import React, { useState, useEffect } from 'react';
import API from './api';

export default function Profile() {
  // 1. 프로필 데이터 상태 관리
  const [interest, setInterest] = useState('');
  const [techStack, setTechStack] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [collaborationStyle, setCollaborationStyle] = useState('');
  
  // 백엔드 ProfileResponse에서 추가로 넘겨주는 유저 기본 정보
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // 2. 현재 상태 제어 (isEditing이 false면 '조회 화면', true면 '수정 화면')
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 3. 컴포넌트가 켜질 때 백엔드에서 "기존에 작성한 내 프로필" 불러오기
  const fetchMyProfile = async () => {
    try {
      const response = await API.get('/profile/me');
      
      // ✨ [중요] 백엔드 ApiResponse 규격에 맞춰 .data.data로 접근합니다.
      const profile = response.data.data;
      
      if (profile) {
        setInterest(profile.interest || '');
        setTechStack(profile.techStack || '');
        setIntroduction(profile.introduction || '');
        setGithubUrl(profile.githubUrl || '');
        setCollaborationStyle(profile.collaborationStyle || '');
        setUserName(profile.name || '');
        setUserEmail(profile.email || '');
      }
    } catch (error) {
      console.error('내 프로필 정보를 불러오지 못했습니다.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  // 4. 프로필 수정 내용 서버에 저장하기
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put('/profile', { interest, techStack, introduction, githubUrl, collaborationStyle });
      alert('프로필이 성공적으로 업데이트되었습니다!');
      setIsEditing(false); // 저장 완료 후 다시 조회 모드로 변경
      fetchMyProfile();    // 최신 데이터 다시 받아오기
    } catch (error) {
      alert('프로필 수정 실패');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>🔄 내 프로필 로딩 중...</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #007bff', margin: '20px 0', borderRadius: '8px', background: '#fdfdfd' }}>
      <h2>👤 나의 구직 프로필</h2>
      
      {/* 기본 회원 인적사항 (수정 불가 영역) */}
      <div style={{ background: '#f1f3f5', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px' }}>
        <p style={{ margin: '3px 0' }}><strong>이름:</strong> {userName || '미등록'}</p>
        <p style={{ margin: '3px 0' }}><strong>이메일:</strong> {userEmail || '미등록'}</p>
      </div>

      {!isEditing ? (
        /* 👁️ [모드 A] 상세 보기 화면 (Read-Only) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p><strong>🎯 관심 분야:</strong> {interest || <span style={{color:'#aaa'}}>등록된 정보가 없습니다.</span>}</p>
          <p><strong>🛠️ 기술 스택:</strong> {techStack || <span style={{color:'#aaa'}}>등록된 정보가 없습니다.</span>}</p>
          <div>
            <strong>📝 자기 소개:</strong>
            <p style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: '10px', borderRadius: '4px', border: '1px solid #eee', marginTop: '5px' }}>
              {introduction || '등록된 자기소개가 없습니다.'}
            </p>
          </div>
          <p>
            <strong>🐙 GitHub 주소:</strong>{' '}
            {githubUrl ? (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>{githubUrl}</a>
            ) : (
              <span style={{color:'#aaa'}}>등록된 GitHub 링크가 없습니다.</span>
            )}
          </p>
          <p><strong>🤝 협업 스타일 / 가용 시간:</strong> {collaborationStyle || <span style={{color:'#aaa'}}>등록된 정보가 없습니다.</span>}</p>
          
          <button 
            onClick={() => setIsEditing(true)} 
            style={{ marginTop: '10px', padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✏️ 프로필 수정하기
          </button>
        </div>
      ) : (
        /* ✏️ [모드 B] 수정하기 화면 (Form Input 활성화) */
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold' }}>🎯 관심 분야:</label><br/>
            <input type="text" value={interest} onChange={e => setInterest(e.target.value)} style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold' }}>🛠️ 기술 스택:</label><br/>
            <input type="text" value={techStack} onChange={e => setTechStack(e.target.value)} style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>📝 자기 소개:</label><br/>
            <textarea value={introduction} onChange={e => setIntroduction(e.target.value)} style={{ width: '100%', height: '80px', padding: '6px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>🐙 GitHub 주소:</label><br/>
            <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>🤝 협업 스타일 / 가용 시간:</label><br/>
            <input type="text" value={collaborationStyle} onChange={e => setCollaborationStyle(e.target.value)} style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
          </div>

          <div style={{ marginTop: '10px' }}>
            <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}>
              💾 저장하기
            </button>
            <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '8px 15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              ❌ 취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}