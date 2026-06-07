import React, { useState, useEffect } from 'react';
import API from './api';

export default function Project({ onProjectSelect }) {
  const [projects, setProjects] = useState([]); 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [recruitCount, setRecruitCount] = useState(1);
  const [deadline, setDeadline] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      const realData = response.data.data;
      if (realData && realData.content) {
        setProjects(realData.content); 
      } else if (Array.isArray(realData)) {
        setProjects(realData); 
      } else {
        setProjects([]); 
      }
    } catch (error) {
      console.error('프로젝트 목록 로딩 실패', error);
      setProjects([]); 
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', { 
        title, 
        description, 
        techStack, 
        recruitCount: parseInt(recruitCount), 
        deadline: deadline + ":00" 
      });
      alert('모집글이 등록되었습니다!');
      fetchProjects(); 
      setTitle(''); setDescription(''); setTechStack(''); setRecruitCount(1); setDeadline('');
    } catch (error) {
      alert('프로젝트 등록 실패');
    }
  };

  const handleApply = async (projectId) => {
    const message = prompt('팀장에게 보낼 지원 메시지를 적어주세요:');
    if (!message) return;
    try {
      await API.post(`/projects/${projectId}/apply`, { message });
      alert('지원이 완료되었습니다! 팀장의 승인을 기다려주세요.');
    } catch (error) {
      alert(error.response?.data?.message || '지원 실패 (본인 글이거나 중복 지원 확인)');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0', borderRadius: '8px' }}>
      <h2>📂 캡스톤/팀플 구인 게시판</h2>
      
      <form onSubmit={handleCreateProject} style={{ marginBottom: '30px' }}>
        <h3>🚀 새로운 모집 팀 개설하기 (내가 팀장)</h3>
        <div style={{ marginBottom: '10px' }}>
          <strong>📌 프로젝트 제목: </strong>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>📝 프로젝트 내용 및 설명: </strong><br/>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', height: '80px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>🛠️ 요구 기술 스택: </strong>
          <input type="text" value={techStack} onChange={e => setTechStack(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>👥 모집 인원 (명): </strong>
          <input type="number" value={recruitCount} onChange={e => setRecruitCount(e.target.value)} min="1" required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>📅 모집 마감 기한: </strong>
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required />
        </div>
        <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer' }}>모집 시작하기</button>
      </form>

      <h3>🌐 현재 모집 중인 팀 목록</h3>
      {projects?.length === 0 ? (
        <p style={{ color: '#888' }}>현재 등록된 모집 팀이 없습니다.</p>
      ) : (
        projects?.map((proj) => (
          <div key={proj.id} style={{ border: '1px solid #eee', padding: '15px', margin: '15px 0', borderRadius: '6px', background: '#fafafa' }}>
            <h4 
              onClick={() => onProjectSelect(proj.id)} 
              style={{ cursor: 'pointer', color: '#0056b3', textDecoration: 'underline', margin: '0 0 10px 0' }}
            >
              {proj.title} (모집 인원: {proj.recruitCount}명)
            </h4>
            <p style={{ color: '#555', margin: '5px 0' }}>{proj.description}</p>
            <p style={{ margin: '5px 0' }}><strong>요구 스택:</strong> {proj.techStack}</p>
            <p style={{ margin: '5px 0' }}><strong>팀장 명:</strong> {proj.leaderName} (ID: {proj.leaderId})</p>
            
            <div style={{ marginTop: '12px' }}>
              <button 
                onClick={() => onProjectSelect(proj.id)} 
                style={{ padding: '5px 12px', marginRight: '10px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                🔍 상세보기
              </button>
              <button 
                onClick={() => handleApply(proj.id)}
                style={{ padding: '5px 12px', cursor: 'pointer', background: '#00c73c', color: '#fff', border: 'none', borderRadius: '4px' }}
              >
                이 팀에 지원하기
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}