import React, { useState } from 'react';
import Auth from './Auth';
import Profile from './Profile';
import Project from './Project';
import ProjectDetail from './ProjectDetail';
import Dashboard from './Dashboard';
import MyTeam from './MyTeam';

const NAV = [
  { key: 'LIST',       label: '구인 게시판' },
  { key: 'MY_PROFILE', label: '나의 프로필' },
  { key: 'DASHBOARD',  label: '매칭 대시보드' },
  { key: 'MY_TEAM',    label: '나의 팀' },
];

export default function App() {
  // view 상태 관리: 'AUTH' | 'LIST' | 'MY_PROFILE' | 'DASHBOARD' | 'MY_TEAM' | 'DETAIL'
  const [view, setView] = useState('AUTH');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleLoginSuccess = () => setView('LIST');

  const handleProjectSelect = (id) => {
    setSelectedProjectId(id);
    setView('DETAIL');
  };

  if (view === 'AUTH') {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      {/* ===== 상단 내비게이션 ===== */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="nav-brand">
            <span className="nav-logo">🤝</span>
            TeamUp
          </div>
          <div className="nav-links">
            {NAV.map((item) => (
              <button
                key={item.key}
                className={`nav-link ${view === item.key ? 'active' : ''}`}
                onClick={() => setView(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="nav-spacer" />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { localStorage.clear(); setView('AUTH'); }}
          >
            로그아웃
          </button>
        </div>
      </nav>

      {/* ===== 본문 ===== */}
      <main className="container">
        {view === 'LIST' && <Project onProjectSelect={handleProjectSelect} />}
        {view === 'MY_PROFILE' && <Profile />}
        {view === 'DETAIL' && (
          <ProjectDetail projectId={selectedProjectId} onBack={() => setView('LIST')} />
        )}
        {view === 'DASHBOARD' && <Dashboard />}
        {view === 'MY_TEAM' && <MyTeam />}
      </main>
    </>
  );
}
