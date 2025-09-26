import { API_BASE } from '../config/api.js';

/**
 * 회사 계정의 Notion API 키를 저장하는 함수
 * @param {string} notionApiKey - Notion API 키
 * @returns {Promise<Object>} 응답 데이터
 */
export const updateNotionApiKey = async (notionApiKey) => {
  // localStorage에서 access token 가져오기
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const response = await fetch(`${API_BASE}/api/company/notion-api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      notionApiKey: notionApiKey
    })
  });

  if (!response.ok) {
    let errorMessage = 'Notion API 키 저장에 실패했습니다.';
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

/**
 * 회사 계정의 Notion API 키 존재 여부 확인
 * @returns {Promise<Object>} 응답 데이터 (hasApiKey: boolean)
 */
export const checkNotionApiKey = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const response = await fetch(`${API_BASE}/api/company/notion-api`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('API 키 확인에 실패했습니다.');
  }

  return await response.json();
};

/**
 * 회사 계정의 Notion API 키 삭제
 * @returns {Promise<Object>} 응답 데이터
 */
export const deleteNotionApiKey = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const response = await fetch(`${API_BASE}/api/company/notion-api`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('API 키 삭제에 실패했습니다.');
  }

  return await response.json();
};

/**
 * 회사 계정의 Notion 데이터 추출 실행
 * @returns {Promise<Object>} 응답 데이터
 */
export const extractNotionData = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const response = await fetch(`${API_BASE}/api/company/notion-extract`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    let errorMessage = 'Notion 데이터 추출에 실패했습니다.';
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

/**
 * 회사 계정의 Notion 데이터 추출 진행률 조회
 * @returns {Promise<Object>} 진행률 데이터 (status, progress, message)
 */
export const getExtractionProgress = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const response = await fetch(`${API_BASE}/api/company/notion-extract/progress`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('진행률 조회에 실패했습니다.');
  }

  return await response.json();
};
