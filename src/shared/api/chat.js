import axios from "axios";
import { getUserPayload } from "../utils/auth.js";
import { createChannel, getChannels } from "./channel.js";

const API_URL = "http://127.0.0.1:8000/chats"; // FastAPI Chat 엔드포인트

// 채널별 채팅 목록 조회
export const getChatsByChannel = async (channelId) => {
  try {
    const response = await axios.get(`${API_URL}`, {
      params: { channel_id: channelId },
    });
    return response.data; // ChatListResponse { chats: [...], total, channel_id }
  } catch (error) {
    console.error("❌ 채팅 불러오기 실패:", error);
    throw error;
  }
};

// 특정 Chat 조회
export const getChat = async (chatId) => {
  try {
    const response = await axios.get(`${API_URL}/${chatId}`);
    return response.data; // ChatResponse
  } catch (error) {
    console.error("❌ 특정 채팅 조회 실패:", error);
    throw error;
  }
};

// 사용자의 기본 채널 ID 가져오기 또는 생성
export const getOrCreateUserChannel = async () => {
  try {
    const userPayload = getUserPayload();
    if (!userPayload?.employee_id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 1. 먼저 백엔드에서 사용자의 채널 목록 조회
    const channelsData = await getChannels(userPayload.employee_id);

    if (channelsData.channels && channelsData.channels.length > 0) {
      // 기존 채널이 있으면 첫 번째 채널 사용
      return channelsData.channels[0].id;
    }

    // 2. 채널이 없으면 새로 생성
    const channel = await createChannel("기본 채널");
    return channel.id;
  } catch (error) {
    console.error("❌ 사용자 채널 생성/조회 실패:", error);
    throw error;
  }
};

// 채팅 생성 (messages 배열 통째로 저장)
export const createChat = async (channelId, messages) => {
  try {
    // channelId가 없으면 사용자 기본 채널 사용
    const finalChannelId = channelId || (await getOrCreateUserChannel());

    const response = await axios.post(API_URL, {
      channel_id: finalChannelId,
      messages: messages, // [{ role: "user", content: "..." }, { role: "agent", content: "..." }]
    });
    return response.data; // ChatResponse
  } catch (error) {
    console.error("❌ 채팅 생성 실패:", error);
    throw error;
  }
};

// 채팅 삭제
export const deleteChat = async (chatId) => {
  try {
    const response = await axios.delete(`${API_URL}/${chatId}`);
    return response.data; // { message, deleted_chat_id }
  } catch (error) {
    console.error("❌ 채팅 삭제 실패:", error);
    throw error;
  }
};

// 실시간 채팅 전송 (기존 Chat에 메시지 추가하거나 새로운 Chat 생성)
export const sendMessage = async (
  channelId,
  content,
  role = "user",
  chatId = null
) => {
  try {
    // 기존 채팅이 있다면 해당 채팅에 메시지 추가, 없다면 새로운 채팅 생성
    if (chatId) {
      // 기존 채팅에 메시지 추가하는 로직 (별도 엔드포인트가 필요할 수 있음)
      // 현재는 새로운 채팅으로 생성하는 방식 사용
      const existingChat = await getChat(chatId);
      const updatedMessages = [...existingChat.messages, { role, content }];

      // 기존 채팅 삭제 후 새로운 채팅으로 재생성 (임시 방법)
      await deleteChat(chatId);
      return await createChat(channelId, updatedMessages);
    } else {
      // 새로운 채팅 생성
      const messages = [{ role, content }];
      return await createChat(channelId, messages);
    }
  } catch (error) {
    console.error("❌ 메시지 전송 실패:", error);
    throw error;
  }
};

// AI 응답 요청 (사용자 질문을 보내고 AI 응답을 받아 DB에 저장)
export const requestAIResponse = async (
  channelId,
  userMessage,
  chatId = null
) => {
  try {
    const userPayload = getUserPayload();

    // 백엔드에 질문-응답을 한 번에 처리하는 API 호출
    const response = await axios.post(
      `${API_URL}/ask`,
      {
        channel_id: channelId,
        user_message: userMessage,
        chat_id: chatId, // 기존 채팅에 추가할 경우
        ...userPayload, // 사용자 정보 포함
      }
      // 헤더 제거: body에 사용자 정보 포함되므로 불필요
    );

    // 백엔드에서 질문과 AI 응답이 포함된 완전한 채팅을 반환
    return response.data; // ChatResponse with user question + AI answer
  } catch (error) {
    console.error("❌ AI 응답 요청 실패:", error);

    // AI 응답 실패 시 사용자 메시지만 저장
    const userOnlyMessages = chatId
      ? [
          ...(await getChat(chatId)).messages,
          { role: "user", content: userMessage },
        ]
      : [{ role: "user", content: userMessage }];

    if (chatId) {
      await deleteChat(chatId);
    }

    return await createChat(channelId, userOnlyMessages);
  }
};

// 채팅 검색 (채널 내 모든 채팅에서 검색)
export const searchChats = async (channelId, searchQuery) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        channel_id: channelId,
        query: searchQuery,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ 채팅 검색 실패:", error);
    // 검색 엔드포인트가 없는 경우 클라이언트에서 처리
    const chatsData = await getChatsByChannel(channelId);
    const searchResults = chatsData.chats.filter((chat) =>
      chat.messages.some((message) =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    return { chats: searchResults, total: searchResults.length };
  }
};

// 채팅 업데이트 (messages 배열 전체 업데이트)
export const updateChat = async (chatId, messages) => {
  try {
    const response = await axios.put(`${API_URL}/${chatId}`, {
      messages: messages,
    });
    return response.data;
  } catch (error) {
    console.error("❌ 채팅 업데이트 실패:", error);
    throw error;
  }
};
