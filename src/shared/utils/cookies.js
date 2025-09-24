// 쿠키 설정
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
};

// 쿠키 읽기
export const getCookie = (name) => {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

// 쿠키 삭제
export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// 구글 관련 쿠키들 일괄 삭제
export const clearGoogleCookies = () => {
  deleteCookie("google_access_token");
  deleteCookie("google_refresh_token");
  deleteCookie("google_user_info");
  deleteCookie("google_scopes");
};

// Access Token 유효성 검사
export const isAccessTokenValid = () => {
  const token = getCookie("google_access_token");
  return !!token;
};

// 저장된 구글 사용자 정보 가져오기
export const getGoogleUserInfo = () => {
  const userInfo = getCookie("google_user_info");
  try {
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error("사용자 정보 파싱 오류:", error);
    return null;
  }
};

// 허용된 스코프 확인
export const getGrantedScopes = () => {
  const scopes = getCookie("google_scopes");
  return scopes ? scopes.split(" ") : [];
};

// 특정 스코프가 허용되었는지 확인
export const hasScopePermission = (scope) => {
  const grantedScopes = getGrantedScopes();
  return grantedScopes.includes(scope);
};
