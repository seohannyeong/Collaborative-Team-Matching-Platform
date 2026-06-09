import React, { useState, useEffect } from 'react';
import API from './api';

export default function Dashboard() {
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [sentApplications, setSentApplications] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      const profileRes = await API.get('/profile/me');
      const myName = profileRes.data.data.name;

      const sentAppsRes = await API.get('/applications/sent');
      setSentApplications(sentAppsRes.data.data || []);

      const projectsRes = await API.get('/projects');
      const allProjects = projectsRes.data.data.content || projectsRes.data.data || [];
      const ownedProjects = allProjects.filter(proj => proj.leaderName === myName);
      setMyProjects(ownedProjects);

      const combinedApplications = [];
      for (const proj of ownedProjects) {
        try {
          const appRes = await API.get(`/projects/${proj.id}/applications`);
          const apps = appRes.data.data || [];
          const appsWithProjectInfo = apps.map(app => ({ ...app, projectTitle: proj.title }));
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

  const handleViewApplicantProfile = async (userId) => {
    setProfileLoading(true);
    setSelectedProfile(null);
    try {
      const res = await API.get(`/profile/${userId}`);
      setSelectedProfile(res.data.data);
    } catch (error) {
      alert('지원자의 프로필 정보를 불러오지 못했습니다.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    const actionText = status === 'ACCEPTED' ? '승인' : '거절';
    if (!window.confirm(`이 지원서를 정말 ${actionText}하시겠습니까?`)) return;

    try {
      await API.patch(`/applications/${applicationId}`, { status });
      alert(`성공적으로 ${actionText} 처리되었습니다.`);
      loadDashboardData();
    } catch (error) {
      alert('상태 변경 실패: ' + (error.response?.data?.message || '권한이 없습니다.'));
    }
  };

  const statusBadge = (status) => {
    if (status === 'PENDING') return <span className="badge badge-yellow">⏳ 심사 대기중</span>;
    if (status === 'ACCEPTED') return <span className="badge badge-green">✅ 최종 매칭 승인</span>;
    if (status === 'REJECTED') return <span className="badge badge-red">❌ 거절됨</span>;
    return <span className="badge badge-gray">{status}</span>;
  };

  if (loading) return <div className="loading-page">🔄 대시보드 데이터를 불러오는 중...</div>;

  return (
    <div className="stack">
      <div>
        <h2 className="page-title">매칭 대시보드</h2>
        <p className="page-sub">내가 보낸 지원과 받은 지원을 한곳에서 관리하세요.</p>
      </div>

      {/* 내가 개설한 팀 현황 */}
      <div className="card">
        <h3 className="section-title">👑 내가 개설한 모집 팀 <span className="count">{myProjects.length}</span></h3>
        {myProjects.length === 0 ? (
          <p className="empty">아직 개설한 프로젝트가 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myProjects.map(proj => (
              <div key={proj.id} className="meta-row" style={{ justifyContent: 'space-between' }}>
                <strong style={{ color: 'var(--ink)' }}>{proj.title}</strong>
                <span className="muted">요구 스택 · {proj.techStack}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 내가 보낸 지원서 */}
      <div className="card">
        <h3 className="section-title">📤 내가 보낸 지원서 <span className="count">{sentApplications.length}</span></h3>
        {sentApplications.length === 0 ? (
          <p className="empty">아직 다른 팀에 지원한 내역이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sentApplications.map((app) => (
              <div key={app.applicationId} className="item-card">
                <div className="item-head">
                  <h4 className="item-title">🎯 {app.projectTitle || `프로젝트 ID: ${app.projectId}`}</h4>
                  {statusBadge(app.status)}
                </div>
                <p className="item-desc" style={{ margin: 0 }}>💌 {app.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 받은 지원서 */}
      <div className="card">
        <h3 className="section-title">📥 내 프로젝트에 들어온 지원서 <span className="count">{receivedApplications.length}</span></h3>
        {receivedApplications.length === 0 ? (
          <p className="empty">아직 접수된 지원서가 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {receivedApplications.map((app) => (
              <div key={app.applicationId} className="item-card">
                <div className="item-head">
                  <span className="badge badge-blue">🎯 {app.projectTitle}</span>
                  {statusBadge(app.status)}
                </div>
                <div className="meta-row" style={{ marginTop: 6 }}>
                  <span><strong>🙋‍♂️ 지원자</strong> · {app.applicantName}</span>
                </div>
                <p className="item-desc">✉️ {app.message}</p>

                <div className="card-actions">
                  <button className="btn btn-info btn-sm" onClick={() => handleViewApplicantProfile(app.applicantId)}>
                    🔍 지원자 프로필 보기
                  </button>
                  {app.status === 'PENDING' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(app.applicationId, 'ACCEPTED')}>
                        👍 승인
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}>
                        ✕ 거절
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 프로필 모달 */}
      {profileLoading && <div className="toast">⏳ 프로필 정보 동기화 중...</div>}

      {selectedProfile && (
        <div className="modal-overlay" onClick={() => setSelectedProfile(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">👤 지원자 상세 프로필</h3>
            <hr />
            <div className="def-list">
              <div className="def-row"><span className="k">이름</span><span className="v">{selectedProfile.name}</span></div>
              <div className="def-row"><span className="k">이메일</span><span className="v">{selectedProfile.email}</span></div>
              <div className="def-row"><span className="k">🎯 관심 분야</span><span className="v">{selectedProfile.interest || '미등록'}</span></div>
              <div className="def-row"><span className="k">🛠️ 기술 스택</span><span className="v">{selectedProfile.techStack || '미등록'}</span></div>
              <div className="def-row">
                <span className="k">📝 자기소개</span>
                <div className="def-block">{selectedProfile.introduction || '작성된 자기소개가 없습니다.'}</div>
              </div>
              <div className="def-row"><span className="k">🤝 협업 스타일</span><span className="v">{selectedProfile.collaborationStyle || '미등록'}</span></div>
              {selectedProfile.githubUrl && (
                <div className="def-row">
                  <span className="k">🐙 GitHub</span>
                  <span className="v"><a href={selectedProfile.githubUrl} target="_blank" rel="noopener noreferrer">{selectedProfile.githubUrl}</a></span>
                </div>
              )}
            </div>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 18 }} onClick={() => setSelectedProfile(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
