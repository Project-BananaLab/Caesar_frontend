import React, { useState, useEffect } from 'react'
import { 
  loadTrashConversations, 
  restoreFromTrash, 
  permanentDeleteFromTrash,
  clearTrash 
} from '../../entities/conversation/storage'
import { MAX_CONVERSATIONS } from '../../entities/conversation/constants'
import '../../assets/styles/TrashModal.css'

export default function TrashModal({ 
  open, 
  onClose, 
  user, 
  currentConversationsCount,
  onRestore,
  onTrashUpdate
}) {
  const [trashConversations, setTrashConversations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && user?.username) {
      loadTrashData()
    }
  }, [open, user])

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

  const loadTrashData = () => {
    const trashData = loadTrashConversations(user.username, user.companyCode)
    setTrashConversations(trashData)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRestore = async (conversationId) => {
    // 현재 대화 개수 체크 (휴지통 제외)
    if (currentConversationsCount >= MAX_CONVERSATIONS) {
      alert(`현재 대화가 ${MAX_CONVERSATIONS}개로 제한에 도달했습니다.\n\n다른 대화를 삭제하거나 프리미엄 구독을 하시면 더 많은 대화를 복구할 수 있습니다! 🎆`)
      return
    }

    setLoading(true)
    try {
      const restoredConversation = restoreFromTrash(conversationId, user.username, user.companyCode)
      if (restoredConversation) {
        loadTrashData()
        onRestore?.(restoredConversation)
        alert('대화가 성공적으로 복구되었습니다.')
      } else {
        alert('대화 복구에 실패했습니다.')
      }
    } catch (error) {
      console.error('복구 오류:', error)
      alert('대화 복구 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handlePermanentDelete = (conversationId, title) => {
    if (window.confirm(`"${title}" 대화를 영구적으로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      const success = permanentDeleteFromTrash(conversationId, user.username, user.companyCode)
      if (success) {
        loadTrashData()
        onTrashUpdate?.() // 휴지통 개수 업데이트 알림
        alert('대화가 영구적으로 삭제되었습니다.')
      } else {
        alert('삭제에 실패했습니다.')
      }
    }
  }

  const handleClearTrash = () => {
    if (trashConversations.length === 0) {
      alert('휴지통이 이미 비어있습니다.')
      return
    }

    if (window.confirm(`휴지통의 모든 대화(${trashConversations.length}개)를 영구적으로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      const success = clearTrash(user.username, user.companyCode)
      if (success) {
        setTrashConversations([])
        onTrashUpdate?.() // 휴지통 개수 업데이트 알림
        alert('휴지통이 비워졌습니다.')
      } else {
        alert('휴지통 비우기에 실패했습니다.')
      }
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content trash-modal">
        <div className="modal-header">
          <h3>휴지통 관리 ({trashConversations.length}개)</h3>
          <div className="modal-header-actions">
            <button 
              onClick={handleClearTrash}
              className="clear-trash-button"
              disabled={loading || trashConversations.length === 0}
            >
              휴지통 비우기
            </button>
            <button onClick={onClose} className="modal-close-button">✕</button>
          </div>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div className="loading-indicator">처리 중...</div>
          )}
          
          {trashConversations.length === 0 ? (
            <div className="empty-trash">
              <div className="empty-icon">🗑️</div>
              <div className="empty-message">휴지통이 비어있습니다.</div>
            </div>
          ) : (
            <div className="trash-list">
              <div className="trash-list-header">
                <div>제목</div>
                <div>삭제일</div>
                <div>작업</div>
              </div>
              
              {trashConversations.map(conv => (
                <div key={conv.id} className="trash-list-item">
                  <div className="trash-title">
                    <span className="conversation-title">{conv.title}</span>
                    <span className="conversation-preview">{conv.preview}</span>
                  </div>
                  <div className="trash-date">
                    {formatDate(conv.deletedAt)}
                  </div>
                  <div className="trash-actions">
                    <button
                      onClick={() => handleRestore(conv.id)}
                      className="restore-button"
                      disabled={loading}
                    >
                      복구
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(conv.id, conv.title)}
                      className="permanent-delete-button"
                      disabled={loading}
                    >
                      영구삭제
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
