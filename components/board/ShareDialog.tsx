"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { M3Button } from "@/components/m3/Button";
import { M3IconButton } from "@/components/m3/IconButton";

// Role type matching the DB constraint
type Role = "owner" | "admin" | "editor" | "viewer";

// Role pill labels: DB role → display label
const ROLE_LABEL: Record<Role, string> = {
  owner: "소유자",
  admin: "관리",
  editor: "편집",
  viewer: "보기",
};

// Editable role options (not owner): the 3 pills in the design
const EDITABLE_ROLES: { value: Exclude<Role, "owner">; label: string }[] = [
  { value: "viewer", label: "보기" },
  { value: "editor", label: "편집" },
  { value: "admin", label: "관리" },
];

// ----- RolePicker (3 pill pills: 보기/편집/관리) -----
function RolePicker({
  value,
  disabled,
  onChange,
}: {
  value: Exclude<Role, "owner">;
  disabled: boolean;
  onChange: (r: Exclude<Role, "owner">) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: 9999,
        padding: 2,
        gap: 2,
        background: "var(--md-sys-color-surface-container-highest)",
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      {EDITABLE_ROLES.map((r) => {
        const sel = value === r.value;
        return (
          <button
            key={r.value}
            disabled={disabled}
            onClick={() => onChange(r.value)}
            style={{
              height: 28,
              padding: "0 10px",
              borderRadius: 9999,
              border: "none",
              cursor: disabled ? "default" : "pointer",
              background: sel
                ? "var(--md-sys-color-primary)"
                : "transparent",
              color: sel
                ? "var(--md-sys-color-on-primary)"
                : "var(--md-sys-color-on-surface-variant)",
              fontFamily: "var(--md-sys-typescale-plain-font)",
              fontSize: 12,
              fontWeight: 600,
              transition: "background 120ms ease",
            }}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

// ----- Member row shape -----
interface MemberRow {
  userId: string;
  role: Role;
  name: string;
  initials: string;
  color: string;
}

// ----- Props -----
export interface ShareDialogProps {
  open: boolean;
  boardId: string;
  boardTitle: string;
  inviteToken: string;
  currentUserId: string;
  currentUserRole: Role;
  onClose: () => void;
}

export function ShareDialog({
  open,
  boardId,
  boardTitle,
  inviteToken,
  currentUserId,
  currentUserRole,
  onClose,
}: ShareDialogProps) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState("");
  const [inviteNote, setInviteNote] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch members whenever dialog opens
  useEffect(() => {
    if (!open) return;
    setInvite("");
    setInviteNote("");
    setCopied(false);
    setLoading(true);

    const supabase = createClient();
    supabase
      .from("board_members")
      .select("role, user_id, profiles(name, initials, color)")
      .eq("board_id", boardId)
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }

        const rows: MemberRow[] = (data as unknown as Array<{
          role: Role;
          user_id: string;
          profiles: { name: string; initials: string; color: string } | Array<{ name: string; initials: string; color: string }> | null;
        }>)
          .flatMap((m) => {
            const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
            if (!p) return [];
            return [{
              userId: m.user_id,
              role: m.role,
              name: p.name,
              initials: p.initials,
              color: p.color,
            }];
          })
          // Sort: owner first, then by name
          .sort((a, b) => {
            if (a.role === "owner") return -1;
            if (b.role === "owner") return 1;
            return a.name.localeCompare(b.name, "ko");
          });

        setMembers(rows);
        setLoading(false);
      });
  }, [open, boardId]);

  if (!open) return null;

  const isAdmin = currentUserRole === "owner" || currentUserRole === "admin";

  // Optimistic role update
  const handleRoleChange = async (userId: string, newRole: Exclude<Role, "owner">) => {
    // Optimistic update
    setMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m)),
    );
    const supabase = createClient();
    await supabase
      .from("board_members")
      .update({ role: newRole })
      .eq("board_id", boardId)
      .eq("user_id", userId);
  };

  // Optimistic remove
  const handleRemove = async (userId: string) => {
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
    const supabase = createClient();
    await supabase
      .from("board_members")
      .delete()
      .eq("board_id", boardId)
      .eq("user_id", userId);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/invite/${inviteToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInvite = () => {
    if (!invite.trim()) return;
    setInviteNote("지금은 초대 링크 복사로 공유해 주세요");
    setTimeout(() => setInviteNote(""), 3000);
  };

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(0,0,0,0.32)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--md-sys-color-surface-container-high)",
          borderRadius: 28,
          padding: 24,
          boxShadow: "var(--md-sys-elevation-level3)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              className="md-headline-small"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              보드 공유
            </div>
            <div
              className="md-body-small"
              style={{
                color: "var(--md-sys-color-on-surface-variant)",
                marginTop: 2,
              }}
            >
              {boardTitle}
            </div>
          </div>
          <M3IconButton icon="close" onClick={onClose} />
        </div>

        {/* Email invite row (placeholder) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 48,
                padding: "0 14px",
                borderRadius: 9999,
                border: "1px solid var(--md-sys-color-outline-variant)",
                background: "var(--md-sys-color-surface)",
              }}
            >
              <span
                className="md-icon"
                style={{
                  fontSize: 20,
                  color: "var(--md-sys-color-on-surface-variant)",
                }}
              >
                mail
              </span>
              <input
                value={invite}
                onChange={(e) => setInvite(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInvite();
                }}
                placeholder="이메일로 초대"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                  fontSize: 15,
                  color: "var(--md-sys-color-on-surface)",
                }}
              />
            </div>
            <M3Button
              variant="filled"
              onClick={handleInvite}
              style={{ height: 48, borderRadius: 9999 }}
            >
              초대
            </M3Button>
          </div>
          {inviteNote && (
            <div
              style={{
                fontSize: 12,
                color: "var(--md-sys-color-on-surface-variant)",
                paddingLeft: 14,
              }}
            >
              {inviteNote}
            </div>
          )}
        </div>

        {/* Member list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {loading && (
            <div
              style={{
                color: "var(--md-sys-color-on-surface-variant)",
                fontSize: 13,
                padding: "8px 4px",
              }}
            >
              불러오는 중…
            </div>
          )}
          {!loading &&
            members.map((m) => {
              const isOwner = m.role === "owner";
              const isSelf = m.userId === currentUserId;
              // Admin can edit roles of non-owners (but not self)
              const canEdit = isAdmin && !isOwner && !isSelf;
              const canRemove = isAdmin && !isOwner && !isSelf;

              return (
                <div
                  key={m.userId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 4px",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 9999,
                      flexShrink: 0,
                      background: m.color,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "var(--md-sys-typescale-plain-font)",
                    }}
                  >
                    {m.initials}
                  </div>

                  {/* Name + "나" / email-ish label */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="md-label-large"
                      style={{ color: "var(--md-sys-color-on-surface)" }}
                    >
                      {m.name}
                      {isOwner && " (소유자)"}
                    </div>
                    <div
                      className="md-body-small"
                      style={{
                        color: "var(--md-sys-color-on-surface-variant)",
                      }}
                    >
                      {isSelf ? "나" : m.name}
                    </div>
                  </div>

                  {/* Role control or static label */}
                  {isOwner ? (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--md-sys-color-on-surface-variant)",
                        fontFamily: "var(--md-sys-typescale-plain-font)",
                        flexShrink: 0,
                      }}
                    >
                      {ROLE_LABEL.owner}
                    </span>
                  ) : canEdit ? (
                    <RolePicker
                      value={m.role as Exclude<Role, "owner">}
                      disabled={false}
                      onChange={(r) => handleRoleChange(m.userId, r)}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--md-sys-color-on-surface-variant)",
                        fontFamily: "var(--md-sys-typescale-plain-font)",
                        flexShrink: 0,
                      }}
                    >
                      {ROLE_LABEL[m.role]}
                    </span>
                  )}

                  {/* Remove button — admin sees it for non-owners (not self) */}
                  {canRemove ? (
                    <M3IconButton
                      icon="close"
                      tooltip="멤버 제거"
                      onClick={() => handleRemove(m.userId)}
                    />
                  ) : (
                    /* Spacer so layout is consistent */
                    <div style={{ width: 40, flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "var(--md-sys-color-outline-variant)",
          }}
        />

        {/* Link sharing row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 9999,
              flexShrink: 0,
              background: "var(--md-sys-color-secondary-container)",
              color: "var(--md-sys-color-on-secondary-container)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="md-icon" style={{ fontSize: 20 }}>
              link
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="md-label-large"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              링크가 있는 모든 사용자
            </div>
            <div
              className="md-body-small"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              이 보드에 접근할 수 있어요 · 보기
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <M3Button variant="outlined" icon="link" onClick={handleCopyLink}>
            {copied ? "복사됨" : "링크 복사"}
          </M3Button>
          <M3Button variant="filled" onClick={onClose}>
            완료
          </M3Button>
        </div>
      </div>
    </div>
  );
}
