import React, { useState, useEffect } from 'react'

export default function IntegrationModal({ open, onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  async function handleSave() {
    setSaving(true)
    try {
      // API 키 저장 로직
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Notion API 키가 저장되었습니다.')
      onClose()
    } catch (error) {
      console.error('API 키 저장 실패:', error)
      alert('API 키 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '20px'
    }}>
      <div style={{
        width: '90vw',
        maxWidth: '800px',
        height: 'auto',
        background: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #E5E7EB',
          background: '#F8FAFC'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>외부 API 연동</h2>
          <button onClick={onClose} style={{
            padding: '8px',
            border: 'none',
            borderRadius: '6px',
            background: '#F3F4F6',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#6B7280',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#E5E7EB'
            e.target.style.color = '#374151'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#F3F4F6'
            e.target.style.color = '#6B7280'
          }}>✕</button>
        </div>

        <div style={{ padding: '32px 24px', flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px'
          }}>
            {/* 왼쪽: 노션 아이콘 */}
            <div style={{
              flexShrink: 0,
              width: '80px',
              height: '80px',
              background: '#fff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <img 
                src="/src/assets/imgs/Notion-logo.svg" 
                alt="Notion" 
                style={{
                  width: '48px',
                  height: '48px'
                }}
              />
            </div>

            {/* 오른쪽: 설정 폼 */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 8px 0'
                }}>
                  Notion API 연동
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Notion 워크스페이스와 연동하여 데이터를 동기화합니다.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  API 키
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Notion API 키를 입력하세요"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827',
                    background: '#FFFFFF',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#9CA3AF',
                  margin: '8px 0 0 0',
                  lineHeight: '1.4'
                }}>
                  Notion 개발자 페이지에서 생성한 Integration Token을 입력하세요.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#F9FAFB'
                    e.target.style.borderColor = '#9CA3AF'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#FFFFFF'
                    e.target.style.borderColor = '#D1D5DB'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !apiKey.trim()}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    background: saving || !apiKey.trim() ? '#9CA3AF' : '#3B82F6',
                    color: 'white',
                    cursor: saving || !apiKey.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!saving && apiKey.trim()) {
                      e.target.style.background = '#2563EB'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving && apiKey.trim()) {
                      e.target.style.background = '#3B82F6'
                    }
                  }}
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}