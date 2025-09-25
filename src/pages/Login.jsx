import React, { useState, useEffect } from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { setCookie } from "../shared/utils/cookies.js";
import "../assets/styles/Login.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState("company"); // 'company' or 'employee'
  const [companyId, setCompanyId] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [error, setError] = useState("");

  // OAuth 리다이렉트 후 access_token 처리
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.slice(1));
      const accessToken = params.get("access_token");
      const scope = params.get("scope");
      const state = params.get("state");

      if (accessToken && state === "additional_permissions") {
        console.log("🎉 추가 권한 Access Token 획득:", accessToken);
        setCookie("google_access_token", accessToken, 1);
        if (scope) {
          setCookie("google_scopes", `profile email ${scope}`, 7);
        }

        // URL 해시 제거
        window.location.hash = "";

        alert("✅ 추가 권한이 성공적으로 승인되었습니다!");
      }
    }
  }, []);

  // (예시) 직원용 테스트 회사코드
  const validCompanyCodes = ["CAESAR2024", "COMPANY123"];

  // 회사 ID 입력 처리 (한글/영문/숫자만 허용)
  const handleCompanyIdChange = (e) => {
    const value = e.target.value
    // 한글, 영어, 숫자 허용 (특수문자만 제거)
    const allowedChars = value.replace(/[^a-zA-Z0-9ㄱ-힣]/g, '')
    setCompanyId(allowedChars)
  }

  // 회사 코드 입력 처리 (한글/영문/숫자, 영문은 대문자화)
  const handleCompanyCodeChange = (e) => {
    const value = e.target.value
    // 한글, 영어, 숫자 허용하고 영어는 대문자로 변환
    const allowedChars = value.replace(/[^a-zA-Z0-9ㄱ-힣]/g, '')
    const formatted = allowedChars.replace(/[a-z]/g, (match) => match.toUpperCase())
    setCompanyCode(formatted)
  }

  // === 회사용 로그인 ===
  const handleCompanyLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/company/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // JWT는 헤더로 주고받으므로 credentials 필요 없음
        body: JSON.stringify({ coId: companyId }),
      });

      // 실패 처리
      if (!res.ok) {
        let msg = "로그인에 실패했습니다.";
        try {
          const err = await res.json();
          if (err?.detail) msg = err.detail;
          if (err?.message) msg = err.message;
        } catch {}
        throw new Error(msg);
      }

      // ✅ 백엔드 응답 예: { companyId, coId, coName, role, accessToken }
      const data = await res.json();

      // 로컬에 최소 정보 저장(가드에서 쓸 수 있게)
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", (data.role || "user").toLowerCase());

      // 상위(App)로 로그인 완료 전달
      onLogin({
        username: data.coId,           // 회사 ID (co_id)
        companyName: data.coName,      // 회사명 (co_name)
        type: "company",                // ← 회사 로그인임을 명확히
        role: (data.role || "user").toLowerCase(), // ← 백엔드 role 그대로 신뢰
        accessToken: data.accessToken,
        isAuthenticated: true,
      });
    } catch (err) {
      setError(err.message || "로그인에 실패했습니다.");
    }
  };

  // === 직원용(구글+회사코드드) 로그인 ===
  const handleEmployeeGoogleLogin = (googleUser) => {
    if (!companyCode || !validCompanyCodes.includes(companyCode)) {
      setError("올바른 회사 코드를 입력해주세요.");
      return;
    }

    console.log("직원 구글 로그인 성공:", googleUser);
    onLogin({
      username: googleUser.username,
      email: googleUser.email,
      picture: googleUser.picture,
      type: "employee",
      companyCode,
      googleId: googleUser.googleId,
      isAuthenticated: true,
      role: "user",
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo"></div>

        {/* TAB 헤더 */}
        <div className="login-tabs">
          <button
            className={`login-tab ${activeTab === "company" ? "active" : ""}`}
            onClick={() => { setActiveTab("company"); setError(""); }}
          >
            회사용 로그인
          </button>
          <button
            className={`login-tab ${activeTab === "employee" ? "active" : ""}`}
            onClick={() => { setActiveTab("employee"); setError(""); }}
          >
            직원용 로그인
          </button>
        </div>

        {/* TAB 컨텐츠 */}
        <div className="login-tab-content">
          {activeTab === "company" ? (
            /* 회사용 로그인 */
            <form onSubmit={handleCompanyLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">회사 계정 ID</label>
                <input
                  type="text"
                  value={companyId}
                  onChange={handleCompanyIdChange}
                  placeholder="회사 계정 ID를 입력하세요"
                  className="form-input"
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="login-button company-login">
                로그인
              </button>

              {/* 필요 없다면 아래 테스트 안내는 제거 */}
              <div className="test-accounts">
                <div className="test-accounts-title">테스트 예시:</div>
                <div>acme / caesar 등 (DB에 존재하는 값)</div>
              </div>
            </form>
          ) : (
            /* 직원용 로그인 */
            <div className="employee-login-form">
              <div className="form-group">
                <label className="form-label">회사 코드</label>
                <input
                  type="text"
                  value={companyCode}
                  onChange={handleCompanyCodeChange}
                  placeholder="회사 코드를 입력하세요"
                  className="form-input"
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="google-login-section">
                <GoogleLoginButton
                  onSuccess={handleEmployeeGoogleLogin}
                  onError={(err) => {
                    console.error("구글 로그인 에러:", err);
                    setError("구글 로그인에 실패했습니다. 다시 시도해주세요.");
                  }}
                />
              </div>

              <div className="test-accounts">
                <div className="test-accounts-title">테스트 회사 코드:</div>
                <div>CAESAR2024</div>
                <div>COMPANY123</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
