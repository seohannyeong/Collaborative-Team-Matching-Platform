import React, { useState, useEffect } from 'react';
import API from './api';

export default function ProjectDetail({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 프로젝트 단건 상세 정보 가져오기
  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        const response = await API.get(`/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        alert('프로젝트 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetail();
  }, [projectId]);

  // 2. 이 팀에 지원서 제출하기 로직
  const handleApply = async () => {
    const message = prompt('팀장에게 보낼 지원 메시지를 적어주세요:');
    if (!message) return;
    try {
      await API.post(`/projects/${projectId}/apply`, { message });
      alert('지원이 완료되었습니다! 팀장의 승인을 기다려주세요.');
    } catch (error) {
      alert(error.response?.data?.message || '지원 실패 (본인 글이거나 중복 지원 확인)');
    }
  };

  if (loading) return <div>🔄 로딩 중...</div>;
  if (!project) return <div>❌ 프로젝트를 찾을 수 없습니다.</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #00c73c', margin: '20px', borderRadius: '8px' }}>
      <button onClick={onBack} style={{ marginBottom: '15px' }}>⬅️ 목록으로 돌아가기</button>
      
      <h2>📋 {project.title}</h2>
      <hr />
      <p><strong>👑 팀장 ID:</strong> {project.leaderName}</p>
      <p><strong>👥 모집 인원:</strong> {project.recruitCount}명</p>
      <p><strong>🛠️ 요구 스택:</strong> {project.techStack}</p>
      <p><strong>📅 마감 기한:</strong> {new Date(project.deadline).toLocaleString()}</p>
      
      <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '5px', margin: '20px 0' }}>
        <h3>🚀 프로젝트 소개</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{project.description}</p>
      </div>

      <button 
        onClick={handleApply} 
        style={{ padding: '10px 20px', background: '#00c73c', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
      >
        🙌 이 팀에 지원서 넣기
      </button>
    </div>
  );
}