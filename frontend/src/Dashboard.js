import React, { useState, useEffect } from 'react';
import API from './api';

export default function Dashboard() {
  const [sentApplications, setSentApplications] = useState([]);     // 내가 신청한 지원서
  const [receivedApplications, setReceivedApplications] = useState([]); // 내가 팀장이라 받은 지원서

  // 1. 모든 지원서 목록 로드 (보낸 것 + 받은 것)
  const fetchApplications = async () => {
    try {
      const sentRes = await API.get('/applications/sent');
      const receivedRes = await API.get('/applications/received');
      setSentApplications(sentRes.data);
      setReceivedApplications(receivedRes.data);
    } catch (error) {
      console.error('지원 현황을 로드하지 못했습니다.', error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // 2. 팀장 입장에서 지원서 승인(APPROVED) 또는 거절(REJECTED) 처리하기
  const handleUpdateStatus = async (applicationId, status) => {
    const actionText = status === 'APPROVED' ? '승인' : '거절';
    if (!window.confirm(`이 지원서를 정말 ${actionText}하시겠습니까?`)) return;

    try {
      // PATCH /api/applications/{id}/status 요청 전송
      await API.patch(`/applications/${applicationId}`, { status });
      alert(`성공적으로 지원서를 ${actionText}했습니다.`);
      fetchApplications(); // 변경 후 목록 새로고침
    } catch (error) {
      alert('상태 변경 실패: ' + (error.response?.data?.message || '권한이 없습니다.'));
    }
  };

  // 상태값에 따른 이쁜 뱃지 디자인 스타일 추출 함수
  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { bg: '#ffeeba', text: '#9e6d00', label: '⏳ 대기중' },
      APPROVED: { bg: '#d4edda', text: '#155724', label: '✅ 승인됨(합격)' },
      REJECTED: { bg: '#f8d7da', text: '#721c24', label: '❌ 거절됨' }
    };
    const current = styles[status] || { bg: '#eee', text: '#333', label: status };
    return (
      <span style={{ padding: '3px 8px', borderRadius: '4px', background: current.bg, color: current.text, fontWeight: 'bold', fontSize: '13px' }}>
        {current.label}
      </span>
    );
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #aaa', margin: '20px', borderRadius: '8px' }}>
      <h2>🎛️ 나의 매칭 대시보드 (마이페이지)</h2>
      <hr />

      {/* SECTION A: 내가 다른 프로젝트에 지원한 현황 */}
      <div style={{ marginBottom: '40px' }}>
        <h3>📤 내가 보낸 지원서 (지원 결과 확인)</h3>
        {sentApplications.length === 0 ? (
          <p style={{ color: '#888' }}>아직 지원한 프로젝트가 없습니다.</p>
        ) : (
          sentApplications.map((app) => (
            <div key={app.id} style={{ border: '1px solid #eee', padding: '12px', margin: '10px 0', borderRadius: '5px' }}>
              <h4>📂 프로젝트 ID: {app.projectId}</h4>
              <p>💌 <strong>내가 보낸 메시지:</strong> {app.message}</p>
              <p>📊 <strong>현재 심사 상태:</strong> {getStatusBadge(app.status)}</p>
            </div>
          ))
        )}
      </div>

      {/* SECTION B: 내 프로젝트에 다른 사람들이 지원한 현황 관리 */}
      <div>
        <h3>📥 내가 받은 지원서 (팀원 매칭 관리)</h3>
        {receivedApplications.length === 0 ? (
          <p style={{ color: '#888' }}>내 프로젝트에 들어온 지원서가 없습니다.</p>
        ) : (
          receivedApplications.map((app) => (
            <div key={app.id} style={{ border: '1px solid #eee', padding: '12px', margin: '10px 0', borderRadius: '5px', background: '#fff' }}>
              <h4>📂 프로젝트 ID: {app.projectId}</h4>
              <p>🙋‍♂️ <strong>지원자 성함/ID:</strong> {app.applicantName}</p>
              <p>✉️ <strong>지원 한줄평:</strong> {app.message}</p>
              <p>📊 <strong>상태:</strong> {getStatusBadge(app.status)}</p>
              
              {/* 대기중(PENDING)일 때만 승인/거절 버튼을 화면에 노출시킵니다 */}
              {app.status === 'PENDING' && (
                <div style={{ marginTop: '10px' }}>
                  <button 
                    onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                    style={{ marginRight: '10px', background: '#28a745', color: '#fff', border: 'none', padding: '5px 12px', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    👍 팀원으로 승인
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                    style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 12px', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    👎 지원 거절
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}