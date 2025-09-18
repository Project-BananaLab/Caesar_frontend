import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { getUserRole } from "../entities/user/constants";
import "../assets/styles/Login.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // 더미 로그인 데이터
  const dummyUsers = [
    { username: "admin", password: "admin123" },
    { username: "user", password: "user123" },
    { username: "caesar", password: "caesar2024" },
  ];

  // 아이디 영어만 입력 처리
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    // 영어와 숫자만 허용
    const englishOnly = value.replace(/[^a-zA-Z0-9]/g, "");
    setUsername(englishOnly.trim());
  };

  // 비밀번호 영어만 입력 처리
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    // 영어, 숫자, 특수문자만 허용 (한글 제외)
    const englishOnly = value.replace(
      /[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g,
      ""
    );
    setPassword(englishOnly.trim());
  };

  // 비밀번호 보이기/숨기기 토글
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const uname = username.trim();
    const pwd = password.trim();
    const user = dummyUsers.find(
      (u) => u.username === uname && u.password === pwd
    );

    if (user) {
      const role = getUserRole(uname);
      onLogin({
        username: uname,
        isAuthenticated: true,
        role: role,
      });
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo"></div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">아이디</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="아이디를 입력하세요 (영어+숫자)"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="비밀번호를 입력하세요 (영어+숫자+특수문자)"
                className="form-input password-input"
                required
              />
              <span
                onClick={togglePasswordVisibility}
                className="password-toggle-button"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    togglePasswordVisibility();
                  }
                }}
                aria-label="비밀번호 보이기/숨기기"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            로그인
          </button>
        </form>

        <div className="test-accounts">
          <div className="test-accounts-title">테스트 계정:</div>
          <div>아이디: admin / 비밀번호: admin123 (관리자)</div>
          <div>아이디: user / 비밀번호: user123 (일반유저)</div>
          <div>아이디: caesar / 비밀번호: caesar2024 (관리자)</div>
        </div>
      </div>
    </div>
  );
}
