import React from 'react'
import '../styles/LoadingModal.css'

export default function LoadingModal({ isOpen, message = '처리 중...' }) {
  if (!isOpen) return null

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal">
        <div className="loading-spinner"></div>
        <p className="loading-modal-message">{message}</p>
      </div>
    </div>
  )
}
