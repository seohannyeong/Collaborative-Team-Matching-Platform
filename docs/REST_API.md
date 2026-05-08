🌐 REST API 설계 규격서 (v1.0)

본 문서는 '대학생 팀원 매칭 플랫폼'의 프론트엔드와 백엔드 간 통신을 위한 API 규격입니다.

1. 인증 및 회원가입 (Auth)

POST /api/auth/signup: 회원가입 (이메일, 비밀번호, 이름 등)

POST /api/auth/login: 로그인 (JWT 토큰 발급)

2. 프로필 관리 (Profiles)

GET /api/profiles/{userId}: 특정 유저의 프로필 조회

PUT /api/profiles/me: 내 프로필 수정 (기술 스택, 협업 스타일 등)

GET /api/profiles/search: 기술 스택 및 관심 분야별 유저 검색

POST /api/profiles: 프로필 생성

3. 프로젝트 모집 (Projects)

GET /api/projects: 전체 프로젝트 목록 조회 (필터링 포함)

POST /api/projects: 새 프로젝트 모집 글 작성

GET /api/projects/{id}: 특정 프로젝트 상세 조회

PUT /api/projects/{id}: 프로젝트 수정 (작성자 전용)

DELETE /api/projects/{id}: 프로젝트 삭제 (작성자 전용)

4. 매칭 신청 (Applications)

POST /api/projects/{projectId}/apply: 프로젝트에 지원 신청 (메시지 포함)

GET /api/projects/{projectId}/applications: 프로젝트 지원자 목록 조회 (리더 전용)

PATCH /api/applications/{applicationId}/status: 지원 승인/거절 상태 변경

5. 알림 (Notifications)

GET /api/notifications: 내 알림 목록 조회

PATCH /api/notifications/{id}/read: 알림 읽음 처리

🛠 공통 응답 규격 (Common Response)

{
  "status": 200,
  "message": "Success",
  "data": { ... }
}


📚 API 문서화 도구

Swagger UI: /swagger-ui.html을 통해 인터랙티브 문서 제공 예정

SpringDoc OpenAPI 3.0 라이브러리 활용