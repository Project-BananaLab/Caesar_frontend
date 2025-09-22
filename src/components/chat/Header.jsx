import React, { useState, useEffect } from 'react'
import llmService from '../../shared/api/llmService.js'
import LoadingModal from '../admin/LoadingModal.jsx'

export default function Header({ 
  title = 'Caesar AI Assistant',
  logo = null,
  status = 'connected',
  onAgentModeChange = null 
}) {
  const [agentMode, setAgentMode] = useState(false)
  const [agentStatus, setAgentStatus] = useState({ connected: false })
  const [isToggling, setIsToggling] = useState(false)


  

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