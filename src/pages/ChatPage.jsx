import React, { useState, useEffect } from "react";
import ChannelSidebar from "../components/chat/ChannelSidebar";
import Header from "../components/chat/Header";
import ChatMessageList from "../components/chat/ChatMessageList";
import ChatComposer from "../components/chat/ChatComposer";
import PreviewPanel from "../components/PreviewPanel";
import SettingsModal from "../components/SettingsModal";
import IntegrationModal from "../components/admin/IntegrationModal";
import {
  saveConversations,
  loadConversations,
  saveCurrentChatId,
  loadCurrentChatId,
  moveToTrash,
} from "../entities/conversation/storage";
import agentService from "../shared/api/agentService";
import "../assets/styles/ChatPage.css";

import { MAX_CONVERSATIONS } from "../entities/conversation/constants";

export default function ChatPage({ user, onLogout, onAgentModeChange }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState("default");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [openIntegrations, setOpenIntegrations] = useState(false);
  const [searchInChat, setSearchInChat] = useState("");
  const [searchMatches, setSearchMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (searchInChat && searchMatches.length > 0) {
        if (e.key === "F3" || (e.ctrlKey && e.key === "g")) {
          e.preventDefault();
          // 다음 검색 결과로 이동
          setCurrentMatchIndex((prev) =>
            prev < searchMatches.length - 1 ? prev + 1 : 0
          );
        } else if (
          (e.key === "F3" && e.shiftKey) ||
          (e.ctrlKey && e.shiftKey && e.key === "G")
        ) {
          e.preventDefault();
          // 이전 검색 결과로 이동
          setCurrentMatchIndex((prev) =>
            prev > 0 ? prev - 1 : searchMatches.length - 1
          );
        } else if (e.key === "Escape") {
          // 검색 종료
          setSearchInChat("");
          setSearchMatches([]);
          setCurrentMatchIndex(-1);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchInChat, searchMatches.length]);

  // 컴포넌트 마운트 시 저장된 대화 불러오기
  useEffect(() => {
    if (!user?.username) return;

    const savedConversations = loadConversations(user.username);
    const savedCurrentId = loadCurrentChatId(user.username);

    if (savedConversations.length > 0) {
      setConversations(savedConversations);
    }

    if (savedCurrentId && savedCurrentId !== "default") {
      setCurrentId(savedCurrentId);
      const currentConv = savedConversations.find(
        (c) => c.id === savedCurrentId
      );
      if (currentConv) {
        setMessages(currentConv.messages || []);
        agentService.loadConversationHistory(currentConv.messages || []);
      }
    }
  }, [user]);

  // 대화 목록이 변경될 때마다 저장
  useEffect(() => {
    if (conversations.length > 0 && user?.username) {
      saveConversations(conversations, user.username);
    }
  }, [conversations, user]);

  // 현재 대화 ID가 변경될 때마다 저장
  useEffect(() => {
    if (currentId !== "default" && user?.username) {
      saveCurrentChatId(currentId, user.username);
    }
  }, [currentId, user]);

  // 새 대화 시작
  function startNewChat() {
    // 30개 제한 체크
    if (conversations.length >= MAX_CONVERSATIONS) {
      alert(
        `최대 ${MAX_CONVERSATIONS}개의 대화만 생성할 수 있습니다.\n\n프리미엄 구독을 하시면 더 많은 대화를 생성할 수 있습니다! 🎆`
      );
      return;
    }

    const id = `conv_${Date.now()}`;
    const chatNumber = conversations.length + 1;
    const newConversation = {
      id,
      title: `새 대화 ${chatNumber}`,
      preview: "",
      messages: [],
      lastMessageTime: new Date().toISOString(),
    };

    setConversations((prev) => {
      const updated = [newConversation, ...prev];
      if (user?.username) {
        saveConversations(updated, user.username);
      }
      return updated;
    });
    setCurrentId(id);
    setMessages([]);
    agentService.clearConversationHistory(user?.username || "default");
  }

  // 대화 선택
  function selectChat(id) {
    setCurrentId(id);
    const conv = conversations.find((c) => c.id === id);
    // 빈 메시지 필터링
    const validMessages = (conv?.messages || []).filter(
      (msg) => msg.text && msg.text.trim()
    );
    setMessages(validMessages);

    if (conv) {
      agentService.loadConversationHistory(validMessages);
    }
  }

  // 대화 삭제 (휴지통으로 이동)
  function deleteChat(id) {
    const conversationToDelete = conversations.find((c) => c.id === id);
    if (!conversationToDelete) return;

    // 삭제 확인
    if (
      !window.confirm(
        `"${conversationToDelete.title}" 대화를 삭제하시겠습니까?\n\n휴지통에서 복구할 수 있습니다.`
      )
    ) {
      return;
    }

    // 휴지통으로 이동
    const success = moveToTrash(conversationToDelete, user?.username);
    if (!success) {
      alert("대화 삭제에 실패했습니다.");
      return;
    }

    // 대화 목록에서 제거
    setConversations((list) => {
      const updated = list.filter((c) => c.id !== id);
      if (user?.username) {
        saveConversations(updated, user.username);
      }
      return updated;
    });

    // 현재 대화가 삭제된 경우 기본 대화로 전환
    if (currentId === id) {
      setCurrentId("default");
      setMessages([]);
      agentService.clearConversationHistory(user?.username || "default");
      if (user?.username) {
        saveCurrentChatId("default", user.username);
      }
    }
  }

  // 대화 이름 변경 (새로운 제목을 매개변수로 받음)
  function renameChat(id, newTitle) {
    if (!newTitle || !newTitle.trim()) return;

    const truncatedTitle =
      newTitle.length > 20 ? newTitle.substring(0, 20) : newTitle;
    setConversations((list) => {
      const updated = list.map((c) =>
        c.id === id ? { ...c, title: truncatedTitle } : c
      );
      if (user?.username) {
        saveConversations(updated, user.username);
      }
      return updated;
    });
  }

  // 휴지통에서 대화 복구
  function restoreChat(restoredConversation) {
    setConversations((list) => {
      const updated = [restoredConversation, ...list];
      if (user?.username) {
        saveConversations(updated, user.username);
      }
      return updated;
    });
  }

  // 대화 목록 정렬 (최근 메시지 시간순)
  const sortedConversations = [...conversations].sort((a, b) => {
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
  });

  async function handleSend() {
    // 빈 텍스트 검사
    if (!input || !input.trim() || busy) {
      if (!input || !input.trim()) {
        alert("질문을 입력해주세요.");
      }
      return;
    }

    // 사용자 입력을 변수에 저장하고 즉시 입력창 비우기
    const userInput = input.trim();
    setInput("");
    setBusy(true);

    const userMsg = {
      role: "user",
      text: userInput,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);

    let conversationId = currentId;

    // 첫 메시지이고 기본 대화인 경우 새 대화 생성
    if (currentId === "default" && messages.length === 0) {
      // 30개 제한 체크
      if (conversations.length >= MAX_CONVERSATIONS) {
        alert(
          `최대 ${MAX_CONVERSATIONS}개의 대화만 생성할 수 있습니다.\n\n프리미엄 구독을 하시면 더 많은 대화를 생성할 수 있습니다! 🎆`
        );
        setBusy(false);
        // 입력창은 이미 비워졌으므로 복원하지 않음
        return;
      }

      conversationId = `conv_${Date.now()}`;
      const chatNumber = conversations.length + 1;
      const newConversation = {
        id: conversationId,
        title: `새 대화 ${chatNumber}`,
        preview: "",
        messages: [],
        lastMessageTime: new Date().toISOString(),
      };
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentId(conversationId);
    }

    try {
      console.log("💬 에이전트에게 질문 보내는 중:", userInput);
      const result = await agentService.processMessage(
        userInput,
        user?.username || "default"
      );
      console.log("🤖 에이전트 응답 받음:", result);

      const botMsg = {
        role: "assistant",
        text: result.response,
        conversationId: result.conversationId,
        timestamp: new Date().toISOString(),
      };
      console.log("📝 봇 메시지 생성:", botMsg);
      console.log("📝 응답 길이:", result.response?.length);
      console.log("📝 응답 내용 미리보기:", result.response?.substring(0, 100));

      setMessages((m) => [...m, botMsg]);

      // 대화 목록 업데이트
      setConversations((list) => {
        const updated = list.map((c) => {
          if (c.id === conversationId) {
            // 빈 메시지 필터링 후 업데이트
            const validMessages = [
              ...(c.messages || []),
              userMsg,
              botMsg,
            ].filter((msg) => msg.text && msg.text.trim());
            return {
              ...c,
              messages: validMessages,
              preview:
                botMsg.text.length > 24
                  ? botMsg.text.substring(0, 24) + "..."
                  : botMsg.text,
              lastMessageTime: new Date().toISOString(),
            };
          }
          return c;
        });

        // 최근 메시지 시간순으로 정렬
        return updated.sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );
      });
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `오류: ${e?.message || e}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-page">
      <ChannelSidebar
        conversations={sortedConversations}
        onNewChat={startNewChat}
        onSelect={selectChat}
        onDelete={deleteChat}
        onRename={renameChat}
        currentId={currentId}
        user={user}
        onLogout={onLogout}
        onOpenSettings={() => setOpenSettings(true)}
        onSearchInChat={(query) => {
          // 빈 검색어는 무시
          if (!query || !query.trim()) {
            setSearchInChat("");
            setSearchMatches([]);
            setCurrentMatchIndex(-1);
            return;
          }

          setSearchInChat(query);
          // 검색어가 있으면 메시지에서 매치 찾기
          const matches = [];
          messages.forEach((message, messageIndex) => {
            if (
              message.text &&
              message.text.toLowerCase().includes(query.toLowerCase())
            ) {
              matches.push({ messageIndex, message });
            }
          });
          setSearchMatches(matches);
          setCurrentMatchIndex(matches.length > 0 ? 0 : -1);
        }}
        onRestore={restoreChat}
      />
      <div className="chat-main">
        <Header
          logo="/caesar_logo_hori.png"
          status={busy ? "thinking…" : "connected"}
          onAgentModeChange={(newMode) => {
            // 에이전트 모드 변경 시 대화 내역 유지
            // agentService는 내부적으로 대화 내역을 유지하므로 별도 처리 불필요
            if (onAgentModeChange) {
              onAgentModeChange(newMode);
            }
          }}
        />
        <ChatMessageList
          messages={messages}
          onPreview={(url) => setPreviewUrl(url)}
          searchQuery={searchInChat}
          searchMatches={searchMatches}
          currentMatchIndex={currentMatchIndex}
          isLoading={busy}
        />

        {/* 검색 네비게이션 컨트롤 */}
        {searchInChat && searchMatches.length > 0 && (
          <div className="search-navigation">
            <div className="search-info">
              <div>
                "{searchInChat}" 검색 결과: {currentMatchIndex + 1} /{" "}
                {searchMatches.length}
              </div>
              <div
                style={{ fontSize: "11px", color: "#A16207", marginTop: "2px" }}
              >
                F3: 다음 | Shift+F3: 이전 | ESC: 종료
              </div>
            </div>
            <div className="search-controls">
              <button
                onClick={() =>
                  setCurrentMatchIndex((prev) =>
                    prev > 0 ? prev - 1 : searchMatches.length - 1
                  )
                }
                className="search-nav-button"
                title="이전 검색 결과"
              >
                ↑
              </button>
              <button
                onClick={() =>
                  setCurrentMatchIndex((prev) =>
                    prev < searchMatches.length - 1 ? prev + 1 : 0
                  )
                }
                className="search-nav-button"
                title="다음 검색 결과"
              >
                ↓
              </button>
              <button
                onClick={() => {
                  setSearchInChat("");
                  setSearchMatches([]);
                  setCurrentMatchIndex(-1);
                }}
                className="search-close-button"
                title="검색 종료"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <ChatComposer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={busy}
        />
      </div>
      {previewUrl && (
        <PreviewPanel url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
      <SettingsModal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
      <IntegrationModal
        open={openIntegrations}
        onClose={() => setOpenIntegrations(false)}
      />
    </div>
  );
}
