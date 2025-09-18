import React, { useState, useEffect } from 'react'

export default function IntegrationModal({ open, onClose }) {
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(null)

  useEffect(() => {
    if (open) {
      loadIntegrations()
    }
  }, [open])

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

  async function loadIntegrations() {
    setLoading(true)
    try {
      // 데모 데이터
      const data = [
        { id: 'slack', name: 'Slack', connected: false, description: 'Slack 워크스페이스 연동' },
        { id: 'notion', name: 'Notion', connected: true, description: 'Notion 데이터베이스 연동' },
        { id: 'github', name: 'GitHub', connected: false, description: 'GitHub 리포지토리 연동' }
      ]
      setIntegrations(data)
    } catch (error) {
      console.error('통합 서비스 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect(serviceId) {
    setConnecting(serviceId)
    try {
      // 데모 연동 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIntegrations(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { ...service, connected: true }
            : service
        )
      )
      alert(`${serviceId} 연동이 완료되었습니다.`)
    } catch (error) {
      console.error(`${serviceId} 연동 실패:`, error)
      alert(`${serviceId} 연동에 실패했습니다.`)
    } finally {
      setConnecting(null)
    }
  }

  async function handleDisconnect(serviceId) {
    setConnecting(serviceId)
    try {
      // 데모 연동 해제 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIntegrations(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { ...service, connected: false }
            : service
        )
      )
      alert(`${serviceId} 연동이 해제되었습니다.`)
    } catch (error) {
      console.error(`${serviceId} 연동 해제 실패:`, error)
      alert(`${serviceId} 연동 해제에 실패했습니다.`)
    } finally {
      setConnecting(null)
    }
  }


  if (!open) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        width: 600,
        maxWidth: '90vw',
        background: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #E5E7EB',
          background: '#F8FAFC'
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, color: '#111827' }}>API 연동 관리</h2>
          <button onClick={onClose} style={{
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: 6,
            background: '#FFFFFF',
            cursor: 'pointer'
          }}>
            닫기
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>로딩 중...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {integrations.map(service => (
                <div key={service.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  border: '1px solid #E5E7EB',
                  borderRadius: 8
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{service.name}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#374151', fontWeight: 500 }}>{service.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 500,
                      background: service.connected ? '#DEF7EC' : '#FEF3C7',
                      color: service.connected ? '#047857' : '#92400E'
                    }}>
                      {service.connected ? '연결됨' : '연결 안됨'}
                    </span>
                    <button
                      onClick={() => service.connected ? handleDisconnect(service.id) : handleConnect(service.id)}
                      disabled={connecting === service.id}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: 6,
                        background: service.connected ? '#DC2626' : '#3B82F6',
                        color: 'white',
                        cursor: connecting === service.id ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        opacity: connecting === service.id ? 0.6 : 1
                      }}
                    >
                      {connecting === service.id ? '처리 중...' : (service.connected ? '연결 해제' : '연결하기')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}