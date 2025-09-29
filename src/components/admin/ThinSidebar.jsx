// src/components/admin/ThinSidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdInsertDriveFile } from "react-icons/md";
import "../../assets/styles/ThinSidebar.css";

export default function ThinSidebar({ logoSrc }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isEmployees = pathname.startsWith("/admin/employees");
  const isFiles = !isEmployees && pathname.startsWith("/admin"); // /admin, /admin/files...

  const items = [
    {
      key: "files",
      title: "파일관리",
      icon: <MdInsertDriveFile className="sidebar-svg" />,
      onClick: () => navigate("/admin", { replace: false }),
      active: isFiles,
    },
    {
      key: "employees",
      title: "직원관리",
      icon: <HiOutlineUserGroup className="sidebar-svg" />,
      onClick: () => navigate("/admin/employees", { replace: false }),
      active: isEmployees,
    },
  ];

  return (
    <aside className="thin-sidebar">
      <div className="sidebar-top">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt="logo"
            className="brand-logo"
            draggable={false}
          />
        ) : (
          <div className="brand-dot" />
        )}
      </div>

      <nav className="sidebar-items">
        {items.map((it) => (
          <button
            key={it.key}
            className={`sidebar-item ${it.active ? "active" : ""}`}
            onClick={it.onClick}
            title={it.title}
            aria-label={it.title}
          >
            <div className="sidebar-icon">{it.icon}</div>
            <div className="sidebar-label">{it.title}</div>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom" />
    </aside>
  );
}
