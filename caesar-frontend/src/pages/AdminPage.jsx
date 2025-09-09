import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import LoadingBar from '../components/LoadingBar'
import PreviewPanel from '../components/PreviewPanel'
import IntegrationModal from '../components/IntegrationModal'
import SettingsModal from '../components/SettingsModal'
import '../styles/AdminPage.css'

const dummyFiles = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `파일_${i + 1}.${['pdf', 'docx', 'xlsx', 'pptx', 'png'][i % 5]}`,
  reason: ['내가 열어본 파일', '내가 수정함', '참고자료', '발표자료', '디자인'][i % 5],
  owner: ['홍길동', '김영희', '이철수', '박민수', '최디자'][i % 5],
  location: ['/docs/hr', '/docs/okr', '/reports/2025', '/slides', '/assets'][i % 5],
  url: `https://example.com/file${i + 1}.pdf`,
  type: ['pdf', 'docx', 'xlsx', 'pptx', 'png'][i % 5],
  createdAt: new Date(2024, 0, i + 1).toISOString()
}))

const typeEmoji = { pdf:'📄', docx:'📝', xlsx:'📊', pptx:'📈', png:'🖼️', jpg:'🖼️' }

const ITEMS_PER_PAGE = 10

export default function AdminPage({ user, onLogout }) {
  const [isDragging, setDragging] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [apiLoading, setApiLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [openIntegrations, setOpenIntegrations] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // 페이징 계산
  const totalPages = Math.ceil(dummyFiles.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentFiles = dummyFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    alert(`${e.dataTransfer.files.length}개 파일 드롭됨 (데모)`)
  }

  const handleApiIntegration = async () => {
    setApiLoading(true)
    try {
      // API 연동 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 3000))
      setOpenIntegrations(true)
    } catch (error) {
      console.error('API 연동 실패:', error)
    } finally {
      setApiLoading(false)
    }
  }

  const handleChatNavigation = (chatId) => {
    // 채팅으로 이동 (실제 구현시 채팅 ID를 사용)
    navigate(`/?chat=${chatId}`)
  }

  return (
    <div className="admin-page">
      <Sidebar
        conversations={[]} // 관리자 페이지에서는 채팅 목록 비우기
        onNewChat={() => navigate('/')}
        currentId=""
        user={user}
        onLogout={onLogout}
        onOpenSettings={() => setOpenSettings(true)}
        isAdminPage={true}
        onChatSelect={handleChatNavigation}
      />
      
      <div className="admin-main">
        <div className="admin-content">
          <div className="admin-header">
            <h2>관리자님 환영합니다!</h2>
            <button 
              onClick={handleApiIntegration} 
              className="api-button"
              disabled={apiLoading}
            >
              API 연동하기
            </button>
          </div>

          <div className="file-upload-section">
            <h3>파일 업로드</h3>
            <div
              className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="drop-icon">📁</div>
              <div>여기로 드래그하거나 클릭해서 파일을 선택하세요</div>
              <input ref={inputRef} type="file" multiple style={{ display: 'none' }} />
            </div>
          </div>

          <div className="file-list-section">
            <div className="file-list-header">
              <div>이름</div>
              <div>추천 이유</div>
              <div>소유자</div>
              <div>위치</div>
            </div>
            
            {currentFiles.map(f => (
              <div key={f.id} className="file-list-item">
                <div>
                  <button 
                    onClick={() => setPreviewUrl(f.url)} 
                    className="file-name-button"
                  >
                    <span className="file-emoji">{typeEmoji[f.type] || '📎'}</span>
                    {f.name}
                  </button>
                </div>
                <div>{f.reason}</div>
                <div>{f.owner}</div>
                <div>{f.location}</div>
              </div>
            ))}
          </div>

          {/* 페이징 */}
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
        </div>
      </div>

      {previewUrl && <PreviewPanel url={previewUrl} onClose={() => setPreviewUrl(null)} />}
      <IntegrationModal open={openIntegrations} onClose={() => setOpenIntegrations(false)} />
      <SettingsModal open={openSettings} onClose={() => setOpenSettings(false)} />
      <LoadingBar isVisible={apiLoading} message="API 연동 중..." />
    </div>
  )
}
