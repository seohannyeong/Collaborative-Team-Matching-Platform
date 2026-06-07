import React, { useState, useEffect } from 'react';
import API from './api';

export default function ProjectDetail({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        // 백엔드 정식 단건 조회 API 요청: GET /api/projects/{projectId}
        const response = await API.get(`/projects/${projectId}`);
        
        // 🌟 [핵심 수정] 백엔드 공용 응답 규격에 맞추어 진짜 알맹이 주머니(.data.data)를 개봉합니다!
        const realData = response.data.data;
        setProject(realData);
      } catch (error) {
        console.error('프로젝트 상세 정보를 가져오는데 실패했습니다.', error);
        alert('상세 정보를 불러올 수 없거나 권한이 없습니다.');
        onBack(); // 실패 시 부드럽게 목록 화면으로 튕겨내기
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetail();
    }
  }, [projectId, onBack]);

  if (loading) return <div style={{ padding: '20px' }}>🔄 팀의 정밀 정보를 백엔드에서 긁어오는 중...</div>;
  if (!project) return <div style={{ padding: '20px' }}>❌ 해당 팀 프로젝트 정보를 찾을 수 없습니다.</div>;

  return (
    <div style={{ 
      border: '1px solid #007bff', 
      padding: '25px', 
      borderRadius: '10px', 
      background: '#ffffff',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      marginTop: '10px'
    }}>
      {/* 🧭 상단 헤더 영역 (제목 & 모집 상태 매핑) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #007bff', paddingBottom: '12px', marginBottom: '20px' }}>
        {/* 🌟 [요구사항 준수] 그 어디에도 프로젝트 고유 숫자 ID는 출력되지 않습니다. */}
        <h3 style={{ margin: 0, color: '#212529', fontSize: '22px' }}>🔍 {project.title}</h3>
        <span style={{ 
          background: project.status === 'RECRUITING' ? '#d4edda' : '#ffeeba',
          color: project.status === 'RECRUITING' ? '#155724' : '#856404',
          padding: '4px 10px',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {project.status === 'RECRUITING' ? '🟢 모집 중' : '🟠 모집 마감 / 진행 중'}
        </span>
      </div>

      {/* 📋 세부 정보 리스트 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: '1.6' }}>
        <div>
          <strong>👑 팀장(개설자):</strong> <span style={{ color: '#495057', fontSize: '15px' }}>{project.leaderName}</span>
        </div>

        <div>
          <strong>👥 정원 구성:</strong> <span style={{ color: '#495057', fontSize: '15px' }}>총 {project.recruitCount}명 모집 희망</span>
        </div>

        <div>
          <strong>🛠️ 필요 기술 스택:</strong> 
          <span style={{ marginLeft: '8px', background: '#e9ecef', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', color: '#495057' }}>
            {project.techStack}
          </span>
        </div>

        <div>
          <strong>📅 구인 종료 일시:</strong> 
          <span style={{ color: '#dc3545', marginLeft: '5px', fontWeight: 'bold' }}>
            {new Date(project.deadline).toLocaleString()}
          </span>
        </div>

        <hr style={{ border: '0', height: '1px', background: '#e9ecef', margin: '10px 0' }} />

        {/* 📝 상세 설명 보드 */}
        <div>
          <strong>📝 프로젝트 상세 설명 및 커리큘럼:</strong>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '18px', 
            borderRadius: '6px', 
            border: '1px solid #e9ecef',
            marginTop: '8px',
            whiteSpace: 'pre-wrap',
            color: '#333',
            fontSize: '15px'
          }}>
            {project.description}
          </div>
        </div>
      </div>

      {/* ⬅️ 목록 롤백 컨트롤 단추 */}
      <button 
        onClick={onBack}
        style={{ 
          marginTop: '30px', 
          width: '100%', 
          padding: '10px', 
          background: '#6c757d', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer', 
          fontWeight: 'bold',
          fontSize: '15px',
          transition: 'background 0.2s'
        }}
      >
        ⬅️ 목록으로 돌아가기
      </button>
    </div>
  );
}