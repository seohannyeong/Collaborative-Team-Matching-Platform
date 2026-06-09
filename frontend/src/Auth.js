import React, { useState } from 'react';
import API from './api';

export default function Auth({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false); // 회원가입 모드 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        // [1단계] 회원가입 요청
        await API.post('/auth/signup', { email, password, name });
        alert('회원가입 성공! 로그인해 주세요.');
        setIsSignUp(false);
      } else {
        // [2단계] 로그인 요청
        const response = await API.post('/auth/login', { email, password });
        const token = response.data.data.accessToken;
        localStorage.setItem('accessToken', token);
        alert('로그인 성공!');
        onLoginSuccess();
      }
    } catch (error) {
      const serverErrorMessage = error.response?.data?.message;
      if (serverErrorMessage) {
        alert(`❌ 가입 실패 사유: ${serverErrorMessage}`);
      } else {
        alert('서버와의 통신이 원활하지 않습니다. 다시 시도해 주세요.');
      }
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="nav-logo">🤝</span>
          <h1>TeamUp</h1>
          <p>기술 스택을 넘어 협업 스타일까지 맞는 팀을 만나보세요</p>
        </div>

        {/* 로그인 / 회원가입 토글 */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
            type="button"
          >
            로그인
          </button>
          <button
            className={`auth-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
            type="button"
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="label">이메일 주소</label>
            <input
              type="email" className="input" placeholder="example@knu.ac.kr"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
            {isSignUp && <span className="hint">💡 학교 인증이 가능한 올바른 이메일 형식이어야 합니다.</span>}
          </div>

          <div className="form-group">
            <label className="label">비밀번호</label>
            <input
              type="password" className="input" placeholder="비밀번호 입력"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
            {isSignUp && <span className="hint-warn">⚠️ 안전을 위해 반드시 8글자 이상으로 작성해 주세요.</span>}
          </div>

          {isSignUp && (
            <div className="form-group">
              <label className="label">이름 (본명)</label>
              <input
                type="text" className="input" placeholder="홍길동"
                value={name} onChange={e => setName(e.target.value)} required
              />
              <span className="hint">💡 10글자 이내의 한글/영문 본명을 입력해 주세요.</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 4 }}>
            {isSignUp ? '가입 신청하기' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
