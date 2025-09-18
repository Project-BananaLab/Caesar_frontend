// 사용자 인증 관련 도메인 로직
export const AUTH_STORAGE_KEY = 'caesar_auth'

// 로그인 상태 저장 (세션 스토리지 사용 - 브라우저 닫으면 삭제됨)
export const saveAuthData = (authData) => {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))
}

// 로그인 상태 불러오기 (세션 스토리지에서)
export const loadAuthData = () => {
  try {
    const data = sessionStorage.getItem(AUTH_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Auth data parsing error:', error)
    return null
  }
}

// 로그인 상태 삭제
export const clearAuthData = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
