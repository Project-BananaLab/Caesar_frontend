/**
 * 지능형 LLM 응답 생성 서비스
 * OpenAI API를 우선 사용하고, 실패 시 폴백 응답 제공
 */

import openaiService from './openaiService.js'

class LLMService {
  constructor() {
    this.conversationHistory = []
    this.isProcessing = false
    this.useAgent = false
    this.agentPriority = true
  }

  // 메시지 처리 및 응답 생성
  async processMessage(message, userId = 'user') {
    if (this.isProcessing) {
      throw new Error('이전 요청이 처리 중입니다.')
    }

    this.isProcessing = true
    let response = ''
    let source = 'fallback'

    try {
      // OpenAI API 사용 시도
      if (openaiService.isReady()) {
        console.log('🤖 OpenAI API를 사용하여 응답 생성 중...')
        const openaiResult = await openaiService.processMessage(message, userId)
        response = openaiResult.response
        source = 'openai'
        
        // OpenAI 응답을 히스토리에 추가
        this.conversationHistory.push({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        })

        this.conversationHistory.push({
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
          source: 'openai'
        })
        
      } else {
        console.log('💬 폴백 응답 생성 중...')
        response = this.generateFallbackResponse(message)
        source = 'fallback'
        
        // 폴백 응답을 히스토리에 추가
        this.conversationHistory.push({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        })

        this.conversationHistory.push({
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
          source: 'fallback'
        })
      }

      return {
        success: true,
        response,
        conversationId: `conv_${Date.now()}`,
        source
      }

    } catch (error) {
      console.error('❌ LLM 서비스 오류:', error)
      
      // 오류 발생 시 폴백 응답
      response = `죄송합니다. 처리 중 문제가 발생했습니다. 다시 시도해주세요.\n\n오류: ${error.message}`
      
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })

      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        source: 'error'
      })

      return {
        success: false,
        response,
        conversationId: `conv_${Date.now()}`,
        source: 'error',
        error: error.message
      }
      
    } finally {
      this.isProcessing = false
    }
  }

  // 폴백 응답 생성
  generateFallbackResponse(message) {
    const responses = [
      "안녕하세요! Caesar AI Assistant입니다. 현재 개발 모드로 작동 중입니다.",
      "질문해 주셔서 감사합니다. 더 자세한 도움이 필요하시면 관리자에게 문의해주세요.",
      "흥미로운 질문이네요! 현재는 데모 모드로 운영되고 있습니다.",
      "도움을 드리고 싶지만, 현재는 제한된 기능으로 운영 중입니다.",
      "좋은 질문입니다! 추후 더 나은 서비스로 답변드리겠습니다."
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Agent 모드 토글 (데모용)
  async toggleAgentMode() {
    try {
      this.useAgent = !this.useAgent
      console.log(`${this.useAgent ? '✅ Agent 모드 활성화' : '❌ Agent 모드 비활성화'}`)
      return this.useAgent
    } catch (error) {
      console.error('Agent 모드 토글 실패:', error)
      this.useAgent = false
      throw error
    }
  }

  // Agent 상태 조회 (데모용)
  async getAgentStatus() {
    return {
      connected: this.useAgent,
      agentModeActive: this.useAgent,
      useAgent: this.useAgent
    }
  }

  // 대화 히스토리 조회
  getConversationHistory() {
    return this.conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      source: msg.source || 'unknown'
    }))
  }

  // 대화 히스토리 초기화
  clearConversationHistory() {
    this.conversationHistory = []
    if (openaiService.isReady()) {
      openaiService.clearConversationHistory()
    }
    console.log('🗑️ 대화 히스토리가 초기화되었습니다.')
  }

  // 현재 처리 상태 확인
  isCurrentlyProcessing() {
    return this.isProcessing
  }

  // 서비스 상태 정보
  getStatus() {
    return {
      useAgent: this.useAgent,
      agentPriority: this.agentPriority,
      openaiReady: openaiService.isReady(),
      agentReady: this.useAgent,
      isProcessing: this.isProcessing,
      conversationLength: this.conversationHistory.length,
      openaiSettings: openaiService.isReady() ? openaiService.getSettings() : null
    }
  }

  // Agent 우선순위 설정
  setAgentPriority(priority) {
    this.agentPriority = priority
    console.log(`🔄 Agent 우선순위: ${priority ? '활성화' : '비활성화'}`)
  }
}

export default new LLMService()