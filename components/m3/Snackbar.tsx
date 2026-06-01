"use client";

import React from "react";

interface Props {
  open: boolean;
  message?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
}

export function M3Snackbar({ open, message, actionLabel, onAction, onClose }: Props) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)",
      background: "var(--md-sys-color-inverse-surface)",
      color: "var(--md-sys-color-inverse-on-surface)",
      borderRadius: 4, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 24,
      boxShadow: "var(--md-sys-elevation-level3)",
      fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, letterSpacing: 0.25,
      minWidth: 320, maxWidth: 560, zIndex: 1000,
    }}>
      <div style={{ flex: 1 }}>{message}</div>
      {actionLabel && (
        <button onClick={onAction || onClose} style={{
          background: "transparent", border: "none",
          color: "var(--md-sys-color-inverse-primary)",
          fontFamily: "var(--md-sys-typescale-plain-font)",
          fontWeight: 500, fontSize: 14, letterSpacing: 0.1,
          cursor: "pointer",
        }}>{actionLabel}</button>
      )}
    </div>
  );
}
