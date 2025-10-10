import React, { useEffect, useRef, useState } from "react";
import {
  getChatsByChannel,
  sendMessage,
  requestAIResponse,
  searchChats,
  createChat,
  deleteChat,
  getChat,
} from "../../shared/api/chat.js";
import fileService from "../../shared/api/fileService.js";
import ChatMessage from "./ChatMessage.jsx";

// 💬 AI 타이핑 중 애니메이션
function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "12px 16px",
          borderRadius: "18px 18px 18px 4px",
          background: "#F8F9FA",
          border: "1px solid #E5E7EB",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#6B7280",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "4px",
              alignItems: "center",
            }}
          >
            <div
              className="typing-dot"
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#9CA3AF",
                animation: "typing 1.4s infinite ease-in-out",
                animationDelay: "0s",
              }}
            />
            <div
              className="typing-dot"
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#9CA3AF",
                animation: "typing 1.4s infinite ease-in-out",
                animationDelay: "0.2s",
              }}
            />
            <div
              className="typing-dot"
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#9CA3AF",
                animation: "typing 1.4s infinite ease-in-out",
                animationDelay: "0.4s",
              }}
            />
          </div>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>
            AI가 답변을 준비 중입니다...
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChatMessageList({
  channelId,
  messages: externalMessages,
  onPreview,
  searchQuery,
  searchMatches,
  currentMatchIndex,
  isLoading = false,
  onMessagesUpdate,
}) {
  const bottomRef = useRef(null);
  const messageRefs = useRef([]);
  const [messages, setMessages] = useState(externalMessages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 채널 변경 시 메시지 불러오기
  useEffect(() => {
    if (channelId) loadMessages();
  }, [channelId]);

  // ✅ 외부 메시지가 바뀌면 동기화
  useEffect(() => {
    if (externalMessages) setMessages(externalMessages);
  }, [externalMessages]);

  // ✅ 백엔드에서 채팅 불러오기
  const loadMessages = async () => {
    if (!channelId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getChatsByChannel(channelId);

      const allMessages = [];
      data.chats.forEach((chat) => {
        chat.messages.forEach((message) => {
          allMessages.push({
            id: `${chat.id}_${message.role}_${Date.now()}`,
            text: message.content,
            role: message.role === "agent" ? "assistant" : message.role,
            chatId: chat.id,
            timestamp: chat.created_at || new Date().toISOString(),
            previewFile: message.previewFile || null,
          });
        });
      });

      setMessages(allMessages);
      onMessagesUpdate?.(allMessages);
    } catch (err) {
      console.error("❌ 채팅 로드 실패:", err);
      setError("채팅을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 메시지 전송
  const handleSendMessage = async (content, role = "user") => {
    if (!channelId || !content.trim()) return;

    try {
      const userMessage = { role, content };
      const tempUserMessage = {
        id: `temp_${Date.now()}`,
        text: content,
        role,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      if (role === "user") {
        setLoading(true);
        try {
          const newChat = await requestAIResponse(channelId, content);
          const newMessages = newChat.messages.map((msg, index) => ({
            id: `${newChat.id}_${msg.role}_${index}`,
            text: msg.content,
            role: msg.role === "agent" ? "assistant" : msg.role,
            chatId: newChat.id,
            timestamp: newChat.created_at || new Date().toISOString(),
          }));

          setMessages((prev) => [
            ...prev.filter((msg) => !msg.id.startsWith("temp_")),
            ...newMessages,
          ]);

          onMessagesUpdate?.([
            ...messages.filter((msg) => !msg.id.startsWith("temp_")),
            ...newMessages,
          ]);
        } catch (aiErr) {
          console.error("❌ AI 응답 실패:", aiErr);
          const simpleChat = await createChat(channelId, [userMessage]);
          const simpleMessage = {
            id: `${simpleChat.id}_user_0`,
            text: content,
            role,
            chatId: simpleChat.id,
            timestamp: simpleChat.created_at || new Date().toISOString(),
          };
          setMessages((prev) => [
            ...prev.filter((msg) => !msg.id.startsWith("temp_")),
            simpleMessage,
          ]);
        } finally {
          setLoading(false);
        }
      } else {
        const newChat = await createChat(channelId, [userMessage]);
        const newMessage = {
          id: `${newChat.id}_${role}_0`,
          text: content,
          role: role === "agent" ? "assistant" : role,
          chatId: newChat.id,
          timestamp: newChat.created_at || new Date().toISOString(),
        };
        setMessages((prev) => [
          ...prev.filter((msg) => !msg.id.startsWith("temp_")),
          newMessage,
        ]);
        onMessagesUpdate?.([
          ...messages.filter((msg) => !msg.id.startsWith("temp_")),
          newMessage,
        ]);
      }
    } catch (err) {
      console.error("❌ 메시지 전송 실패:", err);
      setError("메시지 전송에 실패했습니다.");
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp_")));
    }
  };

  // ✅ 채팅 검색
  const handleSearchMessages = async (query) => {
    if (!channelId || !query.trim()) return [];
    try {
      const searchResults = await searchChats(channelId, query);
      const searchMessages = [];
      searchResults.chats.forEach((chat) => {
        chat.messages.forEach((message, index) => {
          if (message.content.toLowerCase().includes(query.toLowerCase())) {
            searchMessages.push({
              id: `${chat.id}_${message.role}_${index}`,
              text: message.content,
              role: message.role === "agent" ? "assistant" : message.role,
              chatId: chat.id,
              timestamp: chat.created_at || new Date().toISOString(),
              messageIndex: index,
            });
          }
        });
      });
      return searchMessages;
    } catch (err) {
      console.error("❌ 채팅 검색 실패:", err);
      return [];
    }
  };

  // ✅ 메시지 하단 자동 스크롤
  useEffect(() => {
    if (!searchQuery) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, searchQuery]);

  // ✅ 검색 결과 스크롤 이동
  useEffect(() => {
    if (searchMatches?.length > 0 && currentMatchIndex >= 0) {
      const currentMatch = searchMatches[currentMatchIndex];
      const messageRef = messageRefs.current[currentMatch.messageIndex];
      if (messageRef) {
        messageRef.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [searchMatches, currentMatchIndex]);

  // ✅ 외부 접근용 메서드 등록
  useEffect(() => {
    window.chatMessageList = {
      sendMessage: handleSendMessage,
      searchMessages: handleSearchMessages,
      loadMessages,
    };
  }, [channelId, messages]);

  return (
    <div
      className="chat-message-list"
      style={{
        width: "100%",
        margin: "0 auto",
        flex: 1,
        overflowY: "auto",
        padding: "16px 20%",
        background: "#FFFFFF",
        scrollbarWidth: "thin",
        scrollbarColor: "#CBD5E1 #F1F5F9",
      }}
    >
      {/* ❌ 에러 표시 */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            margin: "16px 0",
            background: "#FEE2E2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
            color: "#DC2626",
            textAlign: "center",
          }}
        >
          {error}
          <button
            onClick={loadMessages}
            style={{
              marginLeft: "8px",
              padding: "4px 8px",
              background: "#DC2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 🌀 초기 로딩 */}
      {loading && messages.length === 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            color: "#6B7280",
          }}
        >
          메시지를 불러오는 중...
        </div>
      )}

      {/* 💬 메시지 목록 */}
      {messages.map((message, index) => {
        const isCurrentMatch =
          searchMatches &&
          searchMatches.some(
            (match) =>
              match.messageIndex === index &&
              searchMatches.indexOf(match) === currentMatchIndex
          );

        return (
          <div
            key={message.id || index}
            ref={(el) => (messageRefs.current[index] = el)}
          >
            <ChatMessage
              message={message}
              onPreview={onPreview}
              searchQuery={searchQuery}
              isCurrentMatch={isCurrentMatch}
            />
          </div>
        );
      })}

      {/* ✨ AI 응답 중일 때 */}
      {(isLoading || loading) && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
