import React, { useState, useEffect } from 'react';
import API from './api';

export default function Project({ onProjectSelect }) {
  const [projects, setProjects] = useState([]); 
  const [appliedProjectIds, setAppliedProjectIds] = useState([]); // 내가 신청한 팀 ID 목록
  const [currentUserName, setCurrentUserName] = useState('');     // 내 이름 상태
  const [loading, setLoading] = useState(true);
  
  // 모집팀 개설 폼 상태들
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [recruitCount, setRecruitCount] = useState(1);
  const [deadline, setDeadline] = useState('');

  // 마스터 통합 데이터 수집 함수
  const loadProjectBoardData = async () => {
    try {
      // 1. 내 정보 수집 (내가 개설한 팀 판별용)
      const profileRes = await API.get('/profile/me');
      setCurrentUserName(profileRes.data.data.name || '');

      // 2. 내가 신청해둔 지원서 목록 수집 (이미 신청한 팀 판별용)
      const sentAppsRes = await API.get('/applications/sent');
      const sentApps = sentAppsRes.data.data || [];
      const appliedIds = sentApps.map(app => app.projectId);
      setAppliedProjectIds(appliedIds);

      // 3. 전체 프로젝트 조회 및 정밀 필터링 가동
      const response = await API.get('/projects');
      const rawProjects = response.data.data.content || response.data.data || [];
      
      const now = new Date();

      // 🌟 [요구사항 반영] 모집 마감되었거나 기한이 만료된 프로젝트는 자동으로 목록에서 소멸시킵니다.
      const activeProjects = rawProjects.filter(proj => {
        const isRecruiting = proj.status === 'RECRUITING';
        const isNotExpired = new Date(proj.deadline) > now;
        return isRecruiting && isNotExpired;
      });

      setProjects(activeProjects);

    } catch (error) {
      console.error('구인 게시판 정보 동기화 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectBoardData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', { 
        title, description, techStack, 
        recruitCount: parseInt(recruitCount), 
        deadline: deadline + ":00" 
      });
      alert('새로운 모집 팀이 성공적으로 개설되었습니다!');
      loadProjectBoardData(); // 즉각 최신 상태로 리스트 리로드
      setTitle(''); setDescription(''); setTechStack(''); setRecruitCount(1); setDeadline('');
    } catch (error) {
      alert('프로젝트 개설 실패');
    }
  };

  const handleApply = async (projectId) => {
    const message = prompt('팀장에게 보낼 정성 가득한 지원 한줄평을 적어주세요:');
    if (!message) return;
    try {
      await API.post(`/projects/${projectId}/apply`, { message });
      alert('지원이 완료되었습니다! 팀장의 대시보드 승인을 기다려주세요.');
      loadProjectBoardData(); // 뱃지 상태 실시간 업데이트를 위해 리로드
    } catch (error) {
      alert(error.response?.data?.message || '지원 실패');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>🔄 깨끗하고 정돈된 구인 게시판 구성 중...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* 🌟 [요구사항 6 반영] SECTION A: 새로운 모집 팀 개설 폼 (상단에 명확하게 분리된 카드 레이아웃) */}
      <div style={{ 
        background: '#f1f3f5', 
        padding: '25px', 
        borderRadius: '10px', 
        border: '1px solid #ced4da',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0, color: '#343a40', borderBottom: '2px solid #6c757d', paddingBottom: '8px' }}>
          🚀 새로운 모집 팀 개설하기
        </h3>
        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
          <div>
            <strong>📌 프로젝트 제목: </strong>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '96%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <strong>📝 팀 프로젝트 설명: </strong><br/>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '96%', height: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '4px' }} />
          </div>
          <div>
            <strong>🛠️ 요구 기술 스택: </strong>
            <input type="text" value={techStack} onChange={e => setTechStack(e.target.value)} required style={{ width: '96%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <strong>👥 모집 인원 (명): </strong>
              <input type="number" value={recruitCount} onChange={e => setRecruitCount(e.target.value)} min="1" required style={{ width: '60px', padding: '5px' }} />
            </div>
            <div>
              <strong>📅 모집 마감 기한: </strong>
              <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required style={{ padding: '4px' }} />
            </div>
          </div>
          <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>
            ✨ 팀 생성 및 구인 시작
          </button>
        </form>
      </div>

      {/* 🌟 [요구사항 6 반영] SECTION B: 모집 중인 팀 목록 (하단에 완전히 격리된 독립 화이트 보드 공간) */}
      <div style={{ border: '1px solid #dee2e6', padding: '25px', borderRadius: '10px', background: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h3 style={{ marginTop: 0, color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
          🌐 현재 모집 중인 팀 목록
        </h3>
        
        {projects.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '30px 0' }}>현재 조건에 부합하는 활성화된 구인 팀이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            {projects.map((proj) => {
              // 판별 플래그 설정
              const isMyOwnProject = proj.leaderName === currentUserName;
              const isAlreadyApplied = appliedProjectIds.includes(proj.id);

              return (
                <div key={proj.id} style={{ 
                  border: '1px solid #e9ecef', padding: '18px', borderRadius: '8px', background: '#f8f9fa',
                  borderLeft: isMyOwnProject ? '5px solid #28a745' : isAlreadyApplied ? '5px solid #ffc107' : '1px solid #e9ecef'
                }}>
                  {/* 🌟 [요구사항 1 반영] 제목 등 어디에도 숫자 ID 정보가 출력되지 않습니다. */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>
                      {proj.title}
                    </h4>
                    
                    {/* 🌟 [요구사항 3, 4 반영] 상황에 맞는 정교한 상태 요약 뱃지 노출 */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ background: '#e2e3e5', color: '#383d41', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        👥 모집 {proj.recruitCount}명
                      </span>
                      {isMyOwnProject && (
                        <span style={{ background: '#d4edda', color: '#155724', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          👑 내가 개설함
                        </span>
                      )}
                      {isAlreadyApplied && (
                        <span style={{ background: '#fff3cd', color: '#856404', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          📝 이미 신청함
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ color: '#495057', margin: '8px 0', fontSize: '15px' }}>{proj.description}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>🛠️ 필요 스택:</strong> {proj.techStack}</p>
                  
                  {/* 🌟 [요구사항 1 반영] 팀장의 고유 숫자 ID 출력을 지우고 순수 성함만 표시 */}
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#6c757d' }}><strong>👑 팀장 명:</strong> {proj.leaderName}</p>
                  
                  <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => onProjectSelect(proj.id)} 
                      style={{ padding: '6px 14px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                    >
                      🔍 팀 상세보기
                    </button>

                    {/* 상태 조건에 따른 동작 제어 */}
                    {isMyOwnProject ? (
                      <button 
                        disabled
                        style={{ padding: '6px 14px', background: '#e2e3e5', color: '#6c757d', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontSize: '13px' }}
                      >
                        ✓ 내가 개설한 팀 리더 상태
                      </button>
                    ) : isAlreadyApplied ? (
                      <button 
                        disabled
                        style={{ padding: '6px 14px', background: '#ffeeba', color: '#856404', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontSize: '13px', fontWeight: 'bold' }}
                      >
                        ✓ 이미 지원 완료한 팀
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApply(proj.id)}
                        style={{ padding: '6px 14px', cursor: 'pointer', background: '#00c73c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}
                      >
                        이 팀에 지원하기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}