import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

class WorkflowService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  // 워크플로우 생성
  async createWorkflow(templateName, customNodes = null) {
    try {
      const response = await this.api.post('/workflows/create', {
        template_name: templateName,
        custom_nodes: customNodes
      })
      return response.data
    } catch (error) {
      console.error('워크플로우 생성 오류:', error)
      throw error
    }
  }

  // 워크플로우 실행
  async executeWorkflow(workflowId, initialData, userId = null) {
    try {
      const response = await this.api.post('/workflows/execute', {
        workflow_id: workflowId,
        initial_data: initialData,
        user_id: userId
      })
      return response.data
    } catch (error) {
      console.error('워크플로우 실행 오류:', error)
      throw error
    }
  }

  // 워크플로우 상태 조회
  async getWorkflowStatus(executionId) {
    try {
      const response = await this.api.get(`/workflows/status/${executionId}`)
      return response.data
    } catch (error) {
      console.error('워크플로우 상태 조회 오류:', error)
      throw error
    }
  }

  // 워크플로우 취소
  async cancelWorkflow(executionId) {
    try {
      const response = await this.api.post(`/workflows/cancel/${executionId}`)
      return response.data
    } catch (error) {
      console.error('워크플로우 취소 오류:', error)
      throw error
    }
  }

  // 워크플로우 재시도
  async retryWorkflow(executionId) {
    try {
      const response = await this.api.post(`/workflows/retry/${executionId}`)
      return response.data
    } catch (error) {
      console.error('워크플로우 재시도 오류:', error)
      throw error
    }
  }

  // 사용 가능한 워크플로우 목록 조회
  async getAvailableWorkflows() {
    try {
      const response = await this.api.get('/workflows/list')
      return response.data
    } catch (error) {
      console.error('워크플로우 목록 조회 오류:', error)
      throw error
    }
  }

  // 시스템 메트릭 조회
  async getSystemMetrics() {
    try {
      const response = await this.api.get('/workflows/metrics')
      return response.data
    } catch (error) {
      console.error('시스템 메트릭 조회 오류:', error)
      throw error
    }
  }

  // 워크플로우 로그 조회
  async getWorkflowLogs(executionId = null, level = null, limit = 100) {
    try {
      const params = new URLSearchParams()
      if (executionId) params.append('execution_id', executionId)
      if (level) params.append('level', level)
      params.append('limit', limit)

      const response = await this.api.get(`/workflows/logs?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('워크플로우 로그 조회 오류:', error)
      throw error
    }
  }

  // 워크플로우 추적 정보 조회
  async getWorkflowTraces(executionId) {
    try {
      const response = await this.api.get(`/workflows/traces/${executionId}`)
      return response.data
    } catch (error) {
      console.error('워크플로우 추적 정보 조회 오류:', error)
      throw error
    }
  }

  // 워크플로우 상태 조회
  async getWorkflowHealth(executionId) {
    try {
      const response = await this.api.get(`/workflows/health/${executionId}`)
      return response.data
    } catch (error) {
      console.error('워크플로우 상태 조회 오류:', error)
      throw error
    }
  }

  // 대시보드 데이터 조회
  async getDashboardData() {
    try {
      const response = await this.api.get('/workflows/dashboard')
      return response.data
    } catch (error) {
      console.error('대시보드 데이터 조회 오류:', error)
      throw error
    }
  }

  // 예시 워크플로우 실행
  async runExampleWorkflow(exampleType) {
    try {
      const response = await this.api.post(`/workflows/examples/${exampleType}`)
      return response.data
    } catch (error) {
      console.error('예시 워크플로우 실행 오류:', error)
      throw error
    }
  }

  // 커스텀 워크플로우 생성
  async createCustomWorkflow(name, description, nodes) {
    try {
      const response = await this.api.post('/workflows/custom/create', {
        name,
        description,
        nodes
      })
      return response.data
    } catch (error) {
      console.error('커스텀 워크플로우 생성 오류:', error)
      throw error
    }
  }
}

export default new WorkflowService()
