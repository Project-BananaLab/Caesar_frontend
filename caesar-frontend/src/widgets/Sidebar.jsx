import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BsGear } from 'react-icons/bs'
import { isAdmin } from '../entities/user/model/constants'
import { loadTrashConversations } from '../entities/conversation/model/storage'
import TrashModal from './TrashModal'
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
  onChatSelect,
  onSearchInChat,
  onRestore 
}) {
  const [openMenuId, setOpenMenuId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [openTrashMenu, setOpenTrashMenu] = useState(null)
  const [openTrashModal, setOpenTrashModal] = useState(false)
  const [trashCount, setTrashCount] = useState(0)
  const CONVERSATIONS_PER_PAGE = 10
  const trashMenuRef = useRef(null)
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
      if (trashMenuRef.current && !trashMenuRef.current.contains(event.target)) {
        setOpenTrashMenu(null)
      }
    }

    if (openMenuId || openTrashMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuId, openTrashMenu])

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
      
      // 검색어가 있고 대화 내용에서 검색된 경우 채팅에 검색어 전달
      if (searchQuery && conv._searchMatch === 'content' && onSearchInChat) {
        onSearchInChat(searchQuery)
      } else if (onSearchInChat) {
        onSearchInChat('') // 검색어 초기화
      }
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

  // 검색 및 페이징 처리 - 제목, 미리보기, 대화 내용 모두 검색
  const filteredConversations = conversations.filter(conv => {
    const query = searchQuery.toLowerCase()
    
    if (!query.trim()) return true // 검색어가 없으면 모든 대화 표시
    
    // 제목에서 검색
    if (conv.title.toLowerCase().includes(query)) {
      conv._searchMatch = 'title'
      return true
    }
    
    // 미리보기에서 검색
    if (conv.preview.toLowerCase().includes(query)) {
      conv._searchMatch = 'preview'
      return true
    }
    
    // 대화 내용에서 검색
    if (conv.messages && conv.messages.length > 0) {
      const foundInContent = conv.messages.some(message => 
        message.text && message.text.toLowerCase().includes(query)
      )
      if (foundInContent) {
        conv._searchMatch = 'content'
        return true
      }
    }
    
    return false
  })
  
  const totalPages = Math.ceil(filteredConversations.length / CONVERSATIONS_PER_PAGE)
  const startIndex = (currentPage - 1) * CONVERSATIONS_PER_PAGE
  const paginatedConversations = filteredConversations.slice(startIndex, startIndex + CONVERSATIONS_PER_PAGE)

  // 검색어 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // 휴지통 개수 로드
  useEffect(() => {
    if (user?.username) {
      const trashConversations = loadTrashConversations(user.username)
      setTrashCount(trashConversations.length)
    }
  }, [user, conversations])

  // 대화 목록 순서가 실제로 변경되었을 때만 첫 페이지로 이동
  const [lastFirstConversationId, setLastFirstConversationId] = useState(null)
  
  useEffect(() => {
    if (conversations.length > 0) {
      const currentFirstId = conversations[0]?.id
      
      // 첫 번째 대화가 바뀌었고, 이전에 첫 번째 대화가 있었다면 (순서 변경)
      if (lastFirstConversationId && currentFirstId !== lastFirstConversationId) {
        setCurrentPage(1)
      }
      
      setLastFirstConversationId(currentFirstId)
    }
  }, [conversations, lastFirstConversationId])

  // 검색어 하이라이트 함수
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm.trim()) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark style="background: #FEF08A; color: #92400E;">$1</mark>')
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
          
          {/* 검색 바 */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="제목, 내용으로 대화 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="search-clear-button"
                  title="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="conversation-list">
            {filteredConversations.length === 0 && (
              <div className="no-conversations">
                {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : '대화가 없습니다.'}
              </div>
            )}
          {paginatedConversations.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${conv.id === currentId ? 'active' : ''} ${openMenuId === conv.id ? 'menu-open' : ''}`}
            >
              
              <div 
                className="conversation-content"
                onClick={() => handleChatClick(conv)}
                title={conv.title.length > 20 ? conv.title : undefined}
              >
                <div className="conversation-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div 
                      className="conversation-title"
                      dangerouslySetInnerHTML={{
                        __html: highlightSearchTerm(getTitleDisplay(conv.title), searchQuery)
                      }}
                    />
                    {searchQuery && conv._searchMatch === 'content' && (
                      <span 
                        style={{
                          fontSize: '10px',
                          background: '#3B82F6',
                          color: 'white',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}
                        title="대화 내용에서 검색됨"
                      >
                        내용
                      </span>
                    )}
                  </div>
                  <div className="conversation-time">
                    {formatTime(conv.lastMessageTime)}
                  </div>
                </div>
                <div 
                  className="conversation-preview"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(conv.preview, searchQuery)
                  }}
                />
              </div>
              
              <button 
                className="conversation-menu-button"
                onClick={(e) => toggleMenu(conv.id, e)}
                aria-label="메뉴"
              >
                ⋯
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
              </button>
            </div>
          )          )}
          </div>

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                이전
              </button>
              
              <span className="pagination-info">
                {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      {/* 휴지통 메뉴 */}
      {!isAdminPage && (
        <div className="trash-section">
          <div 
            className="trash-menu-container"
            onClick={(e) => {
              e.stopPropagation()
              setOpenTrashMenu(openTrashMenu ? null : 'trash')
            }}
          >
            <div className="trash-button">
              <span>🗑️ 휴지통</span>
              {trashCount > 0 && (
                <span className="trash-count">{trashCount}</span>
              )}
            </div>
            
            {openTrashMenu === 'trash' && (
              <div ref={trashMenuRef} className="trash-menu">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenTrashModal(true)
                    setOpenTrashMenu(null)
                  }}
                  className="trash-menu-item"
                >
                  관리
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    if (trashCount === 0) {
                      alert('휴지통이 비어있습니다.')
                      return
                    }
                    if (window.confirm(`휴지통의 모든 대화(${trashCount}개)를 영구적으로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
                      // 휴지통 비우기 로직은 TrashModal에서 처리
                      setOpenTrashModal(true)
                    }
                    setOpenTrashMenu(null)
                  }}
                  className="trash-menu-item delete"
                  disabled={trashCount === 0}
                >
                  비우기
                </button>
              </div>
            )}
          </div>
        </div>
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
      
      {/* 휴지통 관리 모달 */}
      <TrashModal
        open={openTrashModal}
        onClose={() => setOpenTrashModal(false)}
        user={user}
        currentConversationsCount={conversations.length}
        onRestore={(restoredConversation) => {
          // 복구된 대화를 부모 컴포넌트에 알림
          if (onRestore) {
            onRestore(restoredConversation)
          }
          // 휴지통 개수 업데이트
          const trashConversations = loadTrashConversations(user.username)
          setTrashCount(trashConversations.length)
        }}
      />
    </aside>
  )
}