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

// 스켈레톤 로딩 컴포넌트
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

function LinkActions({ url, onPreview }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <button
        onClick={() => onPreview?.(url)}
        style={{
          padding: "4px 8px",
          fontSize: 12,
          background: "#F3F4F6",
          border: "1px solid #D1D5DB",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        미리보기
      </button>
      <button
        onClick={() => window.open(url, "_blank")}
        style={{
          padding: "4px 8px",
          fontSize: 12,
          background: "#EBF8FF",
          border: "1px solid #3B82F6",
          borderRadius: 4,
          cursor: "pointer",
          color: "#3B82F6",
        }}
      >
        링크 열기
      </button>
    </div>
  );
}

function ChatMessage({ message, onPreview, searchQuery, isCurrentMatch }) {
  const isUser = message.role === "user";
  const messageRef = useRef(null);

  // URL 패턴 매칭
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = message.text?.match(urlRegex) || [];

  // 검색어 하이라이트 함수
  const highlightSearchTerm = (text) => {
    if (!searchQuery || !text) return text;

    const parts = text.split(
      new RegExp(
        `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      )
    );
    return parts.map((part, index) => {
      const isMatch = part.toLowerCase() === searchQuery.toLowerCase();
      return (
        <span
          key={index}
          style={
            isMatch
              ? {
                  backgroundColor: "#A855F7",
                  color: "white",
                  padding: "2px 4px",
                  borderRadius: "3px",
                  fontWeight: "bold",
                }
              : {}
          }
        >
          {part}
        </span>
      );
    });
  };

  // URL을 제거한 텍스트
  const textWithoutUrls = message.text?.replace(urlRegex, "").trim();

  return (
    <div
      ref={messageRef}
      className={`chat-message ${isUser ? "user" : "assistant"} ${
        isCurrentMatch ? "current-match" : ""
      }`}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
        ...(isCurrentMatch && {
          border: "2px solid #A855F7",
          borderRadius: "12px",
          padding: "8px",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
        }),
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "12px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser ? "#3B82F6" : "#F3F4F6",
          color: isUser ? "#FFFFFF" : "#374151",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {highlightSearchTerm(textWithoutUrls)}
        {!isUser && urls.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {urls.map((url, i) => (
              <LinkActions key={i} url={url} onPreview={onPreview} />
            ))}
          </div>
        )}
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

  // 채널 변경 시 메시지 로드
  useEffect(() => {
    if (channelId) {
      loadMessages();
    }
  }, [channelId]);

  // 외부에서 전달된 메시지가 변경되면 내부 상태 업데이트
  useEffect(() => {
    if (externalMessages) {
      setMessages(externalMessages);
    }
  }, [externalMessages]);

  // 백엔드에서 채팅 로드
  const loadMessages = async () => {
    if (!channelId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getChatsByChannel(channelId);

      // 채팅 목록을 메시지 형태로 변환
      const allMessages = [];
      data.chats.forEach((chat) => {
        chat.messages.forEach((message) => {
          allMessages.push({
            id: `${chat.id}_${message.role}_${Date.now()}`,
            text: message.content,
            role: message.role === "agent" ? "assistant" : message.role,
            chatId: chat.id,
            timestamp: chat.created_at || new Date().toISOString(),
          });
        });
      });

      setMessages(allMessages);
      if (onMessagesUpdate) {
        onMessagesUpdate(allMessages);
      }
    } catch (err) {
      console.error("채팅 로드 실패:", err);
      setError("채팅을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 메시지 전송
  const handleSendMessage = async (content, role = "user") => {
    if (!channelId || !content.trim()) return;

    try {
      // 새로운 채팅 생성 또는 기존 채팅에 메시지 추가
      const userMessage = { role, content };

      // 임시로 UI에 사용자 메시지 먼저 표시
      const tempUserMessage = {
        id: `temp_${Date.now()}`,
        text: content,
        role: role,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempUserMessage]);

      // 사용자 메시지인 경우 AI 응답 요청
      if (role === "user") {
        setLoading(true);
        try {
          // AI 응답과 함께 채팅 생성 (channelId가 없으면 자동으로 채널 생성)
          const newChat = await requestAIResponse(channelId, content);

          // 새로운 채팅의 메시지들을 UI 형태로 변환
          const newMessages = newChat.messages.map((msg, index) => ({
            id: `${newChat.id}_${msg.role}_${index}`,
            text: msg.content,
            role: msg.role === "agent" ? "assistant" : msg.role,
            chatId: newChat.id,
            timestamp: newChat.created_at || new Date().toISOString(),
          }));

          // 임시 메시지 제거하고 실제 메시지들로 교체
          setMessages((prev) => {
            const withoutTemp = prev.filter(
              (msg) => !msg.id.startsWith("temp_")
            );
            return [...withoutTemp, ...newMessages];
          });

          if (onMessagesUpdate) {
            const updatedMessages = [
              ...messages.filter((msg) => !msg.id.startsWith("temp_")),
              ...newMessages,
            ];
            onMessagesUpdate(updatedMessages);
          }
        } catch (aiErr) {
          console.error("AI 응답 요청 실패:", aiErr);
          // AI 응답 실패 시 사용자 메시지만 저장 (channelId가 없으면 자동으로 채널 생성)
          const simpleChat = await createChat(channelId, [userMessage]);
          const simpleMessage = {
            id: `${simpleChat.id}_user_0`,
            text: content,
            role: role,
            chatId: simpleChat.id,
            timestamp: simpleChat.created_at || new Date().toISOString(),
          };

          setMessages((prev) => {
            const withoutTemp = prev.filter(
              (msg) => !msg.id.startsWith("temp_")
            );
            return [...withoutTemp, simpleMessage];
          });
        } finally {
          setLoading(false);
        }
      } else {
        // AI나 다른 역할의 메시지인 경우
        const newChat = await createChat(channelId, [userMessage]);
        const newMessage = {
          id: `${newChat.id}_${role}_0`,
          text: content,
          role: role === "agent" ? "assistant" : role,
          chatId: newChat.id,
          timestamp: newChat.created_at || new Date().toISOString(),
        };

        setMessages((prev) => {
          const withoutTemp = prev.filter((msg) => !msg.id.startsWith("temp_"));
          return [...withoutTemp, newMessage];
        });

        if (onMessagesUpdate) {
          const updatedMessages = [
            ...messages.filter((msg) => !msg.id.startsWith("temp_")),
            newMessage,
          ];
          onMessagesUpdate(updatedMessages);
        }
      }
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      setError("메시지 전송에 실패했습니다.");
      // 임시 메시지 제거
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp_")));
    }
  };

  // 채팅 검색
  const handleSearchMessages = async (query) => {
    if (!channelId || !query.trim()) return [];

    try {
      const searchResults = await searchChats(channelId, query);

      // 검색 결과를 메시지 형태로 변환
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
      console.error("채팅 검색 실패:", err);
      return [];
    }
  };

  // 메시지 변경 시 하단으로 스크롤 (검색 중이 아닐 때만)
  useEffect(() => {
    if (!searchQuery) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, searchQuery]);

  // 현재 검색 결과로 스크롤
  useEffect(() => {
    if (searchMatches.length > 0 && currentMatchIndex >= 0) {
      const currentMatch = searchMatches[currentMatchIndex];
      const messageRef = messageRefs.current[currentMatch.messageIndex];
      if (messageRef) {
        messageRef.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [searchMatches, currentMatchIndex]);

  // 컴포넌트 외부에서 사용할 수 있도록 메서드 노출
  useEffect(() => {
    if (window.chatMessageList) {
      window.chatMessageList = {
        ...window.chatMessageList,
        sendMessage: handleSendMessage,
        searchMessages: handleSearchMessages,
        loadMessages,
      };
    } else {
      window.chatMessageList = {
        sendMessage: handleSendMessage,
        searchMessages: handleSearchMessages,
        loadMessages,
      };
    }
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
      {/* 에러 메시지 표시 */}
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

      {/* 초기 로딩 표시 */}
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

      {/* 메시지 목록 */}
      {messages.map((message, index) => {
        const isCurrentMatch = searchMatches.some(
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

      {/* AI 응답 대기 중 표시 */}
      {(isLoading || loading) && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
