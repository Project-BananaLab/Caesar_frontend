// src/shared/api/fileService.js
// 실제 FastAPI 백엔드와 통신하는 파일 서비스
// - 업로드: POST /api/admin/files/upload  (multipart/form-data)
// - 목록:   GET  /api/admin/files/list
// - 삭제:   DELETE /api/admin/files/{doc_id}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// 공통: 토큰 헤더
function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 안전한 JSON 파싱
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// 파일 사이즈 포맷팅
function formatFileSize(bytes) {
  if (bytes === 0 || bytes === undefined || bytes === null) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// 파일 다운로드(단순 S3 URL 열기)
function downloadFile(doc) {
  if (!doc?.url) return;
  window.open(doc.url, "_blank", "noopener,noreferrer");
}

// 메모리에서 파일 검색
function searchFilesInMemory(files, q) {
  const needle = (q || "").toLowerCase();
  if (!needle) return files;
  return files.filter(
    (f) =>
      (f.name || "").toLowerCase().includes(needle) ||
      (f.owner || "").toLowerCase().includes(needle) ||
      (f.reason || "").toLowerCase().includes(needle)
  );
}

// 서버에서 목록 조회 → 프론트에서 쓰기 좋은 형태로 매핑
async function listFiles() {
  console.debug("[listFiles] headers", authHeaders());
  const res = await fetch(`${API_BASE}/api/admin/files/list`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  // 401 처리: 토큰 만료/유효하지 않을 때 로그인 화면으로 보내기
  if (res.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    window.location.href = "/login";
    return [];
  }

  if (!res.ok) {
    const detail = await safeJson(res);
    throw new Error(detail?.detail || "목록 조회 실패");
  }

  const data = await res.json(); // [{ id, fileName, url, isPrivate, employeeId, status, chunks, createdAt }]

  // AdminPage가 쓰던 필드명으로 얇게 매핑
  return data.map((d) => {
    const name = d.fileName || "";
    const extension = name.includes(".")
      ? name.split(".").pop().toLowerCase()
      : "";
    return {
      id: d.id,
      name,
      url: d.url,
      extension,
      size: d.size ?? undefined, // 서버가 size를 안주면 undefined
      status: d.status, // 'processing' | 'succeeded' | 'failed'
      location: d.url ? "S3" : "-",
      owner: d.employeeId ? `개인(${d.employeeId})` : "회사공개",
      reason: d.status === "succeeded" ? `청크 ${d.chunks}개` : d.status || "-",
      createdAt: d.createdAt,
      raw: d, // 필요하면 원본 접근
    };
  });
}

// 업로드: files[] + isPrivate(옵션) + employeeId(옵션)
//   - AdminPage는 현재 회사공개 기본으로만 올리므로 기본 false로 처리
async function uploadFiles({ files, isPrivate = false, employeeId = null }) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f)); // 이름은 백엔드와 동일해야 함: files
  fd.append("isPrivate", isPrivate ? "true" : "false");
  if (employeeId !== null && employeeId !== undefined && employeeId !== "") {
    fd.append("employeeId", String(employeeId));
  }

  console.debug("[uploadFiles] headers", authHeaders());
  const res = await fetch(`${API_BASE}/api/admin/files/upload`, {
    method: "POST",
    headers: {
      ...authHeaders(),
    },
    body: fd,
  });

  if (res.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    window.location.href = "/login";
    return [];
  }

  const data = await safeJson(res);
  if (!res.ok) {
    // 서버가 detail에 배열 반환(각 파일별 결과)하는 케이스 처리
    throw new Error(
      typeof data?.detail === "string" ? data.detail : "업로드 실패"
    );
  }

  // { uploaded: [{ file, ok, docId, chunks?, url?, error? }, ...] }
  return data;
}

// 삭제
async function deleteFile(docId) {
  const res = await fetch(`${API_BASE}/api/admin/files/${docId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    window.location.href = "/login";
    return false;
  }

  const data = await safeJson(res);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "삭제 실패");
  }

  return true;
}

// 파일 타입 검사 유틸리티 함수들
const fileTypeCheckers = {
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
  },

  isPdfFile(extension) {
    return extension.toLowerCase() === "pdf";
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },
};

export default {
  listFiles,
  uploadFiles,
  deleteFile,
  downloadFile,
  formatFileSize,
  searchFilesInMemory,
  ...fileTypeCheckers,
};
