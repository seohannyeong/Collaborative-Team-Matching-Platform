import React, { useState, useEffect } from 'react';
import API from './api';

export default function Dashboard() {
  const [receivedApplications, setReceivedApplications] = useState([]); // 내가 받은 지원서들
  const [sentApplications, setSentApplications] = useState([]);         // 🌟 [추가] 내가 보낸 지원서들
  const [myProjects, setMyProjects] = useState([]);                     // 내가 개설한 프로젝트 목록
  const [loading, setLoading] = useState(true);

  // 🔥 지원자 프로필 상세 보기를 위한 상태창 관리
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // 대시보드 데이터 전면 자동 동기화 로직
  const loadDashboardData = async () => {
    try {
      // 1. 내 이름 식별
      const profileRes = await API.get('/profile/me');
      const myName = profileRes.data.data.name;

      // 2. 🌟 [정석 연동] 방금 백엔드에 새로 개통한 API를 통해 내가 보낸 지원서 목록 완벽 자동 로드!
      const sentAppsRes = await API.get('/applications/sent');
      setSentApplications(sentAppsRes.data.data || []);

      // 3. 전체 목록 중 내가 개설한 팀 프로젝트 필터링
      const projectsRes = await API.get('/projects');
      const allProjects = projectsRes.data.data.content || projectsRes.data.data || [];
      const ownedProjects = allProjects.filter(proj => proj.leaderName === myName);
      setMyProjects(ownedProjects);

      // 4. 내 프로젝트의 지원자 정보 연쇄 결합
      const combinedApplications = [];
      for (const proj of ownedProjects) {
        try {
          const appRes = await API.get(`/projects/${proj.id}/applications`);
          const apps = appRes.data.data || [];
          const appsWithProjectInfo = apps.map(app => ({
            ...app,
            projectTitle: proj.title
          }));
          combinedApplications.push(...appsWithProjectInfo);
        } catch (err) {
          console.error(`[${proj.title}] 지원서 로드 실패:`, err);
        }
      }
      setReceivedApplications(combinedApplications);

    } catch (error) {
      console.error('대시보드 데이터 동기화 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 🌟 [새로운 기능] 지원자의 구직 프로필을 서버에서 실시간 조회하는 함수 구현
  const handleViewApplicantProfile = async (userId) => {
    setProfileLoading(true);
    setSelectedProfile(null); // 이전 데이터 잔상 초기화
    try {
      // 백엔드 프로필 조회 주소 규칙: GET /api/profile/{userId}
      const res = await API.get(`/profile/${userId}`);
      setSelectedProfile(res.data.data);
    } catch (error) {
      alert('지원자의 프로필 정보를 불러오지 못했습니다.');
    } finally {
      setProfileLoading(false);
    }
  };

  // 팀장 권한 지원자 승인 처리
  const handleUpdateStatus = async (applicationId, status) => {
    const actionText = status === 'ACCEPTED' ? '승인' : '거절';
    if (!window.confirm(`이 지원서를 정말 ${actionText}하시겠습니까?`)) return;

    try {
      await API.patch(`/applications/${applicationId}`, { status });
      alert(`성공적으로 ${actionText} 처리되었습니다.`);
      loadDashboardData(); // 새로고침 대신 깔끔하게 데이터만 리로드
    } catch (error) {
      alert('상태 변경 실패: ' + (error.response?.data?.message || '권한이 없습니다.'));
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>🔄 백엔드 신규 명세 인프라와 동기화 중...</div>;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <h2>🎛️ 나의 매칭 종합 대시보드</h2>
      <hr style={{ margin: 0 }} />

      {/* 왼쪽/오른쪽 레이아웃 분할 또는 상하 레이아웃 배치 */}
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
        <h3 style={{ marginTop: 0 }}>👑 내가 개설한 모집 팀 현황 ({myProjects.length}개)</h3>
        {myProjects.length === 0 ? (
          <p style={{ color: '#888', margin: 0 }}>아직 개설한 프로젝트가 없습니다.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {myProjects.map(proj => <li key={proj.id}><strong>{proj.title}</strong> (요구 스택: {proj.techStack})</li>)}
          </ul>
        )}
      </div>

      {/* 🌟 [수정사항 2 반영] 내가 다른 프로젝트에 신청해둔 지원서 목록 표시 영역 */}
      <div style={{ border: '1px solid #ced4da', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, color: '#007bff' }}>📤 내가 보낸 지원서 (지원 결과 현황)</h3>
        {sentApplications.length === 0 ? (
          <p style={{ color: '#888', margin: 0 }}>아직 다른 팀에 지원한 내역이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            {sentApplications.map((app) => (
              <div key={app.applicationId} style={{ border: '1px solid #e9ecef', padding: '12px', borderRadius: '6px', background: '#fff' }}>
                <h4>🎯 지원한 팀: {app.projectTitle || `프로젝트 ID: ${app.projectId}`}</h4>
                <p style={{ margin: '4px 0' }}>💌 <strong>내가 보낸 메시지:</strong> {app.message}</p>
                <p style={{ margin: '4px 0' }}>
                  📊 <strong>매칭 결과:</strong>{' '}
                  <span style={{ 
                    padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px',
                    background: app.status === 'PENDING' ? '#ffeeba' : app.status === 'ACCEPTED' ? '#d4edda' : '#f8d7da',
                    color: app.status === 'PENDING' ? '#856404' : app.status === 'ACCEPTED' ? '#155724' : '#721c24'
                  }}>
                    {app.status === 'PENDING' ? '⏳ 심사 대기중' : app.status === 'ACCEPTED' ? '✅ 최종 매칭 승인!' : app.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 내 모든 프로젝트에 들어온 타인의 지원서 목록 */}
      <div style={{ border: '1px solid #ced4da', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, color: '#28a745' }}>📥 내 프로젝트에 들어온 지원서 리스트</h3>
        {receivedApplications.length === 0 ? (
          <p style={{ color: '#888', margin: 0 }}>아직 접수된 지원서가 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {receivedApplications.map((app) => (
              <div key={app.applicationId} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', background: '#fafafa' }}>
                <span style={{ background: '#28a745', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  🎯 대상 모집글: {app.projectTitle}
                </span>
                <p style={{ margin: '8px 0 4px 0' }}>🙋‍♂️ <strong>지원자명:</strong> {app.applicantName}</p>
                <p style={{ margin: '4px 0' }}>✉️ <strong>지원 한줄평:</strong> {app.message}</p>
                <p style={{ margin: '4px 0' }}><strong>📊 심사 상태:</strong> {app.status}</p>
                
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  {/* 🌟 [수정사항 1 반영] 지원자의 구직 프로필을 모달 팝업으로 조회하는 버튼 연결 */}
                  <button 
                    onClick={() => handleViewApplicantProfile(app.applicantId)}
                    style={{ background: '#17a2b8', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}
                  >
                    🔍 지원자 프로필 보기
                  </button>

                  {app.status === 'PENDING' && (
                    <button 
                      onClick={() => handleUpdateStatus(app.applicationId, 'ACCEPTED')}
                      style={{ background: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}
                    >
                      👍 팀원으로 승인하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 팝업 모달창 창구 UI 레이아웃 설계 */}
      {profileLoading && <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#333', color: '#fff', padding: '10px 20px', borderRadius: '4px' }}>⏳ 프로필 정보 동기화 중...</div>}
      
      {selectedProfile && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          zIndex: 1000, width: '90%', maxWidth: '500px', border: '2px solid #17a2b8'
        }}>
          <h3 style={{ marginTop: 0, color: '#17a2b8' }}>👤 지원자 상세 프로필 카드</h3>
          <hr />
          <p><strong>이름:</strong> {selectedProfile.name}</p>
          <p><strong>이메일:</strong> {selectedProfile.email}</p>
          <p><strong>🎯 관심 분야:</strong> {selectedProfile.interest || '미등록'}</p>
          <p><strong>🛠️ 기술 스택:</strong> {selectedProfile.techStack || '미등록'}</p>
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
            <strong>📝 자기소개:</strong>
            <p style={{ margin: '5px 0', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{selectedProfile.introduction || '작성된 자기소개가 없습니다.'}</p>
          </div>
          <p><strong>🤝 협업 스타일:</strong> {selectedProfile.collaborationStyle || '미등록'}</p>
          {selectedProfile.githubUrl && <p><strong>🐙 GitHub:</strong> <a href={selectedProfile.githubUrl} target="_blank" rel="noopener noreferrer">{selectedProfile.githubUrl}</a></p>}
          
          <button 
            onClick={() => setSelectedProfile(null)}
            style={{ width: '100%', padding: '8px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' }}
          >
            ❌ 닫기
          </button>
        </div>
      )}
    </div>
  );
}