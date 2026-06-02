"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deriveInitials, pickColor } from "@/lib/profile";

/* ────────────────────────────────────────────────────────────
   MosaicMark — the grid-of-tiles logo mark
──────────────────────────────────────────────────────────── */
function MosaicMark({ size = 44 }: { size?: number }) {
  const tiles = [
    { c: "#6750A4", col: "1 / 3", row: "1 / 2" },
    { c: "#A23BB0", col: "1 / 2", row: "2 / 4" },
    { c: "#00639B", col: "2 / 3", row: "2 / 3" },
    { c: "#386A20", col: "2 / 3", row: "3 / 4" },
  ];
  const gap = Math.round(size * 0.1);
  const r = Math.round(size * 0.13);
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr",
        gap,
      }}
    >
      {tiles.map((t, i) => (
        <div
          key={i}
          style={{
            gridColumn: t.col,
            gridRow: t.row,
            background: t.c,
            borderRadius: r,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MosaicField — decorative pastel tile grid (left panel bg)
──────────────────────────────────────────────────────────── */
function MosaicField() {
  const cells = useMemo(() => {
    const palette = ["#6750A4", "#A23BB0", "#00639B", "#386A20", "#8C4A60", "#7B6FB0"];
    const arr: { key: string; color: string; op: number; big: boolean }[] = [];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        arr.push({
          key: `${r}-${c}`,
          color: palette[(r * 5 + c) % palette.length],
          op: 0.06 + ((r * 3 + c * 7) % 5) * 0.04,
          big: (r * 5 + c) % 9 === 0,
        });
      }
    }
    return arr;
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gridAutoRows: "1fr",
        gap: 10,
        padding: 28,
        opacity: 0.9,
      }}
    >
      {cells.map((c) => (
        <div
          key={c.key}
          style={{
            background: c.color,
            opacity: c.op,
            borderRadius: c.big ? 28 : 16,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SocialButton — pill-shaped outlined social auth button
──────────────────────────────────────────────────────────── */
function SocialButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 52,
        width: "100%",
        borderRadius: 9999,
        cursor: "pointer",
        border: "1px solid var(--md-sys-color-outline-variant)",
        background: hover
          ? "var(--md-sys-color-surface-container)"
          : "var(--md-sys-color-surface)",
        color: "var(--md-sys-color-on-surface)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontFamily: "var(--md-sys-typescale-plain-font)",
        fontSize: 15,
        fontWeight: 600,
        transition: "background 120ms ease",
      }}
    >
      <span className="md-icon" style={{ fontSize: 20 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────
   M3TextField (inline, not the separate component, so we can
   control the password-field padding without extra props)
──────────────────────────────────────────────────────────── */
function Field({
  label,
  value,
  onChange,
  type = "text",
  paddingRight,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  paddingRight?: number;
  autoComplete?: string;
}) {
  // 라벨 플로팅을 CSS `:placeholder-shown` 으로 처리 → 브라우저 자동완성에도
  // 라벨이 정확히 위로 떠서 값과 겹치지 않는다. (placeholder=" " 가 핵심)
  return (
    <div className="lsf">
      <input
        className="lsf-input"
        type={type}
        value={value}
        placeholder=" "
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        style={{ paddingRight: paddingRight ?? 16 }}
      />
      <label className="lsf-label">{label}</label>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   LoginScreen — main exported component
──────────────────────────────────────────────────────────── */
export function LoginScreen({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();

  const isLogin = mode === "login";

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const redirectTo = () => {
    const r = params.get("redirect");
    return r && r.startsWith("/") ? r : "/boards";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("이메일을 입력해주세요."); return; }
    if (!pw) { setError("비밀번호를 입력해주세요."); return; }
    if (!isLogin) {
      if (!name.trim()) { setError("이름을 입력해주세요."); return; }
      if (pw !== pw2) { setError("비밀번호가 일치하지 않습니다."); return; }
    }
    setError("");
    setBusy(true);
    const supabase = createClient();
    if (!isLogin) {
      const { error: err } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          data: {
            name,
            initials: deriveInitials(name),
            color: pickColor(email),
          },
        },
      });
      if (err) { setError(err.message); setBusy(false); return; }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (err) { setError(err.message); setBusy(false); return; }
    }
    router.push(redirectTo());
    router.refresh();
  };

  const handleOAuth = async (provider: "google" | "kakao") => {
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + "/boards" },
      });
      if (err) setError(err.message);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "OAuth 오류가 발생했습니다.");
    }
  };

  return (
    <>
      {/* Scoped responsive styles */}
      <style>{`
        .ls-wrap {
          min-height: 100%;
          display: flex;
          background: var(--md-sys-color-surface);
        }
        .ls-brand {
          flex: 1 1 0;
          position: relative;
          overflow: hidden;
          background: var(--md-sys-color-surface-container-low);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }
        .ls-mobile-brand { display: none; }
        .ls-form-panel {
          flex: 0 0 clamp(420px, 42%, 560px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          background: var(--md-sys-color-surface);
        }
        .lsf {
          position: relative;
          border-radius: 4px;
          box-shadow: inset 0 0 0 1px var(--md-sys-color-outline);
          transition: box-shadow 100ms linear;
        }
        .lsf:has(.lsf-input:focus) {
          box-shadow: inset 0 0 0 2px var(--md-sys-color-primary);
        }
        .lsf-input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          padding: 14px 16px;
          border-radius: 4px;
          font-family: var(--md-sys-typescale-plain-font);
          font-size: 16px;
          line-height: 24px;
          color: var(--md-sys-color-on-surface);
        }
        .lsf-label {
          position: absolute;
          top: 14px;
          left: 16px;
          font-family: var(--md-sys-typescale-plain-font);
          font-size: 16px;
          color: var(--md-sys-color-on-surface-variant);
          pointer-events: none;
          white-space: nowrap;
          transition: all 150ms cubic-bezier(0.2,0,0,1);
        }
        /* 자동완성 포함: 값이 있거나(:not(:placeholder-shown)) 포커스 시 라벨이 위로 */
        .lsf:has(.lsf-input:focus) .lsf-label,
        .lsf:has(.lsf-input:not(:placeholder-shown)) .lsf-label {
          top: -8px;
          left: 12px;
          font-size: 12px;
          padding: 0 4px;
          background: var(--md-sys-color-surface);
        }
        .lsf:has(.lsf-input:focus) .lsf-label {
          color: var(--md-sys-color-primary);
        }
        @media (max-width: 768px) {
          .ls-brand { display: none; }
          .ls-mobile-brand { display: flex !important; }
          .ls-form-panel { flex: 1 1 auto; }
        }
      `}</style>

      <div className="ls-wrap">
        {/* ── Left brand panel ── */}
        <div className="ls-brand">
          <MosaicField />
          {/* Logo */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <MosaicMark size={36} />
            <span
              style={{
                fontFamily: "var(--md-sys-typescale-brand-font)",
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: "-0.4px",
                color: "var(--md-sys-color-on-surface)",
              }}
            >
              Mosaic
            </span>
          </div>

          {/* Hero copy */}
          <div style={{ position: "relative", maxWidth: 440 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--md-sys-typescale-brand-font)",
                fontWeight: 800,
                fontSize: 44,
                lineHeight: 1.15,
                letterSpacing: "-1px",
                color: "var(--md-sys-color-on-surface)",
              }}
            >
              작은 생각들이 모여
              <br />
              하나의 그림이 됩니다
            </h1>
            <p
              style={{
                marginTop: 18,
                marginBottom: 0,
                fontFamily: "var(--md-sys-typescale-plain-font)",
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              팀의 메모, 이미지, 링크, 영상을 한 보드에서 함께 모으고
              정리하세요. 회의 일정을 잡지 않아도 모두의 생각이 실시간으로
              이어집니다.
            </p>
            {/* Avatar dots + social proof */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 26,
              }}
            >
              <div style={{ display: "flex" }}>
                {["#6750A4", "#386A20", "#00639B", "#A23BB0"].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9999,
                      background: c,
                      color: "#fff",
                      marginLeft: i === 0 ? 0 : -8,
                      boxShadow:
                        "0 0 0 2px var(--md-sys-color-surface-container-low)",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                  fontSize: 14,
                  color: "var(--md-sys-color-on-surface-variant)",
                }}
              >
                이미 12,000개 팀이 모자이크에서 협업하고 있어요
              </span>
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="ls-form-panel">
          <form
            onSubmit={submit}
            style={{
              width: "100%",
              maxWidth: 380,
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            {/* Mobile-only brand */}
            <div
              className="ls-mobile-brand"
              style={{ alignItems: "center", gap: 10 }}
            >
              <MosaicMark size={32} />
              <span
                style={{
                  fontFamily: "var(--md-sys-typescale-brand-font)",
                  fontWeight: 800,
                  fontSize: 20,
                  color: "var(--md-sys-color-on-surface)",
                }}
              >
                Mosaic
              </span>
            </div>

            {/* Heading */}
            <div>
              <div
                style={{
                  fontFamily: "var(--md-sys-typescale-brand-font)",
                  fontWeight: 800,
                  fontSize: 28,
                  letterSpacing: "-0.5px",
                  color: "var(--md-sys-color-on-surface)",
                }}
              >
                {isLogin ? "다시 오신 걸 환영해요" : "모자이크 시작하기"}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                  fontSize: 15,
                  color: "var(--md-sys-color-on-surface-variant)",
                }}
              >
                {isLogin
                  ? "계정에 로그인하고 보드로 이동하세요"
                  : "무료로 계정을 만들고 팀을 초대하세요"}
              </div>
            </div>

            {/* Tab switch — navigates between routes */}
            <div
              style={{
                display: "inline-flex",
                borderRadius: 9999,
                padding: 3,
                gap: 2,
                background: "var(--md-sys-color-surface-container-high)",
              }}
            >
              {(
                [
                  ["login", "로그인", "/login"],
                  ["signup", "회원가입", "/signup"],
                ] as const
              ).map(([id, label, href]) => {
                const sel = mode === id;
                return (
                  <Link
                    key={id}
                    href={href}
                    style={{
                      flex: 1,
                      height: 38,
                      borderRadius: 9999,
                      border: "none",
                      cursor: "pointer",
                      background: sel
                        ? "var(--md-sys-color-primary)"
                        : "transparent",
                      color: sel
                        ? "var(--md-sys-color-on-primary)"
                        : "var(--md-sys-color-on-surface-variant)",
                      fontFamily: "var(--md-sys-typescale-plain-font)",
                      fontSize: 14,
                      fontWeight: 600,
                      transition: "background 150ms ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {!isLogin && (
                <Field
                  label="이름"
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                />
              )}
              <Field
                label="이메일"
                value={email}
                onChange={setEmail}
                type="email"
                autoComplete="email"
              />
              {/* Password with visibility toggle */}
              <div style={{ position: "relative" }}>
                <Field
                  label="비밀번호"
                  value={pw}
                  onChange={setPw}
                  type={showPw ? "text" : "password"}
                  paddingRight={52}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  title={showPw ? "숨기기" : "표시"}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    width: 40,
                    height: 40,
                    borderRadius: 9999,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--md-sys-color-on-surface-variant)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="md-icon" style={{ fontSize: 20 }}>
                    {showPw ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {!isLogin && (
                <Field
                  label="비밀번호 확인"
                  value={pw2}
                  onChange={setPw2}
                  type="password"
                  autoComplete="new-password"
                />
              )}
            </div>

            {/* Error message */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--md-sys-color-error)",
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                  fontSize: 13,
                }}
              >
                <span className="md-icon" style={{ fontSize: 18 }}>
                  error
                </span>
                {error}
              </div>
            )}

            {/* Remember me + forgot password (login only) */}
            {isLogin && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontFamily: "var(--md-sys-typescale-plain-font)",
                    fontSize: 14,
                    color: "var(--md-sys-color-on-surface-variant)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{
                      width: 18,
                      height: 18,
                      accentColor: "var(--md-sys-color-primary)",
                      cursor: "pointer",
                    }}
                  />
                  로그인 상태 유지
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    fontFamily: "var(--md-sys-typescale-plain-font)",
                    fontSize: 14,
                    color: "var(--md-sys-color-primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  비밀번호 찾기
                </a>
              </div>
            )}

            {/* Primary submit button */}
            <button
              type="submit"
              disabled={busy}
              style={{
                width: "100%",
                height: 52,
                borderRadius: 9999,
                border: "none",
                cursor: busy ? "not-allowed" : "pointer",
                background: busy
                  ? "var(--md-sys-color-surface-container-high)"
                  : "var(--md-sys-color-primary)",
                color: busy
                  ? "var(--md-sys-color-on-surface-variant)"
                  : "var(--md-sys-color-on-primary)",
                fontFamily: "var(--md-sys-typescale-plain-font)",
                fontSize: 16,
                fontWeight: 700,
                transition: "background 150ms ease",
              }}
            >
              {busy ? "처리 중…" : isLogin ? "로그인" : "계정 만들기"}
            </button>

            {/* "또는" divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--md-sys-color-outline-variant)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                  fontSize: 13,
                }}
              >
                또는
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--md-sys-color-outline-variant)",
                }}
              />
            </div>

            {/* Social buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SocialButton
                icon="mail"
                label="Google로 계속하기"
                onClick={() => handleOAuth("google")}
              />
              <SocialButton
                icon="chat_bubble"
                label="카카오로 계속하기"
                onClick={() => handleOAuth("kakao")}
              />
            </div>

            {/* Footer link to other mode */}
            <div
              style={{
                textAlign: "center",
                fontFamily: "var(--md-sys-typescale-plain-font)",
                fontSize: 14,
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              {isLogin ? "아직 계정이 없으신가요? " : "이미 계정이 있으신가요? "}
              <Link
                href={isLogin ? "/signup" : "/login"}
                style={{
                  color: "var(--md-sys-color-primary)",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                {isLogin ? "회원가입" : "로그인"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
