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
