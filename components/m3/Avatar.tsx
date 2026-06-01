"use client";

import React from "react";

type AvatarColor = "primary" | "secondary" | "tertiary" | "surface";

interface Props {
  initials?: string;
  icon?: string;
  color?: AvatarColor;
  size?: number;
}

export function M3Avatar({ initials, icon, color = "primary", size = 40 }: Props) {
  const palettes: Record<AvatarColor, { bg: string; fg: string }> = {
    primary:   { bg: "var(--md-sys-color-primary-container)", fg: "var(--md-sys-color-on-primary-container)" },
    secondary: { bg: "var(--md-sys-color-secondary-container)", fg: "var(--md-sys-color-on-secondary-container)" },
    tertiary:  { bg: "var(--md-sys-color-tertiary-container)", fg: "var(--md-sys-color-on-tertiary-container)" },
    surface:   { bg: "var(--md-sys-color-surface-container-highest)", fg: "var(--md-sys-color-on-surface-variant)" },
  };
  const p = palettes[color] || palettes.primary;
  return (
    <div style={{
      width: size, height: size, minWidth: size,
      borderRadius: 9999, background: p.bg, color: p.fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--md-sys-typescale-plain-font)", fontWeight: 500, fontSize: size * 0.4,
      flexShrink: 0,
    }}>
      {icon ? <span className="md-icon" style={{ fontSize: size * 0.6 }}>{icon}</span> : initials}
    </div>
  );
}
