import React, { useEffect, useRef } from "react";

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
          <span style={{ fontSize: "14px", marginLeft: "8px" }}>
            Caesar가 답변을 생성하고 있습니다...
          </span>
        </div>

        {/* 스켈레톤 텍스트 라인들 */}
        <div style={{ marginTop: "12px" }}>
          <div
            style={{
              height: "12px",
              background:
                "linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite",
              borderRadius: "6px",
              marginBottom: "8px",
              width: "100%",
            }}
          />
          <div
            style={{
              height: "12px",
              background:
                "linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite",
              borderRadius: "6px",
              marginBottom: "8px",
              width: "85%",
              animationDelay: "0.1s",
            }}
          />
          <div
            style={{
              height: "12px",
              background:
                "linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite",
              borderRadius: "6px",
              width: "70%",
              animationDelay: "0.2s",
            }}
          />
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
    if (!searchQuery || !text) return formatText(text);

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
          {formatText(part)}
        </span>
      );
    });
  };

  // 텍스트 포맷팅 함수 (간단한 마크다운 지원)
  const formatText = (text) => {
    if (!text) return text;

    // HTML 이스케이프 처리
    const escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // **볼드** 텍스트 처리
    const boldText = escapedText.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    // 줄바꿈 처리
    const formattedText = boldText.replace(/\n/g, "<br>");

    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
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
          background: isUser
            ? "linear-gradient(135deg, #4F46E5, #06B6D4)"
            : "#F8F9FA",
          color: isUser ? "#FFFFFF" : "#374151",
          border: isUser ? "none" : "1px solid #E5E7EB",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >

      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser 
          ? '#3B82F6'
          : '#F3F4F6',
        color: isUser ? '#FFFFFF' : '#374151',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap'
      }}>

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
  messages,
  onPreview,
  searchQuery,
  searchMatches,
  currentMatchIndex,
  isLoading = false,
}) {
  const bottomRef = useRef(null);
  const messageRefs = useRef([]);

  // 메시지 변경 시 하단으로 스크롤 (검색 중이 아닐 때만)
  useEffect(() => {
    if (!searchQuery) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, searchQuery, isLoading]); // isLoading도 의존성에 추가

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

  return (

    <div
      className="chat-message-list"
      style={{
        width: "60%",
        margin: "0 auto",
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        background: "#FFFFFF",
      }}
    >
      {messages.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "60%",
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              marginBottom: "8px",
              color: "#374151",
            }}
          >
            Caesar AI에게 질문해보세요!
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.5", maxWidth: "400px" }}>
            궁금한 것이 있으시면 언제든지 질문해주세요. <br />
            문서 검색, 일정 관리, 업무 도움 등 다양한 기능을 제공합니다.
          </p>
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                background: "#F3F4F6",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                color: "#6B7280",
              }}
            >
              📅 일정 관리
            </span>
            <span
              style={{
                background: "#F3F4F6",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                color: "#6B7280",
              }}
            >
              📄 문서 검색
            </span>
            <span
              style={{
                background: "#F3F4F6",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                color: "#6B7280",
              }}
            >
              💼 업무 지원
            </span>
          </div>
        </div>
      )}

    <div className="chat-message-list" style={{ 
      width: '100%',
      margin: '0 auto',
      flex: 1, 
      overflowY: 'auto', 
      padding: '16px 20%',
      background: '#FFFFFF',
      scrollbarWidth: 'thin',
      scrollbarColor: '#CBD5E1 #F1F5F9'
    }}>

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

      {/* 로딩 중일 때 스켈레톤 표시 */}
      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
