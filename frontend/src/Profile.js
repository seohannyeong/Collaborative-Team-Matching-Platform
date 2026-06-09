import React, { useState, useEffect } from 'react';
import API from './api';

export default function Profile() {
  const [interest, setInterest] = useState('');
  const [techStack, setTechStack] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [collaborationStyle, setCollaborationStyle] = useState('');

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMyProfile = async () => {
    try {
      const response = await API.get('/profile/me');
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put('/profile', { interest, techStack, introduction, githubUrl, collaborationStyle });
      alert('프로필이 성공적으로 업데이트되었습니다!');
      setIsEditing(false);
      fetchMyProfile();
    } catch (error) {
      alert('프로필 수정 실패');
    }
  };

  const renderEmpty = (text) => <span className="muted">{text}</span>;

  if (loading) return <div className="loading-page">🔄 내 프로필 로딩 중...</div>;

  return (
    <div className="stack">
      <div>
        <h2 className="page-title">나의 프로필</h2>
        <p className="page-sub">팀장이 보게 될 나의 구직 카드입니다. 꼼꼼히 채울수록 매칭 확률이 올라가요.</p>
      </div>

      <div className="card">
        {/* 기본 인적사항 (수정 불가) */}
        <div className="info-strip" style={{ marginBottom: 22 }}>
          <div>
            <div className="k">이름</div>
            <div className="v">{userName || '미등록'}</div>
          </div>
          <div>
            <div className="k">이메일</div>
            <div className="v">{userEmail || '미등록'}</div>
          </div>
        </div>

        {!isEditing ? (
          /* ===== 조회 모드 ===== */
          <div className="def-list">
            <div className="def-row">
              <span className="k">🎯 관심 분야</span>
              <span className="v">{interest || renderEmpty('등록된 정보가 없습니다.')}</span>
            </div>
            <div className="def-row">
              <span className="k">🛠️ 기술 스택</span>
              <span className="v">{techStack || renderEmpty('등록된 정보가 없습니다.')}</span>
            </div>
            <div className="def-row">
              <span className="k">📝 자기 소개</span>
              <div className="def-block">{introduction || '등록된 자기소개가 없습니다.'}</div>
            </div>
            <div className="def-row">
              <span className="k">🐙 GitHub 주소</span>
              <span className="v">
                {githubUrl
                  ? <a href={githubUrl} target="_blank" rel="noopener noreferrer">{githubUrl}</a>
                  : renderEmpty('등록된 GitHub 링크가 없습니다.')}
              </span>
            </div>
            <div className="def-row">
              <span className="k">🤝 협업 스타일 / 가용 시간</span>
              <span className="v">{collaborationStyle || renderEmpty('등록된 정보가 없습니다.')}</span>
            </div>

            <div>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>✏️ 프로필 수정하기</button>
            </div>
          </div>
        ) : (
          /* ===== 수정 모드 ===== */
          <form onSubmit={handleUpdate} className="form">
            <div className="form-group">
              <label className="label">🎯 관심 분야</label>
              <input type="text" className="input" value={interest} onChange={e => setInterest(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">🛠️ 기술 스택</label>
              <input type="text" className="input" value={techStack} onChange={e => setTechStack(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">📝 자기 소개</label>
              <textarea className="textarea" value={introduction} onChange={e => setIntroduction(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">🐙 GitHub 주소</label>
              <input type="url" className="input" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">🤝 협업 스타일 / 가용 시간</label>
              <input type="text" className="input" value={collaborationStyle} onChange={e => setCollaborationStyle(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-success">💾 저장하기</button>
              <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>취소</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
