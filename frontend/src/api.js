import axios from 'axios';

// 백엔드 요리사(스프링 부트) 주소 설정
const API = axios.create({
  baseURL: 'http://localhost:8080/api', 
});

// [중요 로직] 요청을 보낼 때 브라우저에 토큰이 있다면 헤더에 Bearer 토큰을 자동으로 탑재
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;