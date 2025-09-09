import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { isAdmin } from '../utils/auth'
import '../styles/Sidebar.css'

export default function Sidebar({ 
  conversations = [], 
  onNewChat, 
  onSelect, 
  onDelete, 
  onRename, 
  currentId, 
  user, 
  onLogout, 
  onOpenSettings,
  isAdminPage = false,
  onChatSelect 
}) {
  const [openMenuId, setOpenMenuId] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef(null)

  function toggleMenu(id, event) {
    event.stopPropagation()
    setOpenMenuId(prev => (prev === id ? null : id))
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu()
      }
    }

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuId])

  // 채팅 제목 툴팁 표시
  const getTitleDisplay = (title) => {
    if (title.length > 20) {
      return title.substring(0, 20)
    }
    return title
  }

  // 시간 포맷팅 함수
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInMinutes < 1) return '방금'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInDays < 7) return `${diffInDays}일 전`
    
    // 1주일 이상은 날짜 표시
    return messageTime.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }

  const handleChatClick = (conv) => {
    if (isAdminPage && onChatSelect) {
      onChatSelect(conv.id)
    } else if (onSelect) {
      onSelect(conv.id)
    }
  }

  return (
    <aside className="sidebar">
      {/* 상단 사용자/로그아웃 영역 */}
      {user && (
        <div className="sidebar-user-section">
          <div className="user-info">
            <div className="username">{user.username}</div>
            {isAdmin(user) && <div className="user-role">관리자</div>}
          </div>
          <button onClick={onLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      )}

      {/* 네비게이션 버튼들 */}
      <div className="sidebar-nav">
        <button 
          onClick={() => navigate('/')} 
          className={`nav-button ${location.pathname === '/' ? 'active' : ''}`}
        >
          채팅
        </button>
        
        {!isAdminPage && (
          <button onClick={onNewChat} className="nav-button new-chat">
            + 새 대화
          </button>
        )}
        
        {isAdmin(user) && (
          <button 
            onClick={() => navigate('/admin')} 
            className={`nav-button ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            관리자
          </button>
        )}
      </div>

      {/* 채팅 목록 */}
      {!isAdminPage && (
        <div className="conversation-list">
          {conversations.length === 0 && (
            <div className="no-conversations">대화가 없습니다.</div>
          )}
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${conv.id === currentId ? 'active' : ''}`}
            >
              <div 
                className="conversation-content"
                onClick={() => handleChatClick(conv)}
                title={conv.title.length > 20 ? conv.title : undefined}
              >
                <div className="conversation-header">
                  <div className="conversation-title">
                    {getTitleDisplay(conv.title)}
                  </div>
                  <div className="conversation-time">
                    {formatTime(conv.lastMessageTime)}
                  </div>
                </div>
                <div className="conversation-preview">
                  {conv.preview}
                </div>
              </div>
              
              <button 
                className="conversation-menu-button"
                onClick={(e) => toggleMenu(conv.id, e)}
                aria-label="메뉴"
              >
                ⋯
              </button>

              {openMenuId === conv.id && (
                <div 
                  ref={menuRef}
                  className="conversation-menu"
                >
                  <button 
                    onClick={() => { 
                      closeMenu(); 
                      onRename?.(conv.id) 
                    }}
                    className="menu-item"
                  >
                    이름변경
                  </button>
                  <button 
                    onClick={() => { 
                      closeMenu(); 
                      onDelete?.(conv.id) 
                    }}
                    className="menu-item delete"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 하단 설정 버튼 */}
      <div className="sidebar-footer">
        <button
          onClick={onOpenSettings}
          className="settings-button"
          title="설정"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          설정
        </button>
      </div>
    </aside>
  )
}