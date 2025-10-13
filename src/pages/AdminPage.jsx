// src/pages/AdminPage.jsx
import React, { useState, useRef, useEffect } from 'react'
import AdminHeader from '../components/admin/AdminHeader'
import LoadingModal from '../components/admin/LoadingModal'
import PreviewPanel from '../components/PreviewPanel'
import IntegrationModal from '../components/admin/IntegrationModal'
import fileService from '../shared/api/fileService'     // ✅ 실제 API 연동 파일서비스로 교체
import ThinSidebar from '../components/admin/ThinSidebar';
import logoSrc from '../assets/imgs/caesar_logo.png';
import '../assets/styles/AdminPage.css'

import { ADMIN_PAGE_SIZE } from '../shared/config/api'
import { MdOutlineFileDownload } from "react-icons/md"
import { FaRegTrashCan } from "react-icons/fa6"

const ITEMS_PER_PAGE = ADMIN_PAGE_SIZE

const typeEmoji = { 
  png:'🖼️', jpg:'🖼️', jpeg:'🖼️', jfif:'🖼️', gif:'🖼️', tiff:'🖼️', tif:'🖼️', 
  psd:'🖼️', bmp:'🖼️', webp:'🖼️', svg:'🖼️', ico:'🖼️', raw:'🖼️',
  pdf:'📄', doc:'📝', docx:'📝', hwp:'📝', hwpx:'📝', odt:'📝', rtf:'📝',
  xls:'📊', xlsx:'📊', xlsm:'📊', xlsb:'📊', ods:'📊', csv:'📊',
  ppt:'📈', pptx:'📈', pptm:'📈', ppsx:'📈', odp:'📈',
  txt:'📝', md:'📝', markdown:'📝', log:'📝',
  json:'📄', xml:'📄', yaml:'📄', yml:'📄', ini:'📄', cfg:'📄',
  zip:'🗜️', rar:'🗜️', '7z':'🗜️', tar:'🗜️', gz:'🗜️',
  mp4:'🎥', avi:'🎥', mov:'🎥', wmv:'🎥', flv:'🎥', mkv:'🎥',
  mp3:'🎵', wav:'🎵', flac:'🎵', aac:'🎵', ogg:'🎵', wma:'🎵',
  js:'💻', ts:'💻', jsx:'💻', tsx:'💻', html:'💻', css:'💻', 
  py:'💻', java:'💻', cpp:'💻', c:'💻', cs:'💻', php:'💻'
}

export default function AdminPage({ user, onLogout }) {
  const [isDragging, setDragging] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [apiLoading, setApiLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewFileName, setPreviewFileName] = useState('')
  const [openIntegrations, setOpenIntegrations] = useState(false)

  // ✅ 서버에서 받은 파일 목록(표시에 맞게 매핑된 형태)
  const [files, setFiles] = useState([])

  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadQueue, setUploadQueue] = useState([])
  const inputRef = useRef(null)

  // ─────────────────────────────────────────────────────────────
  // 파일 종류 라벨링(요청 사양에 맞게)
  const getFileTypeLabel = (ext) => {
    const e = (ext || '').toLowerCase()
    const map = {
      pdf: 'PDF',
      docx: 'Word',
      xlsx: 'Excel',
      txt: '텍스트 파일',
      csv: 'CSV 파일',
    }
    // 매핑되지 않은 확장자면 확장자를 대문자로 노출
    return map[e] || (e ? e.toUpperCase() : '-')
  }
  // ─────────────────────────────────────────────────────────────

  // 컴포넌트 마운트 시 파일 목록 로드
  useEffect(() => {
    refreshList()
  }, [])

  // ✅ 서버에서 목록 로드 (리스트 반환하도록 수정)
  const refreshList = async () => {
    try {
      const list = await fileService.listFiles()
      setFiles(list)
      return list
    } catch (error) {
      console.error('파일 로드 실패:', error)
      setFiles([])
      return []
    }
  }

  // 검색 및 페이징 계산 (클라이언트 측 간단 검색)
  const filteredFiles = fileService.searchFilesInMemory(files, searchQuery)
  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentFiles = filteredFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 파일을 대기열에 추가
  const addFilesToQueue = (newFiles) => {
    const fileArray = Array.from(newFiles)
    const SUPPORTED = ['pdf','docx','xlsx','csv','txt']
    const queueItems = fileArray
      .filter(file => {
        const ext = file.name.split('.').pop().toLowerCase()
        return SUPPORTED.includes(ext)
      })
      .map(file => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        extension: file.name.split('.').pop().toLowerCase()
      }))
    setUploadQueue(prev => [...prev, ...queueItems])
  }

  // 대기열에서 파일 제거
  const removeFromQueue = (queueId) => {
    setUploadQueue(prev => prev.filter(item => item.id !== queueId))
  }

  // ✅ 실제 업로드 실행 → 서버로 전송
  const executeUpload = async () => {
    if (uploadQueue.length === 0) return
    setUploading(true)
    try {
      const filesToSend = uploadQueue.map(q => q.file)
      // 현재 UI상 기본은 회사공개 업로드(isPrivate=false)
      const resp = await fileService.uploadFiles({
        files: filesToSend,
        isPrivate: false,
        employeeId: null,
      })
      // resp: { uploaded: [{ file, ok, docId, duplicated?, message?, ... }, ...] }
      const results = resp?.uploaded || []
      const okCount = results.filter(u => u.ok).length
      const duplicatedCount = results.filter(u => u.ok && u.duplicated).length
      const failedCount = results.filter(u => !u.ok).length

      // 중복 파일 메시지 수집
      const duplicatedMessages = results
        .filter(u => u.ok && u.duplicated && u.message)
        .map(u => u.message)

      // 대기열 초기화 & 목록 새로고침
      setUploadQueue([])
      await refreshList()
      setCurrentPage(1)

      // 결과 알림
      let message = `${okCount}개 파일 처리 완료`
      if (duplicatedCount > 0) {
        message += `\n- 새로 업로드: ${okCount - duplicatedCount}개`
        message += `\n- 중복 파일: ${duplicatedCount}개`
      }
      if (failedCount > 0) {
        message += `\n- 실패: ${failedCount}개`
      }
      
      // 중복 파일 상세 메시지 추가
      if (duplicatedMessages.length > 0) {
        message += `\n\n중복 파일 상세:`
        duplicatedMessages.forEach(msg => {
          message += `\n• ${msg}`
        })
      }

      alert(message)
    } catch (error) {
      console.error('파일 업로드 실패:', error)
      alert(error?.message || '파일 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFilesToQueue(e.dataTransfer.files)
  }

  const onFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      addFilesToQueue(files)
      e.target.value = '' // Reset input
    }
  }

  // ✅ 서버 삭제 연동
  const handleDeleteFile = async (docId, fileName) => {
    if (!window.confirm(`"${fileName}" 파일을 삭제하시겠습니까?`)) return
    try {
      await fileService.deleteFile(docId)
      const list = await refreshList()
      const newTotalPages = Math.ceil(list.length / ITEMS_PER_PAGE)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error) {
      console.error('파일 삭제 실패:', error)
      alert(error?.message || '파일 삭제에 실패했습니다.')
    }
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

  return (
    <>
      <ThinSidebar logoSrc={logoSrc} /> {/* 얇은 사이드바 */}
      <div className="admin-page with-sidebar">  {/* 사이드바 여백 클래스 추가 */}
        <div className="admin-page">
          <AdminHeader 
            user={user} 
            onLogout={onLogout} 
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
                  API 설정하기
                </button>
              </div>
      
              <div className="admin-content-section">
                <div className="file-upload-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: '0 0 0 10px' }}>파일 업로드</h3>
                  </div>
      
                  <div
                    className={`admin-file-drop-zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                  >
                    {uploading ? (
                      <div>
                        <div className="admin-drop-icon">⏳</div>
                        <div>파일 업로드 중...</div>
                      </div>
                    ) : (
                      <div>
                        <div className="admin-drop-icon">📁</div>
                        <p className="admin-drop-text">
                          여기로 드래그하거나 클릭해서 파일을 선택하세요
                        </p>
                        <p className="admin-drop-subtext">
                          지원 파일 확장자: .pdf, .docx, .xlsx, .csv, .txt
                        </p>
                      </div>
                    )}
                    <input 
                      ref={inputRef} 
                      type="file" 
                      multiple 
                      accept=".pdf,.docx,.xlsx,.csv,.txt"
                      onChange={onFileSelect}
                      style={{ display: 'none' }} 
                    />
                  </div>
                  
                  {/* 업로드 대기열 */}
                  {uploadQueue.length > 0 && (
                    <div className="admin-upload-queue-section">
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '16px' 
                      }}>
                        <h4 style={{ margin: 0, color: '#111827', fontWeight: '700' }}>
                          업로드 대기 중인 파일 ({uploadQueue.length}개)
                        </h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setUploadQueue([])}
                            style={{
                              padding: '6px 12px',
                              background: '#6B7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            전체 취소
                          </button>
                          <button
                            onClick={executeUpload}
                            disabled={uploading}
                            style={{
                              padding: '8px 16px',
                              background: uploading ? '#9CA3AF' : '#2563EB',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: uploading ? 'not-allowed' : 'pointer',
                              fontWeight: '600',
                              fontSize: '14px'
                            }}
                          >
                            {uploading ? '업로드 중...' : `${uploadQueue.length}개 파일 업로드`}
                          </button>
                        </div>
                      </div>
                          
                      <div className="admin-upload-queue-list">
                        {uploadQueue.map(item => (
                          <div key={item.id} className="admin-upload-queue-item">
                            <button
                              onClick={() => removeFromQueue(item.id)}
                              style={{
                                padding: '6px 8px',
                                background: '#FEE2E2',
                                border: '1px solid #FECACA',
                                cursor: 'pointer',
                                color: '#DC2626',
                                fontSize: '12px',
                                borderRadius: '4px',
                                fontWeight: '600',
                                minWidth: '50px'
                              }}
                              title="대기열에서 제거"
                            >
                              ✕ 삭제
                            </button>
                            <span className="admin-file-emoji" style={{ fontSize: '16px', marginLeft: '8px' }}>
                              {typeEmoji[item.extension] || '📎'}
                            </span>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827', flex: 1, marginLeft: '8px' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', minWidth: '80px', textAlign: 'right' }}>
                              {fileService.formatFileSize(item.size)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    총 {filteredFiles.length}개 파일
                  </span>
                  <div style={{ position: 'relative', display: 'inline-block', width: '200px' }}>
                    <input
                      type="text"
                      placeholder="파일 검색..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1) // 검색 시 첫 페이지로 이동
                      }}
                      style={{
                        padding: '8px 32px 8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        width: '100%'
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setCurrentPage(1)
                        }}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: '#6B7280',
                          padding: '2px',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="검색어 지우기"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                  
                <div className="file-list-section">
                  {filteredFiles.length > 0 && (
                    <div className="file-list-header">
                      <div>이름</div>
                      <div>파일 종류</div>
                      <div>파일 크기</div>
                      <div>상태</div>
                      <div>업로드 날짜</div>
                      <div>작업</div>
                    </div>
                  )}
                  
                  {currentFiles.map(f => (
                    <div key={f.id} className="file-list-item">
                      <div>
                        <button 
                          onClick={() => {
                            setPreviewUrl(f.url)
                            setPreviewFileName(f.name)
                          }} 
                          className="file-name-button"
                        >
                          <span className="file-emoji">{typeEmoji[f.extension] || '📎'}</span>
                          {f.name}
                        </button>
                      </div>
                      <div className="upload-date">{getFileTypeLabel(f.extension)}</div>
                      <div className="upload-date">{fileService.formatFileSize?.(f.size) || '-'}</div>
                      <div>
                        <div style={{
                          marginTop: 4,
                          display: 'inline-block',
                          padding: '2px 6px',
                          borderRadius: 6,
                          fontSize: 11,
                          background: f.status === 'succeeded' ? '#ECFDF5'
                                   : f.status === 'failed' ? '#FEF2F2'
                                   : '#EFF6FF',
                          color: f.status === 'succeeded' ? '#065F46'
                               : f.status === 'failed' ? '#991B1B'
                               : '#1E40AF'
                        }}>
                          {f.status || '-'}
                        </div>
                      </div>
                      <div className="upload-date">{formatDate(f.createdAt)}</div>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          onClick={() => fileService.downloadFile(f)}
                          style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="파일 다운로드"
                        >
                          <MdOutlineFileDownload />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(f.id, f.name)}
                          style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="파일 삭제"
                        >
                          <FaRegTrashCan />
                        </button>
                      </div>
                    </div>
                  ))}
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
                
                {filteredFiles.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#6B7280',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    marginTop: '16px'
                  }}>
                    {searchQuery ? 
                      `"${searchQuery}"에 대한 검색 결과가 없습니다.` : 
                      '아직 업로드된 파일이 없습니다.'
                    }
                  </div>
                )}
              
              </div>
            </div>
          </div>
              
          {previewUrl && (
            <PreviewPanel 
              url={previewUrl} 
              fileName={previewFileName}
              onClose={() => {
                setPreviewUrl(null)
                setPreviewFileName('')
              }} 
            />
          )}
          <IntegrationModal open={openIntegrations} onClose={() => setOpenIntegrations(false)} />
          <LoadingModal isOpen={apiLoading} message="LOADING..." />
        </div>
      </div>
    </>
  )
}
