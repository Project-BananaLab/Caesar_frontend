import React from 'react'
import { BsGearFill } from 'react-icons/bs'
import { isAdmin } from '../../entities/user/constants'

export default function AdminHeader({ user, onLogout, onOpenSettings }) {
  return (
    <header style={{
      height: 64,
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1 style={{ 
          fontSize: 24, 
          fontWeight: 700, 
          color: '#111827',
          margin: 0
        }}>
          Caesar 관리자
        </h1>
        {user && (
          <div style={{
            padding: '4px 12px',
            background: '#10B981',
            color: 'white',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600
          }}>
            관리자
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            color: '#6B7280',
            fontSize: 14
          }}>
            <span>{user.username}님</span>
          </div>
        )}
        
        <button
          onClick={onOpenSettings}
          style={{
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: 6,
            background: '#FFFFFF',
            color: '#374151',
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s ease'
          }}
        >
          <BsGearFill size={16} />
          설정
        </button>
        
        <button 
          onClick={onLogout} 
          style={{
            padding: '8px 16px',
            border: '1px solid #DC2626',
            borderRadius: 6,
            background: '#DC2626',
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
        >
          로그아웃
        </button>
      </div>
    </header>
  )
}
