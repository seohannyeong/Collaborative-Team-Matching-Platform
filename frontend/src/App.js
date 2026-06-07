import React, { useState } from 'react';
import Auth from './Auth';
import Profile from './Profile';
import Project from './Project';
import ProjectDetail from './ProjectDetail'; 
import Dashboard from './Dashboard';         
import MyTeam from './MyTeam'; 

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

  // 🎨 공통 탭 스타일 지정을 위한 헬퍼 함수 (중복 코드를 줄이고 가독성을 높입니다)
  const getTabStyle = (tabName) => {
    const isActive = view === tabName;
    return {
      padding: '8px 16px',
      cursor: 'pointer',
      borderRadius: '4px',
      fontWeight: isActive ? 'bold' : 'normal',
      // 🌟 [핵심 변경] 활성화 상태면 파란색 배경+흰색 글씨 / 비활성화면 흰색 배경+검은색 글씨
      background: isActive ? '#007bff' : '#ffffff',
      color: isActive ? '#ffffff' : '#333333',
      border: isActive ? '1px solid #007bff' : '1px solid #cccccc',
      transition: 'all 0.2s ease', // 클릭하거나 바뀔 때 부드럽게 색상이 변하는 효과
    };
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🤝 대학생 맞춤형 팀 빌딩 플랫폼</h1>
      
      {view === 'AUTH' ? (
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div>
          {/* 🧭 상단 네비게이션 바 */}
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
            {/* 1. 구인 게시판 탭 */}
            <button 
              onClick={() => setView('LIST')} 
              style={getTabStyle('LIST')}
            >
              🌐 구인 게시판 & 프로필
            </button>
            
            {/* 2. 매칭 대시보드 탭 */}
            <button 
              onClick={() => setView('DASHBOARD')} 
              style={getTabStyle('DASHBOARD')}
            >
              🎛️ 매칭 대시보드
            </button>
            
            {/* 3. 나의 팀 관리 탭 */}
            <button 
              onClick={() => setView('MY_TEAM')} 
              style={getTabStyle('MY_TEAM')}
            >
              🏃‍♂️ 나의 팀 관리
            </button>
            
            {/* 로그아웃 버튼 (독립 디자인 유지) */}
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

          {view === 'MY_TEAM' && (
            <MyTeam />
          )}
        </div>
      )}
    </div>
  );
}