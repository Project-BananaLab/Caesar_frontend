// src/app/App.jsx (또는 해당 경로의 App 파일)
import React, { useState, useEffect } from "react";
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
import ManageEmployeesPage from "../pages/ManageEmployeesPage";
import OAuthCallback from "../pages/OAuthCallback";
import LoadingModal from "../components/admin/LoadingModal";
import "../assets/styles/App.css";

/** ✅ 이 파일 내에서 role만 보고 admin 판별 (백엔드 값 신뢰) */
const isAdminRole = (auth) =>
  (auth?.role || localStorage.getItem("role") || "").toLowerCase() === "admin";

/** 보호 라우트 */
function ProtectedRoute({
  children,
  requireAdmin = false,
  blockAdmin = false,
}) {
  const authData = loadAuthData();
  if (!authData) return <Navigate to="/login" replace />;

  // 관리자만 접근 가능한 페이지
  if (requireAdmin && !isAdminRole(authData)) {
    return <Navigate to="/" replace />;
  }

  // 관리자 접근 차단 (일반 사용자만 접근)
  if (blockAdmin && isAdminRole(authData)) {
    return <Navigate to="/admin" replace />;
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
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  // 앱 초기화 시 자동 로그인 체크
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedEmployeeId = localStorage.getItem("employee_id");
        const storedAccessToken = localStorage.getItem("google_access_token");
        const storedUserInfo = localStorage.getItem("google_user_info");

        if (storedEmployeeId && storedAccessToken && storedUserInfo) {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          const authData = {
            type: "google",
            googleId: parsedUserInfo.googleId,
            employeeId: parseInt(storedEmployeeId),
            email: parsedUserInfo.email,
            username: parsedUserInfo.username,
            picture: parsedUserInfo.picture,
            accessToken: storedAccessToken,
            loginTime: new Date().toISOString(),
            role: "user",
            dept_name: parsedUserInfo.dept_name, // 부서명 추가
          };
          setUser(authData);
          saveAuthData(authData);
          console.log("✅ 자동 로그인 성공:", authData);
        } else {
          console.log("📝 저장된 로그인 정보 없음");
        }
      } catch (error) {
        console.error("❌ 자동 로그인 실패:", error);
        localStorage.removeItem("employee_id");
        localStorage.removeItem("google_access_token");
        localStorage.removeItem("google_user_info");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // 어드민/유저 공통 로그인 처리
  const handleLogin = (loginData) => {
    console.log("로그인 처리:", loginData);
    const authData = {
      ...loginData,
      loginTime: new Date().toISOString(),
      type: loginData.type || "company",
      role: (loginData.role || "user").toLowerCase(),
    };
    setUser(authData);
    saveAuthData(authData);
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
    localStorage.removeItem("employee_id");
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("google_user_info");
    console.log("✅ 로그아웃 완료 - 모든 저장된 정보 정리됨");
    navigate("/login", { replace: true });
  };

  if (isInitializing) {
    return <LoadingModal message="앱 초기화 중..." />;
  }

  return (
    <>
      {agentLoading && <LoadingModal message="Agent 모드 변경 중..." />}
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
            <ProtectedRoute blockAdmin={true}>
              <ChatPage user={user} onLogout={handleLogout} />
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
        {/* 직원관리 라우트 */}
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ManageEmployeesPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        {/* OAuth 콜백 */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        {/* 404 → 메인 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
