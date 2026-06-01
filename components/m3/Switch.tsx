"use client";

import React from "react";

interface Props {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

export function M3Switch({ checked, onChange }: Props) {
  return (
    <button onClick={() => onChange?.(!checked)}
      style={{
        width: 52, height: 32, borderRadius: 9999, border: "none",
        position: "relative", cursor: "pointer", flexShrink: 0,
        background: checked ? "var(--md-sys-color-primary)" : "var(--md-sys-color-surface-container-highest)",
        boxShadow: checked ? "none" : "inset 0 0 0 2px var(--md-sys-color-outline)",
        transition: "all 200ms cubic-bezier(0.2,0,0,1)",
      }}>
      <span style={{
        position: "absolute", top: "50%",
        left: checked ? 24 : 8,
        width: checked ? 24 : 16, height: checked ? 24 : 16,
        marginTop: checked ? -12 : -8,
        borderRadius: "50%",
        background: checked ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-outline)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--md-sys-color-primary)",
        transition: "all 200ms cubic-bezier(0.2,0,0,1)",
      }}>
        {checked && <span className="md-icon" style={{ fontSize: 16 }}>check</span>}
      </span>
    </button>
  );
}
