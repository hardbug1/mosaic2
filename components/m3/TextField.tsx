"use client";

import React from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: "outlined" | "filled";
  supporting?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
};

export function M3TextField({ label, value, onChange, variant = "outlined", supporting, multiline, rows = 1, ...rest }: Props) {
  const [focus, setFocus] = React.useState(false);
  const filled = (value || "").length > 0;
  const labelUp = focus || filled;

  if (variant === "outlined") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{
          position: "relative", borderRadius: 4,
          padding: "14px 16px",
          boxShadow: focus
            ? "inset 0 0 0 2px var(--md-sys-color-primary)"
            : "inset 0 0 0 1px var(--md-sys-color-outline)",
          transition: "box-shadow 100ms linear",
        }}>
          <label style={{
            position: "absolute",
            top: labelUp ? -8 : 14, left: labelUp ? 12 : 16,
            padding: labelUp ? "0 4px" : 0,
            background: labelUp ? "var(--md-sys-color-surface)" : "transparent",
            fontFamily: "var(--md-sys-typescale-plain-font)",
            fontSize: labelUp ? 12 : 16,
            color: focus ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface-variant)",
            transition: "all 150ms cubic-bezier(0.2,0,0,1)",
            pointerEvents: "none",
          }}>{label}</label>
          {multiline ? (
            <textarea {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} value={value} onChange={e => onChange?.(e.target.value)}
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              rows={rows}
              style={{
                width: "100%", border: "none", outline: "none", background: "transparent",
                fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 16, lineHeight: "24px",
                color: "var(--md-sys-color-on-surface)", resize: "vertical",
              }} />
          ) : (
            <input {...rest} type="text" value={value} onChange={e => onChange?.(e.target.value)}
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              style={{
                width: "100%", border: "none", outline: "none", background: "transparent",
                fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 16, lineHeight: "24px",
                color: "var(--md-sys-color-on-surface)",
              }} />
          )}
        </div>
        {supporting && (
          <span style={{ padding: "0 16px", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 12, color: "var(--md-sys-color-on-surface-variant)" }}>{supporting}</span>
        )}
      </div>
    );
  }

  // filled variant
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{
        position: "relative", borderTopLeftRadius: 4, borderTopRightRadius: 4,
        background: "var(--md-sys-color-surface-container-highest)",
        padding: labelUp ? "20px 16px 6px" : "16px 16px 10px",
        borderBottom: focus ? "2px solid var(--md-sys-color-primary)" : "1px solid var(--md-sys-color-on-surface-variant)",
        transition: "all 100ms linear",
      }}>
        <label style={{
          position: "absolute",
          top: labelUp ? 6 : "50%",
          transform: labelUp ? "none" : "translateY(-50%)",
          left: 16,
          fontSize: labelUp ? 12 : 16,
          color: focus ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface-variant)",
          fontFamily: "var(--md-sys-typescale-plain-font)",
          transition: "all 150ms cubic-bezier(0.2,0,0,1)",
          pointerEvents: "none",
        }}>{label}</label>
        <input {...rest} type="text" value={value} onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: "100%", border: "none", outline: "none", background: "transparent",
            fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 16,
            color: "var(--md-sys-color-on-surface)",
          }}/>
      </div>
    </div>
  );
}
