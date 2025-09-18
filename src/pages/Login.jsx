import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import { getUserRole } from '../entities/user/model/constants'
import GoogleLoginButton from '../widgets/GoogleLoginButton'
import '../shared/ui/Login.css'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // 구글 로그인 성공 처리
  const handleGoogleLoginSuccess = (googleUser) => {
    console.log('구글 로그인 성공:', googleUser)
    onLogin({
      username: googleUser.username,
      email: googleUser.email,
      picture: googleUser.picture,
      type: 'google',
      googleId: googleUser.googleId,
      isAuthenticated: true,
      role: 'user' // 구글 사용자는 일반 사용자
    })
  }

  // 구글 로그인 실패 처리
  const handleGoogleLoginError = (error) => {
    console.error('구글 로그인 에러:', error)
    setError('구글 로그인에 실패했습니다. 다시 시도해주세요.')
  }

  // 더미 로그인 데이터
  const dummyUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'user', password: 'user123' },
    { username: 'caesar', password: 'caesar2024' }
  ]

  // 아이디 영어만 입력 처리
  const handleUsernameChange = (e) => {
    const value = e.target.value
    // 영어와 숫자만 허용
    const englishOnly = value.replace(/[^a-zA-Z0-9]/g, '')
    setUsername(englishOnly)
  }

  // 비밀번호 영어만 입력 처리
  const handlePasswordChange = (e) => {
    const value = e.target.value
    // 영어, 숫자, 특수문자만 허용 (한글 제외)
    const englishOnly = value.replace(/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '')
    setPassword(englishOnly)
  }

  // 비밀번호 보이기/숨기기 토글
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const uname = username.trim()
    const pwd = password.trim()
    const user = dummyUsers.find(u => u.username === uname && u.password === pwd)

    if (user) {
      const role = getUserRole(uname)
      onLogin({ 
        username: uname, 
        isAuthenticated: true,
        role: role
      })
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    }
  }

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
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    togglePasswordVisibility()
                  }
                }}
                aria-label="비밀번호 보이기/숨기기"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="login-button">
            관리자 로그인
          </button>
        </form>

        {/* 구분선 */}
        <div className="login-divider">
          <span>또는</span>
        </div>

        {/* 구글 로그인 */}
        <div className="google-login-section">
          <GoogleLoginButton 
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
          />
        </div>

        <div className="test-accounts">
          <div className="test-accounts-title">테스트 계정:</div>
          <div>아이디: admin / 비밀번호: admin123</div>
          <div>아이디: user / 비밀번호: user123</div>
          <div>아이디: caesar / 비밀번호: caesar2024</div>
        </div>
      </div>
    </div>
  )
}
