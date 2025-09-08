import React, { useState, useEffect } from 'react'
import llmService from '../services/llmService.js'

export default function Header({ 
  title = 'Caesar AI Assistant', 
  status = 'connected',
  onAgentModeChange = null 
}) {
  const [agentMode, setAgentMode] = useState(false)
  const [agentStatus, setAgentStatus] = useState({ connected: false })
  const [isToggling, setIsToggling] = useState(false)

  // 초기 상태 로드
  useEffect(() => {
    const loadStatus = async () => {
      const serviceStatus = llmService.getStatus()
      setAgentMode(serviceStatus.useAgent)
      
      if (serviceStatus.useAgent) {
        try {
          const agentStat = await llmService.getAgentStatus()
          setAgentStatus(agentStat)
        } catch (error) {
          console.warn('Agent 상태 로드 실패:', error)
        }
      }
    }
    loadStatus()
  }, [])

  // Agent 모드 토글
  const handleAgentToggle = async () => {
    if (isToggling) return

    setIsToggling(true)
    try {
      const newMode = await llmService.toggleAgentMode()
      setAgentMode(newMode)
      
      if (newMode) {
        const agentStat = await llmService.getAgentStatus()
        setAgentStatus(agentStat)
      }

      if (onAgentModeChange) {
        onAgentModeChange(newMode)
      }

    } catch (error) {
      console.error('Agent 모드 토글 실패:', error)
      alert(`Agent 모드 전환 실패: ${error.message}`)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <header style={{
      height: 56,
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      background: '#FFFFFF'
    }}>
      <div style={{ fontWeight: 600, color: '#111827' }}>{title}</div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Agent 모드 토글 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Agent 모드</span>
          <button
            onClick={handleAgentToggle}
            disabled={isToggling}
            style={{
              width: 40,
              height: 20,
              borderRadius: 10,
              border: 'none',
              background: agentMode ? '#10B981' : '#D1D5DB',
              position: 'relative',
              cursor: isToggling ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              opacity: isToggling ? 0.6 : 1
            }}
          >
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#FFFFFF',
              position: 'absolute',
              top: 2,
              left: agentMode ? 22 : 2,
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }} />
          </button>
          {agentMode && (
            <span style={{
              fontSize: 10,
              color: agentStatus.connected ? '#10B981' : '#EF4444',
              fontWeight: 500
            }}>
              {agentStatus.connected ? '🤖 연결됨' : '❌ 연결 실패'}
            </span>
          )}
        </div>

        {/* 상태 표시 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ 
            width: 8, 
            height: 8, 
            borderRadius: 8, 
            background: status === 'thinking…' ? '#F59E0B' : '#10B981', 
            display: 'inline-block' 
          }} />
          <span style={{ fontSize: 12, color: '#6B7280' }}>{status}</span>
        </div>
      </div>
    </header>
  )
}
