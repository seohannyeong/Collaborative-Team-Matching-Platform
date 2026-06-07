import React, { useState, useEffect } from 'react';
import API from './api';

export default function Project() {
  const [projects, setProjects] = useState([]); // 기본값은 안전하게 빈 배열
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [recruitCount, setRecruitCount] = useState(1);
  const [deadline, setDeadline] = useState('');

  // 전체 프로젝트 목록 가져오기
  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      
      // ✨ [핵심 수정] 백엔드가 페이징 처리({ content: [...] })를 해서 보냈는지 체크합니다.
      if (response.data && response.data.content) {
        setProjects(response.data.content); // 페이징 안의 실제 배열 데이터만 쏙 뺍니다.
      } else if (Array.isArray(response.data)) {
        setProjects(response.data); // 만약 일반 배열로 온다면 그대로 넣습니다.
      } else {
        setProjects([]); // 데이터가 이상하면 빈 배열로 방어합니다.
      }
      
    } catch (error) {
      console.error('프로젝트 목록 로딩 실패', error);
      setProjects([]); // 🌟 에러가 나더라도 화면이 터지지 않게 빈 배열로 초기화합니다.
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
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h2>📂 캡스톤/팀플 구인 게시판</h2>
      
      {/* 글쓰기 양식 */}
      <form onSubmit={handleCreateProject} style={{ marginBottom: '30px' }}>
        <h3>🚀 새로운 모집 팀 개설하기 (내가 팀장)</h3>
        <input type="text" placeholder="프로젝트 제목" value={title} onChange={e => setTitle(e.target.value)} required /><br/>
        <textarea placeholder="프로젝트 내용 및 설명" value={description} onChange={e => setDescription(e.target.value)} required /><br/>
        <input type="text" placeholder="요구하는 팀원 기술 스택" value={techStack} onChange={e => setTechStack(e.target.value)} required /><br/>
        <input type="number" placeholder="모집 인원" value={recruitCount} onChange={e => setRecruitCount(e.target.value)} min="1" required /><br/>
        <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required /><br/>
        <button type="submit">모집 시작하기</button>
      </form>

      {/* 목록 출력 */}
      <h3>🌐 현재 모집 중인 팀 목록</h3>
      {/* 🌟 [핵심 방어] projects 뒤에 물음표(?.)를 붙여 배열이 확실할 때만 화면에 그리도록 보호합니다. */}
      {projects?.map((proj) => (
        <div key={proj.id} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0' }}>
          <h4>{proj.title} (모집 인원: {proj.recruitCount}명)</h4>
          <p>{proj.description}</p>
          <p><strong>요구 스택:</strong> {proj.techStack}</p>
          <p><strong>팀장 ID:</strong> {proj.leaderName}</p>
          <button onClick={() => handleApply(proj.id)}>이 팀에 지원하기</button>
        </div>
      ))}
    </div>
  );
}