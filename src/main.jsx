import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './app/App.jsx'

// 구글 클라이언트 ID (환경변수 또는 설정에서 가져오기)
const GOOGLE_CLIENT_ID = "521152274797-sofhronh2pnb802rc37bopuklctq79ec.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
