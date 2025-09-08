/**
 * 지능형 LLM 응답 생성 서비스
 * OpenAI API를 우선 사용하고, 실패 시 폴백 응답 제공
 */

import openaiService from './openaiService.js'
import caesarAgentService from './caesarAgentService.js'

class LLMService {
  constructor() {
    this.conversationHistory = []
    this.isProcessing = false
    this.useOpenAI = true // OpenAI 사용 여부
    this.useAgent = false // Caesar Agent 사용 여부
    this.agentPriority = true // Agent 우선 사용 여부
  }

  // 메시지 처리 및 응답 생성
  async processMessage(message, userId = 'user') {
    if (this.isProcessing) {
      throw new Error('이전 요청이 처리 중입니다.')
    }

    this.isProcessing = true

    try {
      let response
      let source = 'fallback'

      // Caesar Agent 우선 사용 시도 (활성화된 경우)
      if (this.useAgent && this.agentPriority && caesarAgentService.isAgentModeEnabled()) {
        try {
          console.log('🤖 Caesar Agent를 사용하여 응답 생성 중...')
          const agentResult = await caesarAgentService.processAgentMessage(message, userId)
          response = agentResult.response
          source = 'caesar_agent'
          
          // Agent 응답을 히스토리에 추가
          this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
          })

          this.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString(),
            source: 'caesar_agent'
          })
          
        } catch (agentError) {
          console.warn('⚠️ Caesar Agent 사용 실패, OpenAI로 대체:', agentError.message)
          // Agent 실패 시 OpenAI로 대체
        }
      }

      // OpenAI API 사용 시도 (Agent 실패했거나 비활성화인 경우)
      if (source === 'fallback' && this.useOpenAI && openaiService.isReady()) {
        try {
          console.log('🤖 OpenAI를 사용하여 응답 생성 중...')
          const openaiResult = await openaiService.processMessage(message, userId)
          response = openaiResult.response
          source = 'openai'
          
          // OpenAI 히스토리와 동기화
          this.conversationHistory = openaiService.getConversationHistory()
          
        } catch (openaiError) {
          console.warn('⚠️ OpenAI 사용 실패, 폴백 응답 사용:', openaiError.message)
          response = await this.generateFallbackResponse(message)
        }
      }

      // 폴백 응답 사용 (모든 방법 실패한 경우)
      if (source === 'fallback') {
        console.log('📝 폴백 응답 시스템 사용 중...')
        response = await this.generateFallbackResponse(message)
        
        // 로컬 히스토리 업데이트
        this.conversationHistory.push({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        })

        this.conversationHistory.push({
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString()
        })
      }

      return {
        success: true,
        response,
        conversationId: `conv_${Date.now()}`,
        source // 응답 소스 정보
      }

    } catch (error) {
      console.error('❌ LLM 처리 오류:', error)
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  // 폴백 응답 생성 (기존 키워드 기반 시스템)
  async generateFallbackResponse(message) {
    // 타이핑 효과를 위한 지연
    await this.delay(1000 + Math.random() * 2000)

    const lowerMessage = message.toLowerCase()

    // 키워드 기반 응답 생성
    if (lowerMessage.includes('안녕') || lowerMessage.includes('하이') || lowerMessage.includes('hello')) {
      return this.getGreetingResponse()
    } else if (lowerMessage.includes('도움') || lowerMessage.includes('help')) {
      return this.getHelpResponse()
    } else if (lowerMessage.includes('날씨')) {
      return this.getWeatherResponse()
    } else if (lowerMessage.includes('시간')) {
      return this.getTimeResponse()
    } else if (lowerMessage.includes('휴가') || lowerMessage.includes('규정')) {
      return this.getHolidayPolicyResponse()
    } else if (lowerMessage.includes('회의') || lowerMessage.includes('미팅')) {
      return this.getMeetingResponse()
    } else if (lowerMessage.includes('문서') || lowerMessage.includes('파일')) {
      return this.getDocumentResponse()
    } else if (lowerMessage.includes('프로젝트')) {
      return this.getProjectResponse()
    } else if (lowerMessage.includes('코딩') || lowerMessage.includes('프로그래밍')) {
      return this.getCodingResponse()
    } else if (lowerMessage.includes('감사') || lowerMessage.includes('고마워')) {
      return this.getThankYouResponse()
    } else {
      return this.getGeneralResponse(message)
    }
  }


  // 인사 응답
  getGreetingResponse() {
    const responses = [
      "안녕하세요! 😊 Caesar AI 어시스턴트입니다. 무엇을 도와드릴까요?",
      "반갑습니다! 오늘 하루 어떻게 도와드릴까요?",
      "안녕하세요! 궁금한 것이 있으시면 언제든 물어보세요.",
      "Hello! 어떤 업무를 도와드릴까요? 📋"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 도움말 응답
  getHelpResponse() {
    return `🤖 **Caesar AI 어시스턴트 도움말**

저는 다음과 같은 업무를 도와드릴 수 있습니다:

📋 **업무 지원**
• 회사 규정 및 정책 안내
• 회의실 예약 및 일정 관리
• 문서 작성 및 정리 지원

💼 **프로젝트 관리**
• 업무 계획 수립
• 진행 상황 추적
• 팀 협업 지원

🔍 **정보 검색**
• 사내 문서 검색
• 업무 관련 정보 제공
• FAQ 및 가이드 안내

무엇을 도와드릴까요?`
  }

  // 날씨 응답
  getWeatherResponse() {
    return `🌤️ 죄송하지만 실시간 날씨 정보는 제공할 수 없습니다. 

대신 다음과 같은 업무 관련 도움을 드릴 수 있습니다:
• 회사 규정 안내
• 문서 작성 지원
• 일정 관리 도움

다른 업무적인 질문이 있으시면 언제든 말씀해 주세요!`
  }

  // 시간 응답
  getTimeResponse() {
    const now = new Date()
    const timeString = now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    return `🕐 현재 시간: ${timeString}

오늘 일정이나 업무 계획에 대해 도움이 필요하시면 말씀해 주세요!`
  }

  // 휴가 규정 응답
  getHolidayPolicyResponse() {
    return `📋 **사내 휴가 규정 요약**

🏖️ **연차 휴가**
• 입사 1년 후 15일 부여
• 매년 1일씩 추가 (최대 25일)
• 미사용 연차는 다음 해 이월 가능

🤒 **병가**
• 연간 최대 30일
• 진단서 제출 시 무급병가 추가 가능

👶 **특별휴가**
• 출산휴가: 90일 (유급)
• 육아휴직: 최대 1년
• 경조사휴가: 사유별 차등 적용

📝 **신청 방법**
• 3일 전 사전 신청 원칙
• 인사팀 승인 후 사용 가능

더 자세한 내용이 필요하시면 인사팀(02-1234-5678)으로 문의해 주세요.`
  }

  // 회의 응답
  getMeetingResponse() {
    return `📅 **회의실 예약 및 관리**

🏢 **사용 가능한 회의실**
• 대회의실 (20명): 프레젠테이션 장비 완비
• 중회의실 (10명): 화상회의 시설
• 소회의실 (4명): 간단한 미팅용

📝 **예약 방법**
1. 사내 예약 시스템 접속
2. 원하는 시간/장소 선택
3. 회의 목적 및 참석자 입력
4. 승인 후 사용

⏰ **이용 시간**
• 평일: 09:00 - 18:00
• 최대 4시간 연속 사용 가능

회의실 예약이나 장비 사용에 대한 문의사항이 있으시면 총무팀으로 연락해 주세요!`
  }

  // 문서 응답
  getDocumentResponse() {
    return `📄 **문서 관리 및 작성 지원**

📋 **문서 작성 가이드**
• 보고서 템플릿 제공
• 제안서 양식 안내
• 회의록 작성법

🗂️ **문서 관리**
• 공유 드라이브 정리
• 버전 관리 시스템
• 보안 등급별 분류

🔍 **문서 검색**
• 키워드 기반 검색
• 부서별 문서 분류
• 최신 업데이트 알림

어떤 종류의 문서 작업을 도와드릴까요?
• 특정 양식이 필요하신가요?
• 기존 문서를 찾고 계신가요?
• 새로운 문서 작성을 원하시나요?`
  }

  // 프로젝트 응답
  getProjectResponse() {
    return `💼 **프로젝트 관리 지원**

📊 **진행 중인 주요 프로젝트**
• Caesar AI 시스템 개발 (진행률: 75%)
• 고객 관리 시스템 업그레이드 (진행률: 40%)
• 모바일 앱 리뉴얼 (계획 단계)

📅 **프로젝트 일정 관리**
• 마일스톤 설정 및 추적
• 업무 분담 및 책임자 지정
• 정기 진행 보고서 작성

🎯 **성과 지표**
• 일정 준수율: 85%
• 품질 만족도: 4.2/5.0
• 예산 집행률: 78%

특정 프로젝트에 대한 상세 정보가 필요하시거나, 새로운 프로젝트 계획 수립을 원하시면 말씀해 주세요!`
  }

  // 코딩 응답
  getCodingResponse() {
    return `💻 **개발 및 프로그래밍 지원**

🛠️ **기술 스택**
• Frontend: React, Vue.js, TypeScript
• Backend: Node.js, Python, FastAPI
• Database: PostgreSQL, MongoDB
• AI/ML: LangChain, LangGraph

📚 **개발 가이드라인**
• 코드 리뷰 프로세스
• Git 브랜치 전략
• 테스트 작성 규칙
• 배포 자동화

🔧 **개발 도구**
• IDE: VS Code, IntelliJ
• 협업: Slack, Notion, Jira
• 모니터링: 로그 시스템, 성능 대시보드

어떤 기술적 도움이 필요하신가요?
• 코드 리뷰를 원하시나요?
• 특정 기술에 대한 가이드가 필요한가요?
• 버그 해결 방법을 찾고 계신가요?`
  }

  // 감사 응답
  getThankYouResponse() {
    const responses = [
      "천만에요! 😊 언제든 도움이 필요하시면 말씀해 주세요.",
      "도움이 되어서 기쁩니다! 다른 궁금한 것이 있으시면 언제든 물어보세요.",
      "별말씀을요! 더 도움이 필요한 일이 있으시면 편하게 말씀해 주세요.",
      "감사합니다! 앞으로도 최선을 다해 도와드리겠습니다. 🤝"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 일반 응답
  getGeneralResponse(message) {
    const responses = [
      `"${message}"에 대해 말씀해 주셨군요. 🤔

구체적으로 어떤 도움이 필요하신지 자세히 알려주시면 더 정확한 답변을 드릴 수 있습니다.

예를 들어:
• 업무 관련 질문이신가요?
• 회사 규정에 대한 문의인가요?
• 프로젝트 관련 도움이 필요하신가요?

언제든 편하게 질문해 주세요!`,

      `흥미로운 질문이네요! 🌟

더 구체적인 정보를 알려주시면 맞춤형 답변을 제공해 드릴 수 있습니다.

다음 중 어떤 분야의 도움이 필요하신가요?
📋 업무 프로세스
💼 프로젝트 관리  
📚 문서 작성
🤝 팀 협업

자세히 말씀해 주시면 최선을 다해 도와드리겠습니다!`,

      `좋은 질문입니다! 💡

Caesar AI로서 다음과 같은 업무를 도와드릴 수 있습니다:

🎯 **전문 분야**
• 업무 효율성 개선
• 정보 검색 및 정리
• 일정 관리 및 계획 수립
• 팀 커뮤니케이션 지원

어떤 구체적인 도움이 필요하신지 말씀해 주시면 더 정확한 답변을 드리겠습니다!`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 지연 함수
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 대화 히스토리 조회
  getConversationHistory() {
    return this.conversationHistory
  }

  // 대화 히스토리 초기화
  clearConversationHistory() {
    this.conversationHistory = []
    if (openaiService.isReady()) {
      openaiService.clearConversationHistory()
    }
  }

  // OpenAI 사용 여부 토글
  toggleOpenAI(useOpenAI = null) {
    if (useOpenAI !== null) {
      this.useOpenAI = useOpenAI
    } else {
      this.useOpenAI = !this.useOpenAI
    }
    
    console.log(`🔄 OpenAI 사용: ${this.useOpenAI ? '활성화' : '비활성화'}`)
    return this.useOpenAI
  }

  // Caesar Agent 모드 토글
  async toggleAgentMode(enabled = null) {
    if (enabled !== null) {
      this.useAgent = enabled
    } else {
      this.useAgent = !this.useAgent
    }

    // Agent 서비스도 토글
    if (this.useAgent) {
      try {
        await caesarAgentService.toggleAgentMode()
        console.log('🤖 Caesar Agent 모드 활성화됨')
      } catch (error) {
        console.warn('Caesar Agent 활성화 실패:', error.message)
        this.useAgent = false
        throw error
      }
    } else {
      console.log('🤖 Caesar Agent 모드 비활성화됨')
    }

    return this.useAgent
  }

  // Agent 우선순위 설정
  setAgentPriority(priority) {
    this.agentPriority = priority
    console.log(`🔄 Agent 우선순위: ${priority ? '활성화' : '비활성화'}`)
  }

  // Agent 상태 확인
  async getAgentStatus() {
    if (!this.useAgent) {
      return { enabled: false, connected: false }
    }

    try {
      const status = await caesarAgentService.getAgentStatus()
      return {
        enabled: this.useAgent,
        connected: caesarAgentService.isBackendConnected(),
        agentModeActive: caesarAgentService.isAgentModeEnabled(),
        ...status
      }
    } catch (error) {
      return {
        enabled: this.useAgent,
        connected: false,
        error: error.message
      }
    }
  }

  // 현재 설정 정보 조회
  getStatus() {
    return {
      useOpenAI: this.useOpenAI,
      useAgent: this.useAgent,
      agentPriority: this.agentPriority,
      openaiReady: openaiService.isReady(),
      agentReady: caesarAgentService.isAgentModeEnabled(),
      isProcessing: this.isProcessing,
      conversationLength: this.conversationHistory.length,
      openaiSettings: openaiService.isReady() ? openaiService.getSettings() : null,
      agentSettings: caesarAgentService.getSettings()
    }
  }
}

export default new LLMService()
