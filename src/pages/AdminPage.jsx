import React, { useState, useRef, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import LoadingModal from "../components/LoadingModal";
import PreviewPanel from "../components/PreviewPanel";
import IntegrationModal from "../components/IntegrationModal";
import SettingsModal from "../components/SettingsModal";
import fileService from "../shared/api/fileService";
import "../assets/styles/AdminPage.css";

const typeEmoji = {
  // 이미지 파일
  png: "🖼️",
  jpg: "🖼️",
  jpeg: "🖼️",
  jfif: "🖼️",
  gif: "🖼️",
  tiff: "🖼️",
  tif: "🖼️",
  psd: "🖼️",
  bmp: "🖼️",
  webp: "🖼️",
  svg: "🖼️",
  ico: "🖼️",
  raw: "🖼️",

  // 문서 파일
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  hwp: "📝",
  hwpx: "📝",
  odt: "📝",
  rtf: "📝",

  // 스프레드시트
  xls: "📊",
  xlsx: "📊",
  xlsm: "📊",
  xlsb: "📊",
  ods: "📊",
  csv: "📊",

  // 프레젠테이션
  ppt: "📈",
  pptx: "📈",
  pptm: "📈",
  ppsx: "📈",
  odp: "📈",

  // 텍스트 파일
  txt: "📝",
  md: "📝",
  markdown: "📝",
  log: "📝",

  // 데이터 파일
  json: "📄",
  xml: "📄",
  yaml: "📄",
  yml: "📄",
  ini: "📄",
  cfg: "📄",

  // 압축 파일
  zip: "🗜️",
  rar: "🗜️",
  "7z": "🗜️",
  tar: "🗜️",
  gz: "🗜️",

  // 비디오 파일
  mp4: "🎥",
  avi: "🎥",
  mov: "🎥",
  wmv: "🎥",
  flv: "🎥",
  mkv: "🎥",

  // 오디오 파일
  mp3: "🎵",
  wav: "🎵",
  flac: "🎵",
  aac: "🎵",
  ogg: "🎵",
  wma: "🎵",

  // 코드 파일
  js: "💻",
  ts: "💻",
  jsx: "💻",
  tsx: "💻",
  html: "💻",
  css: "💻",
  py: "💻",
  java: "💻",
  cpp: "💻",
  c: "💻",
  cs: "💻",
  php: "💻",
};

import { ADMIN_PAGE_SIZE } from "../shared/config/app";
import { MdOutlineFileDownload } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";

const ITEMS_PER_PAGE = ADMIN_PAGE_SIZE;

export default function AdminPage({ user, onLogout }) {
  const [isDragging, setDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [apiLoading, setApiLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [openIntegrations, setOpenIntegrations] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadQueue, setUploadQueue] = useState([]);
  const inputRef = useRef(null);

  // 컴포넌트 마운트 시 파일 목록 로드
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    try {
      const loadedFiles = fileService.getFiles();
      setFiles(loadedFiles);
    } catch (error) {
      console.error("파일 로드 실패:", error);
      setFiles([]);
    }
  };

  // 검색 및 페이징 계산
  const filteredFiles = searchQuery
    ? fileService
        .searchFiles(searchQuery)
        .filter((f) => files.some((file) => file.id === f.id))
    : files;
  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentFiles = filteredFiles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 파일을 대기열에 추가
  const addFilesToQueue = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const queueItems = fileArray.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: file.name.split(".").pop().toLowerCase(),
    }));

    setUploadQueue((prev) => [...prev, ...queueItems]);
  };

  // 대기열에서 파일 제거
  const removeFromQueue = (queueId) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== queueId));
  };

  // 실제 업로드 실행
  const executeUpload = async () => {
    if (uploadQueue.length === 0) return;

    setUploading(true);

    try {
      const newFiles = [];

      for (let i = 0; i < uploadQueue.length; i++) {
        const queueItem = uploadQueue[i];
        const newFile = await fileService.addFile(queueItem.file, user);
        newFiles.push(newFile);
      }

      // 대기열 초기화
      setUploadQueue([]);

      // 파일 목록 새로고침
      loadFiles();

      // 첫 페이지로 이동하여 새 파일들을 보여줌
      setCurrentPage(1);

      alert(`${newFiles.length}개 파일이 성공적으로 업로드되었습니다.`);
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    addFilesToQueue(files);
  };

  const onFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      addFilesToQueue(files);
      e.target.value = ""; // Reset input
    }
  };

  const handleDeleteFile = (fileId, fileName) => {
    if (window.confirm(`"${fileName}" 파일을 삭제하시겠습니까?`)) {
      const success = fileService.deleteFile(fileId);
      if (success) {
        loadFiles();
        // 현재 페이지에 파일이 없으면 이전 페이지로 이동
        const newFilteredFiles = fileService.getFiles();
        const newTotalPages = Math.ceil(
          newFilteredFiles.length / ITEMS_PER_PAGE
        );
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        alert("파일 삭제에 실패했습니다.");
      }
    }
  };

  const handleApiIntegration = async () => {
    setApiLoading(true);
    try {
      // API 연동 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setOpenIntegrations(true);
    } catch (error) {
      console.error("API 연동 실패:", error);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminHeader
        user={user}
        onLogout={onLogout}
        onOpenSettings={() => setOpenSettings(true)}
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

          <div className="admin-content-section">
            <div className="file-upload-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3 style={{ margin: 0 }}>파일 관리</h3>
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <input
                    type="text"
                    placeholder="파일 검색..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // 검색 시 첫 페이지로 이동
                    }}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #D1D5DB",
                      borderRadius: "6px",
                      fontSize: "14px",
                      width: "200px",
                    }}
                  />
                  <span style={{ fontSize: "14px", color: "#6B7280" }}>
                    총 {filteredFiles.length}개 파일
                  </span>
                </div>
              </div>
              <div
                className={`file-drop-zone ${isDragging ? "dragging" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? (
                  <div>
                    <div className="drop-icon">⏳</div>
                    <div>파일 업로드 중...</div>
                  </div>
                ) : (
                  <div>
                    <div className="drop-icon">📁</div>
                    <div>여기로 드래그하거나 클릭해서 파일을 선택하세요</div>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.hwp,.hwpx,.odt,.rtf,.xls,.xlsx,.xlsm,.xlsb,.ods,.csv,.ppt,.pptx,.pptm,.ppsx,.odp,.png,.jpg,.jpeg,.jfif,.gif,.tiff,.tif,.psd,.bmp,.webp,.svg,.ico,.raw,.txt,.md,.markdown,.log,.json,.xml,.yaml,.yml,.ini,.cfg,.zip,.rar,.7z,.tar,.gz,.mp4,.avi,.mov,.wmv,.flv,.mkv,.mp3,.wav,.flac,.aac,.ogg,.wma,.js,.ts,.jsx,.tsx,.html,.css,.py,.java,.cpp,.c,.cs,.php"
                  onChange={onFileSelect}
                  style={{ display: "none" }}
                />
              </div>

              {/* 업로드 대기열 */}
              {uploadQueue.length > 0 && (
                <div className="upload-queue-section">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h4
                      style={{ margin: 0, color: "#111827", fontWeight: "700" }}
                    >
                      업로드 대기 중인 파일 ({uploadQueue.length}개)
                    </h4>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setUploadQueue([])}
                        style={{
                          padding: "6px 12px",
                          background: "#6B7280",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        전체 취소
                      </button>
                      <button
                        onClick={executeUpload}
                        disabled={uploading}
                        style={{
                          padding: "8px 16px",
                          background: uploading ? "#9CA3AF" : "#2563EB",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: uploading ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        {uploading
                          ? "업로드 중..."
                          : `${uploadQueue.length}개 파일 업로드`}
                      </button>
                    </div>
                  </div>

                  <div className="upload-queue-list">
                    {uploadQueue.map((item) => (
                      <div key={item.id} className="upload-queue-item">
                        <button
                          onClick={() => removeFromQueue(item.id)}
                          style={{
                            padding: "6px 8px",
                            background: "#FEE2E2",
                            border: "1px solid #FECACA",
                            cursor: "pointer",
                            color: "#DC2626",
                            fontSize: "12px",
                            borderRadius: "4px",
                            fontWeight: "600",
                            minWidth: "50px",
                          }}
                          title="대기열에서 제거"
                        >
                          ✕ 삭제
                        </button>
                        <span
                          className="file-emoji"
                          style={{ fontSize: "16px", marginLeft: "8px" }}
                        >
                          {typeEmoji[item.extension] || "📎"}
                        </span>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            color: "#111827",
                            flex: 1,
                            marginLeft: "8px",
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6B7280",
                            fontWeight: "500",
                            minWidth: "80px",
                            textAlign: "right",
                          }}
                        >
                          {fileService.formatFileSize(item.size)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="file-list-section">
              {filteredFiles.length > 0 && (
                <div className="file-list-header">
                  <div>이름</div>
                  <div>추천 이유</div>
                  <div>소유자</div>
                  <div>위치</div>
                  <div>업로드 날짜</div>
                  <div>작업</div>
                </div>
              )}

              {currentFiles.map((f) => (
                <div key={f.id} className="file-list-item">
                  <div>
                    <button
                      onClick={() => {
                        setPreviewUrl(f.url);
                        setPreviewFileName(f.name);
                      }}
                      className="file-name-button"
                    >
                      <span className="file-emoji">
                        {typeEmoji[f.extension] || "📎"}
                      </span>
                      {f.name}
                    </button>
                  </div>
                  <div>{f.reason}</div>
                  <div>{f.owner}</div>
                  <div>
                    {f.location}
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                      {fileService.formatFileSize(f.size)}
                    </div>
                  </div>
                  <div className="upload-date">{formatDate(f.createdAt)}</div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => fileService.downloadFile(f)}
                      style={{
                        padding: "4px 8px",
                        background: "transparent",
                        border: "1px solid #D1D5DB",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="파일 다운로드"
                    >
                      <MdOutlineFileDownload />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(f.id, f.name)}
                      style={{
                        padding: "4px 8px",
                        background: "transparent",
                        border: "1px solid #D1D5DB",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  이전
                </button>

                <span className="pagination-info">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  다음
                </button>
              </div>
            )}

            {filteredFiles.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6B7280",
                  background: "#FFFFFF",
                  borderRadius: "12px",
                  marginTop: "16px",
                }}
              >
                {searchQuery
                  ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                  : "아직 업로드된 파일이 없습니다."}
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
            setPreviewUrl(null);
            setPreviewFileName("");
          }}
        />
      )}
      <IntegrationModal
        open={openIntegrations}
        onClose={() => setOpenIntegrations(false)}
      />
      <SettingsModal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
      <LoadingModal isOpen={apiLoading} message="API 연동 중..." />
    </div>
  );
}
