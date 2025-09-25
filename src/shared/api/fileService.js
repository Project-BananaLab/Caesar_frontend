
// 파일 관리를 위한 서비스
// 주의: 브라우저 환경에서는 보안상의 이유로 실제 파일 시스템에 직접 저장할 수 없습니다.
// 실제 파일 저장을 위해서는 백엔드 서버가 필요합니다.
// 현재는 브라우저의 로컬 스토리지와 Base64 인코딩을 사용하여 파일을 관리합니다.
class FileService {
  constructor() {
    this.storageKey = "caesar_uploaded_files";
    this.baseUploadPath = "/uploads/"; // 실제로는 브라우저 메모리에 저장됨
  }

  // 로컬 스토리지에서 파일 목록 가져오기
  getFiles() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("파일 목록 로드 실패:", error);
      return [];
    }
  }

  // 파일 목록 저장
  saveFiles(files) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(files));
      return true;
    } catch (error) {
      console.error("파일 목록 저장 실패:", error);
      return false;
    }
  }

  // 새 파일 추가
  async addFile(file, user) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const fileData = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            extension: file.name.split(".").pop().toLowerCase(),
            reason: "새로 업로드됨",
            owner: user?.name || "현재 사용자",
            location: this.baseUploadPath,
            url: e.target.result, // Base64 데이터 URL
            createdAt: new Date().toISOString(),
            lastModified: file.lastModified
              ? new Date(file.lastModified).toISOString()
              : new Date().toISOString(),
          };

          const files = this.getFiles();
          files.unshift(fileData); // 최신 파일을 맨 앞에 추가

          if (this.saveFiles(files)) {
            resolve(fileData);
          } else {
            reject(new Error("파일 저장 실패"));
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("파일 읽기 실패"));
      };

      reader.readAsDataURL(file);
    });
  }

  // 파일 삭제
  deleteFile(fileId) {
    try {
      const files = this.getFiles();
      const filteredFiles = files.filter((f) => f.id !== fileId);
      return this.saveFiles(filteredFiles);
    } catch (error) {
      console.error("파일 삭제 실패:", error);
      return false;
    }
  }

  // 파일 검색
  searchFiles(query) {
    const files = this.getFiles();
    if (!query) return files;

    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(query.toLowerCase()) ||
        file.owner.toLowerCase().includes(query.toLowerCase()) ||
        file.reason.toLowerCase().includes(query.toLowerCase())
    );
  }

  // 파일 타입별 필터링
  filterByType(type) {
    const files = this.getFiles();
    if (!type) return files;

    return files.filter((file) => file.extension === type);
  }

  // 파일 크기 포맷팅
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // 파일 타입 검사
  isImageFile(extension) {
    const imageExtensions = [
      "jpg",
      "jpeg",
      "jfif",
      "png",
      "gif",
      "tiff",
      "tif",
      "psd",
      "bmp",
      "webp",
      "svg",
      "ico",
      "raw",
    ];
    return imageExtensions.includes(extension.toLowerCase());
  }

  isPdfFile(extension) {
    return extension.toLowerCase() === "pdf";
  }

  isTextFile(extension) {
    const textExtensions = [
      "txt",
      "csv",
      "json",
      "xml",
      "yaml",
      "yml",
      "ini",
      "cfg",
      "md",
      "markdown",
      "log",
    ];
    return textExtensions.includes(extension.toLowerCase());
  }

  isOfficeFile(extension) {
    const officeExtensions = [
      // Word 문서
      "doc",
      "docx",
      "hwp",
      "hwpx",
      "odt",
      "rtf",
      // Excel 스프레드시트
      "xls",
      "xlsx",
      "xlsm",
      "xlsb",
      "ods",
      // PowerPoint 프레젠테이션
      "ppt",
      "pptx",
      "pptm",
      "ppsx",
      "odp",
    ];
    return officeExtensions.includes(extension.toLowerCase());
  }

  isVideoFile(extension) {
    const videoExtensions = [
      "mp4",
      "avi",
      "mov",
      "wmv",
      "flv",
      "mkv",
      "webm",
      "m4v",
      "3gp",
      "ogv",
    ];
    return videoExtensions.includes(extension.toLowerCase());
  }

  isAudioFile(extension) {
    const audioExtensions = [
      "mp3",
      "wav",
      "flac",
      "aac",
      "ogg",
      "wma",
      "m4a",
      "opus",
      "amr",
    ];
    return audioExtensions.includes(extension.toLowerCase());
  }

  isArchiveFile(extension) {
    const archiveExtensions = [
      "zip",
      "rar",
      "7z",
      "tar",
      "gz",
      "bz2",
      "xz",
      "cab",
      "iso",
    ];
    return archiveExtensions.includes(extension.toLowerCase());
  }

  isCodeFile(extension) {
    const codeExtensions = [
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
      "scss",
      "sass",
      "less",
      "py",
      "java",
      "cpp",
      "c",
      "cs",
      "php",
      "rb",
      "go",
      "rs",
      "swift",
      "kt",
      "scala",
      "r",
      "sql",
      "sh",
      "bat",
      "ps1",
    ];
    return codeExtensions.includes(extension.toLowerCase());
  }

  // 파일 다운로드
  downloadFile(file) {
    try {
      // Base64 데이터 URL을 Blob으로 변환
      const response = fetch(file.url);
      response
        .then((res) => res.blob())
        .then((blob) => {
          // 임시 다운로드 링크 생성
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = file.name;

          // 링크 클릭하여 다운로드 시작
          document.body.appendChild(link);
          link.click();

          // 정리
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
        })
        .catch((error) => {
          console.error("다운로드 실패:", error);
          // Base64 데이터 URL을 직접 사용하는 대체 방법
          const link = document.createElement("a");
          link.href = file.url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });

      return true;
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      return false;

// src/shared/api/fileService.js
// 실제 FastAPI 백엔드와 통신하는 파일 서비스
// - 업로드: POST /api/admin/files/upload  (multipart/form-data)
// - 목록:   GET  /api/admin/files/list
// - 삭제:   DELETE /api/admin/files/{doc_id}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// 공통: 토큰 헤더
function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

// 파일 사이즈 포맷(기존 UI 의존)
function formatFileSize(bytes) {
  if (bytes === 0 || bytes === undefined || bytes === null) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 파일 다운로드(단순 S3 URL 열기)
function downloadFile(doc) {
  if (!doc?.url) return
  window.open(doc.url, '_blank', 'noopener,noreferrer')
}

// 서버에서 목록 조회 → 프론트에서 쓰기 좋은 형태로 매핑
async function listFiles() {
  console.debug('[upload] headers', authHeaders());
  const res = await fetch(`${API_BASE}/api/admin/files/list`, {
    method: 'GET',
    headers: {
      ...authHeaders(),
    }
  })
  // 401 처리: 토큰 만료/유효하지 않을 때 로그인 화면으로 보내기
  if (res.status === 401) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('role')
    // 필요하면 토스트/알림
    window.location.href = '/login' // 라우터 경로에 맞게
    return []
  }
  if (!res.ok) {
    const detail = await safeJson(res)
    throw new Error(detail?.detail || '목록 조회 실패')
  }
  const data = await res.json() // [{ id, fileName, url, isPrivate, employeeId, status, chunks, createdAt }]
  // AdminPage가 쓰던 필드명으로 얇게 매핑
  return data.map(d => {
    const name = d.fileName || ''
    const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : ''
    return {
      id: d.id,
      name,
      url: d.url,
      extension,
      size: d.size ?? undefined, // 서버가 size를 안주면 undefined
      status: d.status, // 'processing' | 'succeeded' | 'failed'
      location: d.url ? 'S3' : '-',
      owner: d.employeeId ? `개인(${d.employeeId})` : '회사공개',
      reason: d.status === 'succeeded' ? `청크 ${d.chunks}개` : (d.status || '-'),
      createdAt: d.createdAt,
      raw: d, // 필요하면 원본 접근
    }
  })
}

// 업로드: files[] + isPrivate(옵션) + employeeId(옵션)
//   - AdminPage는 현재 회사공개 기본으로만 올리므로 기본 false로 처리
async function uploadFiles({ files, isPrivate = false, employeeId = null }) {
  const fd = new FormData()
  files.forEach(f => fd.append('files', f)) // 이름은 백엔드와 동일해야 함: files
  fd.append('isPrivate', isPrivate ? 'true' : 'false')
  if (employeeId !== null && employeeId !== undefined && employeeId !== '') {
    fd.append('employeeId', String(employeeId))
  }

  console.debug('[upload] headers', authHeaders());
  const res = await fetch(`${API_BASE}/api/admin/files/upload`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
    },
    body: fd
  })
  if (res.status === 401) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('role')
    window.location.href = '/login'
    return []
  }
  const data = await safeJson(res)
  if (!res.ok) {
    // 서버가 detail에 배열 반환(각 파일별 결과)하는 케이스 처리
    throw new Error(typeof data?.detail === 'string' ? data.detail : '업로드 실패')
  }
  // { uploaded: [{ file, ok, docId, chunks?, url?, error? }, ...] }
  return data
}

// 삭제
async function deleteFile(docId) {
  const res = await fetch(`${API_BASE}/api/admin/files/${docId}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(),

    }
  })
  if (res.status === 401) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('role')
    window.location.href = '/login'
    return []
  }
  const data = await safeJson(res)
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || '삭제 실패')
  }
  return true
}


  // 로컬 스토리지 데이터 초기화 (필요시)
  clearAllFiles() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error("파일 데이터 초기화 실패:", error);
      return false;
    }
  }
}

export default new FileService();
async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

function searchFilesInMemory(files, q) {
  const needle = (q || '').toLowerCase()
  if (!needle) return files
  return files.filter(f =>
    (f.name || '').toLowerCase().includes(needle) ||
    (f.owner || '').toLowerCase().includes(needle) ||
    (f.reason || '').toLowerCase().includes(needle)
  )
}

export default {
  listFiles,
  uploadFiles,
  deleteFile,
  downloadFile,
  formatFileSize,
  searchFilesInMemory,
}
