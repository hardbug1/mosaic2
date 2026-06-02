"use client";
import React from "react";

// 라이트/다크 테마 토글. data-theme 속성 + localStorage('mosaic-theme')에 영속.
// 초기 적용은 app/layout.tsx의 인라인 스크립트가 담당(깜빡임 방지).
export function ThemeToggle({ size = 40 }: { size?: number }) {
  const [dark, setDark] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("mosaic-theme", next);
    } catch {
      // localStorage 불가 환경은 무시 (세션 한정 적용)
    }
    setDark(!dark);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={dark ? "라이트 모드" : "다크 모드"}
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        border: "none",
        cursor: "pointer",
        background: hover ? "var(--md-sys-color-surface-container-high)" : "transparent",
        color: "var(--md-sys-color-on-surface-variant)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 120ms ease",
        flexShrink: 0,
      }}
    >
      <span className="md-icon" style={{ fontSize: 22 }}>
        {dark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
