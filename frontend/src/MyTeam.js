import React, { useState, useEffect } from 'react';
import API from './api';

export default function MyTeam() {
  const [loading, setLoading] = useState(true);
  const [leaderTeams, setLeaderTeams] = useState([]); // 내가 팀장인 팀
  const [memberTeams, setMemberTeams] = useState([]); // 내가 팀원인 팀

  const [showRosterModal, setShowRosterModal] = useState(false);
  const [rosterProject, setRosterProject] = useState(null);
  const [rosterMembers, setRosterMembers] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchMyTeams = async () => {
    try {
      const profileRes = await API.get('/profile/me');
      const myName = profileRes.data.data.name;

      const projectsRes = await API.get('/projects');
      const allProjects = projectsRes.data.data.content || projectsRes.data.data || [];

      const sentAppsRes = await API.get('/applications/sent');
      const mySentApps = sentAppsRes.data.data || [];

      const asLeader = allProjects.filter(proj => proj.leaderName === myName);
      setLeaderTeams(asLeader);

      const acceptedAppProjectIds = mySentApps
        .filter(app => app.status === 'ACCEPTED')
        .map(app => app.projectId);

      const asMember = allProjects.filter(proj => acceptedAppProjectIds.includes(proj.id));
      setMemberTeams(asMember);
    } catch (error) {
      console.error('나의 팀 목록 동기화 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const handleOpenTeamRoster = async (project) => {
    setRosterProject(project);
    setShowRosterModal(true);
    setRosterLoading(true);
    setRosterMembers([]);
    try {
      const res = await API.get(`/projects/${project.id}/applications`);
      const allApps = res.data.data || [];
      const acceptedMembers = allApps.filter(app => app.status === 'ACCEPTED');
      setRosterMembers(acceptedMembers);
    } catch (error) {
      alert('팀원 명단을 불러올 권한이 없거나 로드에 실패했습니다.');
      setShowRosterModal(false);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleViewMemberProfile = async (userId) => {
    setProfileLoading(true);
    try {
      const res = await API.get(`/profile/${userId}`);
      setSelectedProfile(res.data.data);
    } catch (error) {
      alert('해당 팀원의 프로필 정보를 조회할 수 없습니다.');
    } finally {
      setProfileLoading(false);
    }
  };

  const statusBadge = (status) =>
    status === 'RECRUITING'
      ? <span className="badge badge-green">🟢 모집 중</span>
      : <span className="badge badge-yellow">🟠 모집 마감 / 진행 중</span>;

  const renderTeamCard = (team, isLeaderSection) => (
    <div key={team.id} className="item-card">
      <div className="item-head">
        <h4 className="item-title">{isLeaderSection ? '🚀 ' : '✨ '}{team.title}</h4>
        {statusBadge(team.status)}
      </div>
      <p className="item-desc">{team.description}</p>
      <div className="card-actions">
        <button
          className={`btn btn-sm ${isLeaderSection ? 'btn-success' : 'btn-primary'}`}
          onClick={() => handleOpenTeamRoster(team)}
        >
          👥 팀원 명단 보기
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="loading-page">🔄 팀 정보를 불러오는 중...</div>;

  return (
    <div className="stack">
      <div>
        <h2 className="page-title">나의 팀</h2>
        <p className="page-sub">내가 이끄는 팀과 합류한 팀, 그리고 팀원 명단을 확인하세요.</p>
      </div>

      {/* 팀장 섹션 */}
      <div className="card">
        <h3 className="section-title">👑 내가 팀장으로 이끄는 팀 <span className="count">{leaderTeams.length}</span></h3>
        {leaderTeams.length === 0 ? (
          <p className="empty">아직 개설한 팀이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {leaderTeams.map((team) => renderTeamCard(team, true))}
          </div>
        )}
      </div>

      {/* 팀원 섹션 */}
      <div className="card">
        <h3 className="section-title">🤝 내가 팀원으로 소속된 팀 <span className="count">{memberTeams.length}</span></h3>
        {memberTeams.length === 0 ? (
          <p className="empty">아직 승인되어 소속된 팀이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {memberTeams.map((team) => renderTeamCard(team, false))}
          </div>
        )}
      </div>

      {/* Popup 1: 팀원 명단 모달 */}
      {showRosterModal && rosterProject && (
        <div className="modal-overlay" onClick={() => setShowRosterModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">👥 {rosterProject.title}</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>이름을 클릭하면 상세 구직 프로필을 볼 수 있습니다.</p>
            <hr />

            {rosterLoading ? <p className="loading">⏳ 명단 동기화 중...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* 팀장 */}
                <div className="roster-row leader">
                  <div>
                    <strong>👑 {rosterProject.leaderName}</strong>
                    <span className="sub">프로젝트 개설자 (팀장)</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleViewMemberProfile(rosterProject.leaderId)}>
                    프로필
                  </button>
                </div>

                {/* 팀원 */}
                {rosterMembers.length === 0 ? (
                  <p className="empty" style={{ padding: '16px 0' }}>아직 합류한 팀원이 없습니다.</p>
                ) : (
                  rosterMembers.map(member => (
                    <div key={member.applicationId} className="roster-row">
                      <div>
                        <strong>🏃‍♂️ {member.applicantName}</strong>
                        <span className="sub">{member.applicantEmail}</span>
                      </div>
                      <button className="btn btn-info btn-sm" onClick={() => handleViewMemberProfile(member.applicantId)}>
                        프로필
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            <button className="btn btn-ghost btn-block" style={{ marginTop: 18 }} onClick={() => setShowRosterModal(false)}>
              명단 닫기
            </button>
          </div>
        </div>
      )}

      {/* Popup 2: 팀원 개별 프로필 모달 */}
      {profileLoading && <div className="toast">⏳ 프로필 카드 로딩 중...</div>}

      {selectedProfile && (
        <div className="modal-overlay" onClick={() => setSelectedProfile(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">👤 동료 상세 프로필</h3>
            <hr />
            <div className="def-list">
              <div className="def-row"><span className="k">성함</span><span className="v">{selectedProfile.name}</span></div>
              <div className="def-row"><span className="k">이메일</span><span className="v">{selectedProfile.email}</span></div>
              <div className="def-row"><span className="k">🎯 관심 분야</span><span className="v">{selectedProfile.interest || '미등록'}</span></div>
              <div className="def-row"><span className="k">🛠️ 기술 스택</span><span className="v">{selectedProfile.techStack || '미등록'}</span></div>
              <div className="def-row">
                <span className="k">📝 자기소개</span>
                <div className="def-block">{selectedProfile.introduction || '작성된 내용이 없습니다.'}</div>
              </div>
              <div className="def-row"><span className="k">🤝 협업 스타일</span><span className="v">{selectedProfile.collaborationStyle || '미등록'}</span></div>
              {selectedProfile.githubUrl && (
                <div className="def-row">
                  <span className="k">🐙 GitHub</span>
                  <span className="v"><a href={selectedProfile.githubUrl} target="_blank" rel="noopener noreferrer">{selectedProfile.githubUrl}</a></span>
                </div>
              )}
            </div>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 18 }} onClick={() => setSelectedProfile(null)}>
              확인 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
