import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./app/App.jsx";

// 환경 변수에서 구글 클라이언트 ID 가져오기
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "691456355389-0mpga5brmbdrh5rbgrtkbeda4n043jhp.apps.googleusercontent.com";

console.log("✅ 최종 사용될 Client ID:", GOOGLE_CLIENT_ID);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
