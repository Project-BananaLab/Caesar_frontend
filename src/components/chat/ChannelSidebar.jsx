import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BsGear } from "react-icons/bs";
import { FaRegTrashAlt } from "react-icons/fa";
import { HiOutlinePencil } from "react-icons/hi2";
import { isAdmin } from "../../entities/user/constants";
import "../../assets/styles/ChannelSidebar.css";
import { VscSignOut } from "react-icons/vsc";

export default function ChannelSidebar({
  conversations = [],
  currentId,
  onSelect,
  onNewChat,
  onDelete,
  onRename,
  user,
  onLogout,
  onOpenSettings,
  onSearchInChat,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastFirstConversationId, setLastFirstConversationId] = useState(null);
  const [openTrashMenu, setOpenTrashMenu] = useState(false);
  const [openTrashModal, setOpenTrashModal] = useState(false);
  const trashMenuRef = useRef(null);

  const CONVERSATIONS_PER_PAGE = 10;

  // 검색 쿼리가 변경되면 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // 대화 순서가 바뀔 때만 페이지를 1로 리셋
  useEffect(() => {
    if (conversations.length > 0) {
      const currentFirstId = conversations[0]?.id;
      if (
        lastFirstConversationId &&
        lastFirstConversationId !== currentFirstId
      ) {
        setCurrentPage(1);
      }
      setLastFirstConversationId(currentFirstId);
    }
  }, [conversations, lastFirstConversationId]);

  // 휴지통 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        trashMenuRef.current &&
        !trashMenuRef.current.contains(event.target)
      ) {
        setOpenTrashMenu(false);
      }
    };

    if (openTrashMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openTrashMenu]);

  // 검색 필터링 및 하이라이트
  const filteredConversations = searchQuery
    ? conversations.filter((conv) => {
        const titleMatch = conv.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const previewMatch = conv.preview
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

        // 메시지 내용 검색
        const contentMatch = conv.messages?.some((msg) =>
          msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // 매치 위치 표시를 위한 속성 추가
        if (contentMatch && !titleMatch && !previewMatch) {
          conv._searchMatch = "content";
        } else {
          delete conv._searchMatch;
        }

        return titleMatch || previewMatch || contentMatch;
      })
    : (() => {
        // 검색어가 없을 때 모든 대화의 _searchMatch 속성 제거
        conversations.forEach((conv) => {
          delete conv._searchMatch;
        });
        return conversations;
      })();

  // 페이징 계산
  const totalPages = Math.ceil(
    filteredConversations.length / CONVERSATIONS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * CONVERSATIONS_PER_PAGE;
  const paginatedConversations = filteredConversations.slice(
    startIndex,
    startIndex + CONVERSATIONS_PER_PAGE
  );

  // 현재 페이지에 대화가 없으면 이전 페이지로 이동
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

  const handleSearchInChat = (query) => {
    if (onSearchInChat) {
      onSearchInChat(query);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (onSearchInChat) {
      onSearchInChat("");
    }
    // 검색 종료 시 모든 대화의 _searchMatch 속성 제거
    conversations.forEach((conv) => {
      delete conv._searchMatch;
    });
  };

  // 휴지통 관련 핸들러 (나중에 백엔드 API 연결 준비)
  const handleTrashManage = () => {
    setOpenTrashMenu(false);
    setOpenTrashModal(true);
  };

  const handleTrashEmpty = () => {
    if (
      window.confirm("휴지통을 비우시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    ) {
      // TODO: 백엔드 휴지통 비우기 API 연결
      console.log("휴지통 비우기 API 호출 예정");
      alert("휴지통 기능은 준비 중입니다.");
    }
    setOpenTrashMenu(false);
  };

  return (
    <div className="channel-sidebar">
      <div className="channel-header">
        <div className="channel-user-info">
          <div className="channel-user-avatar">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="channel-user-details">
            <div className="channel-user-name">
              {user?.username || "Unknown"}
            </div>
            <div className="channel-user-role">
              {user?.dept_name || (isAdmin(user) ? "관리자" : "사용자")}

            </div>
          </div>
        </div>
        <div className="channel-header-actions">
          {isAdmin(user) && location.pathname !== "/admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="channel-admin-button"
              title="관리자 페이지"
            >
              관리자
            </button>
          )}
          <button onClick={onLogout} className="channel-logout-button">
            <VscSignOut size={18} color="#f1f1f1" />
          </button>
        </div>
      </div>

      <div className="channel-search-container">
        <div className="channel-search-input-wrapper">
          <input
            type="text"
            placeholder="대화 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="channel-search-input"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="channel-search-clear-button"
              title="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="channel-conversations">
        <div className="channel-conversations-header">
          <button
            onClick={() => {
              // 새 대화 생성 시 검색 초기화
              if (searchQuery) {
                setSearchQuery("");
                if (onSearchInChat) {
                  onSearchInChat("");
                }
              }
              onNewChat();
            }}
            className="channel-new-button"
          >
            + 새 대화
          </button>
          <span className="channel-conversations-count">
            {filteredConversations.length}개
          </span>
        </div>

        <div className="channel-conversations-list">
          {paginatedConversations.map((conv) => (
            <div
              key={conv.id}
              className={`channel-conversation-item ${
                conv.id === currentId ? "active" : ""
              }`}
              onClick={() => {
                onSelect(conv.id);
                // 내용 검색이었다면 채팅에서도 검색 (검색어가 유효할 때만)
                if (
                  conv._searchMatch === "content" &&
                  searchQuery &&
                  searchQuery.trim()
                ) {
                  handleSearchInChat(searchQuery);
                }
              }}
            >
              <div className="channel-conversation-content">
                <div className="channel-conversation-title">
                  {highlightSearchTerm(conv.title, searchQuery)}
                  {conv._searchMatch === "content" && (
                    <span className="channel-content-match-badge">내용</span>
                  )}
                </div>
                {conv.preview && (
                  <div className="channel-conversation-preview">
                    {highlightSearchTerm(conv.preview, searchQuery)}
                  </div>
                )}
              </div>
              <div className="channel-conversation-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newTitle = prompt(
                      "새 제목을 입력하세요:",
                      conv.title
                    );
                    if (newTitle && newTitle.trim()) {
                      onRename(conv.id, newTitle.trim());
                    }
                  }}
                  className="channel-conversation-action-button"
                  title="이름 변경"
                >
                  <HiOutlinePencil size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="channel-conversation-action-button"
                  title="삭제"
                >
                  <FaRegTrashAlt size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 페이징 */}
        {totalPages > 1 && (
          <div className="channel-pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="channel-pagination-button"
            >
              이전
            </button>
            <span className="channel-pagination-info">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="channel-pagination-button"
            >
              다음
            </button>
          </div>
        )}

        {/* 구분선 */}
        <div className="channel-divider"></div>

        {/* 하단 액션 섹션 */}
        <div className="channel-bottom-actions">
          {/* 설정 섹션 */}
          {location.pathname !== "/admin" && (
            <div className="channel-settings-section">
              <button
                onClick={onOpenSettings}
                className="channel-settings-button"
                title="설정"
              >
                <BsGear size={18} />
              </button>
            </div>
          )}

          {/* 휴지통 섹션 (API 연결 준비) */}
          <div className="channel-trash-section">
            <div className="channel-trash-menu-container" ref={trashMenuRef}>
              <button
                onClick={() => setOpenTrashMenu(!openTrashMenu)}
                className="channel-trash-button"
              >
                휴지통
              </button>

              {openTrashMenu && (
                <div className="channel-trash-menu">
                  <button
                    onClick={handleTrashManage}
                    className="channel-trash-menu-item"
                  >
                    관리
                  </button>
                  <button
                    onClick={handleTrashEmpty}
                    className="channel-trash-menu-item"
                  >
                    비우기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 휴지통 모달 (API 연결 준비) */}
      {openTrashModal && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
            onClick={() => setOpenTrashModal(false)}
          />
          <div
            className="trash-modal-placeholder"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
            }}
          >
            <h3>휴지통 관리</h3>
            <p>휴지통 기능은 준비 중입니다.</p>
            <p>백엔드 API 연결 후 사용 가능합니다.</p>
            <button
              onClick={() => setOpenTrashModal(false)}
              style={{
                padding: "8px 16px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
