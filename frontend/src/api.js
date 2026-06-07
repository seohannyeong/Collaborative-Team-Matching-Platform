import axios from 'axios';

// 백엔드 요리사(스프링 부트) 주소 설정
const API = axios.create({
  baseURL: 'http://localhost:8080/api', 
});

API.interceptors.request.use(
  (config) => {
    // Auth.js에서 로그인 성공 시 저장한 토큰 키 이름을 확인하세요 (보통 'token' 또는 'accessToken')
    const token = localStorage.getItem('accessToken'); 
    
    if (token) {
      // 백엔드 스프링 시큐리티가 인식할 수 있도록 Bearer 규격으로 넣어줍니다.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;