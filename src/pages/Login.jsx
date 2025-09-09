import React, { useState } from 'react'
import { getUserRole } from '../utils/auth'
import '../styles/Login.css'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // 더미 로그인 데이터
  const dummyUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'user', password: 'user123' },
    { username: 'caesar', password: 'caesar2024' }
  ]

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
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="아이디를 입력하세요"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
              placeholder="비밀번호를 입력하세요"
              className="form-input"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="login-button">
            로그인
          </button>
        </form>

        <div className="test-accounts">
          <hr />
          <div className="test-accounts-title">테스트 계정:</div>
          <div>아이디: admin / 비밀번호: admin123 (관리자)</div>
          <div>아이디: user / 비밀번호: user123 (일반유저)</div>
          <div>아이디: caesar / 비밀번호: caesar2024 (관리자)</div>
        </div>
      </div>
    </div>
  )
}
