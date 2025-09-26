import React, { useState, useEffect, useRef } from 'react'
import { updateNotionApiKey, checkNotionApiKey, deleteNotionApiKey, extractNotionData, getExtractionProgress } from '../../shared/api/companyService.js'

export default function IntegrationModal({ open, onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [hasExistingKey, setHasExistingKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState({
    status: 'idle',
    progress: 0,
    message: '대기 중'
  })
  const progressInterval = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      checkExistingApiKey()
      checkInitialProgress()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [open, onClose])

  // 초기 진행률 상태 확인
  async function checkInitialProgress() {
    try {
      const progress = await getExtractionProgress()
      setExtractionProgress(progress)
      if (progress.status === 'in_progress') {
        setExtracting(true)
        startProgressPolling()
      }
    } catch (error) {
      console.error('초기 진행률 확인 실패:', error)
    }
  }

  // 진행률 폴링 시작
  function startProgressPolling() {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }
    
    progressInterval.current = setInterval(async () => {
      try {
        const progress = await getExtractionProgress()
        setExtractionProgress(progress)
        
        if (progress.status === 'completed') {
          setExtracting(false)
          clearInterval(progressInterval.current)
          alert('Notion 데이터 추출이 완료되었습니다!')
        } else if (progress.status === 'failed') {
          setExtracting(false)
          clearInterval(progressInterval.current)
          alert(`추출 실패: ${progress.message}`)
        }
      } catch (error) {
        console.error('진행률 조회 실패:', error)
      }
    }, 1000) // 1초마다 폴링
  }

  // 진행률 폴링 중지
  function stopProgressPolling() {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
      progressInterval.current = null
    }
  }

  async function checkExistingApiKey() {
    setLoading(true)
    try {
      const result = await checkNotionApiKey()
      setHasExistingKey(result.hasApiKey)
    } catch (error) {
      console.error('API 키 확인 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateNotionApiKey(apiKey)
      alert('Notion API 키가 저장되었습니다.')
      setApiKey('')
      setIsEditMode(false)
      await checkExistingApiKey() // 상태 새로고침
    } catch (error) {
      console.error('API 키 저장 실패:', error)
      alert(error.message || 'API 키 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const confirmed = confirm('정말로 Notion API 키를 삭제하시겠습니까?')
    if (confirmed) {
      setSaving(true)
      try {
        await deleteNotionApiKey()
        alert('Notion API 키가 삭제되었습니다.')
        setHasExistingKey(false)
        setIsEditMode(false)
      } catch (error) {
        console.error('API 키 삭제 실패:', error)
        alert(error.message || 'API 키 삭제에 실패했습니다.')
      } finally {
        setSaving(false)
      }
    }
  }

  async function handleExtract() {
    setExtracting(true)
    try {
      await extractNotionData()
      // 추출 시작 후 진행률 폴링 시작
      startProgressPolling()
    } catch (error) {
      console.error('데이터 추출 실패:', error)
      alert(error.message || '데이터 추출에 실패했습니다.')
      setExtracting(false)
      stopProgressPolling()
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    API 키
                  </label>
                </div>
                
                {loading ? (
                  <div style={{
                    padding: '12px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    color: '#6B7280',
                    background: '#F9FAFB'
                  }}>
                    확인 중...
                  </div>
                ) : hasExistingKey && !isEditMode ? (
                  <div style={{
                    padding: '12px 16px',
                    border: '1px solid #10B981',
                    borderRadius: '8px',
                    color: '#10B981',
                    background: '#F0FDF4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>API키가 존재합니다</span>
                    <button
                      onClick={handleDelete}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #EF4444',
                        borderRadius: '4px',
                        background: '#FEF2F2',
                        color: '#EF4444',
                        cursor: 'pointer'
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ) : (
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
                )}
                <p style={{
                  fontSize: '12px',
                  color: '#9CA3AF',
                  margin: '8px 0 0 0',
                  lineHeight: '1.4'
                }}>
                  Notion 개발자 페이지에서 생성한 Integration Token을 입력하세요.
                </p>
              </div>

              {/* 추출 진행률 표시 */}
              {extracting && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px' 
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      {extractionProgress.message}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#10B981' }}>
                      {extractionProgress.progress}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${extractionProgress.progress}%`,
                      height: '100%',
                      backgroundColor: '#10B981',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-in-out'
                    }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    if (!extracting) {
                      onClose()
                    }
                  }}
                  disabled={extracting}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    background: extracting ? '#F3F4F6' : '#FFFFFF',
                    color: extracting ? '#9CA3AF' : '#374151',
                    cursor: extracting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!extracting) {
                      e.target.style.background = '#F9FAFB'
                      e.target.style.borderColor = '#9CA3AF'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!extracting) {
                      e.target.style.background = '#FFFFFF'
                      e.target.style.borderColor = '#D1D5DB'
                    }
                  }}
                >
                  취소
                </button>
                {hasExistingKey && (
                  <button
                    onClick={handleExtract}
                    disabled={extracting}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      background: extracting ? '#9CA3AF' : '#10B981',
                      color: 'white',
                      cursor: extracting ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!extracting) {
                        e.target.style.background = '#059669'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!extracting) {
                        e.target.style.background = '#10B981'
                      }
                    }}
                  >
                    {extracting ? `추출 중 (${extractionProgress.progress}%)` : '추출하기'}
                  </button>
                )}
                {(isEditMode || !hasExistingKey) && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}