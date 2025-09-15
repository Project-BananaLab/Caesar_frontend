// 파일 관리를 위한 서비스
// 주의: 브라우저 환경에서는 보안상의 이유로 실제 파일 시스템에 직접 저장할 수 없습니다.
// 실제 파일 저장을 위해서는 백엔드 서버가 필요합니다.
// 현재는 브라우저의 로컬 스토리지와 Base64 인코딩을 사용하여 파일을 관리합니다.
class FileService {
  constructor() {
    this.storageKey = 'caesar_uploaded_files'
    this.baseUploadPath = '/uploads/' // 실제로는 브라우저 메모리에 저장됨
  }

  // 로컬 스토리지에서 파일 목록 가져오기
  getFiles() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('파일 목록 로드 실패:', error)
      return []
    }
  }

  // 파일 목록 저장
  saveFiles(files) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(files))
      return true
    } catch (error) {
      console.error('파일 목록 저장 실패:', error)
      return false
    }
  }

  // 새 파일 추가
  async addFile(file, user) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const fileData = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            extension: file.name.split('.').pop().toLowerCase(),
            reason: '새로 업로드됨',
            owner: user?.name || '현재 사용자',
            location: this.baseUploadPath,
            url: e.target.result, // Base64 데이터 URL
            createdAt: new Date().toISOString(),
            lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString()
          }

          const files = this.getFiles()
          files.unshift(fileData) // 최신 파일을 맨 앞에 추가
          
          if (this.saveFiles(files)) {
            resolve(fileData)
          } else {
            reject(new Error('파일 저장 실패'))
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('파일 읽기 실패'))
      }

      reader.readAsDataURL(file)
    })
  }

  // 파일 삭제
  deleteFile(fileId) {
    try {
      const files = this.getFiles()
      const filteredFiles = files.filter(f => f.id !== fileId)
      return this.saveFiles(filteredFiles)
    } catch (error) {
      console.error('파일 삭제 실패:', error)
      return false
    }
  }

  // 파일 검색
  searchFiles(query) {
    const files = this.getFiles()
    if (!query) return files

    return files.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase()) ||
      file.owner.toLowerCase().includes(query.toLowerCase()) ||
      file.reason.toLowerCase().includes(query.toLowerCase())
    )
  }

  // 파일 타입별 필터링
  filterByType(type) {
    const files = this.getFiles()
    if (!type) return files

    return files.filter(file => file.extension === type)
  }

  // 파일 크기 포맷팅
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 파일 타입 검사
  isImageFile(extension) {
    const imageExtensions = [
      'jpg', 'jpeg', 'jfif', 'png', 'gif', 'tiff', 'tif', 'psd', 'bmp', 'webp', 'svg', 'ico', 'raw'
    ]
    return imageExtensions.includes(extension.toLowerCase())
  }

  isPdfFile(extension) {
    return extension.toLowerCase() === 'pdf'
  }

  isTextFile(extension) {
    const textExtensions = [
      'txt', 'csv', 'json', 'xml', 'yaml', 'yml', 'ini', 'cfg', 'md', 'markdown', 'log'
    ]
    return textExtensions.includes(extension.toLowerCase())
  }

  isOfficeFile(extension) {
    const officeExtensions = [
      // Word 문서
      'doc', 'docx', 'hwp', 'hwpx', 'odt', 'rtf',
      // Excel 스프레드시트
      'xls', 'xlsx', 'xlsm', 'xlsb', 'ods',
      // PowerPoint 프레젠테이션
      'ppt', 'pptx', 'pptm', 'ppsx', 'odp'
    ]
    return officeExtensions.includes(extension.toLowerCase())
  }

  isVideoFile(extension) {
    const videoExtensions = [
      'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', '3gp', 'ogv'
    ]
    return videoExtensions.includes(extension.toLowerCase())
  }

  isAudioFile(extension) {
    const audioExtensions = [
      'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus', 'amr'
    ]
    return audioExtensions.includes(extension.toLowerCase())
  }

  isArchiveFile(extension) {
    const archiveExtensions = [
      'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'cab', 'iso'
    ]
    return archiveExtensions.includes(extension.toLowerCase())
  }

  isCodeFile(extension) {
    const codeExtensions = [
      'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'sass', 'less',
      'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift',
      'kt', 'scala', 'r', 'sql', 'sh', 'bat', 'ps1'
    ]
    return codeExtensions.includes(extension.toLowerCase())
  }

  // 초기 더미 데이터 생성 (개발용) - 다양한 파일 형식 예시
  initializeDummyData() {
    const existingFiles = this.getFiles()
    if (existingFiles.length > 0) return // 이미 데이터가 있으면 스킵

    const sampleExtensions = ['pdf', 'docx', 'xlsx', 'pptx', 'png', 'jpg', 'hwp', 'txt', 'mp4', 'zip']
    const sampleTypes = [
      'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/png', 'image/jpeg', 'application/x-hwp', 'text/plain', 'video/mp4', 'application/zip'
    ]
    const sampleReasons = ['참고자료', '업무문서', '회의자료', '발표자료', '이미지', '동영상', '압축파일', '한글문서', '텍스트', '참고자료']
    
    const dummyFiles = Array.from({ length: 15 }, (_, i) => {
      const ext = sampleExtensions[i % sampleExtensions.length]
      return {
        id: i + 1,
        name: `샘플파일_${i + 1}.${ext}`,
        size: Math.floor(Math.random() * 5000000) + 100000, // 100KB ~ 5MB
        type: sampleTypes[i % sampleTypes.length],
        extension: ext,
        reason: sampleReasons[i % sampleReasons.length],
        owner: ['홍길동', '김영희', '이철수', '박민수', '최디자', '이개발', '박디자인', '김분석'][i % 8],
        location: ['/docs/hr', '/docs/okr', '/reports/2025', '/slides', '/assets', '/media', '/archive', '/code'][i % 8],
        url: `https://via.placeholder.com/400x300/667eea/ffffff?text=Sample+${i + 1}`, // 플레이스홀더 이미지
        createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        lastModified: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
      }
    })

    this.saveFiles(dummyFiles)
  }
}

export default new FileService()
