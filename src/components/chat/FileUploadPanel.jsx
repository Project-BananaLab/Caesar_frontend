// src/components/chat/FileUploadPanel.jsx
// 개인 파일 업로드 패널 컴포넌트

import React, { useState, useRef } from "react";
import { uploadPersonalFile, formatFileSize } from "../../shared/api/userFileService";
import "../../assets/styles/FileUploadPanel.css";

export default function FileUploadPanel({ onUploadSuccess, onClose }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const fileInputRef = useRef(null);

  // 파일 선택 처리
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    uploadFiles(fileArray);
  };

  // 파일 업로드 처리
  const uploadFiles = async (files) => {
    const newUploadingFiles = files.map((file, index) => ({
      id: `upload_${Date.now()}_${index}`,
      file,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      error: null,
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // 각 파일을 순차적으로 업로드
    for (const uploadingFile of newUploadingFiles) {
      try {
        // 업로드 진행률 시뮬레이션 (실제로는 백엔드에서 진행률을 받아야 함)
        setUploadingFiles(prev => 
          prev.map(f => f.id === uploadingFile.id ? { ...f, progress: 30 } : f)
        );

        const result = await uploadPersonalFile(uploadingFile.file);

        setUploadingFiles(prev => 
          prev.map(f => f.id === uploadingFile.id ? { ...f, progress: 100, status: 'completed' } : f)
        );

        // 업로드 성공 콜백 호출
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }

      } catch (error) {
        console.error('파일 업로드 실패:', error);
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, status: 'error', error: error.message } 
              : f
          )
        );
      }
    }

    // 3초 후 완료된 파일들 제거
    setTimeout(() => {
      setUploadingFiles(prev => 
        prev.filter(f => f.status !== 'completed' && f.status !== 'error')
      );
    }, 3000);
  };

  // 드래그 앤 드롭 이벤트 처리
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  // 파일 선택 버튼 클릭
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  // 파일 입력 변경
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  // 업로드 중인 파일 제거
  const removeUploadingFile = (fileId) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="file-upload-panel">
      <div className="file-upload-header">
        <h3>파일 업로드</h3>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectClick}
      >
        <div className="drop-zone-content">
          <div className="upload-icon">📁</div>
          <p className="drop-text">
            파일을 여기에 드래그하거나 클릭하여 선택하세요
          </p>
          <p className="drop-subtext">
            지원 형식: PDF, DOCX, XLSX, TXT, CSV
          </p>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* 업로드 진행 상황 */}
      {uploadingFiles.length > 0 && (
        <div className="upload-progress-list">
          <h4>업로드 진행 상황</h4>
          {uploadingFiles.map((file) => (
            <div key={file.id} className="upload-progress-item">
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">({formatFileSize(file.size)})</span>
              </div>
              
              <div className="progress-section">
                {file.status === 'uploading' && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                )}
                
                {file.status === 'completed' && (
                  <span className="status-completed">✅ 완료</span>
                )}
                
                {file.status === 'error' && (
                  <span className="status-error">❌ 실패: {file.error}</span>
                )}
              </div>

              <button
                className="remove-file-button"
                onClick={() => removeUploadingFile(file.id)}
                title="제거"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
