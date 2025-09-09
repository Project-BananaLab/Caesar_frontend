import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import MessageList from '../components/MessageList'
import Composer from '../components/Composer'
import TypingIndicator from '../components/TypingIndicator'
import PreviewPanel from '../components/PreviewPanel'
import SettingsModal from '../components/SettingsModal'
import IntegrationModal from '../components/IntegrationModal'
import { 
  saveConversations, 
  loadConversations, 
  saveCurrentChatId, 
  loadCurrentChatId
} from '../utils/auth'
import agentService from '../services/agentService'
import '../styles/ChatPage.css'

const MAX_CONVERSATIONS = 30

export default function ChatPage({ user, onLogout, onAgentModeChange }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const [conversations, setConversations] = useState([])
  const [currentId, setCurrentId] = useState('default')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [openSettings, setOpenSettings] = useState(false)
  const [openIntegrations, setOpenIntegrations] = useState(false)

  // 컴포넌트 마운트 시 저장된 대화 불러오기
  useEffect(() => {
    if (!user?.username) return
    
    const savedConversations = loadConversations(user.username)
    const savedCurrentId = loadCurrentChatId(user.username)
    
    if (savedConversations.length > 0) {
      setConversations(savedConversations)
    }
    
    if (savedCurrentId && savedCurrentId !== 'default') {
      setCurrentId(savedCurrentId)
      const currentConv = savedConversations.find(c => c.id === savedCurrentId)
      if (currentConv) {
        setMessages(currentConv.messages || [])
        agentService.loadConversationHistory(currentConv.messages || [])
      }
    }
  }, [user])

  // 대화 목록이 변경될 때마다 저장
  useEffect(() => {
    if (conversations.length > 0 && user?.username) {
      saveConversations(conversations, user.username)
    }
  }, [conversations, user])

  // 현재 대화 ID가 변경될 때마다 저장
  useEffect(() => {
    if (currentId !== 'default' && user?.username) {
      saveCurrentChatId(currentId, user.username)
    }
  }, [currentId, user])

  // 새 대화 시작
  function startNewChat() {
    // 30개 제한 체크
    if (conversations.length >= MAX_CONVERSATIONS) {
      alert(`최대 ${MAX_CONVERSATIONS}개의 대화만 생성할 수 있습니다.`)
      return
    }
    
    const id = `conv_${Date.now()}`
    const chatNumber = conversations.length + 1
    const newConversation = { 
      id, 
      title: `새 대화 ${chatNumber}`, 
      preview: '', 
      messages: [],
      lastMessageTime: new Date().toISOString()
    }
    
    setConversations(prev => {
      const updated = [newConversation, ...prev]
      if (user?.username) {
        saveConversations(updated, user.username)
      }
      return updated
    })
    setCurrentId(id)
    setMessages([])
    agentService.clearConversationHistory()
  }

  // 대화 선택
  function selectChat(id) {
    setCurrentId(id)
    const conv = conversations.find(c => c.id === id)
    setMessages(conv?.messages || [])
    
    if (conv) {
      agentService.loadConversationHistory(conv.messages)
    }
  }

  // 대화 삭제
  function deleteChat(id) {
    setConversations(list => {
      const updated = list.filter(c => c.id !== id)
      if (user?.username) {
        saveConversations(updated, user.username)
      }
      return updated
    })
    if (currentId === id) {
      setCurrentId('default')
      setMessages([])
      agentService.clearConversationHistory()
      if (user?.username) {
        saveCurrentChatId('default', user.username)
      }
    }
  }

  // 대화 이름 변경
  function renameChat(id) {
    const title = window.prompt('새 제목을 입력하세요 (최대 20자):')
    if (!title) return
    
    const truncatedTitle = title.length > 20 ? title.substring(0, 20) : title
    setConversations(list => {
      const updated = list.map(c => c.id === id ? { ...c, title: truncatedTitle } : c)
      if (user?.username) {
        saveConversations(updated, user.username)
      }
      return updated
    })
  }

  // 대화 목록 정렬 (최근 메시지 시간순)
  const sortedConversations = [...conversations].sort((a, b) => {
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  })

  async function handleSend() {
    if (!input || busy) return
    setBusy(true)
    const userMsg = { role: 'user', text: input, timestamp: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    
    let conversationId = currentId
    
    // 첫 메시지이고 기본 대화인 경우 새 대화 생성
    if (currentId === 'default' && messages.length === 0) {
      // 30개 제한 체크
      if (conversations.length >= MAX_CONVERSATIONS) {
        alert(`최대 ${MAX_CONVERSATIONS}개의 대화만 생성할 수 있습니다.`)
        setBusy(false)
        setInput('')
        return
      }
      
      conversationId = `conv_${Date.now()}`
      const title = input.length > 20 ? input.substring(0, 20) : input
      const newConversation = {
        id: conversationId,
        title: title,
        preview: '',
        messages: [],
        lastMessageTime: new Date().toISOString()
      }
      setConversations(prev => [newConversation, ...prev])
      setCurrentId(conversationId)
    }
    
    try {
      const result = await agentService.processMessage(input, user?.username || 'default')
      
      const botMsg = { 
        role: 'assistant', 
        text: result.response,
        conversationId: result.conversationId,
        timestamp: new Date().toISOString()
      }
      
      setMessages(m => [...m, botMsg])
      
      // 대화 목록 업데이트
      setConversations(list => {
        const updated = list.map(c => {
          if (c.id === conversationId) {
            const updatedMessages = [...(c.messages || []), userMsg, botMsg]
            return {
              ...c,
              messages: updatedMessages,
              title: c.title.startsWith('새 대화') && updatedMessages[0]?.text 
                ? (updatedMessages[0].text.length > 20 ? updatedMessages[0].text.substring(0, 20) : updatedMessages[0].text)
                : c.title,
              preview: botMsg.text.length > 24 ? botMsg.text.substring(0, 24) + '...' : botMsg.text,
              lastMessageTime: new Date().toISOString()
            }
          }
          return c
        })
        
        // 최근 메시지 시간순으로 정렬
        return updated.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
      })
    } catch (e) {
      setMessages(m => [...m, { 
        role: 'assistant', 
        text: `오류: ${e?.message || e}`,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setBusy(false)
      setInput('')
    }
  }

  return (
    <div className="chat-page">
      <Sidebar
        conversations={sortedConversations}
        onNewChat={startNewChat}
        onSelect={selectChat}
        onDelete={deleteChat}
        onRename={renameChat}
        currentId={currentId}
        user={user}
        onLogout={onLogout}
        onOpenSettings={() => setOpenSettings(true)}
      />
      <div className="chat-main">
        <Header 
          title={`Caesar AI Assistant - ${user?.username || 'User'}`} 
          status={busy ? 'thinking…' : 'connected'} 
          onAgentModeChange={onAgentModeChange}
        />
        <MessageList messages={messages} onPreview={(url) => setPreviewUrl(url)} />
        <TypingIndicator visible={busy} />
        <Composer value={input} onChange={setInput} onSend={handleSend} disabled={busy} />
      </div>
      {previewUrl && <PreviewPanel url={previewUrl} onClose={() => setPreviewUrl(null)} />}
      <SettingsModal open={openSettings} onClose={() => setOpenSettings(false)} />
      <IntegrationModal open={openIntegrations} onClose={() => setOpenIntegrations(false)} />
    </div>
  )
}
