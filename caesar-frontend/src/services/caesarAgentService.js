/**
 * Caesar Backend_2 Agent 연동 서비스
 * backend_2의 Agent 기능과 연동
 */

import axios from 'axios'

class CaesarAgentService {
  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8000', // backend_2 주소
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    this.isConnected = false
    this.agentMode = false // Agent 모드 활성화 여부
  }

  // 백엔드 연결 상태 확인
  async checkConnection() {
    try {
      const response = await this.api.get('/health')
      this.isConnected = response.status === 200
      return this.isConnected
    } catch (error) {
      console.warn('Caesar Backend_2 연결 실패:', error.message)
      this.isConnected = false
      return false
    }
  }

  // Agent 모드 토글
  async toggleAgentMode() {
    if (!this.isConnected) {
      const connected = await this.checkConnection()
      if (!connected) {
        throw new Error('Caesar Backend_2에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
      }
    }

    this.agentMode = !this.agentMode
    console.log(`🤖 Caesar Agent 모드: ${this.agentMode ? '활성화' : '비활성화'}`)
    return this.agentMode
  }

  // Agent 채팅 (backend_2의 chat 기능 사용)
  async processAgentMessage(message, userId = 'user') {
    if (!this.agentMode) {
      throw new Error('Agent 모드가 비활성화되어 있습니다.')
    }

    if (!this.isConnected) {
      await this.checkConnection()
    }

    try {
      // backend_2의 agent chat API 호출
      const response = await this.api.post('/agent/chat', {
        message: message,
        user_id: userId
      })

      return {
        success: true,
        response: response.data.content || response.data.response,
        agentData: response.data,
        source: 'caesar_agent'
      }

    } catch (error) {
      console.error('Caesar Agent 처리 오류:', error)
      
      // 에러 타입별 처리
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Caesar Backend_2 서버에 연결할 수 없습니다.')
      } else if (error.response?.status === 404) {
        throw new Error('Agent API 엔드포인트를 찾을 수 없습니다.')
      } else {
        throw new Error(`Agent 처리 중 오류: ${error.message}`)
      }
    }
  }

  // MCP 도구 목록 조회
  async getAvailableTools() {
    try {
      const response = await this.api.get('/agent/tools')
      return response.data.tools || []
    } catch (error) {
      console.error('도구 목록 조회 오류:', error)
      return []
    }
  }

  // Agent 상태 조회
  async getAgentStatus() {
    try {
      const response = await this.api.get('/agent/status')
      return response.data
    } catch (error) {
      console.error('Agent 상태 조회 오류:', error)
      return {
        initialized: false,
        tools_count: 0,
        mcp_servers: []
      }
    }
  }

  // 워크플로우 실행 (backend_2의 workflow 기능)
  async executeWorkflow(workflowName, parameters = {}) {
    try {
      const response = await this.api.post('/workflows/execute', {
        workflow_name: workflowName,
        parameters: parameters
      })

      return {
        success: true,
        workflowId: response.data.workflow_id,
        executionId: response.data.execution_id,
        status: response.data.status
      }

    } catch (error) {
      console.error('워크플로우 실행 오류:', error)
      throw error
    }
  }

  // 시스템 초기화 (backend_2 초기화 트리거)
  async initializeSystem() {
    try {
      const response = await this.api.post('/system/initialize')
      return response.data
    } catch (error) {
      console.error('시스템 초기화 오류:', error)
      return { success: false, error: error.message }
    }
  }

  // 현재 설정 조회
  getSettings() {
    return {
      isConnected: this.isConnected,
      agentMode: this.agentMode,
      apiBaseURL: this.api.defaults.baseURL
    }
  }

  // Agent 모드 상태 확인
  isAgentModeEnabled() {
    return this.agentMode && this.isConnected
  }

  // 연결 상태 확인
  isBackendConnected() {
    return this.isConnected
  }
}

export default new CaesarAgentService()
