import axios from "axios";
import { setCookie, getCookie } from "../utils/cookies.js";

// FastAPI 서버 주소
const api = axios.create({
  baseURL: "/agent", // Vite 프록시를 통해 FastAPI로 전달
  headers: {
    "Content-Type": "application/json",
    charset: "utf-8",
  },
  withCredentials: true, // 쿠키를 포함하여 요청
});

class AgentService {
  constructor() {
    this.conversationHistory = [];
    this.isProcessing = false;
  }

  // 메시지 처리 - FastAPI 서버 사용
  async processMessage(message, userId = "default") {
    if (this.isProcessing) {
      throw new Error("이전 요청이 처리 중입니다.");
    }

    this.isProcessing = true;

    try {
      // localStorage의 구글 토큰을 쿠키로 동기화
      const googleToken = localStorage.getItem("google_access_token");
      if (googleToken && !getCookie("google_access_token")) {
        setCookie("google_access_token", googleToken, 1);
        console.log("✅ 구글 토큰을 쿠키로 동기화함");
      }

      // FastAPI 서버에 요청 보내기 (쿠키는 자동으로 전달됨)
      const body = { user_id: userId, query: message };
      console.log("🚀 FastAPI 요청 보내는 중:", body);
      console.log("🌐 요청 URL:", `${api.defaults.baseURL}/query`);
      console.log("🍪 쿠키 전달 설정:", api.defaults.withCredentials);

      const response = await api.post("/query", body);
      console.log("📥 FastAPI 원본 응답:", response);
      console.log("📥 응답 상태:", response.status);
      console.log("📥 응답 헤더:", response.headers);

      const result = response.data;
      console.log("📋 result.output:", result.output);
      console.log("📋 result.response:", result.response);

      if (!result.success) {
        throw new Error(result.message || "서버에서 오류가 발생했습니다.");
      }

      // 응답 텍스트 추출 (여러 필드명 시도)
      let responseText = null;

      // 각 필드를 개별적으로 체크하여 디버깅
      if (result.output) {
        responseText = result.output;
        console.log("✅ result.output에서 응답 추출:", responseText);
      } else if (result.response) {
        responseText = result.response;
        console.log("✅ result.response에서 응답 추출:", responseText);
      } else if (result.answer) {
        responseText = result.answer;
        console.log("✅ result.answer에서 응답 추출:", responseText);
      } else if (result.text) {
        responseText = result.text;
        console.log("✅ result.text에서 응답 추출:", responseText);
      } else if (result.message) {
        responseText = result.message;
        console.log("✅ result.message에서 응답 추출:", responseText);
      } else {
        responseText = "응답을 받지 못했습니다.";
        console.log(
          "❌ 응답 필드를 찾을 수 없음. 사용 가능한 필드들:",
          Object.keys(result)
        );
      }

      console.log("✅ 최종 추출된 응답 텍스트:", responseText);

      // ✅ RAG 결과 포맷팅 (여러 필드명 체크)
      const ragResults =
        result.rag_results ||
        result.ragResults ||
        result.rag ||
        result.sources ||
        result.references ||
        result.documents;

      console.log("🔍 RAG 결과 확인 (rag_results):", result.rag_results);
      console.log("🔍 RAG 결과 확인 (ragResults):", result.ragResults);
      console.log("🔍 RAG 결과 확인 (rag):", result.rag);
      console.log("🔍 RAG 결과 확인 (sources):", result.sources);
      console.log("🔍 최종 선택된 RAG 결과:", ragResults);
      console.log("🔍 RAG 결과 타입:", typeof ragResults);
      console.log("🔍 RAG 결과 길이:", ragResults?.length);

      console.log("✅ 최종 응답 텍스트:", responseText);

      // 로컬 히스토리 업데이트
      this.conversationHistory.push({
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      this.conversationHistory.push({
        role: "assistant",
        content: responseText,
        timestamp: new Date().toISOString(),
        conversationId: result.conversation_id || `conv_${Date.now()}`,
      });

      return {
        success: true,
        response: responseText,
        conversationId: result.conversation_id || `conv_${Date.now()}`,
      };
    } catch (error) {
      console.error("❌ FastAPI 서버 통신 오류:", error);
      console.error("❌ 에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        headers: error.config?.headers,
      });

      // 실제 응답 데이터가 있는지 확인
      if (error.response && error.response.data) {
        console.error(
          "❌ 서버 응답 데이터:",
          JSON.stringify(error.response.data, null, 2)
        );
      }

      // 에러 응답
      let errorResponse = "죄송합니다. 서버 연결에 문제가 발생했습니다.";

      if (error.response) {
        // 서버가 응답했지만 에러 상태코드
        errorResponse = `서버 오류 (${error.response.status}): ${
          error.response.data?.message || error.response.statusText
        }`;
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못함
        errorResponse =
          "서버에 연결할 수 없습니다. FastAPI 서버가 실행 중인지 확인해주세요.";
      } else {
        // 요청 설정 중 에러
        errorResponse = `요청 설정 오류: ${error.message}`;
      }

      this.conversationHistory.push({
        role: "assistant",
        content: errorResponse,
        timestamp: new Date().toISOString(),
        error: true,
      });

      return {
        success: false,
        response: errorResponse,
        error: error.message,
      };
    } finally {
      this.isProcessing = false;
    }
  }

  // 대화 히스토리 조회 (서버에서 가져오기)
  async getConversationHistory(userId = "default") {
    try {
      const response = await api.get(`/history/${userId}`);
      const result = response.data;

      // 서버 응답을 로컬 형식으로 변환
      this.conversationHistory = (result.chat_history || []).map((msg) => ({
        role: msg.role,
        content: msg.content || msg.text,
        timestamp: msg.timestamp || new Date().toISOString(),
      }));

      return this.conversationHistory;
    } catch (error) {
      console.error("대화 히스토리 조회 오류:", error);
      return this.conversationHistory;
    }
  }

  // 대화 히스토리 초기화
  async clearConversationHistory(userId = "default") {
    try {
      await api.delete(`/history/${userId}`);
      this.conversationHistory = [];
      console.log("🗑️ 대화 히스토리가 초기화되었습니다.");
    } catch (error) {
      console.error("대화 히스토리 초기화 오류:", error);
      this.conversationHistory = [];
    }
  }

  // 대화 히스토리 로드 함수
  loadConversationHistory(messages) {
    this.conversationHistory = messages || [];
  }

  // 현재 처리 상태 조회
  isCurrentlyProcessing() {
    return this.isProcessing;
  }

  // 서버 상태 체크
  async checkHealth() {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      console.error("서버 상태 체크 오류:", error);
      return { status: "error", message: "서버에 연결할 수 없습니다." };
    }
  }
}

// 기존 함수형 API도 유지 (하위 호환성)
export const queryAgent = async (userId, query, apiKey = null) => {
  const body = { user_id: userId, query };
  if (apiKey) body.openai_api_key = apiKey;

  const res = await api.post("/query", body);
  return res.data;
};

export const getChatHistory = async (userId) => {
  const res = await api.get(`/history/${userId}`);
  return res.data;
};

export const clearChatHistory = async (userId) => {
  const res = await api.delete(`/history/${userId}`);
  return res.data;
};

export const getAgentStats = async () => {
  const res = await api.get("/stats");
  return res.data;
};

export const resetUserAgent = async (userId) => {
  const res = await api.post(`/reset/${userId}`);
  return res.data;
};

export const resetAllAgents = async () => {
  const res = await api.post("/reset-all");
  return res.data;
};

export const checkAgentHealth = async () => {
  const res = await api.get("/health");
  return res.data;
};

const agentService = new AgentService();

// 개발 환경에서 디버깅을 위해 전역 객체에 추가
if (typeof window !== "undefined") {
  window.agentService = agentService;
}

export default agentService;
