import React, { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import simpleCalendarService from '../shared/api/simpleCalendarService'

export default function SimpleCalendarButton({ onSuccess, onError }) {
  const [isConnecting, setIsConnecting] = useState(false)

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('캘린더 토큰 받음:', tokenResponse)
      setIsConnecting(true)
      
      try {
        // 토큰 저장
        simpleCalendarService.setAccessToken(tokenResponse.access_token)
        
        // 연결 테스트 (오늘 일정 가져오기)
        const events = await simpleCalendarService.getTodayEvents()
        console.log('캘린더 연결 성공, 오늘 일정:', events)
        
        onSuccess?.(events)
      } catch (error) {
        console.error('캘린더 연결 실패:', error)
        onError?.(error)
      } finally {
        setIsConnecting(false)
      }
    },
    onError: (error) => {
      console.error('OAuth 실패:', error)
      setIsConnecting(false)
      onError?.(error)
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly'
  })

  return (
    <button
      onClick={login}
      disabled={isConnecting}
      style={{
        padding: '12px 24px',
        background: isConnecting ? '#9CA3AF' : '#4285F4',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: isConnecting ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      📅 {isConnecting ? '연결 중...' : '구글 캘린더 연결'}
    </button>
  )
}
