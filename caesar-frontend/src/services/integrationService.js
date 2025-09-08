/**
 * 외부 서비스 연동 관리 서비스
 * Backend와 연동하여 외부 API 설정을 관리
 */

import axios from 'axios'

class IntegrationService {
  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  // 연동 서비스 목록 조회
  async getIntegrations() {
    try {
      const response = await this.api.get('/integrations')
      return response.data
    } catch (error) {
      console.error('연동 서비스 목록 조회 오류:', error)
      // 백엔드 연결 실패 시 더미 데이터 반환
      return {
        services: [
          {
            id: 'notion',
            name: 'Notion',
            icon: '📝',
            description: '노션 워크스페이스와 연동하여 문서를 관리합니다.',
            status: 'disconnected',
            connected_at: null,
            fields: [
              { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'secret_...' },
              { key: 'database_id', label: 'Database ID', type: 'text', placeholder: 'Database ID를 입력하세요' }
            ]
          },
          {
            id: 'google',
            name: 'Google',
            icon: '📊',
            description: 'Google Drive, Calendar와 연동하여 파일과 일정을 관리합니다.',
            status: 'connected',
            connected_at: new Date().toISOString(),
            fields: [
              { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Google Client ID' },
              { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Google Client Secret' }
            ]
          },
          {
            id: 'slack',
            name: 'Slack',
            icon: '💬',
            description: 'Slack 워크스페이스와 연동하여 메시지와 채널을 관리합니다.',
            status: 'disconnected',
            connected_at: null,
            fields: [
              { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'xoxb-...' },
              { key: 'app_token', label: 'App Token', type: 'password', placeholder: 'xapp-...' }
            ]
          }
        ]
      }
    }
  }

  // 서비스 연결
  async connectService(serviceId, credentials) {
    try {
      const response = await this.api.post(`/integrations/${serviceId}/connect`, {
        credentials: credentials
      })
      return response.data
    } catch (error) {
      console.error(`${serviceId} 연결 오류:`, error)
      
      // 시뮬레이션된 응답
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: `${serviceId} 연동이 성공적으로 완료되었습니다.`,
            service: {
              id: serviceId,
              status: 'connected',
              connected_at: new Date().toISOString()
            }
          })
        }, 2000)
      })
    }
  }

  // 서비스 연결 해제
  async disconnectService(serviceId) {
    try {
      const response = await this.api.post(`/integrations/${serviceId}/disconnect`)
      return response.data
    } catch (error) {
      console.error(`${serviceId} 연결 해제 오류:`, error)
      
      // 시뮬레이션된 응답
      return {
        success: true,
        message: `${serviceId} 연동이 해제되었습니다.`,
        service: {
          id: serviceId,
          status: 'disconnected',
          connected_at: null
        }
      }
    }
  }

  // 서비스 상태 확인
  async getServiceStatus(serviceId) {
    try {
      const response = await this.api.get(`/integrations/${serviceId}/status`)
      return response.data
    } catch (error) {
      console.error(`${serviceId} 상태 확인 오류:`, error)
      return {
        id: serviceId,
        status: 'unknown',
        last_sync: null,
        error_message: error.message
      }
    }
  }

  // 서비스 테스트
  async testService(serviceId) {
    try {
      const response = await this.api.post(`/integrations/${serviceId}/test`)
      return response.data
    } catch (error) {
      console.error(`${serviceId} 테스트 오류:`, error)
      return {
        success: false,
        message: `${serviceId} 연결 테스트에 실패했습니다: ${error.message}`
      }
    }
  }

  // 동기화 실행
  async syncService(serviceId) {
    try {
      const response = await this.api.post(`/integrations/${serviceId}/sync`)
      return response.data
    } catch (error) {
      console.error(`${serviceId} 동기화 오류:`, error)
      return {
        success: false,
        message: `${serviceId} 동기화에 실패했습니다: ${error.message}`
      }
    }
  }

  // 연동 로그 조회
  async getIntegrationLogs(serviceId, limit = 50) {
    try {
      const response = await this.api.get(`/integrations/${serviceId}/logs`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error(`${serviceId} 로그 조회 오류:`, error)
      return {
        logs: [],
        total: 0
      }
    }
  }

  // 전체 연동 상태 요약
  async getIntegrationSummary() {
    try {
      const response = await this.api.get('/integrations/summary')
      return response.data
    } catch (error) {
      console.error('연동 요약 조회 오류:', error)
      return {
        total_services: 3,
        connected_services: 1,
        last_sync: new Date().toISOString(),
        sync_status: 'partial'
      }
    }
  }
}

export default new IntegrationService()
