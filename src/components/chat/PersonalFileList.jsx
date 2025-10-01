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
  const [currentPage, setCurrentPage] = useState(1);

  const FILES_PER_PAGE = 10;

  // 파일 목록 로드 (모든 파일을 가져와서 클라이언트 사이드 페이징)
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 충분히 큰 수로 설정하여 모든 파일을 가져옴
      const response = await getPersonalFiles(1000, 0);
      
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

  // 검색 쿼리가 변경되면 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
      hour12: false,
    });
  };

  // 파일 검색 필터링
  const filteredFiles = searchQuery
    ? files.filter((file) =>
        file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : files;

  // 페이징 계산
  const totalPages = Math.ceil(filteredFiles.length / FILES_PER_PAGE);
  const startIndex = (currentPage - 1) * FILES_PER_PAGE;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + FILES_PER_PAGE);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  // 현재 페이지에 파일이 없으면 이전 페이지로 이동
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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
          {paginatedFiles.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-icon">
                {file.fileName.endsWith('.pdf') ? '📄' :
                 file.fileName.endsWith('.docx') || file.fileName.endsWith('.doc') ? '📝' :
                 file.fileName.endsWith('.xlsx') || file.fileName.endsWith('.xls') ? '📊' :
                 file.fileName.endsWith('.pptx') || file.fileName.endsWith('.ppt') ? '📋' :
                 '📁'}
              </div>
              
              <div className="file-content">
                <div className="file-header">
                  <div className="file-name" title={file.fileName}>
                    {highlightSearchTerm(file.fileName, searchQuery)}
                  </div>
                  <div className="file-header-actions">
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
                </div>
                
                <div className="file-footer">
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-date">{formatDate(file.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이징 컨트롤 - 대화 리스트와 동일한 스타일 */}
      {totalPages > 1 && (
        <div className="channel-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="channel-pagination-button"
          >
            이전
          </button>
          <span className="channel-pagination-info">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="channel-pagination-button"
          >
            다음
          </button>
        </div>
      )}

    </div>
  );
}
