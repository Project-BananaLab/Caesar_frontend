// src/components/chat/PersonalFileList.jsx
// 개인 파일 목록 컴포넌트

import React, { useState, useEffect } from "react";
import { 
  getPersonalFiles, 
  deletePersonalFile, 
  formatFileSize, 
  getFileStatusText 
} from "../../shared/api/userFileService";
import "../../assets/styles/PersonalFileList.css";

export default function PersonalFileList({ refreshTrigger, onFileDeleted }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalFiles, setTotalFiles] = useState(0);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 파일 목록 로드
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPersonalFiles(50, 0);
      setFiles(response.files || []);
      setTotalFiles(response.total || 0);
    } catch (err) {
      console.error('파일 목록 로드 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 및 refreshTrigger 변경 시 파일 목록 로드
  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  // 파일 삭제 처리
  const handleDeleteFile = async (fileId, fileName) => {
    if (!window.confirm(`"${fileName}" 파일을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setDeletingFileId(fileId);
      await deletePersonalFile(fileId);
      
      // 목록에서 삭제된 파일 제거
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setTotalFiles(prev => prev - 1);
      
      // 삭제 완료 콜백 호출
      if (onFileDeleted) {
        onFileDeleted(fileId);
      }
      
      console.log('파일 삭제 완료:', fileName);
    } catch (err) {
      console.error('파일 삭제 실패:', err);
      alert(`파일 삭제에 실패했습니다: ${err.message}`);
    } finally {
      setDeletingFileId(null);
    }
  };

  // 파일 상태에 따른 스타일 클래스
  const getStatusClass = (status) => {
    switch (status) {
      case 'succeeded': return 'status-success';
      case 'processing': return 'status-processing';
      case 'failed': return 'status-error';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 파일 검색 필터링
  const filteredFiles = searchQuery
    ? files.filter((file) =>
        file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : files;

  // 검색어 하이라이트 함수
  const highlightSearchTerm = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={index}
          style={{ backgroundColor: "#FEF3C7", fontWeight: "bold" }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // 검색어 클리어
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="file-list-loading">
        <div className="loading-spinner">⏳</div>
        <p>파일 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-list-error">
        <p>❌ 파일 목록 로드 실패: {error}</p>
        <button onClick={loadFiles} className="retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="personal-file-list">
      <div className="channel-conversations-header">
        <span className="file-list-title">내 파일</span>
        <span className="channel-conversations-count">{totalFiles}개</span>
      </div>

      {/* 파일 검색 영역 */}
      <div className="file-search-container">
        <div className="file-search-input-wrapper">
          <input
            type="text"
            placeholder="파일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="file-search-input"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="file-search-clear-button"
              title="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>
        <button onClick={loadFiles} className="refresh-button" title="새로고침">
          🔄
        </button>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="empty-file-list">
          <div className="empty-icon">📄</div>
          {searchQuery ? (
            <>
              <p>"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
              <p className="empty-subtext">다른 검색어를 시도해보세요.</p>
            </>
          ) : (
            <>
              <p>업로드된 파일이 없습니다.</p>
              <p className="empty-subtext">파일을 업로드하여 AI와 대화해보세요!</p>
            </>
          )}
        </div>
      ) : (
        <div className="file-list">
          {filteredFiles.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-icon">
                {file.fileName.endsWith('.pdf') ? '📄' :
                 file.fileName.endsWith('.docx') || file.fileName.endsWith('.doc') ? '📝' :
                 file.fileName.endsWith('.xlsx') || file.fileName.endsWith('.xls') ? '📊' :
                 file.fileName.endsWith('.pptx') || file.fileName.endsWith('.ppt') ? '📋' :
                 '📁'}
              </div>
              
              <div className="file-details">
                <div className="file-name" title={file.fileName}>
                  {highlightSearchTerm(file.fileName, searchQuery)}
                </div>
                <div className="file-meta">
                  <span className="file-size">{formatFileSize(file.size)}</span>
                  <span className="file-date">{formatDate(file.createdAt)}</span>
                  {file.chunksCount > 0 && (
                    <span className="chunks-count">{file.chunksCount}개 청크</span>
                  )}
                </div>
              </div>

              <div className="file-status">
                <span className={`status-badge ${getStatusClass(file.status)}`}>
                  {getFileStatusText(file.status)}
                </span>
                {file.status === 'failed' && file.errorText && (
                  <div className="error-tooltip" title={file.errorText}>
                    ⚠️
                  </div>
                )}
              </div>

              <div className="file-actions">
                <button
                  onClick={() => handleDeleteFile(file.id, file.fileName)}
                  disabled={deletingFileId === file.id}
                  className="delete-button"
                  title="파일 삭제"
                >
                  {deletingFileId === file.id ? '⏳' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
