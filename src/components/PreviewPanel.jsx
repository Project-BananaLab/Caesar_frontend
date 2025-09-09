import React, { useEffect, useRef, useState } from 'react'

export default function PreviewPanel({ url, onClose }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function handleWheel(e) {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY < 0 ? 0.05 : -0.05
        setScale(s => Math.min(2, Math.max(0.5, s + delta)))
      }
    }
    const el = containerRef.current
    el?.addEventListener('wheel', handleWheel, { passive: false })
    return () => el?.removeEventListener('wheel', handleWheel)
  }, [])

  function download() { window.open(url, '_blank') }
  function print() { window.open(url + (url.includes('?') ? '&' : '?') + 'print=true', '_blank') }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: 420,
      height: '100vh',
      background: '#FFFFFF',
      boxShadow: '-6px 0 20px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderBottom: '1px solid #E5E7EB',
        background: '#F8FAFC'
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={download} style={{ padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, background: '#FFF', cursor: 'pointer' }}>다운로드</button>
          <button onClick={print} style={{ padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, background: '#FFF', cursor: 'pointer' }}>인쇄</button>
        </div>
        <div>
          <button onClick={onClose} aria-label="close" style={{ padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, background: '#FFF', cursor: 'pointer' }}>✕</button>
        </div>
      </div>

      <div ref={containerRef} style={{ flex: 1, overflow: 'auto', background: '#F1F5F9' }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <iframe title="preview" src={url} style={{ width: 400, height: '100vh', border: 'none', background: '#FFF' }} />
        </div>
      </div>
    </div>
  )
}
