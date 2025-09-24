import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { setCookie, getCookie } from "../shared/utils/cookies.js";

export default function GoogleLoginButton({ onSuccess, onError }) {
  const [hasAccessToken, setHasAccessToken] = useState(false);

  // 구글 API 스코프 (Access Token 발급 시 포함됨)
  const googleScopes = [
    "profile",
    "email",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/drive.appfolder",
    "https://www.googleapis.com/auth/drive.install",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.apps.readonly",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.activity",
    "https://www.googleapis.com/auth/drive.activity.readonly",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.calendarlist",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.events.owned",
    "https://www.googleapis.com/auth/drive.activity",
    "https://www.googleapis.com/auth/drive.activity.readonly",
    "https://www.googleapis.com/auth/drive.admin.labels",
    "https://www.googleapis.com/auth/drive.admin.labels.readonly",
    "https://www.googleapis.com/auth/drive.labels",
    "https://www.googleapis.com/auth/drive.labels.readonly",
  ];

  // 페이지 로드 시 쿠키에서 Access Token 확인
  useEffect(() => {
    const token = getCookie("google_access_token");
    setHasAccessToken(!!token);
  }, []);

  // 구글 로그인 훅 (COOP 에러 해결을 위해 redirect_uri 제거)
  const login = useGoogleLogin({
    scope: googleScopes.join(" "),
    flow: "implicit", // access_token 직접 받기
    onSuccess: async (response) => {
      try {
        console.log("✅ 구글 OAuth 응답:", response);

        // Access Token 저장
        if (response.access_token) {
          setCookie("google_access_token", response.access_token, 1);
          setHasAccessToken(true);
          console.log("✅ Access Token 저장 완료:", response.access_token);

          // 스코프 정보 저장
          if (response.scope) {
            setCookie("google_scopes", response.scope, 7);
            console.log("✅ 스코프 저장 완료:", response.scope);
          }
        }

        // 사용자 정보 가져오기
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          }
        );

        const userInfo = await userInfoResponse.json();
        console.log("✅ 사용자 정보:", userInfo);

        // 사용자 정보를 쿠키에 저장
        const googleUserData = {
          googleId: userInfo.id,
          email: userInfo.email,
          username: userInfo.name,
          picture: userInfo.picture,
        };

        setCookie("google_user_info", JSON.stringify(googleUserData), 7);
        console.log("✅ 사용자 정보 저장 완료:", googleUserData);

        // 상위 컴포넌트에 로그인 성공 알림
        if (onSuccess) {
          const loginData = {
            type: "google",
            ...googleUserData,
          };
          onSuccess(loginData);
          console.log("✅ 상위 컴포넌트로 로그인 데이터 전달:", loginData);
        }
      } catch (error) {
        console.error("❌ 구글 로그인 처리 오류:", error);
        if (onError) {
          onError(error);
        }
      }
    },
    onError: (error) => {
      console.error("❌ 구글 로그인 실패:", error);
      if (onError) {
        onError(error);
      }
    },
  });

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      {/* 로그인 버튼 */}
      <button
        onClick={() => login()}
        className="login-button company-login"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        Google 계정으로 로그인
      </button>
    </div>
  );
}
