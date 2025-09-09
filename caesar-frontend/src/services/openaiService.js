/**
 * OpenAI API 서비스
 * 실제 GPT-4를 사용한 지능형 응답 생성
 */

import OpenAI from 'openai'

class OpenAIService {
  constructor() {
    // 환경변수에서 API 키 가져오기
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.log('🔧 개발 모드: OpenAI API 키 없이 시뮬레이션으로 작동합니다.')
      this.openai = null
      this.isConfigured = false
      return
    }

    // OpenAI 클라이언트 초기화
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // 브라우저에서 사용 허용
    })

    this.isConfigured = true
    this.conversationHistory = []
    this.isProcessing = false

    // 설정값들
    this.model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4'
    this.maxTokens = parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS) || 2000
    this.temperature = parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE) || 0.7

    console.log('✅ OpenAI 서비스가 초기화되었습니다.')
  }

  // OpenAI 설정 상태 확인
  isReady() {
    return this.isConfigured && this.openai !== null
  }

  // 메시지 처리 및 OpenAI 응답 생성
  async processMessage(message, userId = 'user') {
    if (!this.isReady()) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.')
    }

    if (this.isProcessing) {
      throw new Error('이전 요청이 처리 중입니다.')
    }

    this.isProcessing = true

    try {
      // 대화 히스토리에 사용자 메시지 추가
      this.conversationHistory.push({
        role: 'user',
        content: message
      })

      // 시스템 프롬프트 설정
      const systemPrompt = this.getSystemPrompt()
      
      // OpenAI API 호출을 위한 메시지 배열 구성
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory.slice(-10) // 최근 10개 대화만 유지
      ]

      console.log('🤖 OpenAI API 호출 중...')

      // OpenAI API 호출
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false
      })

      const response = completion.choices[0].message.content

      // 대화 히스토리에 AI 응답 추가
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      })

      console.log('✅ OpenAI 응답 생성 완료')

      return {
        success: true,
        response,
        conversationId: `conv_${Date.now()}`,
        model: this.model,
        tokensUsed: completion.usage?.total_tokens || 0
      }

    } catch (error) {
      console.error('❌ OpenAI API 오류:', error)
      
      // API 오류 메시지 처리
      let errorMessage = 'OpenAI API 처리 중 오류가 발생했습니다.'
      
      if (error.code === 'invalid_api_key') {
        errorMessage = 'OpenAI API 키가 유효하지 않습니다. .env 파일의 API 키를 확인해주세요.'
      } else if (error.code === 'insufficient_quota') {
        errorMessage = 'OpenAI API 사용량 한도를 초과했습니다. 요금제를 확인해주세요.'
      } else if (error.code === 'rate_limit_exceeded') {
        errorMessage = 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      }

      throw new Error(errorMessage)
      
    } finally {
      this.isProcessing = false
    }
  }

  // 시스템 프롬프트 설정
  getSystemPrompt() {
    return `당신은 Caesar AI Assistant입니다. 한국어로 친근하고 도움이 되는 응답을 제공하는 회사 내부 AI 어시스턴트입니다.

**역할과 특징:**
- 회사 업무를 도와주는 전문적이면서도 친근한 어시스턴트
- 명확하고 구체적인 정보 제공
- 적절한 이모지 사용으로 친근함 표현
- 모르는 것은 솔직하게 인정하고 대안 제시

**주요 업무 영역:**
📋 회사 규정 및 정책 안내
💼 업무 프로세스 지원
📅 일정 및 회의 관리
📄 문서 작성 및 정리
🤝 팀 협업 지원
💻 기술 관련 도움

**응답 스타일:**
- 존댓말 사용
- 구조화된 정보 제공 (불릿 포인트, 번호 등)
- 실용적이고 actionable한 조언
- 필요시 추가 질문 유도

항상 도움이 되고 정확한 정보를 제공하려고 노력하세요.`
  }

  // 대화 히스토리 조회
  getConversationHistory() {
    return this.conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date().toISOString()
    }))
  }

  // 대화 히스토리 초기화
  clearConversationHistory() {
    this.conversationHistory = []
    console.log('🗑️ 대화 히스토리가 초기화되었습니다.')
  }

  // 현재 처리 상태 확인
  isCurrentlyProcessing() {
    return this.isProcessing
  }

  // 설정 정보 조회
  getSettings() {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      isConfigured: this.isConfigured,
      conversationLength: this.conversationHistory.length
    }
  }

  // 모델 변경 (런타임에서)
  setModel(model) {
    if (['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'].includes(model)) {
      this.model = model
      console.log(`🔄 모델이 ${model}로 변경되었습니다.`)
    } else {
      console.warn(`⚠️ 지원하지 않는 모델입니다: ${model}`)
    }
  }

  // Temperature 조정
  setTemperature(temp) {
    if (temp >= 0 && temp <= 2) {
      this.temperature = temp
      console.log(`🌡️ Temperature가 ${temp}로 설정되었습니다.`)
    } else {
      console.warn('⚠️ Temperature는 0과 2 사이의 값이어야 합니다.')
    }
  }
}

export default new OpenAIService()
