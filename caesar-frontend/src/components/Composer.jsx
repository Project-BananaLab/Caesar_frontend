import React, { useCallback } from 'react'

export default function Composer({ value, onChange, onSend, disabled }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend?.()
    }
  }, [onSend])

  return (
    <div style={{ padding: 16, borderTop: '1px solid #E5E7EB', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하고 Enter로 전송(Shift+Enter: 줄바꿈)"
          rows={2}
          style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '1px solid #E5E7EB', resize: 'vertical' }}
        />
        <button onClick={onSend} disabled={disabled} style={{
          padding: '12px 16px',
          borderRadius: 10,
          border: 'none',
          background: disabled ? '#9CA3AF' : 'linear-gradient(135deg,#4F46E5,#06B6D4)',
          color: '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}>전송</button>
      </div>
    </div>
  )
}
