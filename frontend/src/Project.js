import React, { useState, useEffect } from 'react';
import API from './api';

export default function Project({ onProjectSelect }) {
  const [projects, setProjects] = useState([]); 
  const [appliedProjectIds, setAppliedProjectIds] = useState([]); 
  const [currentUserName, setCurrentUserName] = useState('');     
  const [loading, setLoading] = useState(true);
  
  // 폼 개설 상태들
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [recruitCount, setRecruitCount] = useState(1);
  const [deadline, setDeadline] = useState('');

  // 🔍 검색 필드 상태들
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchTechStack, setSearchTechStack] = useState('');
  const [searchStatus, setSearchStatus] = useState('RECRUITING'); 

  // 기본 유저 정보 및 지원 내역 선 로드
  const initUserAndApplications = async () => {
    try {
      const profileRes = await API.get('/profile/me');
      setCurrentUserName(profileRes.data.data.name || '');

      const sentAppsRes = await API.get('/applications/sent');
      const sentApps = sentAppsRes.data.data || [];
      const appliedIds = sentApps.map(app => app.projectId);
      setAppliedProjectIds(appliedIds);
    } catch (error) {
      console.error('기본 유저 데이터 동기화 실패:', error);
    }
  };

  const fetchFilteredProjects = async (e) => {
    if (e) e.preventDefault(); 
    setLoading(true);
    try {
      let searchResults = [];

      // 검색창이 둘 다 비어있으면 전체 조회 API 호출
      if (!searchKeyword.trim() && !searchTechStack.trim()) {
        const response = await API.get('/projects');
        const allData = response.data.data.content || response.data.data || [];
        searchResults = allData.filter(proj => proj.status === searchStatus);
      } 
      // 🔍 글자가 입력되어 검색할 때
      else {
        // 🌟 [가장 정석적인 동적 주소 조립]
        // 값이 있는 파라미터만 주소 뒤에 엮어주고, 빈 값은 아예 누락시켜 백엔드에서 null로 받게 유도합니다.
        const params = new URLSearchParams();
        if (searchKeyword.trim()) params.append('keyword', searchKeyword.trim());
        if (searchTechStack.trim()) params.append('techStack', searchTechStack.trim());
        if (searchStatus) params.append('status', searchStatus);

        // 최종 주소 예시: /projects/search?keyword=스프링&status=RECRUITING
        const response = await API.get(`/projects/search?${params.toString()}`);
        searchResults = response.data.data || [];
      }

      const now = new Date();
      const activeProjects = searchResults.filter(proj => {
        if (searchStatus === 'RECRUITING') {
          return new Date(proj.deadline) > now;
        }
        return true; 
      });

      setProjects(activeProjects);
    } catch (error) {
      console.error('프로젝트 데이터 동기화 실패:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 조건 초기화 함수
  const handleResetSearch = () => {
    setSearchKeyword('');
    setSearchTechStack('');
    setSearchStatus('RECRUITING');
    // 즉시 기본 전체 목록을 새로고침 하도록 트리거
    setTimeout(() => {
      loadInitialData();
    }, 50);
  };

  const loadInitialData = async () => {
    setLoading(true);
    await initUserAndApplications();
    await fetchFilteredProjects(); 
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', { 
        title, description, techStack, 
        recruitCount: parseInt(recruitCount), 
        deadline: deadline + ":00" 
      });
      alert('새로운 모집 팀이 성공적으로 개설되었습니다!');
      loadInitialData(); 
      setTitle(''); setDescription(''); setTechStack(''); setRecruitCount(1); setDeadline('');
    } catch (error) {
      alert('프로젝트 개설 실패');
    }
  };

  const handleApply = async (projectId) => {
    const message = prompt('팀장에게 보낼 정성 가득한 지원 한줄평을 적어주세요:');
    if (!message) return;
    try {
      await API.post(`/projects/${projectId}/apply`, { message });
      alert('지원이 완료되었습니다! 팀장의 대시보드 승인을 기다려주세요.');
      loadInitialData(); 
    } catch (error) {
      alert(error.response?.data?.message || '지원 실패');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* SECTION A: 새로운 모집 팀 개설 폼 */}
      <div style={{ 
        background: '#f1f3f5', padding: '25px', borderRadius: '10px', border: '1px solid #ced4da',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0, color: '#343a40', borderBottom: '2px solid #6c757d', paddingBottom: '8px' }}>
          🚀 새로운 모집 팀 개설하기
        </h3>
        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
          <div>
            <strong>📌 프로젝트 제목: </strong>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '96%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <strong>📝 팀 프로젝트 설명: </strong><br/>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '96%', height: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '4px' }} />
          </div>
          <div>
            <strong>🛠️ 요구 기술 스택: </strong>
            <input type="text" value={techStack} onChange={e => setTechStack(e.target.value)} required style={{ width: '96%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <strong>👥 모집 인원 (명): </strong>
              <input type="number" value={recruitCount} onChange={e => setRecruitCount(e.target.value)} min="1" required style={{ width: '60px', padding: '5px' }} />
            </div>
            <div>
              <strong>📅 모집 마감 기한: </strong>
              <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required style={{ padding: '4px' }} />
            </div>
          </div>
          <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>
            ✨ 팀 생성 및 구인 시작
          </button>
        </form>
      </div>

      {/* SECTION B: 모집 중인 팀 목록 및 검색 엔진 바 */}
      <div style={{ border: '1px solid #dee2e6', padding: '25px', borderRadius: '10px', background: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h3 style={{ marginTop: 0, color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
          🌐 현재 모집 중인 팀 목록
        </h3>
        
        {/* 🔍 맞춤형 멀티 검색 필터 폼 섹션 */}
        <form onSubmit={fetchFilteredProjects} style={{ 
          display: 'flex', gap: '10px', alignItems: 'center', background: '#f8f9fa', 
          padding: '15px', borderRadius: '6px', margin: '15px 0 25px 0', border: '1px solid #e9ecef', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>🔍 키워드 검색</span>
            <input 
              type="text" placeholder="제목/내용 검색" value={searchKeyword} 
              onChange={e => setSearchKeyword(e.target.value)}
              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', width: '140px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>🛠️ 기술 스택</span>
            <input 
              type="text" placeholder="예: React, Java" value={searchTechStack} 
              onChange={e => setSearchTechStack(e.target.value)}
              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', width: '140px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>📊 모집 상태</span>
            <select 
              value={searchStatus} 
              onChange={e => setSearchStatus(e.target.value)}
              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', height: '32px' }}
            >
              <option value="RECRUITING">🟢 모집 중</option>
              <option value="COMPLETED">🟠 모집 마감 / 팀 매칭 완료</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', height: '32px' }}>
            <button type="submit" style={{ padding: '0 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              검색하기
            </button>
            <button type="button" onClick={handleResetSearch} style={{ padding: '0 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              초기화
            </button>
          </div>
        </form>

        {/* 게시판 리스트 본체 */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>⏳ 데이터를 동기화하는 중...</p>
        ) : projects.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '30px 0' }}>조건에 부합하는 구인 팀이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {projects.map((proj) => {
              const isMyOwnProject = proj.leaderName === currentUserName;
              const isAlreadyApplied = appliedProjectIds.includes(proj.id);

              return (
                <div key={proj.id} style={{ 
                  border: '1px solid #e9ecef', padding: '18px', borderRadius: '8px', background: '#f8f9fa',
                  borderLeft: isMyOwnProject ? '5px solid #28a745' : isAlreadyApplied ? '5px solid #ffc107' : '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>{proj.title}</h4>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ background: '#e2e3e5', color: '#383d41', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        👥 모집 {proj.recruitCount}명
                      </span>
                      {isMyOwnProject && <span style={{ background: '#d4edda', color: '#155724', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>👑 내가 개설함</span>}
                      {isAlreadyApplied && <span style={{ background: '#fff3cd', color: '#856404', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>📝 이미 신청함</span>}
                    </div>
                  </div>

                  <p style={{ color: '#495057', margin: '8px 0', fontSize: '15px' }}>{proj.description}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>🛠️ 필요 스택:</strong> {proj.techStack}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#6c757d' }}><strong>👑 팀장 명:</strong> {proj.leaderName}</p>
                  
                  <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => onProjectSelect(proj.id)} 
                      style={{ padding: '6px 14px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                    >
                      🔍 팀 상세보기
                    </button>

                    {isMyOwnProject ? (
                      <button disabled style={{ padding: '6px 14px', background: '#e2e3e5', color: '#6c757d', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontSize: '13px' }}>
                        ✓ 내가 개설한 팀 리더 상태
                      </button>
                    ) : isAlreadyApplied ? (
                      <button disabled style={{ padding: '6px 14px', background: '#ffeeba', color: '#856404', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontSize: '13px', fontWeight: 'bold' }}>
                        ✓ 이미 지원 완료한 팀
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApply(proj.id)}
                        style={{ padding: '6px 14px', cursor: 'pointer', background: '#00c73c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}
                      >
                        이 팀에 지원하기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}