import llmService from './llmService.js'

class AgentService {
  constructor() {
    this.conversationHistory = []
    this.currentWorkflow = null
    this.isProcessing = false
  }

  // 메시지 처리 - LLM 서비스 사용
  async processMessage(message, userId = 'default') {
    if (this.isProcessing) {
      throw new Error('이전 요청이 처리 중입니다.')
    }

    this.isProcessing = true
    
    try {
      // LLM 서비스를 통한 메시지 처리
      const result = await llmService.processMessage(message, userId)
      
      // 로컬 히스토리 업데이트
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })

      this.conversationHistory.push({
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        conversationId: result.conversationId
      })

      return {
        success: true,
        response: result.response,
        conversationId: result.conversationId
      }
    } catch (error) {
      console.error('메시지 처리 오류:', error)
      
      // 에러 응답
      const errorResponse = `죄송합니다. 처리 중 오류가 발생했습니다: ${error.message}`
      
      this.conversationHistory.push({
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date().toISOString(),
        error: true
      })

      return {
        success: false,
        response: errorResponse,
        error: error.message
      }
    } finally {
      this.isProcessing = false
    }
  }

  // 대화 히스토리와 LLM 서비스 동기화
  syncWithLLMService() {
    const llmHistory = llmService.getConversationHistory()
    this.conversationHistory = llmHistory
  }

  // 대화 히스토리 조회
  getConversationHistory() {
    return this.conversationHistory
  }

  // 대화 히스토리 초기화
  clearConversationHistory() {
    this.conversationHistory = []
    llmService.clearConversationHistory()
  }

  // 대화 히스토리 로드 함수 추가
  loadConversationHistory(messages) {
    this.conversationHistory = messages || []
  }

  // 현재 처리 상태 조회
  isCurrentlyProcessing() {
    return this.isProcessing
  }
}

export default new AgentService()
