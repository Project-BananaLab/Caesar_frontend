import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BsGear } from 'react-icons/bs'
import { isAdmin } from '../entities/user/model/constants'
import '../shared/ui/Sidebar.css'

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
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false)
  const [selectedChats, setSelectedChats] = useState(new Set())
  const [selectAll, setSelectAll] = useState(false)
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
    if (bulkDeleteMode) {
      toggleChatSelection(conv.id)
    } else {
      if (isAdminPage && onChatSelect) {
        onChatSelect(conv.id)
      } else if (onSelect) {
        onSelect(conv.id)
      }
    }
  }

  // 벌크 삭제 모드 토글
  const toggleBulkDeleteMode = () => {
    setBulkDeleteMode(!bulkDeleteMode)
    setSelectedChats(new Set())
    setSelectAll(false)
  }

  // 개별 채팅 선택/해제
  const toggleChatSelection = (chatId) => {
    const newSelected = new Set(selectedChats)
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId)
    } else {
      newSelected.add(chatId)
    }
    setSelectedChats(newSelected)
    setSelectAll(newSelected.size === conversations.length)
  }

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedChats(new Set())
      setSelectAll(false)
    } else {
      setSelectedChats(new Set(conversations.map(c => c.id)))
      setSelectAll(true)
    }
  }

  // 선택된 채팅들 삭제
  const handleBulkDelete = () => {
    if (selectedChats.size === 0) return
    
    const confirmMsg = `선택한 ${selectedChats.size}개의 대화를 삭제하시겠습니까?`
    if (window.confirm(confirmMsg)) {
      selectedChats.forEach(chatId => {
        onDelete?.(chatId)
      })
      setBulkDeleteMode(false)
      setSelectedChats(new Set())
      setSelectAll(false)
    }
  }

  // 이름 변경 (기존 이름으로 프리필)
  const handleRename = (conv) => {
    closeMenu()
    const newTitle = window.prompt('새 제목을 입력하세요 (최대 20자):', conv.title)
    if (newTitle !== null && newTitle.trim()) {
      onRename?.(conv.id, newTitle.trim())
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
          <>
            <button onClick={onNewChat} className="nav-button new-chat">
              + 새 대화
            </button>
            <button 
              onClick={toggleBulkDeleteMode} 
              className={`nav-button ${bulkDeleteMode ? 'active' : ''}`}
            >
              {bulkDeleteMode ? '취소' : '선택 삭제'}
            </button>
            {bulkDeleteMode && selectedChats.size > 0 && (
              <button 
                onClick={handleBulkDelete} 
                className="nav-button delete-selected"
              >
                삭제 ({selectedChats.size})
              </button>
            )}
          </>
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
        <>
          {/* 전체 선택 체크박스 (벌크 삭제 모드에서만 표시) */}
          {bulkDeleteMode && conversations.length > 0 && (
            <div className="select-all-container">
              <label className="select-all-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
                <span className="select-all-text">전체 선택</span>
              </label>
            </div>
          )}
          
          <div className="conversation-list">
            {conversations.length === 0 && (
              <div className="no-conversations">대화가 없습니다.</div>
            )}
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${conv.id === currentId ? 'active' : ''} ${bulkDeleteMode ? 'bulk-mode' : ''}`}
            >
              {/* 개별 체크박스 (벌크 삭제 모드에서만 표시) */}
              {bulkDeleteMode && (
                <input 
                  type="checkbox" 
                  className="conversation-checkbox"
                  checked={selectedChats.has(conv.id)}
                  onChange={() => toggleChatSelection(conv.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              
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
                    onClick={() => handleRename(conv)}
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
          )          )}
          </div>
        </>
      )}

      {/* 하단 설정 버튼 */}
      <div className="sidebar-footer">
        <button
          onClick={onOpenSettings}
          className="settings-button"
          title="설정"
        >
          <BsGear size={16} color="white" />
          설정
        </button>
      </div>
    </aside>
  )
}