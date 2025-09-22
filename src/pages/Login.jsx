import React, { useState } from 'react'
import { getUserRole } from '../entities/user/constants'
import GoogleLoginButton from '../components/GoogleLoginButton'
import '../assets/styles/Login.css'

export default function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('company') // 'company' or 'employee'
  const [companyId, setCompanyId] = useState('')
  const [companyCode, setCompanyCode] = useState('')
  const [error, setError] = useState('')

  // 구글 로그인 실패 처리
  const handleGoogleLoginError = (error) => {
    console.error('구글 로그인 에러:', error)
    setError('구글 로그인에 실패했습니다. 다시 시도해주세요.')
  }

  // 회사 계정 데이터 (ID만으로 인증)
  const companyAccounts = [
    { id: 'admin', role: 'admin' },
    { id: 'caesar', role: 'admin' },
    { id: 'manager', role: 'user' }
  ]

  // 회사 코드 데이터
  const validCompanyCodes = ['CAESAR2024', 'COMPANY123']

  // 회사 ID 입력 처리
  const handleCompanyIdChange = (e) => {
    const value = e.target.value
    // 영어와 숫자만 허용
    const englishOnly = value.replace(/[^a-zA-Z0-9]/g, '')
    setCompanyId(englishOnly)
  }

  // 회사 코드 입력 처리
  const handleCompanyCodeChange = (e) => {
    const value = e.target.value
    // 영어, 숫자, 대문자로 변환
    const formatted = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    setCompanyCode(formatted)
  }

  // 회사용 로그인 처리
  const handleCompanyLogin = (e) => {
    e.preventDefault()
    setError('')
    
    const account = companyAccounts.find(acc => acc.id.toLowerCase() === companyId.toLowerCase())
    
    if (account) {
      onLogin({ 
        username: account.id, 
        type: 'company',
        isAuthenticated: true,
        role: account.role
      })
    } else {
      setError('존재하지 않는 회사 계정입니다.')
    }
  }

  // 직원용 로그인 처리 (구글 + 회사코드)
  const handleEmployeeGoogleLogin = (googleUser) => {
    if (!companyCode || !validCompanyCodes.includes(companyCode)) {
      setError('올바른 회사 코드를 입력해주세요.')
      return
    }

    console.log('직원 구글 로그인 성공:', googleUser)
    onLogin({
      username: googleUser.username,
      email: googleUser.email,
      picture: googleUser.picture,
      type: 'employee',
      companyCode: companyCode,
      googleId: googleUser.googleId,
      isAuthenticated: true,
      role: 'user'
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo"></div>
        
        {/* TAB 헤더 */}
        <div className="login-tabs">
          <button 
            className={`login-tab ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('company')
              setError('')
            }}
          >
            회사용 로그인
          </button>
          <button 
            className={`login-tab ${activeTab === 'employee' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('employee')
              setError('')
            }}
          >
            직원용 로그인
          </button>
        </div>

        {/* TAB 컨텐츠 */}
        <div className="login-tab-content">
          {activeTab === 'company' ? (
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

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button type="submit" className="login-button company-login">
                로그인
              </button>

              <div className="test-accounts">
                <div className="test-accounts-title">테스트 계정:</div>
                <div>admin (관리자)</div>
                <div>caesar (관리자)</div>
                <div>manager (일반)</div>
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

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="google-login-section">
                <GoogleLoginButton 
                  onSuccess={handleEmployeeGoogleLogin}
                  onError={handleGoogleLoginError}
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
  )
}
