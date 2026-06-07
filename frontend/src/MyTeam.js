import React, { useState, useEffect } from 'react';
import API from './api';

export default function MyTeam() {
  const [loading, setLoading] = useState(true);
  const [leaderTeams, setLeaderTeams] = useState([]); // 내가 팀장인 팀
  const [memberTeams, setMemberTeams] = useState([]); // 내가 팀원인 팀

  // 👥 팀원 명단 팝업창을 위한 상태 관리
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [rosterProject, setRosterProject] = useState(null);
  const [rosterMembers, setRosterMembers] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // 👤 특정 팀원 상세 프로필 조회를 위한 상태 관리
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

      // 내가 리더인 팀
      const asLeader = allProjects.filter(proj => proj.leaderName === myName);
      setLeaderTeams(asLeader);

      // 내가 승인(ACCEPTED)받아 합류한 팀
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

  // 🌟 [새로운 연동] 해당 팀의 모집 완료된 팀원 명단을 긁어오는 함수
  const handleOpenTeamRoster = async (project) => {
    setRosterProject(project);
    setShowRosterModal(true);
    setRosterLoading(true);
    setRosterMembers([]);
    try {
      // 파트 1에서 개방한 API 호출: GET /api/projects/{id}/applications
      const res = await API.get(`/projects/${project.id}/applications`);
      const allApps = res.data.data || [];
      
      // 모집이 확정된 승인(ACCEPTED) 상태의 팀원들만 필터링합니다.
      const acceptedMembers = allApps.filter(app => app.status === 'ACCEPTED');
      setRosterMembers(acceptedMembers);
    } catch (error) {
      alert('팀원 명단을 불러올 권한이 없거나 로드에 실패했습니다.');
      setShowRosterModal(false);
    } finally {
      setRosterLoading(false);
    }
  };

  // 🌟 [새로운 연동] 명단에서 특정 팀원을 클릭했을 때 프로필 상세 모달을 띄우는 함수
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

  const getProjectStatusBadge = (status) => {
    if (status === 'RECRUITING') {
      return <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#d4edda', color: '#155724', fontWeight: 'bold', fontSize: '12px' }}>🟢 모집 중</span>;
    }
    return <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#ffeeba', color: '#856404', fontWeight: 'bold', fontSize: '12px' }}>🟠 모집 마감 / 진행 중</span>;
  };

  if (loading) return <div style={{ padding: '20px' }}>🔄 팀 소속 인프라 동기화 중...</div>;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '35px' }}>
      <h2>🏃‍♂️ 나의 소속 팀 프로젝트 관리</h2>
      <hr style={{ margin: 0 }} />

      {/* 팀장 섹션 */}
      <div style={{ border: '1px solid #28a745', padding: '20px', borderRadius: '8px', background: '#fcfdfc' }}>
        <h3 style={{ marginTop: 0, color: '#28a745' }}>👑 내가 팀장으로 이끄는 팀 ({leaderTeams.length})</h3>
        {leaderTeams.length === 0 ? (
          <p style={{ color: '#888', margin: 0 }}>아직 개설한 팀이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {leaderTeams.map((team) => (
              <div key={team.id} style={{ border: '1px solid #dee2e6', padding: '15px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px' }}>🚀 {team.title}</h4>
                  {getProjectStatusBadge(team.status)}
                </div>
                <p style={{ margin: '5px 0', color: '#555' }}>{team.description}</p>
                <button 
                  onClick={() => handleOpenTeamRoster(team)}
                  style={{ marginTop: '10px', padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  👥 팀원 명단 및 프로필 보기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 팀원 섹션 */}
      <div style={{ border: '1px solid #007bff', padding: '20px', borderRadius: '8px', background: '#fcfeff' }}>
        <h3 style={{ marginTop: 0, color: '#007bff' }}>🤝 내가 팀원으로 소속된 팀 ({memberTeams.length})</h3>
        {memberTeams.length === 0 ? (
          <p style={{ color: '#888', margin: 0 }}>아직 승인되어 소속된 팀이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {memberTeams.map((team) => (
              <div key={team.id} style={{ border: '1px solid #dee2e6', padding: '15px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px' }}>✨ {team.title}</h4>
                  {getProjectStatusBadge(team.status)}
                </div>
                <p style={{ margin: '5px 0', color: '#555' }}>{team.description}</p>
                {/* 🌟 일반 팀원도 이 단추를 눌러 동일하게 대원 명단을 꺼낼 수 있게 되었습니다! */}
                <button 
                  onClick={() => handleOpenTeamRoster(team)}
                  style={{ marginTop: '10px', padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  👥 함께하는 팀원 명단 보기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup 1: 👥 팀원 종합 리스트 대형 모달 창구 */}
      {showRosterModal && rosterProject && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 25px rgba(0,0,0,0.2)',
          zIndex: 900, width: '90%', maxWidth: '450px', border: '2px solid #6c757d'
        }}>
          <h3 style={{ marginTop: 0 }}>👥 [{rosterProject.title}] 팀원 명단</h3>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '-5px' }}>이름을 클릭하면 상세 구직 프로필을 볼 수 있습니다.</p>
          <hr />
          
          {rosterLoading ? <p>⏳ 명단 동기화 중...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
              {/* 기둥 1: 언제나 팀장을 최상단에 배치합니다 */}
              <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeeba', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>👑 팀장: {rosterProject.leaderName}</strong>
                  <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>프로젝트 개설자</span>
                </div>
                <button 
                  onClick={() => handleViewMemberProfile(rosterProject.leaderId)}
                  style={{ background: '#f0ad4e', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  프로필 보기
                </button>
              </div>

              {/* 기둥 2: 승인 완료된 동료 팀원들 목록 루프 */}
              {rosterMembers.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center', margin: '15px 0' }}>아직 합류한 팀원이 없습니다.</p>
              ) : (
                rosterMembers.map(member => (
                  <div key={member.applicationId} style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>🏃‍♂️ 팀원: {member.applicantName}</strong>
                      <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>{member.applicantEmail}</span>
                    </div>
                    <button 
                      onClick={() => handleViewMemberProfile(member.applicantId)}
                      style={{ background: '#17a2b8', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      프로필 보기
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <button 
            onClick={() => setShowRosterModal(false)}
            style={{ width: '100%', padding: '8px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ❌ 명단 닫기
          </button>
        </div>
      )}

      {/* Popup 2: 👤 팀원 개별 구직 프로필 상세 카드 모달 창구 */}
      {profileLoading && <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#333', color: '#fff', padding: '10px 20px', borderRadius: '4px', zIndex: 2000 }}>⏳ 프로필 카드 로딩 중...</div>}
      
      {selectedProfile && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 25px rgba(0,0,0,0.3)',
          zIndex: 1100, width: '85%', maxWidth: '420px', border: '2px solid #17a2b8'
        }}>
          <h3 style={{ marginTop: 0, color: '#17a2b8' }}>👤 동료 상세 프로필</h3>
          <hr />
          <p><strong>성함:</strong> {selectedProfile.name}</p>
          <p><strong>이메일:</strong> {selectedProfile.email}</p>
          <p><strong>🎯 관심 분야:</strong> {selectedProfile.interest || '미등록'}</p>
          <p><strong>🛠️ 기술 스택:</strong> {selectedProfile.techStack || '미등록'}</p>
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
            <strong>📝 자기소개:</strong>
            <p style={{ margin: '5px 0', whiteSpace: 'pre-wrap', fontSize: '13px', color: '#444' }}>{selectedProfile.introduction || '작성된 내용이 없습니다.'}</p>
          </div>
          <p><strong>🤝 협업 스타일:</strong> {selectedProfile.collaborationStyle || '미등록'}</p>
          {selectedProfile.githubUrl && <p><strong>🐙 GitHub:</strong> <a href={selectedProfile.githubUrl} target="_blank" rel="noopener noreferrer">{selectedProfile.githubUrl}</a></p>}
          
          <button 
            onClick={() => setSelectedProfile(null)}
            style={{ width: '100%', padding: '7px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}
          >
            ✓ 프로필 확인 완료
          </button>
        </div>
      )}
    </div>
  );
}