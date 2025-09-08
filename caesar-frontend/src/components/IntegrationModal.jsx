import React, { useState, useEffect } from 'react'
import integrationService from '../services/integrationService.js'

export default function IntegrationModal({ open, onClose }) {
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)

  // 모달이 열릴 때 서비스 목록 로드
  useEffect(() => {
    if (open) {
      loadServices()
    }
  }, [open])

  useEffect(() => {
    if (selectedService) {
      // 선택된 서비스의 기존 데이터 로드
      const service = services.find(s => s.id === selectedService)
      if (service) {
        const initialData = {}
        service.fields.forEach(field => {
          initialData[field.key] = ''
        })
        setFormData(initialData)
      }
    }
  }, [selectedService, services])

  // 서비스 목록 로드
  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await integrationService.getIntegrations()
      setServices(data.services || [])
    } catch (error) {
      console.error('서비스 목록 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (serviceId, credentials = {}) => {
    try {
      console.log(`Connecting to ${serviceId}...`)
      
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, status: 'connecting' }
          : service
      ))

      // 실제 backend API 호출
      const result = await integrationService.connectService(serviceId, credentials)
      
      if (result.success) {
        setServices(prev => prev.map(service => 
          service.id === serviceId 
            ? { ...service, status: 'connected', connected_at: result.service.connected_at }
            : service
        ))
        alert(`${serviceId} 연동이 완료되었습니다!`)
      } else {
        throw new Error(result.message || '연동 실패')
      }

    } catch (error) {
      console.error('Connection failed:', error)
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, status: 'error' }
          : service
      ))
      alert(`${serviceId} 연동 실패: ${error.message}`)
    }
  }

  const handleDisconnect = async (serviceId) => {
    try {
      const result = await integrationService.disconnectService(serviceId)
      
      if (result.success) {
        setServices(prev => prev.map(service => 
          service.id === serviceId 
            ? { ...service, status: 'disconnected', connected_at: null }
            : service
        ))
        alert(`${serviceId} 연동이 해제되었습니다.`)
      } else {
        throw new Error(result.message || '연동 해제 실패')
      }
    } catch (error) {
      console.error('Disconnection failed:', error)
      alert(`${serviceId} 연동 해제 실패: ${error.message}`)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (selectedService) {
      handleConnect(selectedService, formData)
      setSelectedService(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#10B981'
      case 'connecting': return '#F59E0B'
      case 'error': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return '연결됨'
      case 'connecting': return '연결 중...'
      case 'error': return '오류'
      default: return '연결 안됨'
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
      zIndex: 60
    }}>
      <div style={{ 
        width: 800, 
        maxWidth: '90vw', 
        maxHeight: '80vh',
        background: '#FFFFFF', 
        borderRadius: 12, 
        overflow: 'hidden', 
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '20px 24px', 
          borderBottom: '1px solid #E5E7EB', 
          background: '#F8FAFC' 
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, color: '#111827' }}>외부 데이터 연동</h2>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0 0' }}>외부 서비스와 연동하여 데이터를 동기화합니다</p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #D1D5DB', 
              borderRadius: 8, 
              background: '#FFFFFF', 
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            닫기
          </button>
        </div>

        {/* 내용 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: 40 
            }}>
              <div>로딩 중...</div>
            </div>
          )}
          {!loading && selectedService ? (
            /* 상세 설정 화면 */
            <div style={{ padding: 24 }}>
              <button 
                onClick={() => setSelectedService(null)}
                style={{
                  marginBottom: 20,
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: '#6B7280',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                ← 목록으로 돌아가기
              </button>

              {(() => {
                const service = services.find(s => s.id === selectedService)
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                      <span style={{ fontSize: 32, marginRight: 12 }}>{service.icon}</span>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>{service.name} 연동 설정</h3>
                        <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0 0' }}>{service.description}</p>
                      </div>
                    </div>

                    <form onSubmit={handleFormSubmit}>
                      {service.fields.map(field => (
                        <div key={field.key} style={{ marginBottom: 16 }}>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: 6, 
                            fontSize: 14, 
                            fontWeight: 500, 
                            color: '#374151' 
                          }}>
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.key] || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              [field.key]: e.target.value
                            }))}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: '1px solid #D1D5DB',
                              borderRadius: 8,
                              fontSize: 14,
                              boxSizing: 'border-box'
                            }}
                            required
                          />
                        </div>
                      ))}

                      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <button
                          type="submit"
                          style={{
                            padding: '12px 24px',
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          연결하기
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedService(null)}
                          style={{
                            padding: '12px 24px',
                            background: '#F3F4F6',
                            color: '#374151',
                            border: '1px solid #D1D5DB',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          취소
                        </button>
                      </div>
                    </form>
                  </div>
                )
              })()}
            </div>
          ) : !loading ? (
            /* 서비스 목록 화면 */
            <div style={{ padding: 24 }}>
              <div style={{ 
                display: 'grid', 
                gap: 16,
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
              }}>
                {services.map(service => (
                  <div
                    key={service.id}
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: 12,
                      padding: 20,
                      background: '#FFFFFF',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 24, marginRight: 12 }}>{service.icon}</span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 'bold', margin: 0 }}>{service.name}</h3>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginTop: 4 
                        }}>
                          <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: getStatusColor(service.status),
                            marginRight: 6
                          }} />
                          <span style={{ 
                            fontSize: 12, 
                            color: getStatusColor(service.status),
                            fontWeight: 500
                          }}>
                            {getStatusText(service.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p style={{ 
                      fontSize: 14, 
                      color: '#6B7280', 
                      marginBottom: 16,
                      lineHeight: 1.4
                    }}>
                      {service.description}
                    </p>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {service.status === 'connected' ? (
                        <button
                          onClick={() => handleDisconnect(service.id)}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          연결 해제
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedService(service.id)}
                          disabled={service.status === 'connecting'}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: service.status === 'connecting' ? '#F3F4F6' : '#3B82F6',
                            color: service.status === 'connecting' ? '#6B7280' : 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: service.status === 'connecting' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {service.status === 'connecting' ? '연결 중...' : '연결하기'}
                        </button>
                      )}
                      
                      <button
                        style={{
                          padding: '10px 16px',
                          background: '#F3F4F6',
                          color: '#374151',
                          border: '1px solid #D1D5DB',
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        설정
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
