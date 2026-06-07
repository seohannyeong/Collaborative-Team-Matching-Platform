import React, { useState } from 'react';
import Auth from './Auth';
import Profile from './Profile';
import Project from './Project';
import ProjectDetail from './ProjectDetail'; // ✨ 추가된 상세 페이지
import Dashboard from './Dashboard';         // ✨ 추가된 대시보드

export default function App() {
  // view 상태 관리: 'AUTH' | 'LIST' | 'DETAIL' | 'DASHBOARD'
  const [view, setView] = useState('AUTH');
  // 상세 조회를 위해 선택된 프로젝트의 ID를 저장하는 상태
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // 로그인 성공 시 호출될 함수
  const handleLoginSuccess = () => {
    setView('LIST');
  };

  // 프로젝트를 클릭했을 때 상세 페이지로 이동시키는 함수
  const handleProjectSelect = (id) => {
    setSelectedProjectId(id);
    setView('DETAIL');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🤝 대학생 맞춤형 팀 빌딩 플랫폼</h1>
      
      {view === 'AUTH' ? (
        /* 🔐 비로그인 상태: 로그인/회원가입 화면 */
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : (
        /* 🔓 로그인 상태: 메인 서비스 화면 */
        <div>
          {/* 🧭 상단 네비게이션 바 (탭 전환 및 로그아웃) */}
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

          {/* 📺 네비게이션 선택에 따른 화면(뷰) 전환 영역 */}
          
          {/* 1. 메인 목록 뷰 (프로필 + 프로젝트 모집 목록) */}
          {view === 'LIST' && (
            <div>
              <Profile />
              {/* Project 컴포넌트에 상세조회 함수를 prop으로 전달합니다 */}
              <Project onProjectSelect={handleProjectSelect} />
            </div>
          )}

          {/* 2. 프로젝트 단건 상세 보기 뷰 */}
          {view === 'DETAIL' && (
            <ProjectDetail 
              projectId={selectedProjectId} 
              onBack={() => setView('LIST')} 
            />
          )}

          {/* 3. 나의 매칭 대시보드 뷰 (보낸/받은 지원서 관리) */}
          {view === 'DASHBOARD' && (
            <Dashboard />
          )}
        </div>
      )}
    </div>
  );
}