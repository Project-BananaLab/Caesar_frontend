import React, { useState } from 'react'
import { getUserRole } from '../entities/user/constants'
import '../assets/styles/Login.css'

export default function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('company') // 'company' or 'employee'
  const [companyId, setCompanyId] = useState('')
  const [companyCode, setCompanyCode] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [employeePassword, setEmployeePassword] = useState('')
  const [error, setError] = useState('')


  // 회사 계정 데이터 (ID만으로 인증)
  const companyAccounts = [
    { id: 'admin', role: 'admin' },
    { id: 'caesar', role: 'admin' },
    { id: 'manager', role: 'user' }
  ]


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

  // 직원 ID 입력 처리
  const handleEmployeeIdChange = (e) => {
    const value = e.target.value
    // 영어와 숫자만 허용
    const englishOnly = value.replace(/[^a-zA-Z0-9]/g, '')
    setEmployeeId(englishOnly)
  }

  // 직원용 로그인 처리 (아이디/비밀번호)
  const handleEmployeeLogin = (e) => {
    e.preventDefault()
    setError('')
    
    // 간단한 직원 계정 데이터 (실제로는 서버에서 인증)
    const employeeAccounts = [
      { id: 'employee1', password: '1234', name: '김직원' },
      { id: 'employee2', password: '5678', name: '이직원' },
      { id: 'test', password: 'test', name: '테스트직원' }
    ]
    
    const account = employeeAccounts.find(acc => 
      acc.id.toLowerCase() === employeeId.toLowerCase() && 
      acc.password === employeePassword
    )
    
    if (account) {
      onLogin({
        username: account.id,
        name: account.name,
        type: 'employee',
        isAuthenticated: true,
        role: 'user'
      })
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    }
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
            <form onSubmit={handleEmployeeLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">직원 ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={handleEmployeeIdChange}
                  placeholder="직원 ID를 입력하세요"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">비밀번호</label>
                <input
                  type="password"
                  value={employeePassword}
                  onChange={(e) => setEmployeePassword(e.target.value)}
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

              <button type="submit" className="login-button employee-login">
                로그인
              </button>

              <div className="test-accounts">
                <div className="test-accounts-title">테스트 계정:</div>
                <div>employee1 / 1234</div>
                <div>employee2 / 5678</div>
                <div>test / test</div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
