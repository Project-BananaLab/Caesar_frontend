import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  saveAuthData,
  loadAuthData,
  clearAuthData,
} from "../entities/user/auth";

import Login from "../pages/Login";
import ChatPage from "../pages/ChatPage";
import AdminPage from "../pages/AdminPage";
import OAuthCallback from "../pages/OAuthCallback";
import LoadingModal from "../components/admin/LoadingModal";
import "../assets/styles/App.css";

/** ✅ 이 파일 내에서 role만 보고 admin 판별 (백엔드 값 신뢰) */
const isAdminRole = (auth) =>
  ((auth?.role || localStorage.getItem("role") || "").toLowerCase() === "admin");

/** 보호 라우트 */
function ProtectedRoute({ children, requireAdmin = false }) {
  const authData = loadAuthData();
  if (!authData) return <Navigate to="/login" replace />;

  if (requireAdmin && !isAdminRole(authData)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

/** 로그인 상태면 로그인 페이지 접근 차단 */
function PublicRoute({ children }) {
  const authData = loadAuthData();
  if (authData) {
    return <Navigate to={isAdminRole(authData) ? "/admin" : "/"} replace />;
  }
  return children;
}

function AppContent() {
  const [user, setUser] = useState(loadAuthData());
  const [agentLoading, setAgentLoading] = useState(false);
  const navigate = useNavigate();

  /** ✅ 로그인 처리: 백엔드 role을 그대로 사용 */
  const handleLogin = (loginData) => {
    console.log("로그인 처리:", loginData);

    const authData = {
      ...loginData,
      loginTime: new Date().toISOString(),
      type: loginData.type || "company",          // 의미 있는 값만 저장
      role: (loginData.role || "user").toLowerCase(), // 백엔드 값 그대로
    };

    setUser(authData);
    saveAuthData(authData);

    // role만 보고 분기
    if (authData.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setUser(null);
    clearAuthData();
    navigate("/login", { replace: true });
  };

  const handleAgentModeChange = async (enabled) => {
    setAgentLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      console.log(`Agent 모드 ${enabled ? "활성화" : "비활성화"}됨`);
    } finally {
      setAgentLoading(false);
    }
  };

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
        {/* OAuth 콜백 라우트 */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        {/* 404: 잘못된 경로는 메인으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <LoadingModal
        isOpen={agentLoading}
        message="Agent 모드를 변경하는 중입니다..."
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
