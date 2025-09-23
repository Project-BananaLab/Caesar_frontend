import React, { useCallback, useRef, useEffect } from 'react'

export default function ChatComposer({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null)

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend?.()
    }
  }, [onSend])

  // 텍스트 길이에 따라 높이 자동 조절
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = Math.min(textarea.scrollHeight, 150) // 최대 150px
      textarea.style.height = `${scrollHeight}px`
    }
  }, [value])

  return (
    <div className="chat-composer" style={{ 
      padding: '16px 0', 
      borderTop: '2px solid #E5E7EB', 
      background: '#FAFAFA',
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      <div className="chat-composer-container" style={{ 
        display: 'flex', 
        gap: 12,
        width: '100%',
        margin: '0 auto',
        padding: '0 20%'
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하고 Enter로 전송(Shift+Enter: 줄바꿈)"
          className="chat-composer-input"
          style={{ 
            flex: 1, 
            padding: '14px 16px', 
            borderRadius: 12, 
            border: '2px solid #E5E7EB', 
            resize: 'none',
            minHeight: '50px',
            maxHeight: '150px',
            overflow: 'auto',
            fontSize: '15px',
            lineHeight: '1.5',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#64748B #F1F5F9'
          }}
        />
        <button 
          onClick={onSend} 
          disabled={disabled} 
          className="chat-composer-send-button"
          style={{
            padding: '12px 24px',
            background: disabled ? '#9CA3AF' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: '14px',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '80px'
          }}
        >
          전송
        </button>
      </div>
    </div>
  )
}