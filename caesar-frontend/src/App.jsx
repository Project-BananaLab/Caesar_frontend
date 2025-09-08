import React, { useMemo, useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import MessageList from './components/MessageList.jsx'
import Composer from './components/Composer.jsx'
import TypingIndicator from './components/TypingIndicator.jsx'
import Login from './login/Login.jsx'
import PreviewPanel from './components/PreviewPanel.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import IntegrationModal from './components/IntegrationModal.jsx'
import AdminPage from './components/AdminPage.jsx'
import agentService from './services/agentService.js'

export default function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const [conversations, setConversations] = useState([])
  const [currentId, setCurrentId] = useState('default')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [openSettings, setOpenSettings] = useState(false)
  const [openIntegrations, setOpenIntegrations] = useState(false)
  const [route, setRoute] = useState(() => (location.hash === '#/admin' ? 'admin' : 'chat'))
  // 라우트 변경 감지
  useEffect(() => {
    function onHashChange() {
      setRoute(location.hash === '#/admin' ? 'admin' : 'chat')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // 새 대화 시작
  function startNewChat() {
    const id = `conv_${Date.now()}`
    setConversations(prev => [{ id, title: '새 대화', preview: '', messages: [] }, ...prev])
    setCurrentId(id)
    setMessages([])
    agentService.clearConversationHistory()
  }

  // 대화 선택
  function selectChat(id) {
    setCurrentId(id)
    const conv = conversations.find(c => c.id === id)
    setMessages(conv?.messages || [])
  }

  // 대화 삭제
  function deleteChat(id) {
    setConversations(list => list.filter(c => c.id !== id))
    if (currentId === id) {
      setCurrentId('default')
      setMessages([])
    }
  }

  // 대화 이름 변경
  function renameChat(id) {
    const title = window.prompt('새 제목을 입력하세요:')
    if (!title) return
    setConversations(list => list.map(c => c.id === id ? { ...c, title } : c))
  }

  // 로그인 처리
  function handleLogin(loginData) {
    setUser(loginData)
    setIsAuthenticated(true)
  }

  // 로그아웃 처리
  function handleLogout() {
    setUser(null)
    setIsAuthenticated(false)
    setMessages([])
    setConversations([])
    setCurrentId('default')
    agentService.clearConversationHistory()
  }

  async function handleSend() {
    if (!input || busy) return
    setBusy(true)
    const userMsg = { role: 'user', text: input }
    setMessages(m => [...m, userMsg])
    
    // 첫 메시지이고 기본 대화인 경우 새 대화 생성
    if (currentId === 'default' && messages.length === 0) {
      const newId = `conv_${Date.now()}`
      const newConversation = {
        id: newId,
        title: input.slice(0, 16) + (input.length > 16 ? '...' : ''),
        preview: '',
        messages: []
      }
      setConversations(prev => [newConversation, ...prev])
      setCurrentId(newId)
    }
    
    try {
      // AI 에이전트를 통한 메시지 처리
      const result = await agentService.processMessage(input, user?.username || 'default')
      
      const botMsg = { 
        role: 'assistant', 
        text: result.response,
        conversationId: result.conversationId
      }
      
      setMessages(m => [...m, botMsg])
      
      setConversations(list => {
        const idx = list.findIndex(c => c.id === currentId)
        if (idx === -1) return list
        const updated = [...list]
        const msgs = [...(updated[idx].messages || []), userMsg, botMsg]
        updated[idx] = {
          ...updated[idx],
          messages: msgs,
          title: updated[idx].title === '새 대화' && msgs[0]?.text ? msgs[0].text.slice(0, 16) : updated[idx].title,
          preview: botMsg.text.slice(0, 24)
        }
        return updated
      })
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: `오류: ${e?.message || e}` }])
    } finally {
      setBusy(false)
      setInput('')
    }
  }

  // 로그인하지 않은 경우 로그인 화면 표시
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // 로그인한 경우 메인 채팅 화면 표시
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0B1020' }}>
      <Sidebar
        conversations={conversations}
        onNewChat={startNewChat}
        onSelect={selectChat}
        onDelete={deleteChat}
        onRename={renameChat}
        currentId={currentId}
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setOpenSettings(true)}
        onOpenAdmin={() => { location.hash = '#/admin' }}
        onGoChat={() => { location.hash = '#/' }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', width: '100%' }}>
        <Header 
          title={`Caesar AI Assistant - ${user?.username || 'User'}`} 
          status={busy ? 'thinking…' : 'connected'} 
          onAgentModeChange={(enabled) => {
            console.log(`Agent 모드 ${enabled ? '활성화' : '비활성화'}됨`)
          }}
        />
        {route !== 'admin' ? (
          <MessageList messages={messages} onPreview={(url) => setPreviewUrl(url)} />
        ) : (
          <AdminPage onPreview={(url) => setPreviewUrl(url)} onOpenIntegrations={() => setOpenIntegrations(true)} />
        )}
        <TypingIndicator visible={busy} />
        <Composer value={input} onChange={setInput} onSend={handleSend} disabled={busy} />
      </div>
      {previewUrl && <PreviewPanel url={previewUrl} onClose={() => setPreviewUrl(null)} />}
      <SettingsModal open={openSettings} onClose={() => setOpenSettings(false)} />
      <IntegrationModal open={openIntegrations} onClose={() => setOpenIntegrations(false)} />
    </div>
  )
}
