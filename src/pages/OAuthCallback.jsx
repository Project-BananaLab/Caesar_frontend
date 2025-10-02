import React, { useEffect } from "react";

export default function OAuthCallback() {
  useEffect(() => {
    // URL 해시에서 access_token 추출
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));

    const accessToken = params.get("access_token");
    const scope = params.get("scope");
    const error = params.get("error");

    if (error) {
      // 에러를 부모 창으로 전송
      window.opener?.postMessage(
        {
          type: "GOOGLE_OAUTH_ERROR",
          error: error,
        },
        window.location.origin
      );
      window.close();
    } else if (accessToken) {
      // 성공적으로 토큰을 받았으면 부모 창으로 전송
      window.opener?.postMessage(
        {
          type: "GOOGLE_OAUTH_SUCCESS",
          accessToken: accessToken,
          scope: scope,
        },
        window.location.origin
      );
    } else {
      // 토큰이 없으면 에러 처리
      window.opener?.postMessage(
        {
          type: "GOOGLE_OAUTH_ERROR",
          error: "No access token received",
        },
        window.location.origin
      );
      window.close();
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div>🔄 인증 처리 중...</div>
        <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
          잠시만 기다려주세요.
        </div>
      </div>
    </div>
  );
}
