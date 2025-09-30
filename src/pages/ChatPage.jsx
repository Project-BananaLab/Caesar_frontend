import React, { useState, useEffect } from "react";
import ChannelSidebar from "../components/chat/ChannelSidebar";
import Header from "../components/chat/Header";
import ChatMessageList from "../components/chat/ChatMessageList";
import ChatComposer from "../components/chat/ChatComposer";
import PreviewPanel from "../components/PreviewPanel";
import SettingsModal from "../components/SettingsModal";
import IntegrationModal from "../components/admin/IntegrationModal";
import agentService from "../shared/api/agentService";
import { getChannels } from "../shared/api/channel";
import {
  getChatsByChannel,
  createChat,
  updateChat,
  deleteChat,
  getOrCreateUserChannel,
} from "../shared/api/chat";
import "../assets/styles/ChatPage.css";
import ReactMarkdown from "react-markdown";

export default function ChatPage({ user, onLogout }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState("default");
  const [currentChannelId, setCurrentChannelId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [openIntegrations, setOpenIntegrations] = useState(false);
  const [searchInChat, setSearchInChat] = useState("");
  const [searchMatches, setSearchMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [employeeId, setEmployeeId] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);

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

  // 백엔드에서 대화 로드하는 함수
  const loadConversationsFromBackend = async (targetEmployeeId) => {
    if (!targetEmployeeId) {
      console.log("📝 employeeId 없음 - 대화 로드 생략");
      return;
    }

    try {
      console.log("🔄 백엔드에서 대화 데이터 로드 시작:", targetEmployeeId);

      // 1. 사용자의 채널 목록 가져오기
      const channelsData = await getChannels(targetEmployeeId);
      console.log("✅ 채널 목록 로드:", channelsData);

      if (!channelsData.channels || channelsData.channels.length === 0) {
        console.log("📝 채널이 없음 - 첫 메시지 전송 시 생성됨");
        return;
      }

      // 2. 첫 번째 채널의 채팅 목록 가져오기
      const firstChannel = channelsData.channels[0];
      setCurrentChannelId(firstChannel.id);

      const chatsData = await getChatsByChannel(firstChannel.id);
      console.log("✅ 채팅 목록 로드:", chatsData);

      // 3. 백엔드 채팅 데이터를 프론트엔드 대화 형식으로 변환
      // chatsData.chats가 없거나 빈 배열인 경우 처리
      if (!chatsData.chats || chatsData.chats.length === 0) {
        console.log("📝 채팅 데이터가 없음");
        return;
      }

      const backendConversations = chatsData.chats.map((chat) => {
        // chat.messages가 없는 경우 빈 배열로 처리
        const messages = (chat.messages || []).map((msg, index) => ({
          id: `${chat.id}_${msg.role}_${index}`,
          text: msg.content,
          role: msg.role === "agent" ? "assistant" : msg.role,
          chatId: chat.id,
          timestamp: chat.created_at || new Date().toISOString(),
        }));

        // 첫 번째 사용자 메시지를 제목으로 사용
        const firstUserMessage = messages.find((msg) => msg.role === "user");
        const title = generateTitleFromMessage(firstUserMessage?.text, chat.id);

        return {
          id: `chat_${chat.id}`,
          chatId: chat.id, // 백엔드 채팅 ID 저장
          title: title,
          preview:
            messages.length > 0
              ? messages[messages.length - 1].text.length > 24
                ? messages[messages.length - 1].text.substring(0, 24) + "..."
                : messages[messages.length - 1].text
              : "",
          messages: messages,
          lastMessageTime: chat.created_at || new Date().toISOString(),
        };
      });

      setConversations(backendConversations);

      // 4. 가장 최근 대화를 현재 대화로 설정
      if (backendConversations.length > 0) {
        const mostRecent = backendConversations[0];
        setCurrentId(mostRecent.id);
        setMessages(mostRecent.messages || []);
        agentService.loadConversationHistory(mostRecent.messages || []);
        console.log("✅ 최근 대화 복구:", mostRecent.title);
      }

      console.log("✅ 새로고침 후 대화 데이터 복구 완료");
    } catch (error) {
      console.error("❌ 대화 로드 실패:", error);
    }
  };

  // user 변경 시 employeeId 추출 및 저장
  useEffect(() => {
    if (user?.employeeId) {
      console.log("✅ 사용자 정보에서 employeeId 추출:", user.employeeId);
      setEmployeeId(user.employeeId);
      localStorage.setItem("employee_id", user.employeeId.toString());
    } else {
      // 사용자 정보가 없으면 localStorage에서 복원 시도
      const storedEmployeeId = localStorage.getItem("employee_id");
      if (storedEmployeeId) {
        console.log("✅ localStorage에서 employeeId 복원:", storedEmployeeId);
        setEmployeeId(parseInt(storedEmployeeId));
      } else {
        console.log("📝 employeeId 정보 없음");
        setEmployeeId(null);
      }
    }
  }, [user]);

  // employeeId 변경 시 대화 데이터 로드
  useEffect(() => {
    if (employeeId) {
      console.log("🔄 employeeId 변경됨 - 대화 데이터 로드:", employeeId);
      loadConversationsFromBackend(employeeId);
    } else {
      console.log("📝 employeeId 없음 - 대화 데이터 로드 생략");
      setConversations([]);
      setMessages([]);
      setCurrentId("default");
      setCurrentChannelId(null);
    }
  }, [employeeId]);

  // 제목 생성 헬퍼 함수
  const generateTitleFromMessage = (messageText, fallbackId = null) => {
    const titleText =
      messageText || (fallbackId ? `대화 ${fallbackId}` : "새 대화");
    return titleText.length > 30
      ? titleText.substring(0, 30) + "..."
      : titleText;
  };

  // 새 대화 시작 (백엔드에는 첫 메시지 전송 시 생성)
  function startNewChat() {
    // 임시 대화 ID 생성 (실제 백엔드 채팅은 첫 메시지 전송 시 생성)
    const id = `temp_${Date.now()}`;
    setCurrentId(id);
    setMessages([]);
    setIsNewChat(true);
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
    }
  }

  // 대화 삭제 (백엔드에서 완전 삭제)
  async function deleteChatFromBackend(id) {
    const conversationToDelete = conversations.find((c) => c.id === id);
    if (!conversationToDelete) return;

    // 삭제 확인
    if (
      !window.confirm(
        `"${conversationToDelete.title}" 대화를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    try {
      // 백엔드에서 채팅 삭제
      if (conversationToDelete.chatId) {
        await deleteChat(conversationToDelete.chatId);
      }

      // 대화 목록에서 제거
      setConversations((list) => list.filter((c) => c.id !== id));

      // 현재 대화가 삭제된 경우 기본 대화로 전환
      if (currentId === id) {
        setCurrentId("default");
        setMessages([]);
        agentService.clearConversationHistory(user?.username || "default");
      }

      console.log("✅ 대화 삭제 완료");
    } catch (error) {
      console.error("❌ 대화 삭제 실패:", error);
      alert("대화 삭제에 실패했습니다.");
    }
  }

  // 대화 이름 변경 (로컬 상태만 변경, 백엔드 업데이트는 필요시 추가)
  function renameChat(id, newTitle) {
    if (!newTitle || !newTitle.trim()) return;

    const truncatedTitle =
      newTitle.length > 20 ? newTitle.substring(0, 20) : newTitle;
    setConversations((list) =>
      list.map((c) => (c.id === id ? { ...c, title: truncatedTitle } : c))
    );
  }

  // 휴지통 기능 제거 (백엔드 직접 삭제 방식 사용)

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

    try {
      // 임시 사용자 메시지 표시
      const tempUserMsg = {
        id: `temp_user_${Date.now()}`,
        role: "user",
        text: userInput,
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, tempUserMsg]);

      // AI 응답과 함께 백엔드에 채팅 저장
      console.log("💬 백엔드에 메시지 전송 중:", userInput);

      // Agent 서비스로 AI 응답 받기
      console.log("💬 에이전트에게 질문 보내는 중:", userInput);
      console.log("🔍 현재 사용자 정보:", user);
      const userId =
        user?.google_user_id || user?.googleId || user?.username || "default";
      console.log("🆔 에이전트에 전달할 User ID:", userId);
      const agentResult = await agentService.processMessage(userInput, userId);
      console.log("🤖 에이전트 응답 받음:", agentResult);

      // 백엔드에 채팅 저장 (사용자 질문 + AI 응답)
      const chatMessages = [
        { role: "user", content: userInput },
        { role: "agent", content: agentResult.response },
      ];

      let updatedChat;

      // 기존 대화인지 새 대화인지 확인
      const currentConversation = conversations.find((c) => c.id === currentId);

      if (currentConversation && currentConversation.chatId) {
        // 백엔드는 기존 메시지에 새 메시지를 추가하므로, 새 메시지만 보냄
        const newMessages = [
          { role: "user", content: userInput },
          { role: "agent", content: agentResult.response },
        ];

        console.log("📝 기존 채팅에 메시지 추가:", currentConversation.chatId);
        updatedChat = await updateChat(currentConversation.chatId, newMessages);
      } else if (isNewChat) {
        console.log("📝 새로운 채팅 생성:", isNewChat);
        const finalChannelId =
          currentChannelId || (await getOrCreateUserChannel());
        updatedChat = await createChat(finalChannelId, chatMessages);
        setIsNewChat(false); //한 번 생성 후 다시 생성하지 않도록 설정
      } else {
        console.log("📝 새로운 채팅 생성:", isNewChat);
        return;
      }

      // UI 메시지 형식으로 변환
      const finalMessages = updatedChat.messages.map((msg, index) => ({
        id: `${updatedChat.id}_${msg.role}_${index}`,
        text: msg.content,
        role: msg.role === "agent" ? "assistant" : msg.role,
        chatId: updatedChat.id,
        timestamp: updatedChat.created_at || new Date().toISOString(),
      }));

      // 기존 대화 업데이트 또는 새 대화 생성
      if (currentConversation && currentConversation.chatId) {
        // 기존 대화 업데이트: 전체 메시지로 교체
        setMessages(finalMessages);

        // conversations 목록에서 해당 대화 업데이트
        const updatedConversation = {
          ...currentConversation,
          messages: finalMessages,

          preview:
            agentResult.response.length > 24
              ? agentResult.response.substring(0, 24) + "..."
              : agentResult.response,

          lastMessageTime: updatedChat.created_at || new Date().toISOString(),
        };

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === currentId ? updatedConversation : c
          );

          return updated.sort(
            (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
          );
        });
      } else {
        // 새 대화 생성
        // 임시 메시지 제거하고 실제 메시지들로 교체
        setMessages((prev) => {
          const withoutTemp = prev.filter((msg) => !msg.id.startsWith("temp_"));
          return [...withoutTemp, ...finalMessages];
        });

        // 첫 번째 사용자 메시지를 제목으로 사용
        const title = generateTitleFromMessage(userInput);

        const newConversation = {
          id: `chat_${updatedChat.id}`,
          chatId: updatedChat.id,
          title: title,
          preview:
            agentResult.response.length > 24
              ? agentResult.response.substring(0, 24) + "..."
              : agentResult.response,
          messages: finalMessages,
          lastMessageTime: updatedChat.created_at || new Date().toISOString(),
        };

        setConversations((prev) => [newConversation, ...prev]);
        setCurrentId(newConversation.id);
      }
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error);
      // 오류 메시지 표시
      setMessages((m) => [
        ...m.filter((msg) => !msg.id.startsWith("temp_")),
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          text: `오류: ${error?.message || error}`,
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
        onDelete={deleteChatFromBackend}
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
      />
      <div className="chat-main">
        <Header
          logo="/src/assets/imgs/caesar_logo_hori.png"
          status={busy ? "thinking…" : "connected"}
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

// 메시지에서 제목 생성 함수
function generateTitleFromMessage(message) {
  if (!message) return "새 대화";
  
  // 첫 20자까지만 제목으로 사용
  const title = message.trim();
  return title.length > 20 ? title.substring(0, 20) + "..." : title;
}
