"use client";

import React from "react";

interface Props {
  open: boolean;
  onClose?: () => void;
  icon?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function M3Dialog({ open, onClose, icon, title, children, actions }: Props) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--md-sys-color-surface-container-high)",
        borderRadius: 28, padding: 24, maxWidth: 560, width: "100%",
        boxShadow: "var(--md-sys-elevation-level3)",
      }}>
        {icon && <span className="md-icon" style={{ fontSize: 24, color: "var(--md-sys-color-secondary)", display: "block" }}>{icon}</span>}
        <div style={{
          marginTop: icon ? 16 : 0,
          fontFamily: "var(--md-sys-typescale-brand-font)",
          fontSize: 24, lineHeight: "32px",
          color: "var(--md-sys-color-on-surface)",
        }}>{title}</div>
        <div style={{
          marginTop: 16, marginBottom: 24,
          fontFamily: "var(--md-sys-typescale-plain-font)",
          fontSize: 14, lineHeight: "20px", letterSpacing: 0.25,
          color: "var(--md-sys-color-on-surface-variant)",
        }}>{children}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>{actions}</div>
      </div>
    </div>
  );
}
