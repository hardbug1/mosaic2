"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deriveInitials } from "@/lib/profile";
import { PALETTE } from "@/lib/constants";
import { ThemeToggle } from "@/components/ThemeToggle";

/* ─────────────────────────────────────────────────────────────────
   MosaicMark logo
───────────────────────────────────────────────────────────────── */
function MosaicMark({ size = 28 }: { size?: number }) {
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

/* ─────────────────────────────────────────────────────────────────
   Row — a label + control row in a card
───────────────────────────────────────────────────────────────── */
function Row({
  title,
  desc,
  children,
  last,
}: {
  title: string;
  desc?: string;
  children?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 0",
        borderBottom: last ? "none" : "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="md-title-small"
          style={{ color: "var(--md-sys-color-on-surface)" }}
        >
          {title}
        </div>
        {desc && (
          <div
            className="md-body-small"
            style={{
              color: "var(--md-sys-color-on-surface-variant)",
              marginTop: 2,
            }}
          >
            {desc}
          </div>
        )}
      </div>
      {children && <div style={{ flexShrink: 0 }}>{children}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Card
───────────────────────────────────────────────────────────────── */
function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--md-sys-color-surface-container-low)",
        border: "1px solid var(--md-sys-color-outline-variant)",
        borderRadius: 20,
        padding: "8px 20px 16px",
      }}
    >
      {title && (
        <div
          className="md-title-medium"
          style={{
            color: "var(--md-sys-color-on-surface)",
            padding: "14px 0 4px",
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Nav items
───────────────────────────────────────────────────────────────── */
const NAV = [
  { id: "profile", icon: "person", label: "프로필" },
  { id: "account", icon: "lock", label: "계정 · 보안" },
  { id: "notif", icon: "notifications", label: "알림" },
  { id: "appearance", icon: "palette", label: "테마 · 표시" },
] as const;

type SectionId = (typeof NAV)[number]["id"];

/* ─────────────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────────────── */
type Props = {
  userId: string;
  initialName: string;
  initialInitials: string;
  initialColor: string;
  initialBio: string;
  email: string;
};

/* ─────────────────────────────────────────────────────────────────
   SettingsClient
───────────────────────────────────────────────────────────────── */
export function SettingsClient({
  userId,
  initialName,
  initialInitials: _initialInitials,
  initialColor,
  initialBio,
  email,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [section, setSection] = useState<SectionId>("profile");
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [color, setColor] = useState(initialColor);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const initials = deriveInitials(name);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    setErrorMsg("");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name, bio, color, initials: deriveInitials(name) })
        .eq("id", userId);
      if (error) throw error;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2200);
      router.refresh();
    } catch (err) {
      setSaveStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100%", background: "var(--md-sys-color-surface)" }}>
      {/* ── Top bar ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--md-sys-color-surface-container-low)",
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 28px",
        }}
      >
        {/* Logo + back link */}
        <Link
          href="/boards"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <MosaicMark size={28} />
          <span
            style={{
              fontFamily: "var(--md-sys-typescale-brand-font)",
              fontWeight: 800,
              fontSize: 19,
              letterSpacing: "-0.3px",
              color: "var(--md-sys-color-on-surface)",
            }}
          >
            Mosaic
          </span>
        </Link>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 24,
            background: "var(--md-sys-color-outline-variant)",
          }}
        />

        <div
          className="md-title-medium"
          style={{ color: "var(--md-sys-color-on-surface)" }}
        >
          설정
        </div>

        <div style={{ flex: 1 }} />

        {/* Error message */}
        {saveStatus === "error" && (
          <span
            className="md-body-small"
            style={{ color: "var(--md-sys-color-error)", marginRight: 8 }}
          >
            {errorMsg}
          </span>
        )}

        {/* Save button */}
        {section === "profile" && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              height: 40,
              padding: "0 20px",
              borderRadius: 9999,
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              background:
                saveStatus === "saved"
                  ? "var(--md-sys-color-secondary-container)"
                  : "var(--md-sys-color-primary)",
              color:
                saveStatus === "saved"
                  ? "var(--md-sys-color-on-secondary-container)"
                  : "var(--md-sys-color-on-primary)",
              fontFamily: "var(--md-sys-typescale-plain-font)",
              fontSize: 14,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              opacity: saving ? 0.7 : 1,
              transition: "background 200ms ease, color 200ms ease",
            }}
          >
            <span className="md-icon" style={{ fontSize: 18 }}>
              {saveStatus === "saved" ? "check" : "save"}
            </span>
            {saveStatus === "saved" ? "저장됨" : "변경사항 저장"}
          </button>
        )}

        {/* Back link affordance */}
        <Link
          href="/boards"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            height: 40,
            padding: "0 16px",
            borderRadius: 9999,
            textDecoration: "none",
            color: "var(--md-sys-color-on-surface-variant)",
            fontFamily: "var(--md-sys-typescale-plain-font)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <span className="md-icon" style={{ fontSize: 18 }}>
            arrow_back
          </span>
          내 보드
        </Link>
      </header>

      {/* ── Body (sidebar + content) ── */}
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "28px 28px 80px",
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* Side nav */}
        <nav
          style={{
            position: "sticky",
            top: 92,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {NAV.map((n) => {
            const sel = section === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSection(n.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  height: 48,
                  padding: "0 16px",
                  borderRadius: 9999,
                  cursor: "pointer",
                  border: "none",
                  background: sel
                    ? "var(--md-sys-color-secondary-container)"
                    : "transparent",
                  color: sel
                    ? "var(--md-sys-color-on-secondary-container)"
                    : "var(--md-sys-color-on-surface-variant)",
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                <span
                  className={`md-icon ${sel ? "is-filled" : ""}`}
                  style={{ fontSize: 20 }}
                >
                  {n.icon}
                </span>
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Content panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ── 프로필 ── */}
          {section === "profile" && (
            <>
              <Card title="프로필">
                {/* Avatar + color palette */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "12px 0",
                    borderBottom: "1px solid var(--md-sys-color-outline-variant)",
                  }}
                >
                  {/* Avatar preview */}
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 9999,
                      background: color,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                      fontWeight: 600,
                      fontFamily: "var(--md-sys-typescale-plain-font)",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>

                  {/* Color picker */}
                  <div>
                    <div
                      className="md-label-large"
                      style={{
                        color: "var(--md-sys-color-on-surface-variant)",
                        marginBottom: 8,
                      }}
                    >
                      아바타 색상
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          title={c}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 9999,
                            border: "none",
                            cursor: "pointer",
                            background: c,
                            boxShadow:
                              color === c
                                ? "0 0 0 2px var(--md-sys-color-surface-container-low), 0 0 0 4px var(--md-sys-color-primary)"
                                : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <Row title="이름">
                  <div style={{ width: 240 }}>
                    <div
                      style={{
                        position: "relative",
                        borderRadius: 4,
                        boxShadow: "inset 0 0 0 1px var(--md-sys-color-outline)",
                      }}
                    >
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          padding: "12px 14px",
                          borderRadius: 4,
                          fontFamily: "var(--md-sys-typescale-plain-font)",
                          fontSize: 15,
                          color: "var(--md-sys-color-on-surface)",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                </Row>

                {/* Bio */}
                <Row title="소개" last>
                  <div style={{ width: 240 }}>
                    <div
                      style={{
                        borderRadius: 4,
                        boxShadow: "inset 0 0 0 1px var(--md-sys-color-outline)",
                      }}
                    >
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          padding: "12px 14px",
                          borderRadius: 4,
                          fontFamily: "var(--md-sys-typescale-plain-font)",
                          fontSize: 15,
                          color: "var(--md-sys-color-on-surface)",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                </Row>
              </Card>

              {/* Organisation card — visual only */}
              <Card title="조직">
                <Row title="워크스페이스" desc="모자이크">
                  <button
                    type="button"
                    style={{
                      height: 36,
                      padding: "0 16px",
                      borderRadius: 9999,
                      border: "1px solid var(--md-sys-color-outline)",
                      cursor: "pointer",
                      background: "transparent",
                      color: "var(--md-sys-color-primary)",
                      fontFamily: "var(--md-sys-typescale-plain-font)",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    전환
                  </button>
                </Row>
                <Row title="이메일" desc={email} last>
                  <span
                    className="md-body-small"
                    style={{ color: "#386A20", fontWeight: 600 }}
                  >
                    인증됨
                  </span>
                </Row>
              </Card>
            </>
          )}

          {/* ── 계정 · 보안 (placeholder) ── */}
          {section === "account" && (
            <Card title="계정 · 보안">
              <Row title="비밀번호" desc="마지막 변경 32일 전">
                <button
                  type="button"
                  style={{
                    height: 36,
                    padding: "0 16px",
                    borderRadius: 9999,
                    border: "1px solid var(--md-sys-color-outline)",
                    cursor: "pointer",
                    background: "transparent",
                    color: "var(--md-sys-color-primary)",
                    fontFamily: "var(--md-sys-typescale-plain-font)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  변경
                </button>
              </Row>
              <Row title="2단계 인증" desc="로그인 시 인증 코드를 추가로 요구해요" />
              <Row title="연결된 계정" desc="Google · 카카오" />
              <Row title="로그인 기기" desc="현재 3대에서 로그인됨" last />
            </Card>
          )}

          {/* ── 알림 (placeholder) ── */}
          {section === "notif" && (
            <>
              <Card title="활동 알림">
                <Row title="멘션" desc="누군가 회원님을 멘션할 때" />
                <Row title="댓글" desc="내 게시물에 댓글이 달릴 때" />
                <Row title="초대" desc="새 보드에 초대될 때" last />
              </Card>
              <Card title="이메일">
                <Row title="주간 다이제스트" desc="한 주간의 보드 활동 요약" />
                <Row title="제품 소식" desc="새 기능과 팁 안내" last />
              </Card>
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "var(--md-sys-color-surface-container)",
                  color: "var(--md-sys-color-on-surface-variant)",
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                  fontSize: 14,
                }}
              >
                알림 설정 기능은 준비 중입니다.
              </div>
            </>
          )}

          {/* ── 테마 · 표시 ── */}
          {section === "appearance" && (
            <Card title="테마">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 0",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    className="md-title-small"
                    style={{ color: "var(--md-sys-color-on-surface)" }}
                  >
                    다크 모드
                  </div>
                  <div
                    className="md-body-small"
                    style={{
                      color: "var(--md-sys-color-on-surface-variant)",
                      marginTop: 2,
                    }}
                  >
                    라이트 / 다크 테마를 전환합니다
                  </div>
                </div>
                <ThemeToggle size={40} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
