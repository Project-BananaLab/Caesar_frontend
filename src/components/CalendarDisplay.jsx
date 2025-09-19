import React, { useState, useEffect } from 'react'
import calendarService from '../shared/api/calendarService'

export default function CalendarDisplay() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (calendarService.isConnected()) {
      loadTodayEvents()
    }
  }, [])

  const loadTodayEvents = async () => {
    if (!calendarService.isConnected()) {
      setError('캘린더가 연결되지 않았습니다.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const todayEvents = await calendarService.getTodayEvents()
      const formatted = todayEvents.map(event => calendarService.formatEvent(event))
      setEvents(formatted)
      console.log('오늘 일정:', formatted)
    } catch (error) {
      console.error('일정 로드 실패:', error)
      setError('일정을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadWeekEvents = async () => {
    if (!calendarService.isConnected()) {
      setError('캘린더가 연결되지 않았습니다.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const weekEvents = await calendarService.getWeekEvents()
      const formatted = weekEvents.map(event => calendarService.formatEvent(event))
      setEvents(formatted)
      console.log('이번주 일정:', formatted)
    } catch (error) {
      console.error('주간 일정 로드 실패:', error)
      setError('이번주 일정을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date) => {
    if (!date) return ''
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date) => {
    if (!date) return ''
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatDateTime = (date) => {
    if (!date) return ''
    return date.toLocaleDateString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    }) + ' ' + formatTime(date)
  }

  return (
    <div style={{
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      background: 'white',
      margin: '16px 0'
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #E5E7EB',
        background: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          📅 내 일정
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={loadTodayEvents}
            disabled={loading || !calendarService.isConnected()}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: loading ? '#9CA3AF' : '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '로딩...' : '오늘'}
          </button>
          <button 
            onClick={loadWeekEvents}
            disabled={loading || !calendarService.isConnected()}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: loading ? '#9CA3AF' : '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '로딩...' : '이번주'}
          </button>
        </div>
      </div>
      
      <div style={{ padding: '16px', maxHeight: '300px', overflow: 'auto' }}>
        {!calendarService.isConnected() ? (
          <div style={{ textAlign: 'center', color: '#6B7280', padding: '20px' }}>
            구글 캘린더를 먼저 연결해주세요.
          </div>
        ) : error ? (
          <div style={{ color: '#DC2626', textAlign: 'center', padding: '20px' }}>
            ❌ {error}
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6B7280', padding: '20px' }}>
            🎉 선택한 기간에 일정이 없습니다!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map((event, index) => (
              <div key={index} style={{
                padding: '12px',
                border: '1px solid #F3F4F6',
                borderRadius: '6px',
                background: '#FAFAFA'
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {event.title}
                </div>
                
                {event.start && (
                  <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                    {event.isAllDay ? (
                      `📅 ${formatDate(event.start)} (하루 종일)`
                    ) : (
                      `📅 ${formatDateTime(event.start)}${event.end ? ` ~ ${formatTime(event.end)}` : ''}`
                    )}
                  </div>
                )}
                
                {event.location && (
                  <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                    📍 {event.location}
                  </div>
                )}
                
                {event.description && (
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    📝 {event.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
