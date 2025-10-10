import React from "react";

export default function ChatMessage({ message, onPreview }) {
  const isUser = message.role === "user";

  // 1️⃣ 노션 링크 감지
  const hasNotionLink = message.text?.includes("notion.so");

  // 2️⃣ 구글드라이브 감지 (더 정확한 패턴)
  const hasDriveLink =
    message.text?.includes("drive.google.com") ||
    message.text?.includes("📥 다운로드:") ||
    message.text?.includes("👁️ 미리보기:") ||
    (message.text?.includes("구글 드라이브에서") &&
      message.text?.includes("파일을 찾았습니다"));

  // 3️⃣ RAG 미리보기 감지
  const hasPreviewFile =
    message.previewFile &&
    (message.previewFile.url || message.previewFile.s3_url);

  // 4️⃣ Markdown 링크 제거 (ex: [회의록6 페이지 링크](https://www.notion.so/....))
  const textWithoutMarkdownLink = message.text?.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    "" // ✅ 링크 구문 자체를 제거
  );

  // 5️⃣ 노션 링크 추출 (버튼용)
  const notionUrlMatch = message.text.match(
    /\(?(https?:\/\/(?:www\.)?notion\.so\/[^\s)]+)/
  );
  const notionUrl = notionUrlMatch
    ? notionUrlMatch[1] || notionUrlMatch[0]
    : null;

  // 6️⃣ 버튼 클릭 시 링크 보정 & 새창 열기
  const handleButtonClick = () => {
    const text = message?.text || "";
    console.log("🔍 버튼 클릭 - 메시지 텍스트:", text);
    console.log("🔍 버튼 클릭 - previewFile:", message?.previewFile);

    const notionUrlMatch = text.match(
      /\(?(https?:\/\/(?:www\.)?notion\.so\/[^\s)]+)/
    );
    const notionUrlRaw = notionUrlMatch
      ? notionUrlMatch[1] || notionUrlMatch[0]
      : "";

    // 구글 드라이브 다운로드 링크 추출 (더 정확한 패턴)
    const driveDownloadMatch = text.match(
      /📥 다운로드:\s*(https:\/\/drive\.google\.com\/uc\?export=download&id=[^\s\n]+)/
    );
    const driveViewMatch = text.match(
      /👁️ 미리보기:\s*(https:\/\/drive\.google\.com\/[^\s\n]+)/
    );
    const driveUrl = driveDownloadMatch?.[1] || driveViewMatch?.[1] || "";

    console.log("🔍 드라이브 다운로드 매치:", driveDownloadMatch);
    console.log("🔍 드라이브 미리보기 매치:", driveViewMatch);
    console.log("🔍 최종 드라이브 URL:", driveUrl);

    const previewUrl =
      message?.previewFile?.s3_url || message?.previewFile?.url || "";

    // ✅ 1. previewFile 우선 처리 (RAG 및 구글 드라이브 모두 포함)
    if (hasPreviewFile && message.previewFile) {
      console.log("📎 previewFile:", message.previewFile);

      // S3 URL이 있으면 직접 열기 (어드민 페이지와 동일한 방식)
      const s3Url = message.previewFile.s3_url || message.previewFile.url;
      if (s3Url) {
        console.log("✅ 파일 열기:", s3Url);
        window.open(s3Url, "_blank", "noopener,noreferrer");
        return;
      }

      console.log("❌ previewFile에 URL이 없음");
    }

    // ✅ 2. 노션 링크 처리
    if (hasNotionLink && notionUrlRaw) {
      const pageId = (notionUrlRaw.match(/([a-fA-F0-9]{32})/) || [])[1];
      let fixed = notionUrlRaw;
      if (pageId) fixed = `https://www.notion.so/${pageId}?v=default`;
      fixed = encodeURI(fixed);
      window.open(fixed, "_blank", "noopener,noreferrer");
      return;
    }

    // ✅ 3. 구글 드라이브 링크 처리 (텍스트에서 직접 추출)
    if (hasDriveLink && driveUrl) {
      console.log("✅ 텍스트에서 추출한 드라이브 URL 열기:", driveUrl);
      window.open(driveUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // ✅ 4. 아무 케이스에도 해당되지 않으면 경고
    alert("열 수 있는 미리보기 링크가 없습니다.");
  };

  const cleanedText = textWithoutMarkdownLink
    ?.replace(/\n{2,}/g, "\n") // 2줄 이상 개행 → 1줄로
    ?.trim();

  // 7️⃣ 버튼 텍스트 설정
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
