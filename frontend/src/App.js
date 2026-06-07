import React, { useState } from 'react';
import Auth from './Auth';
import Profile from './Profile';
import Project from './Project';
import ProjectDetail from './ProjectDetail'; 
import Dashboard from './Dashboard';         
import MyTeam from './MyTeam'; 

export default function App() {
  // view 상태 관리: 'AUTH' | 'LIST' | 'MY_PROFILE' | 'DASHBOARD' | 'MY_TEAM' | 'DETAIL'
  const [view, setView] = useState('AUTH');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleLoginSuccess = () => {
    setView('LIST');
  };

  const handleProjectSelect = (id) => {
    setSelectedProjectId(id);
    setView('DETAIL');
  };

  // 공통 내비게이션 탭 스타일 헬퍼 함수
  const getTabStyle = (tabName) => {
    const isActive = view === tabName;
    return {
      padding: '8px 14px',
      cursor: 'pointer',
      borderRadius: '4px',
      fontWeight: isActive ? 'bold' : 'normal',
      background: isActive ? '#007bff' : '#ffffff',
      color: isActive ? '#ffffff' : '#333333',
      border: isActive ? '1px solid #007bff' : '1px solid #cccccc',
      transition: 'all 0.2s ease',
    };
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '850px', margin: '0 auto', padding: '20px' }}>
      <h1>🤝 대학생 맞춤형 팀 빌딩 플랫폼</h1>
      
      {view === 'AUTH' ? (
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div>
          {/* 🧭 더욱 세련되어진 전용 대메뉴 탭 바 */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '25px', 
            background: '#f8f9fa', 
            padding: '12px', 
            borderRadius: '6px',
            border: '1px solid #e9ecef',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <button onClick={() => setView('LIST')} style={getTabStyle('LIST')}>
              🌐 구인 게시판
            </button>
            
            {/* 🌟 [요구사항 반영] 독립 탭으로 전격 분리된 나의 구직 프로필 창구 */}
            <button onClick={() => setView('MY_PROFILE')} style={getTabStyle('MY_PROFILE')}>
              👤 나의 프로필
            </button>

            <button onClick={() => setView('DASHBOARD')} style={getTabStyle('DASHBOARD')}>
              🎛️ 매칭 대시보드
            </button>
            
            <button onClick={() => setView('MY_TEAM')} style={getTabStyle('MY_TEAM')}>
              🏃‍♂️ 나의 팀 관리
            </button>
            
            <button 
              onClick={() => { localStorage.clear(); setView('AUTH'); }} 
              style={{ 
                marginLeft: 'auto', padding: '8px 14px', background: '#ff4d4f', color: '#fff', 
                border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold'
              }}
            >
              로그아웃
            </button>
          </div>

          {/* 📺 내비게이션 상태에 따른 컴포넌트 매핑 */}
          {view === 'LIST' && (
            <Project onProjectSelect={handleProjectSelect} />
          )}

          {/* 🌟 단독으로 쾌적하게 조회/수정하는 프로필 공간 */}
          {view === 'MY_PROFILE' && (
            <Profile />
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

          {view === 'MY_TEAM' && (
            <MyTeam />
          )}
        </div>
      )}
    </div>
  );
}