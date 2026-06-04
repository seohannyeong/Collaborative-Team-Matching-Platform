import React, { useState } from 'react';
import Auth from './Auth';
import Profile from './Profile';
import Project from './Project';


export default function App() {
  const [view, setView] = useState('AUTH');

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🤝 대학생 맞춤형 팀 빌딩 플랫폼</h1>
      {view === 'AUTH' ? (
        <Auth onLoginSuccess={() => setView('MAIN')} />
      ) : (
        <div>
          <button onClick={() => { localStorage.clear(); setView('AUTH'); }}>로그아웃</button>
          <Profile />
          <Project />
        </div>
      )}
    </div>
  );
}