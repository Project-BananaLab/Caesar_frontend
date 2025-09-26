// API 베이스 URL
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API 엔드포인트 설정
export const API_ENDPOINTS = {
  CHAT: "/api/chat",
  AGENT: "/api/agent",
  FILES: "/api/files",
};

// 전역 앱 설정
export const ADMIN_PAGE_SIZE = 10;
