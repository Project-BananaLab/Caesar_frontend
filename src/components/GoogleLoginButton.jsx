// src/components/GoogleLoginButton.jsx
import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { setCookie, getCookie } from "../shared/utils/cookies.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function MergedGoogleLoginButton({
  onSuccess,
  onError,
  companyCode,
}) {
  const [hasAccessToken, setHasAccessToken] = useState(false);

  // 상세 스코프 배열
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

  const login = useGoogleLogin({
    scope: [...new Set(googleScopes)].join(" "), // 중복 스코프 제거 후 사용
    flow: "implicit", // Access Token을 직접 받기 위한 설정
    onSuccess: async (tokenResponse) => {
      try {
        const { access_token, scope } = tokenResponse;
        console.log("✅ 구글 OAuth 응답:", tokenResponse);

        // 1. Access Token 및 스코프 쿠키에 저장
        setCookie("google_access_token", access_token, 1);
        setCookie("google_scopes", scope, 7);
        setHasAccessToken(true);

        // 구글 사용자 정보
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        if (!userInfoResponse.ok)
          throw new Error("Google 사용자 정보 조회 실패");
        const userInfo = await userInfoResponse.json();
        console.log("✅ Google 사용자 정보:", userInfo);

        // 백엔드로 가입/로그인 요청 (회사코드 포함)
        const backendResponse = await fetch(
          `${API_BASE}/employees/google-login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_code: companyCode, // ★ 중요: 회사코드 함께 전송
              google_user_id: userInfo.id,
              email: userInfo.email,
              full_name: userInfo.name,
            }),
          }
        );
        if (!backendResponse.ok) {
          const err = await backendResponse.json().catch(() => ({}));
          throw new Error(
            err?.detail || err?.message || "백엔드 서버 응답 오류"
          );
        }
        const employeeData = await backendResponse.json();
        console.log("✅ 백엔드 응답 (직원 정보):", employeeData);

        // 상위로 넘길 통합 데이터
        const finalLoginData = {
          type: "google",
          googleId: userInfo.id,
          google_user_id: userInfo.id, // 중복이지만 일관성을 위해 추가
          email: userInfo.email,
          username: userInfo.name,
          full_name: userInfo.name, // 백엔드 호환을 위한 필드
          picture: userInfo.picture,
          accessToken: access_token,
          employeeData, // { id, company_id, ... }
          dept_name: employeeData.dept_name, // 부서명 추가
        };

        // 쿠키에 사용자 정보 저장
        setCookie("google_user_info", JSON.stringify(finalLoginData), 7);

        // localStorage에 중요한 정보 저장 (새로고침 대응)
        localStorage.setItem("employee_id", String(employeeData.id));
        localStorage.setItem("google_access_token", access_token);
        localStorage.setItem(
          "google_user_info",
          JSON.stringify(finalLoginData)
        );

        onSuccess?.(finalLoginData);
      } catch (error) {
        console.error("❌ 구글 로그인 처리 중 오류 발생:", error);
        onError?.(error);
      }
    },
    onError: (error) => {
      console.error("❌ 구글 로그인 실패:", error);
      onError?.(error);
    },
  });

  return (
    <div style={{ width: "100%" }}>
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
        disabled={!companyCode} // 회사코드 없으면 비활성화(선택)
        title={!companyCode ? "회사 코드를 입력하세요" : ""}
      >
        Google 계정으로 로그인
      </button>
    </div>
  );
}
