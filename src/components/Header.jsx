import React, { useState, useEffect } from 'react'
import llmService from '../shared/api/llmService.js'
import LoadingModal from './LoadingModal'

export default function Header({ 
  title = 'Caesar AI Assistant',
  logo = null,
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
    <>
    <header style={{
      height: 56,
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      background: '#FFFFFF'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {logo ? (
          <img 
            src={logo} 
            alt="Caesar Logo" 
            style={{ 
              height: '32px', 
              objectFit: 'contain'
            }} 
          />
        ) : (
          <div style={{ fontWeight: 600, color: '#111827' }}>{title}</div>
        )}
      </div>
      
    </header>
    <LoadingModal 
      isOpen={isToggling} 
      message="Agent 모드를 변경하는 중입니다..." 
    />
    </>
  )
}