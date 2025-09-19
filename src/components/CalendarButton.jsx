import React, { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import calendarService from '../shared/api/calendarService'

export default function CalendarButton({ onSuccess, onError }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(calendarService.isConnected())

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('캘린더 토큰 받음:', tokenResponse)
      setIsConnecting(true)
      
      try {
        // 토큰 저장
        calendarService.setAccessToken(tokenResponse.access_token)
        
        // 연결 테스트 (오늘 일정 가져오기)
        const events = await calendarService.getTodayEvents()
        console.log('캘린더 연결 성공, 오늘 일정:', events)
        
        setIsConnected(true)
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

  const handleDisconnect = () => {
    if (window.confirm('구글 캘린더 연결을 해제하시겠습니까?')) {
      calendarService.disconnect()
      setIsConnected(false)
      alert('구글 캘린더 연결이 해제되었습니다.')
    }
  }

  if (isConnected) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        border: '2px solid #10B981',
        borderRadius: '8px',
        background: '#F0FDF4'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#10B981'
        }} />
        <span style={{
          flex: 1,
          fontSize: '14px',
          fontWeight: '500',
          color: '#065F46'
        }}>
          구글 캘린더 연결됨
        </span>
        <button
          onClick={handleDisconnect}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          연결 해제
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={login}
      disabled={isConnecting}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '12px 16px',
        border: '2px solid #4285F4',
        borderRadius: '8px',
        background: isConnecting ? '#F3F4F6' : '#4285F4',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        cursor: isConnecting ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      📅 {isConnecting ? '연결 중...' : '구글 캘린더 연결'}
    </button>
  )
}
