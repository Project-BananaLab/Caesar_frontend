// SettingsModal.jsx
import React, { useEffect, useState } from "react";

export default function SettingsModal({ open, onClose }) {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    department: '',
    position: ''
  });
  const [loading, setLoading] = useState(false);
  
  // API 키 상태
  const [notionApi, setNotionApi] = useState('');
  const [slackApi, setSlackApi] = useState('');
  const [hasNotionApi, setHasNotionApi] = useState(false);
  const [hasSlackApi, setHasSlackApi] = useState(false);
  const [isNotionEditing, setIsNotionEditing] = useState(false);
  const [isSlackEditing, setIsSlackEditing] = useState(false);

  // 사용자 정보를 Backend에서 가져오는 함수
  const fetchUserInfo = async (googleUserId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/employees/me`, {
        method: 'GET',
        headers: {
          'Authorization': `GoogleAuth ${googleUserId}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        setUserInfo({
          name: userData.full_name || 'null',
          email: userData.email || 'null',
          department: userData.dept_name || 'null',
          position: userData.rank_name || 'null'
        });
        
        // API 키 존재 여부 설정
        setHasNotionApi(userData.has_notion_api === true);
        setHasSlackApi(userData.has_slack_api === true);
      } else {
        setUserInfo({
          name: 'null',
          email: 'null',
          department: 'null',
          position: 'null'
        });
        setHasNotionApi(false);
        setHasSlackApi(false);
      }
    } catch (error) {
      setUserInfo({
        name: 'null',
        email: 'null',
        department: 'null',
        position: 'null'
      });
      setHasNotionApi(false);
      setHasSlackApi(false);
    } finally {
      setLoading(false);
    }
  };

  // Notion API 키 편집 버튼 핸들러
  const handleNotionEdit = async () => {
    if (hasNotionApi) {
      const confirmed = window.confirm('기존의 notion API키가 삭제됩니다.');
      if (confirmed) {
        const success = await deleteNotionApi();
        if (success) {
          setIsNotionEditing(true);
          setNotionApi('');
          setHasNotionApi(false);
        }
      }
    } else {
      setIsNotionEditing(true);
      setNotionApi('');
    }
  };

  // Slack API 키 편집 버튼 핸들러
  const handleSlackEdit = async () => {
    if (hasSlackApi) {
      const confirmed = window.confirm('기존의 slack API키가 삭제됩니다.');
      if (confirmed) {
        const success = await deleteSlackApi();
        if (success) {
          setIsSlackEditing(true);
          setSlackApi('');
          setHasSlackApi(false);
        }
      }
    } else {
      setIsSlackEditing(true);
      setSlackApi('');
    }
  };

  // Notion API 키 삭제
  const deleteNotionApi = async () => {
    const savedAuth = sessionStorage.getItem('caesar_auth');
    if (!savedAuth) return false;

    try {
      const authData = JSON.parse(savedAuth);
      const googleUserId = authData.googleId;
      
      const response = await fetch(`http://127.0.0.1:8000/employees/${googleUserId}/api-keys`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notion_api: '' })
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Slack API 키 삭제
  const deleteSlackApi = async () => {
    const savedAuth = sessionStorage.getItem('caesar_auth');
    if (!savedAuth) return false;

    try {
      const authData = JSON.parse(savedAuth);
      const googleUserId = authData.googleId;
      
      const response = await fetch(`http://127.0.0.1:8000/employees/${googleUserId}/api-keys`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slack_api: '' })
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Notion API 키 저장
  const saveNotionApi = async () => {
    const savedAuth = sessionStorage.getItem('caesar_auth');
    if (!savedAuth) return;

    try {
      const authData = JSON.parse(savedAuth);
      const googleUserId = authData.googleId;
      
      const response = await fetch(`http://127.0.0.1:8000/employees/${googleUserId}/api-keys`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notion_api: notionApi })
      });
      
      if (response.ok) {
        setHasNotionApi(true);
        setIsNotionEditing(false);
        setNotionApi('');
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // Slack API 키 저장
  const saveSlackApi = async () => {
    const savedAuth = sessionStorage.getItem('caesar_auth');
    if (!savedAuth) return;

    try {
      const authData = JSON.parse(savedAuth);
      const googleUserId = authData.googleId;
      
      const response = await fetch(`http://127.0.0.1:8000/employees/${googleUserId}/api-keys`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slack_api: slackApi })
      });
      
      if (response.ok) {
        setHasSlackApi(true);
        setIsSlackEditing(false);
        setSlackApi('');
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 모달이 열릴 때 사용자 정보 로드
  useEffect(() => {
    if (open) {
      const savedAuth = sessionStorage.getItem('caesar_auth');
      
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          const googleUserId = authData.googleId;
          
          if (googleUserId) {
            fetchUserInfo(googleUserId);
          } else {
            setUserInfo({
              name: 'null',
              email: 'null',
              department: 'null',
              position: 'null'
            });
            setHasNotionApi(false);
            setHasSlackApi(false);
          }
        } catch (error) {
          setUserInfo({
            name: 'null',
            email: 'null',
            department: 'null',
            position: 'null'
          });
          setHasNotionApi(false);
          setHasSlackApi(false);
        }
      } else {
        setUserInfo({
          name: 'null',
          email: 'null',
          department: 'null',
          position: 'null'
        });
        setHasNotionApi(false);
        setHasSlackApi(false);
      }
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      // 모달이 닫힐 때 상태 초기화
      setIsNotionEditing(false);
      setIsSlackEditing(false);
      setNotionApi('');
      setSlackApi('');
      setUserInfo({
        name: '',
        email: '',
        department: '',
        position: ''
      });
      setHasNotionApi(false);
      setHasSlackApi(false);
      setLoading(false);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
      }}
    >
      <div
        style={{
          width: 720,
          maxWidth: "92vw",
          background: "#FFFFFF",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid #E5E7EB",
            background: "#F8FAFC",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: "bold", color: "#111827" }}>
            사용자 설정
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "6px 10px",
              border: "1px solid #CBD5E1",
              borderRadius: 6,
              background: "#FFF",
              cursor: "pointer",
              color: "#374151",
            }}
          >
            닫기
          </button>
        </div>

        {/* 내용 */}

        <div style={{ padding: "20px 40px 20px 40px" }}>
          {/* 계정 */}
          <section style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: "bold", color: "#111827" }}>계정</div>
            </div>
            {["이름", "이메일", "부서", "직급"].map(
              (label, index) => {
                const fieldMap = {
                  "이름": userInfo.name,
                  "이메일": userInfo.email,
                  "부서": userInfo.department,
                  "직급": userInfo.position
                };
                
                return (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ width: 90, color: "#374151" }}>{label}</div>
                    <input
                      value={loading ? "로딩 중..." : (fieldMap[label] || 'null')}
                      readOnly
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        border: "2px solid #D1D5DB",
                        borderRadius: 6,
                        color: "#374151",
                        backgroundColor: "#F9FAFB",
                        cursor: "not-allowed"
                      }}
                    />
                  </div>
                );
              }
            )}
          </section>


          {/* API 키 연동 설정 */}
          <section style={{ marginBottom: 16 }}>
            <div
              style={{
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 16,
                fontSize: "16px"
              }}
            >
              API 키 설정
            </div>
            
            {/* Notion API */}
            <div style={{ marginBottom: 16, padding: "12px", border: "1px solid #E5E7EB", borderRadius: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: "600", color: "#374151" }}>Notion API</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {!isNotionEditing ? (
                    <button
                      onClick={handleNotionEdit}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #3B82F6",
                        borderRadius: 4,
                        background: "#3B82F6",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      편집
                    </button>
                  ) : (
                    <button
                      onClick={saveNotionApi}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #10B981",
                        borderRadius: 4,
                        background: "#10B981",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      저장
                    </button>
                  )}
                </div>
              </div>
              <input
                value={isNotionEditing ? notionApi : (hasNotionApi ? 'API가 저장되었습니다' : '저장된 API키가 없습니다')}
                onChange={(e) => setNotionApi(e.target.value)}
                placeholder={isNotionEditing ? "Notion API Key를 입력하세요" : ""}
                readOnly={!isNotionEditing}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "2px solid #D1D5DB",
                  borderRadius: 6,
                  color: "#374151",
                  backgroundColor: isNotionEditing ? "#FFFFFF" : "#F9FAFB",
                  cursor: isNotionEditing ? "text" : "not-allowed",
                  boxSizing: "border-box"
                }}
              />
            </div>
            
            {/* Slack API */}
            <div style={{ marginBottom: 16, padding: "12px", border: "1px solid #E5E7EB", borderRadius: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: "600", color: "#374151" }}>Slack API</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {!isSlackEditing ? (
                    <button
                      onClick={handleSlackEdit}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #3B82F6",
                        borderRadius: 4,
                        background: "#3B82F6",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      편집
                    </button>
                  ) : (
                    <button
                      onClick={saveSlackApi}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #10B981",
                        borderRadius: 4,
                        background: "#10B981",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      저장
                    </button>
                  )}
                </div>
              </div>
              <input
                value={isSlackEditing ? slackApi : (hasSlackApi ? 'API가 저장되었습니다' : '저장된 API키가 없습니다')}
                onChange={(e) => setSlackApi(e.target.value)}
                placeholder={isSlackEditing ? "Slack API Key를 입력하세요" : ""}
                readOnly={!isSlackEditing}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "2px solid #D1D5DB",
                  borderRadius: 6,
                  color: "#374151",
                  backgroundColor: isSlackEditing ? "#FFFFFF" : "#F9FAFB",
                  cursor: isSlackEditing ? "text" : "not-allowed",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
