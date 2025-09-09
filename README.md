# Caesar AI Assistant Frontend

React 기반의 AI 채팅 어시스턴트 프론트엔드 애플리케이션입니다.

## 주요 기능

### 🔐 인증 시스템
- 로그인/로그아웃 기능
- 새로고침 시 로그인 상태 유지 (localStorage 사용)
- 권한 기반 접근 제어 (관리자/일반 사용자)

### 💬 채팅 시스템
- 실시간 AI 채팅
- 대화 목록 관리 (최대 30개)
- 대화 제목 자동 생성 (20자 제한)
- 최근 메시지 시간순 정렬
- 현재 대화 하이라이트 표시

### 👨‍💼 관리자 기능
- 파일 업로드 및 관리
- 페이징 처리 (10개씩)
- API 연동 기능
- 실시간 로딩 상태 표시

### 🎨 UI/UX
- 반응형 디자인
- 다크/라이트 테마
- 로딩 바 및 모달
- 호버 효과 및 애니메이션

## 기술 스택

- **Frontend**: React 19, React Router DOM
- **Styling**: CSS Modules, Custom CSS
- **State Management**: React Hooks
- **Build Tool**: Vite
- **Package Manager**: NPM

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
├── pages/              # 페이지 컴포넌트
├── services/           # API 서비스
├── styles/             # CSS 스타일 시트
├── utils/              # 유틸리티 함수
└── App.jsx             # 메인 앱 컴포넌트
```

## 테스트 계정

- **관리자**: admin / admin123
- **관리자**: caesar / caesar2024  
- **일반 사용자**: user / user123

## 주요 URL

- `/` - 메인 채팅 페이지
- `/login` - 로그인 페이지
- `/admin` - 관리자 페이지 (관리자 권한 필요)

## 개발 가이드

### 컴포넌트 구조
- 각 컴포넌트는 단일 책임 원칙 준수
- CSS는 별도 파일로 분리
- 재사용 가능한 컴포넌트는 `components/` 폴더에 위치

### 상태 관리
- 로그인 상태는 localStorage를 통해 영속화
- 채팅 데이터는 메모리에서 관리
- 전역 상태는 Context API 사용 가능

### 스타일링
- CSS 변수를 활용한 일관된 디자인 시스템
- 반응형 디자인 적용
- 접근성 고려한 UI 구현

## 라이센스

MIT License