import React, { useState } from 'react';
import Auth from './Auth';
import Profile from './Profile';
import Project from './Project';
import ProjectDetail from './ProjectDetail'; 
import Dashboard from './Dashboard';         
import MyTeam from './MyTeam'; // 🌟 새롭게 추가한 나의 팀 컴포넌트 임포트

export default function App() {
  // view 상태 관리: 'AUTH' | 'LIST' | 'DETAIL' | 'DASHBOARD' | 'MY_TEAM'
  const [view, setView] = useState('AUTH');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleLoginSuccess = () => {
    setView('LIST');
  };

  const handleProjectSelect = (id) => {
    setSelectedProjectId(id);
    setView('DETAIL');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🤝 대학생 맞춤형 팀 빌딩 플랫폼</h1>
      
      {view === 'AUTH' ? (
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div>
          {/* 🧭 상단 네비게이션 바 메뉴 확장 */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '25px', 
            background: '#f8f9fa', 
            padding: '12px', 
            borderRadius: '6px',
            border: '1px solid #e9ecef',
            alignItems: 'center' 
          }}>
            <button 
              onClick={() => setView('LIST')} 
              style={{ padding: '8px 14px', cursor: 'pointer', fontWeight: view === 'LIST' ? 'bold' : 'normal' }}
            >
              🌐 구인 게시판 & 프로필
            </button>
            <button 
              onClick={() => setView('DASHBOARD')} 
              style={{ padding: '8px 14px', cursor: 'pointer', fontWeight: view === 'DASHBOARD' ? 'bold' : 'normal' }}
            >
              🎛️ 매칭 대시보드
            </button>
            {/* 🌟 [추가] 나의 팀 전용 네비게이션 버튼 단추 장착 */}
            <button 
              onClick={() => setView('MY_TEAM')} 
              style={{ 
                padding: '8px 14px', 
                cursor: 'pointer', 
                background: view === 'MY_TEAM' ? '#212529' : '#fff',
                color: view === 'MY_TEAM' ? '#fff' : '#000',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontWeight: view === 'MY_TEAM' ? 'bold' : 'normal' 
              }}
            >
              🏃‍♂️ 나의 팀 관리
            </button>
            
            <button 
              onClick={() => { localStorage.clear(); setView('AUTH'); }} 
              style={{ 
                marginLeft: 'auto', 
                padding: '8px 14px', 
                background: '#ff4d4f', 
                color: '#fff', 
                border: 'none', 
                cursor: 'pointer', 
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              로그아웃
            </button>
          </div>

          {/* 📺 네비게이션 선택에 따른 화면 전환 */}
          {view === 'LIST' && (
            <div>
              <Profile />
              <Project onProjectSelect={handleProjectSelect} />
            </div>
          )}

          {view === 'DETAIL' && (
            <ProjectDetail 
              projectId={selectedProjectId} 
              onBack={() => setView('LIST')} 
            />
          )}

          {view === 'DASHBOARD' && (
            <Dashboard />
          )}

          {/* 🌟 [추가] 나의 팀 관리 전용 화면 분기 매핑 */}
          {view === 'MY_TEAM' && (
            <MyTeam />
          )}
        </div>
      )}
    </div>
  );
}