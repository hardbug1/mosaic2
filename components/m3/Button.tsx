"use client";

import React from "react";

type ButtonVariant = "filled" | "tonal" | "elevated" | "outlined" | "text" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function M3Button({ variant = "filled", size = "md", icon, children, onClick, disabled, fullWidth, ...rest }: Props) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);

  const HEIGHT: Record<ButtonSize, number> = { sm: 32, md: 40, lg: 56 };
  const PAD: Record<ButtonSize, string>    = { sm: "0 16px", md: "0 24px", lg: "0 24px" };

  const palettes: Record<ButtonVariant, { bg: string; fg: string; stroke: string }> = {
    filled:   { bg: "var(--md-sys-color-primary)",             fg: "var(--md-sys-color-on-primary)",             stroke: "none" },
    tonal:    { bg: "var(--md-sys-color-secondary-container)", fg: "var(--md-sys-color-on-secondary-container)", stroke: "none" },
    elevated: { bg: "var(--md-sys-color-surface-container-low)", fg: "var(--md-sys-color-primary)",              stroke: "none" },
    outlined: { bg: "transparent",                             fg: "var(--md-sys-color-primary)",                stroke: "inset 0 0 0 1px var(--md-sys-color-outline)" },
    text:     { bg: "transparent",                             fg: "var(--md-sys-color-primary)",                stroke: "none" },
    danger:   { bg: "var(--md-sys-color-error)",               fg: "var(--md-sys-color-on-error)",               stroke: "none" },
  };
  const p = palettes[variant];

  const stateOpacity = disabled ? 0 : press ? 0.10 : hover ? 0.08 : 0;

  return (
    <button {...rest}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      onClick={disabled ? undefined : onClick}
      style={{
        position: "relative", overflow: "hidden",
        border: "none",
        background: p.bg, color: p.fg,
        boxShadow: variant === "elevated"
          ? "var(--md-sys-elevation-level1)"
          : (p.stroke !== "none" ? p.stroke : "none"),
        height: HEIGHT[size],
        padding: variant === "text" ? "0 12px" : PAD[size],
        borderRadius: 9999,
        fontFamily: "var(--md-sys-typescale-plain-font)",
        fontWeight: 500,
        fontSize: 14,
        letterSpacing: "0.1px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "box-shadow 200ms cubic-bezier(0.2,0,0,1)",
        width: fullWidth ? "100%" : undefined,
        justifyContent: "center",
      }}>
      <span style={{
        position: "absolute", inset: 0,
        background: p.fg, opacity: stateOpacity,
        transition: "opacity 100ms linear",
        pointerEvents: "none",
      }}/>
      {icon && <span className="md-icon" style={{ fontSize: 18, position: "relative" }}>{icon}</span>}
      <span style={{ position: "relative" }}>{children}</span>
    </button>
  );
}
