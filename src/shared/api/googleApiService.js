import { getCookie, deleteCookie } from "../utils/cookies.js";

// 기본 API 호출 함수
const callGoogleAPI = async (url, options = {}) => {
  const accessToken = getCookie("google_access_token");

  if (!accessToken) {
    throw new Error("Access Token이 없습니다. 다시 로그인해주세요.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // 토큰 만료 시 쿠키 삭제
    deleteCookie("google_access_token");
    throw new Error("토큰이 만료되었습니다. 다시 로그인해주세요.");
  }

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Google Drive API 호출 예시
export const driveAPI = {
  // 파일 목록 가져오기
  getFiles: () => callGoogleAPI("https://www.googleapis.com/drive/v3/files"),

  // 파일 업로드
  uploadFile: (fileData) =>
    callGoogleAPI("https://www.googleapis.com/upload/drive/v3/files", {
      method: "POST",
      body: fileData,
    }),

  // 파일 정보 가져오기
  getFileInfo: (fileId) =>
    callGoogleAPI(`https://www.googleapis.com/drive/v3/files/${fileId}`),
};

// Google Calendar API 호출 예시
export const calendarAPI = {
  // 캘린더 목록 가져오기
  getCalendars: () =>
    callGoogleAPI(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList"
    ),

  // 이벤트 목록 가져오기
  getEvents: (calendarId = "primary") =>
    callGoogleAPI(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`
    ),

  // 이벤트 생성
  createEvent: (calendarId = "primary", eventData) =>
    callGoogleAPI(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: "POST",
        body: JSON.stringify(eventData),
      }
    ),
};

// API 테스트 함수
export const testGoogleAPIs = async () => {
  try {
    console.log("=== Google API 테스트 시작 ===");

    // Drive API 테스트
    console.log("Drive 파일 목록 조회 중...");
    const files = await driveAPI.getFiles();
    console.log("Drive 파일들:", files);

    // Calendar API 테스트
    console.log("Calendar 목록 조회 중...");
    const calendars = await calendarAPI.getCalendars();
    console.log("캘린더들:", calendars);

    console.log("=== Google API 테스트 완료 ===");
    return { files, calendars };
  } catch (error) {
    console.error("Google API 테스트 실패:", error);
    throw error;
  }
};
