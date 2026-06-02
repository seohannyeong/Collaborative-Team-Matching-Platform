import React, { useState } from 'react';
import API from './api';

export default function Profile() {
  const [interest, setInterest] = useState('');
  const [techStack, setTechStack] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [collaborationStyle, setCollaborationStyle] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // [3단계] 내 상세 프로필 수정 요청
      await API.put('/profile', { interest, techStack, introduction, githubUrl, collaborationStyle });
      alert('프로필이 성공적으로 업데이트되었습니다!');
    } catch (error) {
      alert('프로필 수정 실패');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h2>👤 내 구직 프로필 완성하기</h2>
      <form onSubmit={handleUpdate}>
        <label>관심 분야:</label><br/>
        <input type="text" value={interest} onChange={e => setInterest(e.target.value)} placeholder="양자 기계 학습, 백엔드" /><br/>
        <label>기술 스택:</label><br/>
        <input type="text" value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="Spring Boot, Python, Qiskit" /><br/>
        <label>자기 소개:</label><br/>
        <textarea value={introduction} onChange={e => setIntroduction(e.target.value)} /><br/>
        <label>GitHub 주소:</label><br/>
        <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} /><br/>
        <label>협업 스타일/가용 시간:</label><br/>
        <input type="text" value={collaborationStyle} onChange={e => setCollaborationStyle(e.target.value)} placeholder="주 20시간 가용, A+ 목표" /><br/>
        <button type="submit">저장하기</button>
      </form>
    </div>
  );
}