import React, { useState } from 'react'
import caesarLogo from '../images/caesar_logo.png'

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

    // 더미 데이터와 비교
    const uname = username.trim()
    const pwd = password.trim()
    const user = dummyUsers.find(u => u.username === uname && u.password === pwd)

    if (user) {
      // 로그인 성공
      onLogin({ username: uname, isAuthenticated: true })
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        width: '400px',
        textAlign: 'center'
      }}>
        {/* 로고를 배경으로 표시 */}
        <div
          style={{
            marginBottom: '30px',
            width: '100%',
            height: '120px',
            backgroundImage: `url(${caesarLogo})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '120px 120px',
            borderRadius: '10px 10px 0 0'
          }}
        />

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 아이디 입력 */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              아이디
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/^\s+|\s+$/g, ''))}
              placeholder="아이디를 입력하세요"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* 비밀번호 입력 */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/^\s+|\s+$/g, ''))}
              placeholder="비밀번호를 입력하세요"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div style={{
              color: 'red',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            로그인
          </button>
        </form>

        {/* 더미 계정 정보 */}
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '5px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>테스트 계정:</div>
          <div>아이디: admin / 비밀번호: admin123</div>
          <div>아이디: user / 비밀번호: user123</div>
          <div>아이디: caesar / 비밀번호: caesar2024</div>
        </div>
      </div>
    </div>
  )
}
