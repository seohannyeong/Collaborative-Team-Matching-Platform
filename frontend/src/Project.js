import React, { useState, useEffect } from 'react';
import API from './api';

export default function Project({ onProjectSelect }) {
  const [projects, setProjects] = useState([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState([]);
  const [currentUserName, setCurrentUserName] = useState('');
  const [loading, setLoading] = useState(true);

  // 폼 개설 상태들
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [recruitCount, setRecruitCount] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // 검색 필드 상태들
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchTechStack, setSearchTechStack] = useState('');
  const [searchStatus, setSearchStatus] = useState('RECRUITING');

  // 기본 유저 정보 및 지원 내역 선 로드
  const initUserAndApplications = async () => {
    try {
      const profileRes = await API.get('/profile/me');
      setCurrentUserName(profileRes.data.data.name || '');

      const sentAppsRes = await API.get('/applications/sent');
      const sentApps = sentAppsRes.data.data || [];
      const appliedIds = sentApps.map(app => app.projectId);
      setAppliedProjectIds(appliedIds);
    } catch (error) {
      console.error('기본 유저 데이터 동기화 실패:', error);
    }
  };

  // 검색어가 없을 때와 있을 때를 분기하는 스마트 조회 함수
  const fetchFilteredProjects = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      let searchResults = [];

      if (!searchKeyword.trim() && !searchTechStack.trim()) {
        const response = await API.get('/projects');
        const allData = response.data.data.content || response.data.data || [];
        searchResults = allData.filter(proj => proj.status === searchStatus);
      } else {
        const params = new URLSearchParams();
        if (searchKeyword.trim()) params.append('keyword', searchKeyword.trim());
        if (searchTechStack.trim()) params.append('techStack', searchTechStack.trim());
        if (searchStatus) params.append('status', searchStatus);

        const response = await API.get(`/projects/search?${params.toString()}`);
        searchResults = response.data.data || [];
      }

      const now = new Date();
      const activeProjects = searchResults.filter(proj => {
        if (searchStatus === 'RECRUITING') {
          return new Date(proj.deadline) > now;
        }
        return true;
      });

      setProjects(activeProjects);
    } catch (error) {
      console.error('프로젝트 데이터 동기화 실패:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchKeyword('');
    setSearchTechStack('');
    setSearchStatus('RECRUITING');
    setTimeout(() => { loadInitialData(); }, 50);
  };

  const loadInitialData = async () => {
    setLoading(true);
    await initUserAndApplications();
    await fetchFilteredProjects();
  };

  useEffect(() => {
    loadInitialData();
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
      setShowCreate(false);
      loadInitialData();
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
      loadInitialData();
    } catch (error) {
      alert(error.response?.data?.message || '지원 실패');
    }
  };

  return (
    <div className="stack">
      {/* ===== 헤더 ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">구인 게시판</h2>
          <p className="page-sub">함께할 팀을 찾고, 새로운 팀을 모집해보세요.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? '✕ 닫기' : '＋ 새 팀 모집하기'}
        </button>
      </div>

      {/* ===== SECTION A: 새 팀 개설 폼 (토글) ===== */}
      {showCreate && (
        <div className="card">
          <h3 className="section-title">🚀 새로운 모집 팀 개설하기</h3>
          <form onSubmit={handleCreateProject} className="form">
            <div className="form-group">
              <label className="label">📌 프로젝트 제목</label>
              <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">📝 팀 프로젝트 설명</label>
              <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">🛠️ 요구 기술 스택</label>
              <input type="text" className="input" placeholder="예: React, Spring Boot" value={techStack} onChange={e => setTechStack(e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: '0 0 120px' }}>
                <label className="label">👥 모집 인원</label>
                <input type="number" className="input" value={recruitCount} onChange={e => setRecruitCount(e.target.value)} min="1" required />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
                <label className="label">📅 모집 마감 기한</label>
                <input type="datetime-local" className="input" value={deadline} onChange={e => setDeadline(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">✨ 팀 생성 및 구인 시작</button>
          </form>
        </div>
      )}

      {/* ===== SECTION B: 목록 + 검색 ===== */}
      <div className="card">
        <h3 className="section-title">🌐 모집 중인 팀 목록</h3>

        <form onSubmit={fetchFilteredProjects} className="toolbar">
          <div className="form-group">
            <span className="label">🔍 키워드</span>
            <input type="text" className="input" placeholder="제목/내용 검색" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
          </div>
          <div className="form-group">
            <span className="label">🛠️ 기술 스택</span>
            <input type="text" className="input" placeholder="예: React, Java" value={searchTechStack} onChange={e => setSearchTechStack(e.target.value)} />
          </div>
          <div className="form-group">
            <span className="label">📊 모집 상태</span>
            <select className="select" value={searchStatus} onChange={e => setSearchStatus(e.target.value)}>
              <option value="RECRUITING">🟢 모집 중</option>
              <option value="COMPLETED">🟠 모집 마감 / 매칭 완료</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">검색</button>
          <button type="button" className="btn btn-ghost" onClick={handleResetSearch}>초기화</button>
        </form>

        {loading ? (
          <p className="loading">⏳ 데이터를 동기화하는 중...</p>
        ) : projects.length === 0 ? (
          <p className="empty">조건에 부합하는 구인 팀이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {projects.map((proj) => {
              const isMyOwnProject = proj.leaderName === currentUserName;
              const isAlreadyApplied = appliedProjectIds.includes(proj.id);

              return (
                <div key={proj.id} className={`item-card ${isMyOwnProject ? 'is-mine' : isAlreadyApplied ? 'is-applied' : ''}`}>
                  <div className="item-head">
                    <h4 className="item-title">{proj.title}</h4>
                    <div className="item-badges">
                      <span className="badge badge-gray">👥 모집 {proj.recruitCount}명</span>
                      {isMyOwnProject && <span className="badge badge-green">👑 내가 개설함</span>}
                      {isAlreadyApplied && <span className="badge badge-yellow">📝 이미 신청함</span>}
                    </div>
                  </div>

                  <p className="item-desc">{proj.description}</p>
                  <div className="meta-row">
                    <span><strong>🛠️ 필요 스택</strong> · {proj.techStack}</span>
                    <span><strong>👑 팀장</strong> · {proj.leaderName}</span>
                  </div>

                  <div className="card-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => onProjectSelect(proj.id)}>
                      🔍 상세보기
                    </button>

                    {isMyOwnProject ? null : isAlreadyApplied ? (
                      <button className="btn btn-sm" disabled>✓ 이미 지원 완료</button>
                    ) : (
                      <button className="btn btn-success btn-sm" onClick={() => handleApply(proj.id)}>
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
