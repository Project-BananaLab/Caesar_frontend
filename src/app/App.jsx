import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { saveAuthData, loadAuthData, clearAuthData } from '../entities/user/auth'
import { isAdmin } from '../entities/user/constants'
import Login from '../pages/Login'
import ChatPage from '../pages/ChatPage'
import AdminPage from '../pages/AdminPage'
import LoadingModal from '../components/admin/LoadingModal'
import '../assets/styles/App.css'

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children, requireAdmin = false }) {
  const authData = loadAuthData()
  
  if (!authData) {
    return <Navigate to="/login" replace />
  }
  
  if (requireAdmin && !isAdmin(authData)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

// 인증된 사용자는 로그인 페이지 접근 차단
function PublicRoute({ children }) {
  const authData = loadAuthData()
  
  if (authData) {
    // 관리자는 관리자 페이지로, 일반 사용자는 채팅 페이지로 이동
    return <Navigate to={isAdmin(authData) ? '/admin' : '/'} replace />
  }
  
  return children
}

function AppContent() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [agentLoading, setAgentLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // 앱 시작시 저장된 인증 정보 확인
  useEffect(() => {
    const authData = loadAuthData()
    if (authData) {
      setUser(authData)
      setIsAuthenticated(true)
    }
  }, [])

  // 로그인 처리
  const handleLogin = (loginData) => {
    console.log('로그인 처리:', loginData)
    
    const authData = {
      ...loginData,
      loginTime: new Date().toISOString(),
      type: loginData.type || 'admin', // 구글 로그인이면 'google', 아니면 'admin'
      role: loginData.type === 'google' ? 'user' : (isAdmin(loginData) ? 'admin' : 'user')
    }
    
    setUser(authData)
    setIsAuthenticated(true)
    saveAuthData(authData)
    
    // 관리자는 관리자 페이지로, 일반 사용자는 채팅 페이지로 이동
    if (isAdmin(authData)) {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  // 로그아웃 처리
  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    clearAuthData()
    // 대화 데이터는 삭제하지 않고 유지
    navigate('/login')
  }

  // Agent 모드 변경 처리
  const handleAgentModeChange = async (enabled) => {
    setAgentLoading(true)
    try {
      // 실제 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log(`Agent 모드 ${enabled ? '활성화' : '비활성화'}됨`)
    } catch (error) {
      console.error('Agent 모드 변경 실패:', error)
    } finally {
      setAgentLoading(false)
    }
  }

  return (
    <>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login onLogin={handleLogin} />
            </PublicRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ChatPage 
                user={user} 
                onLogout={handleLogout}
                onAgentModeChange={handleAgentModeChange}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        {/* 잘못된 경로는 메인으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Agent 모드 로딩 모달 */}
      <LoadingModal 
        isOpen={agentLoading} 
        message="Agent 모드를 변경하는 중입니다..." 
      />
    </>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
