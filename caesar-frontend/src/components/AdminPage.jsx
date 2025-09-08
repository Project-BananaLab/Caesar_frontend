import React, { useMemo, useRef, useState } from 'react'

const dummyFiles = [
  { id: 1, name: '회사_휴가규정.pdf', reason: '내가 열어본 파일', owner: '홍길동', location: '/docs/hr', url: 'https://example.com/file1.pdf', type: 'pdf' },
  { id: 2, name: 'OKR_정리.docx', reason: '내가 수정함', owner: '김영희', location: '/docs/okr', url: 'https://example.com/file2.docx', type: 'doc' },
  { id: 3, name: '월간_보고서.xlsx', reason: '참고자료', owner: '이철수', location: '/reports/2025', url: 'https://example.com/file3.xlsx', type: 'xls' },
  { id: 4, name: 'PT_초안.pptx', reason: '발표자료', owner: '박민수', location: '/slides', url: 'https://example.com/file4.pptx', type: 'ppt' },
  { id: 5, name: '샘플이미지.png', reason: '디자인', owner: '최디자', location: '/assets', url: 'https://example.com/img.png', type: 'png' },
]

const typeEmoji = { pdf:'📄', doc:'📝', xls:'📊', ppt:'📈', png:'🖼️', jpg:'🖼️' }

export default function AdminPage({ onPreview, onOpenIntegrations }) {
  const [isDragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  function onDrop(e) {
    e.preventDefault(); setDragging(false)
    // 실제 업로드 처리 대신 목록만 유지
    alert(`${e.dataTransfer.files.length}개 파일 드롭됨 (데모)`)
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 12 }}>관리자님 환영합니다!</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 14, color: '#334155' }}>파일 업로드</div>
        <button onClick={onOpenIntegrations} style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, background: '#FFF', cursor: 'pointer' }}>API 연동하기</button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          background: isDragging ? '#EEF2FF' : '#F8FAFC',
          border: '2px dashed #A5B4FC',
          padding: 24,
          borderRadius: 10,
          textAlign: 'center',
          marginBottom: 16,
          cursor: 'pointer'
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>📁</div>
        <div>여기로 드래그하거나 클릭해서 파일을 선택하세요</div>
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} />
      </div>

      <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', background: '#F3F4F6', padding: '10px 12px', fontWeight: 'bold' }}>
          <div>이름</div>
          <div>추천 이유</div>
          <div>소유자</div>
          <div>위치</div>
        </div>
        {dummyFiles.map(f => (
          <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '10px 12px', borderTop: '1px solid #E5E7EB' }}>
            <div>
              <button onClick={() => onPreview?.(f.url)} style={{ background: 'transparent', border: 'none', color: '#2563EB', cursor: 'pointer' }}>
                <span style={{ marginRight: 6 }}>{typeEmoji[f.type] || '📎'}</span>
                {f.name}
              </button>
            </div>
            <div>{f.reason}</div>
            <div>{f.owner}</div>
            <div>{f.location}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
