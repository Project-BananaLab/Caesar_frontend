// 대화 스토리지 관리
export const CONVERSATIONS_STORAGE_KEY = 'caesar_conversations'
export const CURRENT_CHAT_STORAGE_KEY = 'caesar_current_chat'

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
