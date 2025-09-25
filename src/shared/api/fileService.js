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
    }
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
