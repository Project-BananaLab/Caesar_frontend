import React from 'react'

export default function SettingsModal({ open, onClose }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60
    }}>
      <div style={{ width: 720, maxWidth: '92vw', background: '#FFFFFF', borderRadius: 10, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>사용자 설정</div>
          <button onClick={onClose} style={{ padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, background: '#FFF', cursor: 'pointer', color: '#374151' }}>닫기</button>
        </div>

        {/* 내용 */}
        <div style={{ padding: 16 }}>
            {/* 계정 */}
            <section style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontWeight: 'bold', color: '#111827' }}>계정</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ width: 24, height: 24, border: '2px solid #D1D5DB', borderRadius: 4, background: '#FFF' }} />
                  <button style={{ width: 24, height: 24, border: '2px solid #D1D5DB', borderRadius: 4, background: '#FFF' }} />
                  <button style={{ width: 24, height: 24, border: '2px solid #D1D5DB', borderRadius: 4, background: '#FFF' }} />
                </div>
              </div>
              {['이름','생년월일','부서','직급','이메일','전화번호'].map((label) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 90, color: '#374151' }}>{label}</div>
                  <input style={{ flex: 1, padding: '8px 10px', border: '2px solid #D1D5DB', borderRadius: 6, color: '#374151' }} />
                </div>
              ))}
            </section>

            {/* 연동 설정 */}
            {[{t:'Notion'},{t:'Google'},{t:'Slack'}].map(({t}) => (
              <section key={t} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 'bold', color: '#111827' }}>{t}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ width: 24, height: 24, border: '2px solid #D1D5DB', borderRadius: 4, background: '#FFF' }} />
                    <button style={{ width: 24, height: 24, border: '2px solid #D1D5DB', borderRadius: 4, background: '#FFF' }} />
                    <button style={{ width: 24, height: 24, border: '2px solid #D1D5DB', borderRadius: 4, background: '#FFF' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 120, color: '#374151' }}>API Key</div>
                  <input placeholder={`${t} API Key`} style={{ flex: 1, padding: '8px 10px', border: '2px solid #D1D5DB', borderRadius: 6, color: '#374151' }} />
                </div>
              </section>
            ))}
        </div>
      </div>
    </div>
  )
}