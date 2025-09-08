# Caesar AI Assistant Frontend

LangGraph 기반 AI 에이전트와 통합된 현대적인 채팅 인터페이스입니다.

## 🚀 주요 기능

- **AI 채팅 인터페이스**: GPT와 유사한 대화형 인터페이스
- **LangGraph 워크플로우 통합**: 백엔드 워크플로우와 실시간 연동
- **실시간 상태 모니터링**: 워크플로우 실행 상태 실시간 추적
- **멀티 대화 관리**: 여러 대화 세션 관리 및 히스토리 저장
- **관리자 페이지**: 파일 업로드 및 시스템 관리
- **반응형 디자인**: 모바일 및 데스크톱 최적화

## 🛠️ 기술 스택

- **Frontend**: React 19 + Vite
- **상태 관리**: React Hooks
- **HTTP 클라이언트**: Axios
- **AI 통합**: LangChain + LangGraph
- **스타일링**: CSS-in-JS + CSS Modules

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 프로덕션 빌드
```bash
npm run build
```

### 4. 빌드 미리보기
```bash
npm run preview
```

## 🔧 백엔드 연동

이 프론트엔드는 Caesar 백엔드 API와 연동됩니다:

- **API Base URL**: `http://localhost:8000`
- **워크플로우 엔드포인트**: `/workflows/*`
- **실시간 모니터링**: WebSocket 또는 SSE

### 백엔드 실행
```bash
cd ../Caesar_backend_1
python -m uvicorn backend.main:app --reload --port 8000
```

## 🎯 사용법

### 1. 로그인
- **admin** / **admin123**
- **user** / **user123**  
- **caesar** / **caesar2024**

### 2. AI 채팅
- 자연어로 메시지 입력
- 자동으로 적절한 워크플로우 선택 및 실행
- 실시간 상태 모니터링

### 3. 워크플로우 타입
- **문서 처리**: "문서 업로드해줘", "파일 처리"
- **RAG 질의응답**: "회사 규정 알려줘", "질문 있어"
- **회의실 예약**: "회의실 예약해줘", "미팅 잡아줘"

## 📁 프로젝트 구조

```
src/
├── components/          # UI 컴포넌트
│   ├── MessageList.jsx  # 메시지 목록
│   ├── Composer.jsx     # 메시지 입력
│   ├── Sidebar.jsx      # 사이드바
│   ├── Header.jsx       # 헤더
│   └── AdminPage.jsx    # 관리자 페이지
├── services/            # API 서비스
│   ├── workflowService.js  # 워크플로우 API
│   └── agentService.js     # AI 에이전트 서비스
├── login/               # 로그인 관련
│   └── Login.jsx
├── App.jsx              # 메인 앱
├── App.css              # 스타일
└── main.jsx             # 진입점
```

## 🔌 API 엔드포인트

### 워크플로우 관리
- `POST /workflows/create` - 워크플로우 생성
- `POST /workflows/execute` - 워크플로우 실행
- `GET /workflows/status/{id}` - 상태 조회
- `POST /workflows/cancel/{id}` - 워크플로우 취소

### 모니터링
- `GET /workflows/metrics` - 시스템 메트릭
- `GET /workflows/logs` - 로그 조회
- `GET /workflows/dashboard` - 대시보드 데이터

## 🎨 UI/UX 특징

- **다크 테마**: 현대적인 다크 모드 디자인
- **그라데이션**: 시각적 매력도 향상
- **애니메이션**: 부드러운 전환 효과
- **반응형**: 모바일 최적화
- **접근성**: 키보드 네비게이션 지원

## 🚀 개발 가이드

### 새로운 컴포넌트 추가
```jsx
// src/components/NewComponent.jsx
import React from 'react'

export default function NewComponent({ prop1, prop2 }) {
  return (
    <div className="new-component">
      {/* 컴포넌트 내용 */}
    </div>
  )
}
```

### API 서비스 확장
```javascript
// src/services/newService.js
import axios from 'axios'

class NewService {
  async newMethod() {
    // API 호출 로직
  }
}

export default new NewService()
```

## 🐛 문제 해결

### 백엔드 연결 오류
1. 백엔드 서버가 실행 중인지 확인
2. API Base URL 확인 (`src/services/workflowService.js`)
3. CORS 설정 확인

### 워크플로우 실행 오류
1. 네트워크 탭에서 API 응답 확인
2. 콘솔에서 에러 메시지 확인
3. 백엔드 로그 확인

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
