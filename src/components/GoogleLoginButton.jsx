import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { setCookie, getCookie } from "../shared/utils/cookies.js"; // 가상 경로

export default function MergedGoogleLoginButton({ onSuccess, onError }) {
  const [hasAccessToken, setHasAccessToken] = useState(false);

  // 코드 1의 상세한 스코프 배열 (중복 제거됨)
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
        console.log("✅ 구글 OAuth 응답:", tokenResponse);
        const { access_token, scope } = tokenResponse;

        // 1. Access Token 및 스코프 쿠키에 저장 (코드 1의 로직)
        setCookie("google_access_token", access_token, 1);
        setCookie("google_scopes", scope, 7);
        setHasAccessToken(true);
        console.log("✅ Access Token 및 스코프 저장 완료.");

        // 2. 구글 API를 통해 사용자 정보 가져오기 (코드 1의 로직)
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        if (!userInfoResponse.ok) {
          throw new Error("Google 사용자 정보 조회 실패");
        }
        const userInfo = await userInfoResponse.json();
        console.log("✅ Google 사용자 정보:", userInfo);

        // 3. 백엔드 서버에 사용자 정보 전송 및 직원 정보 받기
        const backendResponse = await fetch(
          "http://127.0.0.1:8000/employees/google-login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              google_user_id: userInfo.id,
              email: userInfo.email,
              full_name: userInfo.name,
            }),
          }
        );
        if (!backendResponse.ok) {
          throw new Error("백엔드 서버 응답 오류");
        }
        const employeeData = await backendResponse.json();
        console.log("✅ 백엔드 응답 (직원 정보):", employeeData);

        // 4. employee_id를 포함한 완전한 사용자 정보 생성
        const googleUserData = {
          googleId: userInfo.id,
          google_user_id: userInfo.id, // 중복이지만 일관성을 위해 추가
          email: userInfo.email,
          username: userInfo.name,
          full_name: userInfo.name, // 백엔드 호환을 위한 필드
          picture: userInfo.picture,
          employeeId: employeeData.id,
        };

        // 쿠키에 사용자 정보 저장
        setCookie("google_user_info", JSON.stringify(googleUserData), 7);
        console.log("✅ 사용자 정보 쿠키 저장 완료.");

        // localStorage에 중요한 정보 저장 (새로고침 대응)
        localStorage.setItem("employee_id", employeeData.id.toString());
        localStorage.setItem("google_access_token", access_token);
        localStorage.setItem(
          "google_user_info",
          JSON.stringify(googleUserData)
        );

        console.log("✅ 사용자 정보 저장 완료 (쿠키 + localStorage):", {
          employeeId: employeeData.id,
          accessToken: access_token ? "존재" : "없음",
          userInfo: googleUserData,
        });

        // 5. 상위 컴포넌트에 최종 데이터 전달
        if (onSuccess) {
          const finalLoginData = {
            type: "google",
            ...googleUserData, // 이미 google_user_id가 포함됨
            accessToken: access_token, // Access Token도 함께 전달
            employeeData: employeeData, // 백엔드에서 받은 직원 정보
          };
          onSuccess(finalLoginData);
          console.log(
            "✅ 상위 컴포넌트로 최종 로그인 데이터 전달:",
            finalLoginData
          );
        }
      } catch (error) {
        console.error("❌ 구글 로그인 처리 중 오류 발생:", error);
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
    <div style={{ width: "100%" }}>
      <button
        onClick={() => login()}
        className="login-button company-login" // 필요에 따라 클래스명 수정
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {/* 구글 로고 SVG 등을 추가하면 더 좋습니다. */}
        Google 계정으로 로그인
      </button>
    </div>
  );
}
