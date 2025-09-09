// 인증 관련 유틸리티 함수들
export const AUTH_STORAGE_KEY = 'caesar_auth'
export const CONVERSATIONS_STORAGE_KEY = 'caesar_conversations'
export const CURRENT_CHAT_STORAGE_KEY = 'caesar_current_chat'

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

// 사용자 권한 정의 (하드코딩)
export const USER_ROLES = {
  ADMIN: 0,
  USER: 1
}

// 사용자 권한 매핑 (하드코딩)
export const getUserRole = (username) => {
  const adminUsers = ['admin', 'caesar']
  return adminUsers.includes(username) ? USER_ROLES.ADMIN : USER_ROLES.USER
}

// 관리자 권한 체크
export const isAdmin = (user) => {
  if (!user) return false
  return getUserRole(user.username) === USER_ROLES.ADMIN
}

// 사용자별 대화 목록 저장
export const saveConversations = (conversations, username) => {
  try {
    const key = `${CONVERSATIONS_STORAGE_KEY}_${username}`
    localStorage.setItem(key, JSON.stringify(conversations))
  } catch (error) {
    console.error('대화 목록 저장 실패:', error)
  }
}

// 사용자별 대화 목록 불러오기
export const loadConversations = (username) => {
  try {
    const key = `${CONVERSATIONS_STORAGE_KEY}_${username}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('대화 목록 불러오기 실패:', error)
    return []
  }
}

// 사용자별 현재 대화 ID 저장
export const saveCurrentChatId = (chatId, username) => {
  try {
    const key = `${CURRENT_CHAT_STORAGE_KEY}_${username}`
    localStorage.setItem(key, chatId)
  } catch (error) {
    console.error('현재 대화 ID 저장 실패:', error)
  }
}

// 사용자별 현재 대화 ID 불러오기
export const loadCurrentChatId = (username) => {
  try {
    const key = `${CURRENT_CHAT_STORAGE_KEY}_${username}`
    return localStorage.getItem(key) || 'default'
  } catch (error) {
    console.error('현재 대화 ID 불러오기 실패:', error)
    return 'default'
  }
}

// 특정 사용자의 대화 데이터 삭제 (필요시에만 사용)
export const clearUserConversationData = (username) => {
  localStorage.removeItem(`${CONVERSATIONS_STORAGE_KEY}_${username}`)
  localStorage.removeItem(`${CURRENT_CHAT_STORAGE_KEY}_${username}`)
}
