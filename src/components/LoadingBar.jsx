import React from "react";
import "../assets/styles/LoadingBar.css";

export default function LoadingBar({ isVisible, message = "로딩 중..." }) {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}
