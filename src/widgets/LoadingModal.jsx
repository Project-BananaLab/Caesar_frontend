import React from 'react'
import '../shared/ui/LoadingModal.css'

export default function LoadingModal({ 
  isOpen = false, 
  message = '처리 중입니다...',
  showProgress = false,
  progress = 0 
}) {
  if (!isOpen) return null

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
        {showProgress && (
          <div className="loading-progress">
            <div 
              className="loading-progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}