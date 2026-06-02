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
        const token = response.data.accessToken;
        localStorage.setItem('accessToken', token);
        alert('로그인 성공!');
        onLoginSuccess();
      }
    } catch (error) {
      // ✨ [핵심 수정] 백엔드가 보내준 상세한 규칙 위반 메시지가 있으면 그걸 보여주고, 없으면 기본 에러 문구를 보여줍니다.
      const serverErrorMessage = error.response?.data?.message;
      if (serverErrorMessage) {
        alert(`❌ 가입 실패 사유: ${serverErrorMessage}`);
      } else {
        alert('서버와의 통신이 원활하지 않습니다. 다시 시도해 주세요.');
      }
    }
  };

  return (
    <div style={{ padding: '30px', border: '1px solid #ccc', borderRadius: '10px', margin: '20px', backgroundColor: '#f9f9f9' }}>
      <h2>{isSignUp ? '📝 플랫폼 회원가입 창구' : '🔑 로그인 창구'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* 이메일 입력 및 가이드 규약 */}
        <div>
          <label style={{ fontWeight: 'bold' }}>이메일 주소</label><br />
          <input type="email" placeholder="example@knu.ac.kr" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
          {isSignUp && <small style={{ color: '#666', display: 'block', marginTop: '3px' }}>💡 학교 인증이 가능한 올바른 이메일 형식이어야 합니다.</small>}
        </div>

        {/* 비밀번호 입력 및 가이드 규약 */}
        <div>
          <label style={{ fontWeight: 'bold' }}>비밀번호</label><br />
          <input type="password" placeholder="비밀번호 입력" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
          {isSignUp && <small style={{ color: '#d9534f', fontWeight: 'bold', display: 'block', marginTop: '3px' }}>⚠️ 필수 규약: 안전을 위해 반드시 "8글자 이상"으로 작성해 주세요.</small>}
        </div>

        {/* 이름 입력 및 가이드 규약 */}
        {isSignUp && (
          <div>
            <label style={{ fontWeight: 'bold' }}>이름 (본명)</label><br />
            <input type="text" placeholder="홍길동" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
            <small style={{ color: '#666', display: 'block', marginTop: '3px' }}>💡 10글자 이내의 한글/영문 본명을 입력해 주세요.</small>
          </div>
        )}

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isSignUp ? '가입 신청하기' : '로그인'}
        </button>
      </form>

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />

      <button onClick={() => setIsSignUp(!isSignUp)} style={{ width: '100%', padding: '8px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}>
        {isSignUp ? '이미 계정이 있으신가요? 로그인하기' : '플랫폼이 처음이신가요? 회원가입하기'}
      </button>
    </div>
  );
}