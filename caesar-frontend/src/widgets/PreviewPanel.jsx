import React, { useEffect, useRef, useState } from 'react'

export default function PreviewPanel({ url, onClose, fileName = '' }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  
  const getFileType = () => {
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
    
    // 이미지 파일
    if (['jpg', 'jpeg', 'jfif', 'png', 'gif', 'tiff', 'tif', 'bmp', 'webp', 'svg', 'ico'].includes(extension)) {
      return 'image'
    }
    
    // PDF 파일
    if (['pdf'].includes(extension)) {
      return 'pdf'
    }
    
    // 텍스트 파일
    if (['txt', 'csv', 'json', 'xml', 'yaml', 'yml', 'ini', 'cfg', 'md', 'markdown', 'log'].includes(extension)) {
      return 'text'
    }
    
    // 비디오 파일
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].includes(extension)) {
      return 'video'
    }
    
    // 오디오 파일
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(extension)) {
      return 'audio'
    }
    
    // 오피스 문서
    if (['doc', 'docx', 'hwp', 'hwpx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return 'office'
    }
    
    // 압축 파일
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return 'archive'
    }
    
    // 코드 파일
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'cs', 'php'].includes(extension)) {
      return 'code'
    }
    
    return 'other'
  }
  
  const fileType = getFileType()

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
      width: '50vw',
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

      <div ref={containerRef} style={{ flex: 1, overflow: 'auto', background: '#F1F5F9', padding: '16px' }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {fileType === 'image' && (
            <img 
              src={url} 
              alt={fileName}
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }} 
            />
          )}
          {fileType === 'pdf' && (
            <iframe 
              title="preview" 
              src={url} 
              style={{ 
                width: '100%', 
                height: '80vh', 
                border: 'none', 
                background: '#FFF',
                borderRadius: '8px'
              }} 
            />
          )}
          {fileType === 'text' && (
            <div style={{
              background: '#FFF',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <iframe 
                title="preview" 
                src={url} 
                style={{ 
                  width: '100%', 
                  height: '60vh', 
                  border: 'none'
                }} 
              />
            </div>
          )}
          {fileType === 'video' && (
            <div style={{
              background: '#FFF',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <video 
                src={url} 
                controls
                style={{ 
                  width: '100%', 
                  maxHeight: '60vh',
                  borderRadius: '8px'
                }}
              >
                브라우저가 비디오를 지원하지 않습니다.
              </video>
            </div>
          )}
          {fileType === 'audio' && (
            <div style={{
              background: '#FFF',
              padding: '32px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{fileName}</div>
              <audio 
                src={url} 
                controls
                style={{ 
                  width: '100%',
                  marginBottom: '16px'
                }}
              >
                브라우저가 오디오를 지원하지 않습니다.
              </audio>
            </div>
          )}
          {fileType === 'office' && (
            <div style={{
              background: '#FFF',
              padding: '32px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{fileName}</div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                오피스 문서는 다운로드하여 확인하세요.
                <br />
                (Word, Excel, PowerPoint, 한글 등)
              </div>
              <button 
                onClick={download}
                style={{
                  padding: '8px 16px',
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                다운로드
              </button>
            </div>
          )}
          {fileType === 'archive' && (
            <div style={{
              background: '#FFF',
              padding: '32px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗜️</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{fileName}</div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                압축 파일입니다. 다운로드하여 압축을 해제하세요.
                <br />
                (ZIP, RAR, 7Z 등)
              </div>
              <button 
                onClick={download}
                style={{
                  padding: '8px 16px',
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                다운로드
              </button>
            </div>
          )}
          {fileType === 'code' && (
            <div style={{
              background: '#FFF',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '12px',
                fontFamily: 'sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>💻</span>
                {fileName}
              </div>
              <iframe 
                title="code-preview" 
                src={url} 
                style={{ 
                  width: '100%', 
                  height: '60vh', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '4px'
                }} 
              />
            </div>
          )}
          {fileType === 'other' && (
            <div style={{
              background: '#FFF',
              padding: '32px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{fileName}</div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                이 파일 형식은 미리보기를 지원하지 않습니다.
                <br />
                다운로드하여 확인하세요.
              </div>
              <button 
                onClick={download}
                style={{
                  padding: '8px 16px',
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                다운로드
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
