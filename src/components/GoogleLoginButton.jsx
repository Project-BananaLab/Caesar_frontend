import React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

export default function GoogleLoginButton({ onSuccess, onError }) {
  const handleGoogleSuccess = (credentialResponse) => {
    try {
      // JWT 토큰 디코딩
      const decoded = jwtDecode(credentialResponse.credential)
      
      const googleUser = {
        type: 'google',
        googleId: decoded.sub,
        email: decoded.email,
        username: decoded.name,
        picture: decoded.picture,
        credential: credentialResponse.credential
      }
      
      console.log('구글 로그인 성공:', googleUser)
      onSuccess(googleUser)
    } catch (error) {
      console.error('구글 로그인 처리 오류:', error)
      onError(error)
    }
  }

  const handleGoogleError = () => {
    console.error('구글 로그인 실패')
    onError(new Error('구글 로그인에 실패했습니다.'))
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        logo_alignment="left"
      />
    </div>
  )
}
