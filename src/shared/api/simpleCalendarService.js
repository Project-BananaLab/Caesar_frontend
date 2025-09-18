/**
 * 간단한 구글 캘린더 서비스 (프론트엔드 전용)
 */

class SimpleCalendarService {
  constructor() {
    this.accessToken = null
  }

  // 토큰 설정
  setAccessToken(token) {
    this.accessToken = token
    localStorage.setItem('google_calendar_token', token)
  }

  // 토큰 가져오기
  getAccessToken() {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('google_calendar_token')
    }
    return this.accessToken
  }

  // 연결 상태 확인
  isConnected() {
    return !!this.getAccessToken()
  }

  // 오늘 일정 가져오기
  async getTodayEvents() {
    const token = this.getAccessToken()
    if (!token) {
      throw new Error('캘린더가 연결되지 않았습니다.')
    }

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`)
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('캘린더 데이터 로드 실패:', error)
      throw error
    }
  }

  // 이벤트 간단 포맷팅
  formatEvent(event) {
    const start = event.start?.dateTime || event.start?.date
    const end = event.end?.dateTime || event.end?.date
    
    return {
      title: event.summary || '제목 없음',
      start: start ? new Date(start) : null,
      end: end ? new Date(end) : null,
      location: event.location || '',
      description: event.description || '',
      isAllDay: !event.start?.dateTime
    }
  }

  // 연결 해제
  disconnect() {
    this.accessToken = null
    localStorage.removeItem('google_calendar_token')
  }
}

export default new SimpleCalendarService()
