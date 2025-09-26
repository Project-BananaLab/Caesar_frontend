import { getCookie, getGoogleUserInfo } from "./cookies.js";

// 현재 로그인된 사용자 정보 가져오기
export const getCurrentUser = () => {
  // 1. localStorage에서 직접 사용자 정보 확인 (새로고침 대응)
  const storedUserInfo = localStorage.getItem("google_user_info");
  const storedEmployeeId = localStorage.getItem("employee_id");
  const storedAccessToken = localStorage.getItem("google_access_token");

  if (storedUserInfo && storedEmployeeId && storedAccessToken) {
    try {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      return {
        type: "google",
        googleId: parsedUserInfo.googleId,
        employeeId: parseInt(storedEmployeeId),
        email: parsedUserInfo.email,
        username: parsedUserInfo.username,
        picture: parsedUserInfo.picture,
        accessToken: storedAccessToken,
      };
    } catch (error) {
      console.error("localStorage 사용자 정보 파싱 오류:", error);
    }
  }

  // 2. 쿠키에서 구글 사용자 정보 확인 (fallback)
  const googleUser = getGoogleUserInfo();
  if (googleUser) {
    return {
      type: "google",
      googleId: googleUser.googleId,
      employeeId: googleUser.employeeId,
      email: googleUser.email,
      username: googleUser.username,
      picture: googleUser.picture,
    };
  }

  // 3. 로컬스토리지에서 회사 사용자 정보 확인
  const authData = localStorage.getItem("authData");
  if (authData) {
    try {
      const parsedAuth = JSON.parse(authData);
      return {
        type: "company",
        username: parsedAuth.username,
        email: parsedAuth.email,
        role: parsedAuth.role,
        companyCode: parsedAuth.companyCode,
      };
    } catch (error) {
      console.error("인증 데이터 파싱 오류:", error);
    }
  }

  return null;
};

// API 요청에 포함할 사용자 헤더 생성
export const getUserHeaders = () => {
  const user = getCurrentUser();
  if (!user) return {};

  const headers = {};

  // 한글이나 특수문자 포함 여부 확인 함수
  const isISO88591Safe = (str) => {
    if (!str) return true;
    // ISO-8859-1 범위는 0-255
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) {
        return false;
      }
    }
    return true;
  };

  if (user.type === "google") {
    headers["X-User-Type"] = "google";
    headers["X-Google-User-Id"] = user.googleId;

    // 이메일과 사용자명은 ASCII 안전한 경우만 헤더에 포함
    if (isISO88591Safe(user.email)) {
      headers["X-User-Email"] = user.email;
    }
    if (isISO88591Safe(user.username)) {
      headers["X-User-Name"] = user.username;
    }
  } else if (user.type === "company") {
    headers["X-User-Type"] = "company";

    // 이메일, 사용자명, 회사코드는 ASCII 안전한 경우만 헤더에 포함
    if (isISO88591Safe(user.username)) {
      headers["X-User-Name"] = user.username;
    }
    if (isISO88591Safe(user.email)) {
      headers["X-User-Email"] = user.email || "";
    }
    if (isISO88591Safe(user.companyCode)) {
      headers["X-Company-Code"] = user.companyCode || "";
    }
  }

  return headers;
};

// 백엔드 요청용 사용자 정보 객체 생성
export const getUserPayload = () => {
  const user = getCurrentUser();
  if (!user) return null;

  if (user.type === "google") {
    return {
      user_type: "google",
      google_user_id: user.googleId,
      employee_id: user.employeeId, // employee_id 추가
      email: user.email,
      username: user.username,
      picture: user.picture,
    };
  } else if (user.type === "company") {
    return {
      user_type: "company",
      username: user.username,
      email: user.email || "",
      company_code: user.companyCode || "",
    };
  }

  return null;
};
