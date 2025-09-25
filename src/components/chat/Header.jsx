import React, { useState, useEffect } from 'react'
// import llmService from '../../shared/api/llmService.js'
import LoadingModal from '../admin/LoadingModal.jsx'
// import PreviewPanel from '../PreviewPanel.jsx'

export default function Header({
  title = "Caesar AI Assistant",
  logo = null,
  // status = "connected",
}) {
  // const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <header
        style={{
          height: 56,
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {logo ? (
            <img
              src={logo}
              alt="Caesar Logo"
              style={{
                height: "32px",
                objectFit: "contain",
              }}
            />
          ) : (
            <div style={{ fontWeight: 600, color: "#111827" }}>{title}</div>
          )}
        </div>
      </header>
    </>
  );
}
