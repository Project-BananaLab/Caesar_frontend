import React from 'react'

export default function TypingIndicator({ visible }) {
  if (!visible) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', color: '#6B7280' }}>
      <span style={{ width: 8, height: 8, background: '#06B6D4', borderRadius: 8, display: 'inline-block', animation: 'pulse 1.2s infinite' }} />
      <span>응답 생성 중…</span>
      <style>{`@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }`}</style>
    </div>
  )
}
