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

function Bubble({ role, text, onPreview }) {
  const isUser = role === 'user'
  const links = useMemo(() => {
    const urlRegex = /https?:\/\/[\w.-]+(?:\/[\w\-./?%&=]*)?/gi
    return (text?.match(urlRegex) || [])
  }, [text])
  return (
    <div style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '100%',
      background: isUser ? '#4F46E5' : '#F3F4F6',
      color: isUser ? '#FFFFFF' : '#111827',
      borderRadius: 12,
      padding: '12px 14px',
      margin: '6px 0',
      whiteSpace: 'pre-wrap'
    }}>
      {text}
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

export default function MessageList({ messages, onPreview }) {
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0 16px', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.text} onPreview={onPreview} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}