import React, { useState, useEffect } from 'react';
import API from './api';

// ISO 문자열 → datetime-local input 값(YYYY-MM-DDTHH:mm)으로 변환
const toInputDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ProjectDetail({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myName, setMyName] = useState('');

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [recruitCount, setRecruitCount] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('RECRUITING');

  const fillForm = (p) => {
    setTitle(p.title || '');
    setDescription(p.description || '');
    setTechStack(p.techStack || '');
    setRecruitCount(p.recruitCount || 1);
    setDeadline(toInputDateTime(p.deadline));
    setStatus(p.status || 'RECRUITING');
  };

  const fetchProjectDetail = async () => {
    try {
      const response = await API.get(`/projects/${projectId}`);
      const realData = response.data.data;
      setProject(realData);
      fillForm(realData);
    } catch (error) {
      console.error('프로젝트 상세 정보를 가져오는데 실패했습니다.', error);
      alert('상세 정보를 불러올 수 없거나 권한이 없습니다.');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    // 팀장 여부 판별용 내 이름도 함께 조회
    API.get('/profile/me')
      .then(res => setMyName(res.data.data.name || ''))
      .catch(() => {});
    fetchProjectDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // 프로젝트 수정 저장
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/projects/${projectId}`, {
        title, description, techStack,
        recruitCount: parseInt(recruitCount),
        deadline: deadline.length === 16 ? deadline + ':00' : deadline,
        status,
      });
      alert('프로젝트가 수정되었습니다!');
      setIsEditing(false);
      fetchProjectDetail();
    } catch (error) {
      alert('수정 실패: ' + (error.response?.data?.message || '권한이 없습니다.'));
    }
  };

  // 프로젝트 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 이 모집글을 삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
    try {
      await API.delete(`/projects/${projectId}`);
      alert('모집글이 삭제되었습니다.');
      onBack();
    } catch (error) {
      alert('삭제 실패: ' + (error.response?.data?.message || '권한이 없습니다.'));
    }
  };

  if (loading) return <div className="loading-page">🔄 팀 정보를 불러오는 중...</div>;
  if (!project) return <div className="loading-page">❌ 해당 팀 프로젝트 정보를 찾을 수 없습니다.</div>;

  const isRecruiting = project.status === 'RECRUITING';
  const isLeader = myName && project.leaderName === myName;

  return (
    <div className="stack">
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        ⬅️ 목록으로
      </button>

      <div className="card card-pad-lg">
        {!isEditing ? (
          /* ===== 조회 모드 ===== */
          <>
            <div className="item-head" style={{ marginBottom: 20 }}>
              <h2 className="page-title" style={{ margin: 0 }}>{project.title}</h2>
              <span className={`badge ${isRecruiting ? 'badge-green' : 'badge-yellow'}`}>
                {isRecruiting ? '🟢 모집 중' : '🟠 모집 마감 / 진행 중'}
              </span>
            </div>

            <div className="def-list">
              <div className="meta-row" style={{ gap: 28 }}>
                <div className="def-row">
                  <span className="k">👑 팀장(개설자)</span>
                  <span className="v">{project.leaderName}</span>
                </div>
                <div className="def-row">
                  <span className="k">👥 정원 구성</span>
                  <span className="v">총 {project.recruitCount}명 모집</span>
                </div>
                <div className="def-row">
                  <span className="k">🛠️ 필요 기술 스택</span>
                  <span className="v"><span className="badge badge-blue">{project.techStack}</span></span>
                </div>
                <div className="def-row">
                  <span className="k">📅 구인 종료 일시</span>
                  <span className="v" style={{ color: 'var(--danger)', fontWeight: 700 }}>
                    {new Date(project.deadline).toLocaleString()}
                  </span>
                </div>
              </div>

              <hr />

              <div className="def-row">
                <span className="k">📝 프로젝트 상세 설명</span>
                <div className="def-block">{project.description}</div>
              </div>
            </div>

            {/* 팀장에게만 보이는 관리 버튼 */}
            {isLeader && (
              <div className="card-actions" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line-2)' }}>
                <button className="btn btn-primary btn-sm" onClick={() => { fillForm(project); setIsEditing(true); }}>
                  ✏️ 모집글 수정
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  🗑️ 모집글 삭제
                </button>
              </div>
            )}
          </>
        ) : (
          /* ===== 수정 모드 (팀장 전용) ===== */
          <>
            <h2 className="page-title" style={{ marginBottom: 18 }}>✏️ 모집글 수정</h2>
            <form onSubmit={handleUpdate} className="form">
              <div className="form-group">
                <label className="label">📌 프로젝트 제목</label>
                <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">📝 팀 프로젝트 설명</label>
                <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">🛠️ 요구 기술 스택</label>
                <input type="text" className="input" value={techStack} onChange={e => setTechStack(e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: '0 0 120px' }}>
                  <label className="label">👥 모집 인원</label>
                  <input type="number" className="input" value={recruitCount} onChange={e => setRecruitCount(e.target.value)} min="1" required />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
                  <label className="label">📅 모집 마감 기한</label>
                  <input type="datetime-local" className="input" value={deadline} onChange={e => setDeadline(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: '0 0 200px' }}>
                  <label className="label">📊 모집 상태</label>
                  <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="RECRUITING">🟢 모집 중</option>
                    <option value="COMPLETED">🟠 모집 마감 / 매칭 완료</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-success">💾 저장</button>
                <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>취소</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
