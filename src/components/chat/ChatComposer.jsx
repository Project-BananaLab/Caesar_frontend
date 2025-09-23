import React, { useCallback, useRef, useEffect } from "react";

export default function ChatComposer({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend?.();
      }
    },
    [onSend]
  );

  // 텍스트 길이에 따라 높이 자동 조절
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = Math.min(textarea.scrollHeight, 150); // 최대 150px
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [value]);

  return (
    <div
      className="chat-composer"
      style={{
        padding: "16px 20px",
        borderTop: "2px solid #E5E7EB",
        background: "#FAFAFA",
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        className="chat-composer-container"
        style={{ display: "flex", gap: 12 }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문을 입력하고 Enter로 전송하세요 (Shift+Enter: 줄바꿈)"
          className="chat-composer-input"
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: 12,
            border: "2px solid #E5E7EB",
            resize: "none",
            minHeight: "48px",
            maxHeight: "150px",
            overflow: "auto",
            fontSize: "15px",
            lineHeight: "1.5",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
          }}
        />
        <button
          onClick={onSend}
          disabled={disabled}
          className="chat-composer-send-button"
          style={{
            padding: "14px 20px",
            borderRadius: 12,
            border: "none",
            background: disabled
              ? "#9CA3AF"
              : "linear-gradient(135deg,#4F46E5,#06B6D4)",
            color: "#fff",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "15px",
            fontWeight: "600",
            boxShadow: "0 2px 6px rgba(79, 70, 229, 0.3)",
            minWidth: "80px",
          }}
        >
          {disabled ? "처리중..." : "질문하기"}
        </button>
      </div>
    </div>
  );
}
