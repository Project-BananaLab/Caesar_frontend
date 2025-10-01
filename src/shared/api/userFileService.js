// src/shared/api/userFileService.js
// 개인 파일 업로드 관련 API 서비스

import { API_BASE } from '../config/api';

/**
 * Authorization 헤더 생성
 * localStorage에서 Google User ID를 가져와서 헤더 형식으로 반환
 */
function getAuthHeaders() {
  // localStorage에서 google_user_info 객체를 가져와서 google_user_id 추출
  const userInfoStr = localStorage.getItem('google_user_info');
  if (!userInfoStr) {
    throw new Error('로그인이 필요합니다.');
  }
  
  try {
    const userInfo = JSON.parse(userInfoStr);
    const googleUserId = userInfo.google_user_id || userInfo.googleId;
    
    if (!googleUserId) {
      throw new Error('사용자 ID를 찾을 수 없습니다.');
    }
    
    return {
      'Authorization': `GoogleAuth ${googleUserId}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    throw new Error('로그인 정보가 올바르지 않습니다.');
  }
}

/**
 * 개인 파일 업로드
 * @param {File} file - 업로드할 파일
 * @returns {Promise<Object>} 업로드 결과
 */
export async function uploadPersonalFile(file) {
  try {
    // localStorage에서 google_user_info 객체를 가져와서 google_user_id 추출
    const userInfoStr = localStorage.getItem('google_user_info');
    if (!userInfoStr) {
      throw new Error('로그인이 필요합니다.');
    }

    const userInfo = JSON.parse(userInfoStr);
    const googleUserId = userInfo.google_user_id || userInfo.googleId;
    
    if (!googleUserId) {
      throw new Error('사용자 ID를 찾을 수 없습니다.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/user/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `GoogleAuth ${googleUserId}`,
        // Content-Type은 FormData 사용 시 자동 설정되므로 제외
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '파일 업로드에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    throw error;
  }
}

/**
 * 개인 파일 목록 조회
 * @param {number} limit - 조회할 파일 수 (기본값: 50)
 * @param {number} offset - 시작 인덱스 (기본값: 0)
 * @returns {Promise<Object>} 파일 목록 및 총 개수
 */
export async function getPersonalFiles(limit = 50, offset = 0) {
  try {
    const headers = getAuthHeaders();
    
    const response = await fetch(
      `${API_BASE}/api/user/files/list?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '파일 목록 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('파일 목록 조회 오류:', error);
    throw error;
  }
}

/**
 * 개인 파일 삭제
 * @param {number} fileId - 삭제할 파일 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deletePersonalFile(fileId) {
  try {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE}/api/user/files/${fileId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '파일 삭제에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('파일 삭제 오류:', error);
    throw error;
  }
}

/**
 * 파일 상태 텍스트 변환
 * @param {string} status - 파일 상태 ('pending'|'processing'|'succeeded'|'failed')
 * @returns {string} 한글 상태 텍스트
 */
export function getFileStatusText(status) {
  const statusMap = {
    'pending': '대기 중',
    'processing': '처리 중',
    'succeeded': '완료',
    'failed': '실패',
  };
  
  return statusMap[status] || '알 수 없음';
}

/**
 * 파일 크기를 읽기 쉬운 형태로 변환
 * @param {number} bytes - 바이트 단위 파일 크기
 * @returns {string} 읽기 쉬운 파일 크기 (예: "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
}
