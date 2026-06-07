import React, { useState, useEffect } from 'react';
import API from './api';

export default function MyTeam() {
  const [loading, setLoading] = useState(true);
  const [leaderTeams, setLeaderTeams] = useState([]); // 내가 팀장인 팀들
  const [memberTeams, setMemberTeams] = useState([]); // 내가 승인받아 팀원으로 합류한 팀들

  useEffect(() => {
    const fetchMyTeams = async () => {
      try {
        // 1. 내 프로필 정보를 조회하여 "나의 이름"을 식별합니다.
        const profileRes = await API.get('/profile/me');
        const myName = profileRes.data.data.name;

        // 2. 전체 프로젝트(구인글) 목록을 가져옵니다.
        const projectsRes = await API.get('/projects');
        const allProjects = projectsRes.data.data.content || projectsRes.data.data || [];

        // 3. 내가 보낸 지원서 목록을 가져옵니다.
        const sentAppsRes = await API.get('/applications/sent');
        const mySentApps = sentAppsRes.data.data || [];

        // 👑 [로직 A] 내가 팀장인 팀 필터링 (생성 즉시 바로 뜸)
        const asLeader = allProjects.filter(proj => proj.leaderName === myName);
        setLeaderTeams(asLeader);

        // 🤝 [로직 B] 내가 지원해서 승인(ACCEPTED)받은 팀원 전용 팀 필터링
        const acceptedAppProjectIds = mySentApps
          .filter(app => app.status === 'ACCEPTED') // 승인 완료된 지원서만 거름
          .map(app => app.projectId);                // 해당 프로젝트 ID들만 추출

        // 전체 프로젝트 중 위에서 구한 승인된 프로젝트 ID들과 일치하는 프로젝트 정보를 매칭합니다.
        const asMember = allProjects.filter(proj => acceptedAppProjectIds.includes(proj.id));
        setMemberTeams(asMember);

      } catch (error) {
        console.error('나의 팀 목록을 동기화하지 못했습니다.', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTeams();
  }, []);

  // 🟢🟠 프로젝트 모집 상태에 따른 가독성 높은 뱃지 출력 함수
  const getProjectStatusBadge = (status) => {
    if (status === 'RECRUITING') {
      return (
        <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#d4edda', color: '#155724', fontWeight: 'bold', fontSize: '13px' }}>
          🟢 모집 중
        </span>
      );
    }
    // 인원이 다 차거나 complete()가 호출되어 마감되었을 때
    return (
      <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#ffeeba', color: '#856404', fontWeight: 'bold', fontSize: '13px' }}>
        Result: 🟠 모집 마감 / 팀 빌딩 완료
      </span>
    );
  };

  if (loading) return <div style={{ padding: '20px' }}>🔄 소속된 팀 정보를 백엔드와 실시간 동기화 중...</div>;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '35px' }}>
      <h2>🏃‍♂️ 나의 소속 팀 프로젝트 관리</h2>
      <hr style={{ margin: 0 }} />

      {/* SECTION 1: 내가 리더(팀장)인 팀 목록 */}
      <div style={{ border: '1px solid #28a745', padding: '20px', borderRadius: '8px', background: '#fcfdfc' }}>
        <h3 style={{ marginTop: 0, color: '#28a745' }}>👑 내가 팀장으로 이끄는 팀 ({leaderTeams.length})</h3>
        {leaderTeams.length === 0 ? (
          <p style={{ color: '#888', margin: 0 }}>아직 개설한 팀이 없습니다. 구인 게시판에서 팀을 먼저 개설해 보세요!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {leaderTeams.map((team) => (
              <div key={team.id} style={{ border: '1px solid #dee2e6', padding: '15px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px' }}>🚀 {team.title}</h4>
                  {getProjectStatusBadge(team.status)}
                </div>
                <p style={{ margin: '5px 0', color: '#555' }}>{team.description}</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>🛠️ 팀 스택:</strong> {team.techStack}</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>👥 정원 현황:</strong> 총 {team.recruitCount}명 모집 요구</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: 내가 지원자로서 승인받아 합류한 팀 목록 */}
      <div style={{ border: '1px solid #007bff', padding: '20px', borderRadius: '8px', background: '#fcfeff' }}>
        <h3 style={{ marginTop: 0, color: '#007bff' }}>🤝 내가 팀원으로 소속된 팀 ({memberTeams.length})</h3>
        {memberTeams.length === 0 ? (
          <p style={{ color: '#888', margin: 0 }}>아직 최종 승인되어 소속된 팀이 없습니다. 대시보드에서 보낸 지원서의 승인 현황을 확인해 보세요!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {memberTeams.map((team) => (
              <div key={team.id} style={{ border: '1px solid #dee2e6', padding: '15px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px' }}>✨ {team.title}</h4>
                  {getProjectStatusBadge(team.status)}
                </div>
                <p style={{ margin: '5px 0', color: '#555' }}>{team.description}</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>👑 팀장님 성함:</strong> {team.leaderName}</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>🛠️ 팀 요구 스택:</strong> {team.techStack}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}