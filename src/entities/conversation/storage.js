// 대화 스토리지 관리
export const CONVERSATIONS_STORAGE_KEY = "caesar_conversations";
export const CURRENT_CHAT_STORAGE_KEY = "caesar_current_chat";
export const TRASH_STORAGE_KEY = "caesar_trash";

// 대화 관련 상수
export const MAX_CONVERSATIONS = 30;
export const MAX_TITLE_LENGTH = 20;

// 사용자별 대화 목록 저장
export const saveConversations = (conversations, username) => {
  try {
    const key = `${CONVERSATIONS_STORAGE_KEY}_${username}`;
    localStorage.setItem(key, JSON.stringify(conversations));
  } catch (error) {
    console.error("대화 목록 저장 실패:", error);
  }
};

// 사용자별 대화 목록 불러오기
export const loadConversations = (username) => {
  try {
    const key = `${CONVERSATIONS_STORAGE_KEY}_${username}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("대화 목록 불러오기 실패:", error);
    return [];
  }
};

// 사용자별 현재 대화 ID 저장
export const saveCurrentChatId = (chatId, username) => {
  try {
    const key = `${CURRENT_CHAT_STORAGE_KEY}_${username}`;
    localStorage.setItem(key, chatId);
  } catch (error) {
    console.error("현재 대화 ID 저장 실패:", error);
  }
};

// 사용자별 현재 대화 ID 불러오기
export const loadCurrentChatId = (username) => {
  try {
    const key = `${CURRENT_CHAT_STORAGE_KEY}_${username}`;
    return localStorage.getItem(key) || "default";
  } catch (error) {
    console.error("현재 대화 ID 불러오기 실패:", error);
    return "default";
  }
};

// 휴지통 관련 함수들
export const saveTrashConversations = (trashConversations, username) => {
  try {
    const key = `${TRASH_STORAGE_KEY}_${username}`;
    localStorage.setItem(key, JSON.stringify(trashConversations));
  } catch (error) {
    console.error("휴지통 저장 실패:", error);
  }
};

export const loadTrashConversations = (username) => {
  try {
    const key = `${TRASH_STORAGE_KEY}_${username}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("휴지통 불러오기 실패:", error);
    return [];
  }
};

export const moveToTrash = (conversation, username) => {
  try {
    const trashConversations = loadTrashConversations(username);
    const trashItem = {
      ...conversation,
      deletedAt: new Date().toISOString(),
    };
    trashConversations.unshift(trashItem);
    saveTrashConversations(trashConversations, username);
    return true;
  } catch (error) {
    console.error("휴지통 이동 실패:", error);
    return false;
  }
};

export const restoreFromTrash = (conversationId, username) => {
  try {
    const trashConversations = loadTrashConversations(username);
    const conversationIndex = trashConversations.findIndex(
      (conv) => conv.id === conversationId
    );

    if (conversationIndex === -1) return null;

    const [restoredConversation] = trashConversations.splice(
      conversationIndex,
      1
    );
    delete restoredConversation.deletedAt;

    saveTrashConversations(trashConversations, username);
    return restoredConversation;
  } catch (error) {
    console.error("휴지통 복구 실패:", error);
    return null;
  }
};

export const permanentDeleteFromTrash = (conversationId, username) => {
  try {
    const trashConversations = loadTrashConversations(username);
    const filteredTrash = trashConversations.filter(
      (conv) => conv.id !== conversationId
    );
    saveTrashConversations(filteredTrash, username);
    return true;
  } catch (error) {
    console.error("영구 삭제 실패:", error);
    return false;
  }
};

export const clearTrash = (username) => {
  try {
    const key = `${TRASH_STORAGE_KEY}_${username}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("휴지통 비우기 실패:", error);
    return false;
  }
};

// 특정 사용자의 대화 데이터 삭제 (필요시에만 사용)
export const clearUserConversationData = (username) => {
  localStorage.removeItem(`${CONVERSATIONS_STORAGE_KEY}_${username}`);
  localStorage.removeItem(`${CURRENT_CHAT_STORAGE_KEY}_${username}`);
  localStorage.removeItem(`${TRASH_STORAGE_KEY}_${username}`);
};
