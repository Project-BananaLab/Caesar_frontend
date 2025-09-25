import axios from "axios";
import { getUserPayload } from "../utils/auth.js";

const API_URL = "http://127.0.0.1:8000/channels"; // FastAPI 서버 주소

// 사용자별 채널 조회
export const getChannels = async (employeeId) => {
  const response = await axios.get(API_URL + "/", {
    params: { employee_id: employeeId },
  });
  return response.data;
};

// 특정 채널 조회
export const getChannel = async (channelId) => {
  const response = await axios.get(`${API_URL}/${channelId}`);
  return response.data;
};

// 채널 생성 (사용자 정보 포함)
export const createChannel = async (title) => {
  const userPayload = getUserPayload();

  if (!userPayload || !userPayload.employee_id) {
    throw new Error("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
  }

  const response = await axios.post(
    API_URL + "/",
    {
      title: title,
      employee_id: userPayload.employee_id, // 백엔드가 요구하는 형식으로 정확히 전송
    }
    // 헤더 제거: body에 사용자 정보 포함되므로 불필요
  );
  return response.data;
};

// 채널 수정
export const updateChannel = async (channelId, title) => {
  const response = await axios.put(`${API_URL}/${channelId}`, {
    title: title,
  });
  return response.data;
};

// 채널 삭제
export const deleteChannel = async (channelId) => {
  const response = await axios.delete(`${API_URL}/${channelId}`);
  return response.data;
};

// default export 추가 (하위 호환성을 위해)
export default {
  getChannels,
  getChannel,
  createChannel,
  updateChannel,
  deleteChannel,
};
