import React, { useEffect, useMemo, useRef } from 'react'

function LinkActions({ url, onPreview }) {
  function copy() { navigator.clipboard?.writeText(url) }
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
      <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#2563EB' }}>{url}</a>
      <button onClick={copy} style={{ fontSize: 11, padding: '4px 6px', border: '1px solid #CBD5E1', borderRadius: 4, background: '#FFF', cursor: 'pointer' }}>복사</button>
      <button onClick={() => onPreview?.(url)} style={{ fontSize: 11, padding: '4px 6px', border: '1px solid #CBD5E1', borderRadius: 4, background: '#FFF', cursor: 'pointer' }}>미리보기</button>
    </div>
  )
}

function Bubble({ role, text, onPreview, searchQuery, isCurrentMatch, messageRef }) {
  const isUser = role === 'user'
  const links = useMemo(() => {
    const urlRegex = /https?:\/\/[\w.-]+(?:\/[\w\-./?%&=]*)?/gi
    return (text?.match(urlRegex) || [])
  }, [text])
  
  // 검색어 하이라이트 처리
  const highlightedText = useMemo(() => {
    if (!searchQuery || !text) return text
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark style="background: #FEF08A; color: #92400E; font-weight: 600;">$1</mark>')
  }, [text, searchQuery])
  
  return (
    <div 
      ref={messageRef}
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '100%',
        background: isCurrentMatch 
          ? (isUser ? '#3730A3' : '#EDE9FE') 
          : (isUser ? '#4F46E5' : '#F3F4F6'),
        color: isUser ? '#FFFFFF' : '#111827',
        borderRadius: 12,
        padding: '12px 14px',
        margin: '6px 0',
        whiteSpace: 'pre-wrap',
        border: isCurrentMatch ? '2px solid #8B5CF6' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      {searchQuery ? (
        <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
      ) : (
        text
      )}
      {!isUser && links.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {links.map((u, i) => (
            <LinkActions key={i} url={u} onPreview={onPreview} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MessageList({ messages, onPreview, searchQuery, searchMatches, currentMatchIndex }) {
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
        messageRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }
  }, [currentMatchIndex, searchMatches])
  
  // messageRefs 배열 초기화
  useEffect(() => {
    messageRefs.current = messageRefs.current.slice(0, messages.length)
  }, [messages.length])
  
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0 16px', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {messages.map((m, i) => {
          const isCurrentMatch = searchMatches.length > 0 && 
            currentMatchIndex >= 0 && 
            searchMatches[currentMatchIndex]?.messageIndex === i
          
          return (
            <Bubble 
              key={i} 
              role={m.role} 
              text={m.text} 
              onPreview={onPreview}
              searchQuery={searchQuery}
              isCurrentMatch={isCurrentMatch}
              messageRef={el => messageRefs.current[i] = el}
            />
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}