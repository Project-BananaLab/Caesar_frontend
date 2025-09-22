import React, { useEffect, useRef } from 'react'

function LinkActions({ url, onPreview }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <button 
        onClick={() => onPreview?.(url)}
        style={{
          padding: '4px 8px',
          fontSize: 12,
          background: '#F3F4F6',
          border: '1px solid #D1D5DB',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        미리보기
      </button>
      <button 
        onClick={() => window.open(url, '_blank')}
        style={{
          padding: '4px 8px',
          fontSize: 12,
          background: '#EBF8FF',
          border: '1px solid #3B82F6',
          borderRadius: 4,
          cursor: 'pointer',
          color: '#3B82F6'
        }}
      >
        링크 열기
      </button>
    </div>
  )
}

function ChatMessage({ message, onPreview, searchQuery, isCurrentMatch }) {
  const isUser = message.role === 'user'
  const messageRef = useRef(null)
  
  // URL 패턴 매칭
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = message.text?.match(urlRegex) || []
  
  // 검색어 하이라이트 함수
  const highlightSearchTerm = (text) => {
    if (!searchQuery || !text) return text
    
    const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, index) => {
      const isMatch = part.toLowerCase() === searchQuery.toLowerCase()
      return (
        <span 
          key={index} 
          style={isMatch ? { 
            backgroundColor: '#A855F7', 
            color: 'white', 
            padding: '2px 4px', 
            borderRadius: '3px',
            fontWeight: 'bold'
          } : {}}
        >
          {part}
        </span>
      )
    })
  }

  // URL을 제거한 텍스트
  const textWithoutUrls = message.text?.replace(urlRegex, '').trim()
  
  return (
    <div 
      ref={messageRef}
      className={`chat-message ${isUser ? 'user' : 'assistant'} ${isCurrentMatch ? 'current-match' : ''}`}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 16,
        ...(isCurrentMatch && {
          border: '2px solid #A855F7',
          borderRadius: '12px',
          padding: '8px',
          backgroundColor: 'rgba(168, 85, 247, 0.1)'
        })
      }}
    >
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser 
          ? 'linear-gradient(135deg, #4F46E5, #06B6D4)'
          : '#F3F4F6',
        color: isUser ? '#FFFFFF' : '#374151',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap'
      }}>
        {highlightSearchTerm(textWithoutUrls)}
        {!isUser && urls.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {urls.map((url, i) => (
              <LinkActions key={i} url={url} onPreview={onPreview} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatMessageList({ messages, onPreview, searchQuery, searchMatches, currentMatchIndex }) {
  const bottomRef = useRef(null)
  const messageRefs = useRef([])
  
  // 메시지 변경 시 하단으로 스크롤 (검색 중이 아닐 때만)
  useEffect(() => {
    if (!searchQuery) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, searchQuery])
  
  // 현재 검색 결과로 스크롤
  useEffect(() => {
    if (searchMatches.length > 0 && currentMatchIndex >= 0) {
      const currentMatch = searchMatches[currentMatchIndex]
      const messageRef = messageRefs.current[currentMatch.messageIndex]
      if (messageRef) {
        messageRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [searchMatches, currentMatchIndex])

  return (
    <div className="chat-message-list" style={{ 
      width: '60%',
      margin: '0 auto',
      flex: 1, 
      overflowY: 'auto', 
      padding: '16px',
      background: '#FFFFFF'
    }}>
      {messages.map((message, index) => {
        const isCurrentMatch = searchMatches.some(match => 
          match.messageIndex === index && 
          searchMatches.indexOf(match) === currentMatchIndex
        )
        
        return (
          <div 
            key={message.id || index}
            ref={el => messageRefs.current[index] = el}
          >
            <ChatMessage 
              message={message} 
              onPreview={onPreview}
              searchQuery={searchQuery}
              isCurrentMatch={isCurrentMatch}
            />
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
