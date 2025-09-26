import React, { useCallback, useRef, useEffect } from "react";

export default function ChatComposer({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null);

  // 컴포넌트 마운트 시 초기 높이 설정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "55px";
      textareaRef.current.style.overflow = "hidden";
    }
  }, []);

  // value가 비워지면 높이 리셋
  useEffect(() => {
    if (textareaRef.current && (!value || value.trim() === "")) {
      textareaRef.current.style.height = "55px";
      textareaRef.current.style.overflow = "hidden";
    }
  }, [value]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend?.();
      }
    },
    [onSend]
  );

  // 텍스트 입력 시 높이 조절
  const handleInput = useCallback(
    (e) => {
      const newValue = e.target.value;
      onChange?.(newValue);

      const textarea = e.target;

      // 텍스트가 없으면 초기 높이(55px)로 리셋
      if (!newValue || newValue.trim() === "") {
        textarea.style.height = "55px";
        textarea.style.overflow = "hidden";
        return;
      }

      // 임시로 높이를 55px로 고정하고 실제 필요한 높이 측정
      const originalHeight = textarea.style.height;
      textarea.style.height = "55px";

      // 스크롤이 필요한지 확인 (스크롤이 필요하면 텍스트가 55px를 넘어간 것)
      const needsScroll = textarea.scrollHeight > 55;

      if (needsScroll) {
        // 텍스트가 55px를 넘어가면 실제 필요한 높이로 조절
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;
        const newHeight = Math.min(scrollHeight, 150);
        textarea.style.height = `${newHeight}px`;

        // 최대 높이에 도달하면 스크롤 활성화
        if (newHeight >= 150) {
          textarea.style.overflow = "auto";
        } else {
          textarea.style.overflow = "hidden";
        }
      } else {
        // 텍스트가 55px 안에 들어가면 높이 유지
        textarea.style.height = "55px";
        textarea.style.overflow = "hidden";
      }
    },
    [onChange]
  );

  return (
    <div
      className="chat-composer"
      style={{
        padding: "16px 0",
        borderTop: "2px solidrgb(255, 255, 255)",
        background: "#FAFAFA",
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        className="chat-composer-container"
        style={{
          display: "flex",
          gap: 12,
          width: "100%",
          margin: "0 auto",
          padding: "0 20%",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder=""
          className="chat-composer-input"
          maxLength={4000}
          style={{ 
            flex: 1, 
            padding: '14px 16px', 
            borderRadius: 12, 
            border: '2px solid #E5E7EB', 
            resize: 'none',
            height: '55px',
            minHeight: '55px',
            maxHeight: '150px',
            overflow: 'hidden',
            fontSize: '15px',
            lineHeight: '1.5',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#64748B #F1F5F9',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={onSend}
          disabled={disabled}
          className="chat-composer-send-button"
          style={{
            height: "55px",
            padding: "0 24px",
            background: disabled
              ? "#9CA3AF"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: "14px",
            fontWeight: 600,
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            minWidth: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}
