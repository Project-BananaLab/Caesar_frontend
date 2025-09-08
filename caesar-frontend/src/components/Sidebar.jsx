import React, { useState } from 'react'

export default function Sidebar({ conversations = [], onNewChat, onSelect, onDelete, onRename, currentId, user, onLogout, onOpenSettings, onOpenAdmin, onGoChat }) {
  const [openMenuId, setOpenMenuId] = useState(null)

  function toggleMenu(id) {
    setOpenMenuId(prev => (prev === id ? null : id))
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  return (
    <aside style={{
      width: 280,
      background: '#0F172A',
      color: '#E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #111827'
    }}>
      {/* 상단 사용자/로그아웃 영역 */}
      {user && (
        <div style={{ padding: 16, borderBottom: '1px solid #111827', background: '#0B1220' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 'bold' }}>{user.username}</div>
            <button
              onClick={onLogout}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #334155',
                background: '#111827',
                color: '#FCA5A5',
                cursor: 'pointer',
                fontSize: 12
              }}
            >로그아웃</button>
          </div>
        </div>
      )}

      <div style={{ padding: 16, borderBottom: '1px solid #111827', display: 'flex', gap: 8 }}>
        <button onClick={onGoChat} style={{
          width: '40%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #334155',
          background: '#0F172A',
          color: '#E5E7EB',
          cursor: 'pointer'
        }}>채팅</button>
        <button onClick={onNewChat} style={{
          width: '60%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #334155',
          background: '#111827',
          color: '#E5E7EB',
          cursor: 'pointer'
        }}>+ 새 대화</button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {conversations.length === 0 && (
          <div style={{ padding: 16, color: '#94A3B8' }}>대화가 없습니다.</div>
        )}
        {conversations.map(conv => (
          <div key={conv.id}
               onMouseLeave={closeMenu}
               style={{
                 padding: '8px 10px',
                 background: conv.id === currentId ? '#111827' : 'transparent',
                 borderBottom: '1px solid #111827',
                 position: 'relative'
               }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div onClick={() => onSelect?.(conv.id)} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minWidth: 0,
                flex: 1,
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: 13, color: '#E5E7EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.preview}</div>
              </div>
              <button aria-label="menu" onClick={() => toggleMenu(conv.id)} style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid #334155',
                background: '#0F172A',
                color: '#E5E7EB',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>⋯</button>
            </div>

            {openMenuId === conv.id && (
              <div style={{
                position: 'absolute',
                top: 40,
                right: 10,
                background: '#0B1220',
                border: '1px solid #334155',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                zIndex: 10,
                width: 140,
                overflow: 'hidden'
              }}>
                <button onClick={() => { setOpenMenuId(null); onRename?.(conv.id) }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', color: '#E5E7EB', cursor: 'pointer'
                }}>이름변경</button>
                <button onClick={() => { setOpenMenuId(null); onDelete?.(conv.id) }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', color: '#FCA5A5', cursor: 'pointer'
                }}>삭제</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* 하단 설정/관리자 */}
      <div style={{ padding: 16, borderTop: '1px solid #111827' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onOpenSettings}
            aria-label="settings"
            title="설정"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#0F172A',
              color: '#E5E7EB',
              cursor: 'pointer'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="#E5E7EB" strokeWidth="2"/>
              <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" stroke="#E5E7EB" strokeWidth="1.5"/>
            </svg>
            설정
          </button>
          <button
            onClick={onOpenAdmin}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#0F172A',
              color: '#E5E7EB',
              cursor: 'pointer'
            }}
          >관리자</button>
        </div>
      </div>
    </aside>
  )
}
