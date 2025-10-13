import React from "react";

export default function ChatMessage({ message, onPreview }) {
  const isUser = message.role === "user";

  // 1️⃣ 노션 링크 감지 (마크다운 형태의 노션 링크만)
  const hasNotionLink =
    !isUser &&
    message.text &&
    /\[([^\]]+)\]\((https?:\/\/(?:www\.)?notion\.so\/[^\s)]+)\)/.test(
      message.text
    );

  // 2️⃣ 구글드라이브 감지 (드라이브 툴에서 생성한 특정 패턴만)
  const hasDriveLink =
    !isUser &&
    message.text &&
    (message.text.includes("다운로드:") || message.text.includes("미리보기:"));

  // 3️⃣ RAG 미리보기 감지 (previewFile 객체가 있을 때만)
  const hasPreviewFile =
    !isUser &&
    message.previewFile &&
    (message.previewFile.url || message.previewFile.s3_url);

  // 4️⃣ Markdown 링크 제거 (ex: [회의록6 페이지 링크](https://www.notion.so/....))
  const textWithoutMarkdownLink = message.text?.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    "" // ✅ 링크 구문 자체를 제거
  );

  // 5️⃣ 버튼 클릭 시 링크 보정 & 새창 열기 (우선순위: 노션 > RAG > 드라이브)
  const handleButtonClick = () => {
    const text = message?.text || "";
    console.log("🔍 버튼 클릭 - 메시지 텍스트:", text);
    console.log("🔍 버튼 클릭 - previewFile:", message?.previewFile);

    // ✅ 1. 노션 링크 처리 (최우선)
    if (hasNotionLink) {
      const notionUrlMatch = text.match(
        /\[([^\]]+)\]\((https?:\/\/(?:www\.)?notion\.so\/[^\s)]+)\)/
      );
      const notionUrlRaw = notionUrlMatch?.[2] || "";

      if (notionUrlRaw) {
        // ✅ 하이픈 포함 36자리 UUID 또는 하이픈 없는 32자리 UUID 인식
        const pageIdMatch = notionUrlRaw.match(/([a-f0-9-]{36}|[a-f0-9]{32})/i);
        const pageIdRaw = pageIdMatch ? pageIdMatch[1] : null;

        if (pageIdRaw) {
          // ✅ 하이픈 제거하여 32자리 페이지 ID로 변환
          const pageId = pageIdRaw.replace(/-/g, "");
          const fixed = `https://www.notion.so/${pageId}`;

          console.log("✅ 노션 링크 열기:", fixed);
          window.open(fixed, "_blank", "noopener,noreferrer");
          return;
        }
      }
    }

    // ✅ 2. RAG previewFile 처리
    if (hasPreviewFile && message.previewFile) {
      const s3Url = message.previewFile.s3_url || message.previewFile.url;
      if (s3Url) {
        console.log("✅ RAG 파일 열기:", s3Url);
        window.open(s3Url, "_blank", "noopener,noreferrer");
        return;
      }
    }

    // ✅ 3. 구글 드라이브 링크 처리
    if (hasDriveLink) {
      const driveDownloadMatch = text.match(
        /다운로드:\s*(https:\/\/drive\.google\.com\/uc\?export=download&id=[^\s\n]+)/
      );
      const driveViewMatch = text.match(
        /미리보기:\s*(https:\/\/drive\.google\.com\/[^\s\n]+)/
      );
      const driveUrl = driveDownloadMatch?.[1] || driveViewMatch?.[1] || "";

      if (driveUrl) {
        console.log("✅ 드라이브 파일 열기:", driveUrl);
        window.open(driveUrl, "_blank", "noopener,noreferrer");
        return;
      }
    }

    // ✅ 4. 아무 케이스에도 해당되지 않으면 경고
    alert("열 수 있는 미리보기 링크가 없습니다.");
  };

  const cleanedText = textWithoutMarkdownLink
    ?.replace(/\n{2,}/g, "\n") // 2줄 이상 개행 → 1줄로
    ?.trim();

  // 6️⃣ 버튼 텍스트 설정 (우선순위: 노션 > RAG 파일 > 드라이브)
  const getButtonLabel = () => {
    if (hasNotionLink) return "🔗 노션 링크 열기";
    if (hasPreviewFile) return "📂 파일 미리보기";
    if (hasDriveLink) return "📂 드라이브 파일 열기";
    return null;
  };
  const buttonLabel = getButtonLabel();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
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
        }}
      >
        {/* 🗣️ 본문 (링크 텍스트 제거된 상태) */}
        <div
          style={{
            whiteSpace: "pre-line",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          {cleanedText}
        </div>

        {/* 🔘 버튼 표시 (링크 제거 후 별도로 추가) */}
        {/* 버튼 간격 줄이기 */}
        {buttonLabel && (
          <div style={{ marginTop: 4 }}>
            <button
              onClick={handleButtonClick}
              style={{
                padding: "6px 12px",
                background: "#2563EB",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {buttonLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
