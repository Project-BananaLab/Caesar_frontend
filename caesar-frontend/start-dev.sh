#!/bin/bash

# Caesar AI Assistant 개발 서버 시작 스크립트

echo "🚀 Caesar AI Assistant 개발 서버를 시작합니다..."

# 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치합니다..."
    npm install
fi

# 백엔드 서버 상태 확인
echo "🔍 백엔드 서버 상태를 확인합니다..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 백엔드 서버가 실행 중입니다."
else
    echo "⚠️  백엔드 서버가 실행되지 않았습니다."
    echo "   다음 명령어로 백엔드를 먼저 실행하세요:"
    echo "   cd ../Caesar_backend_1"
    echo "   python -m uvicorn backend.main:app --reload --port 8000"
    echo ""
    echo "   백엔드 없이도 프론트엔드는 실행됩니다 (일부 기능 제한)"
fi

echo ""
echo "🎯 프론트엔드 개발 서버를 시작합니다..."
echo "   URL: http://localhost:5173"
echo "   백엔드 API: http://localhost:8000"
echo ""

# 개발 서버 시작
npm run dev
