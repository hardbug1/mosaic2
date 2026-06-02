"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BoardScheme } from "@/lib/time";

/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
export type BoardCardData = {
  id: string;
  title: string;
  members: { name: string; initials: string; color: string }[];
  posts: number;
  updated: string;
  starred: boolean;
  live: number;
  scheme: BoardScheme;
};

type Props = {
  boards: BoardCardData[];
  userName: string;
  userInitials: string;
  userColor: string;
  userId: string;
  createBoard: (fd: FormData) => Promise<void>;
};

/* ─────────────────────────────────────────────────────────────────
   Board color palette (matches home.jsx)
───────────────────────────────────────────────────────────────── */
const BOARD_COLORS: Record<BoardScheme, [string, string]> = {
  violet: ["#6750A4", "#A23BB0"],
  green: ["#386A20", "#7FB069"],
  blue: ["#00639B", "#4AA3D1"],
  rose: ["#8C4A60", "#C77D94"],
  amber: ["#9A6A00", "#E0A93B"],
  teal: ["#006A60", "#3FA89C"],
};

/* ─────────────────────────────────────────────────────────────────
   MosaicMark logo
───────────────────────────────────────────────────────────────── */
function MosaicMark({ size = 30 }: { size?: number }) {
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
   BoardThumb — mini mosaic thumbnail for a card
───────────────────────────────────────────────────────────────── */
function BoardThumb({ scheme }: { scheme: BoardScheme }) {
  const [a, b] = BOARD_COLORS[scheme] ?? BOARD_COLORS.violet;
  // Use a "columns" layout pattern for all boards (deterministic, not stored yet)
  const blocks = [
    [0, 0, 1, 2],
    [1, 0, 1, 1],
    [1, 1, 1, 1],
    [2, 0, 1, 2],
    [3, 0, 1, 1],
  ];
  return (
    <div
      style={{
        height: 132,
        borderRadius: 14,
        padding: 12,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${a}22, ${b}14)`,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: 6,
      }}
    >
      {blocks.map((bl, i) => (
        <div
          key={i}
          style={{
            gridColumn: `${bl[0] + 1} / span ${bl[2]}`,
            gridRow: `${bl[1] + 1} / span ${bl[3]}`,
            background: i % 2 === 0 ? a : b,
            opacity: 0.16 + (i % 3) * 0.08,
            borderRadius: 7,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MemberDots — overlapping avatar circles
───────────────────────────────────────────────────────────────── */
function MemberDots({
  members,
}: {
  members: { name: string; initials: string; color: string }[];
}) {
  const shown = members.slice(0, 3);
  const extra = members.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((p, i) => (
        <div
          key={i}
          title={p.name}
          style={{
            width: 26,
            height: 26,
            borderRadius: 9999,
            background: p.color,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "var(--md-sys-typescale-plain-font)",
            marginLeft: i === 0 ? 0 : -7,
            boxShadow: "0 0 0 2px var(--md-sys-color-surface-container-low)",
          }}
        >
          {p.initials}
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 9999,
            marginLeft: -7,
            background: "var(--md-sys-color-surface-container-highest)",
            color: "var(--md-sys-color-on-surface-variant)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "var(--md-sys-typescale-plain-font)",
            boxShadow: "0 0 0 2px var(--md-sys-color-surface-container-low)",
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   BoardCard
───────────────────────────────────────────────────────────────── */
function BoardCard({
  board,
  onToggleStar,
}: {
  board: BoardCardData;
  onToggleStar: (id: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/boards/${board.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left",
        border: "1px solid var(--md-sys-color-outline-variant)",
        cursor: "pointer",
        background: "var(--md-sys-color-surface-container-low)",
        borderRadius: 20,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: "var(--md-sys-typescale-plain-font)",
        boxShadow: hover
          ? "var(--md-sys-elevation-level2)"
          : "var(--md-sys-elevation-level1)",
        transform: hover ? "translateY(-2px)" : "none",
        transition:
          "box-shadow 160ms var(--md-sys-motion-easing-standard), transform 120ms var(--md-sys-motion-easing-standard)",
      }}
    >
      <div style={{ position: "relative" }}>
        <BoardThumb scheme={board.scheme} />

        {/* Star toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(board.id);
          }}
          title="즐겨찾기"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: 9999,
            border: "none",
            cursor: "pointer",
            background: "var(--md-sys-color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: board.starred
              ? "#E0A93B"
              : "var(--md-sys-color-on-surface-variant)",
            boxShadow: "var(--md-sys-elevation-level1)",
          }}
        >
          <span
            className={`md-icon ${board.starred ? "is-filled" : ""}`}
            style={{ fontSize: 18 }}
          >
            star
          </span>
        </button>

        {/* Live badge — only when live > 0 */}
        {board.live > 0 && (
          <span
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "var(--md-sys-color-surface)",
              borderRadius: 9999,
              padding: "3px 9px",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--md-sys-color-on-surface-variant)",
              boxShadow: "var(--md-sys-elevation-level1)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 9999,
                background: "#386A20",
              }}
            />
            {board.live}명 접속
          </span>
        )}
      </div>

      {/* Card body */}
      <div
        style={{ padding: "0 4px 4px", display: "flex", flexDirection: "column", gap: 10 }}
      >
        <div
          className="md-title-medium"
          style={{ color: "var(--md-sys-color-on-surface)" }}
        >
          {board.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <MemberDots members={board.members} />
          <span
            className="md-body-small"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            게시물 {board.posts}개 · {board.updated}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Create Board Modal
───────────────────────────────────────────────────────────────── */
const BOARD_TEMPLATES = [
  {
    id: "blank",
    title: "빈 보드",
    desc: "처음부터 자유롭게",
    icon: "add",
    accent: "#6750A4",
  },
  {
    id: "retro",
    title: "회고 (KPT)",
    desc: "Keep · Problem · Try",
    icon: "task_alt",
    accent: "#386A20",
  },
  {
    id: "brainstorm",
    title: "브레인스토밍",
    desc: "아이디어를 자유롭게 발산",
    icon: "lightbulb",
    accent: "#9A6A00",
  },
  {
    id: "roadmap",
    title: "로드맵",
    desc: "분기별 계획 정리",
    icon: "calendar_month",
    accent: "#00639B",
  },
];

function CreateBoardModal({
  open,
  onClose,
  createBoard,
}: {
  open: boolean;
  onClose: () => void;
  createBoard: (fd: FormData) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [tpl, setTpl] = useState("retro");

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setTpl("retro");
    }
  }, [open]);

  if (!open) return null;

  return (
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
          gap: 20,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            className="md-headline-small"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            새 보드 만들기
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              background: "transparent",
              color: "var(--md-sys-color-on-surface-variant)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="md-icon" style={{ fontSize: 22 }}>
              close
            </span>
          </button>
        </div>

        {/* Form — title + template picker */}
        <form
          action={createBoard}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Hidden template field (future use) */}
          <input type="hidden" name="template" value={tpl} />

          {/* Title field */}
          <div
            style={{
              position: "relative",
              borderRadius: 4,
              boxShadow: "inset 0 0 0 1px var(--md-sys-color-outline)",
            }}
          >
            <input
              name="title"
              value={title}
              placeholder=" "
              autoComplete="off"
              required
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                padding: "14px 16px",
                borderRadius: 4,
                fontFamily: "var(--md-sys-typescale-plain-font)",
                fontSize: 16,
                lineHeight: "24px",
                color: "var(--md-sys-color-on-surface)",
              }}
            />
            <label
              style={{
                position: "absolute",
                top: title ? -8 : 14,
                left: title ? 12 : 16,
                fontSize: title ? 12 : 16,
                padding: title ? "0 4px" : undefined,
                background: title
                  ? "var(--md-sys-color-surface-container-high)"
                  : "transparent",
                color: "var(--md-sys-color-on-surface-variant)",
                pointerEvents: "none",
                transition: "all 150ms cubic-bezier(0.2,0,0,1)",
                whiteSpace: "nowrap",
              }}
            >
              보드 이름
            </label>
          </div>

          {/* Template picker */}
          <div>
            <div
              className="md-label-large"
              style={{
                color: "var(--md-sys-color-on-surface-variant)",
                marginBottom: 10,
              }}
            >
              템플릿 선택
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {BOARD_TEMPLATES.map((t) => {
                const sel = tpl === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTpl(t.id)}
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      borderRadius: 16,
                      padding: 14,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      border: "none",
                      background: sel
                        ? "var(--md-sys-color-secondary-container)"
                        : "var(--md-sys-color-surface-container)",
                      boxShadow: sel
                        ? "inset 0 0 0 2px var(--md-sys-color-primary)"
                        : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                      fontFamily: "var(--md-sys-typescale-plain-font)",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        flexShrink: 0,
                        background: t.accent + "22",
                        color: t.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span className="md-icon" style={{ fontSize: 22 }}>
                        {t.icon}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        className="md-title-small"
                        style={{ color: "var(--md-sys-color-on-surface)" }}
                      >
                        {t.title}
                      </div>
                      <div
                        className="md-body-small"
                        style={{
                          color: "var(--md-sys-color-on-surface-variant)",
                        }}
                      >
                        {t.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                height: 40,
                padding: "0 20px",
                borderRadius: 9999,
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: "var(--md-sys-color-primary)",
                fontFamily: "var(--md-sys-typescale-plain-font)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              style={{
                height: 40,
                padding: "0 20px",
                borderRadius: 9999,
                border: "none",
                cursor: title.trim() ? "pointer" : "not-allowed",
                background: title.trim()
                  ? "var(--md-sys-color-primary)"
                  : "var(--md-sys-color-surface-container-highest)",
                color: title.trim()
                  ? "var(--md-sys-color-on-primary)"
                  : "var(--md-sys-color-on-surface-variant)",
                fontFamily: "var(--md-sys-typescale-plain-font)",
                fontSize: 14,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span className="md-icon" style={{ fontSize: 18 }}>
                add
              </span>
              만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Avatar dropdown menu
───────────────────────────────────────────────────────────────── */
function AvatarMenu({
  initials,
  color,
}: {
  initials: string;
  color: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="내 계정"
        style={{
          width: 36,
          height: 36,
          borderRadius: 9999,
          background: color,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "var(--md-sys-typescale-plain-font)",
          flexShrink: 0,
        }}
      >
        {initials}
      </button>

      {open && (
        <>
          {/* Backdrop to close */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1100,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 1101,
              minWidth: 160,
              background: "var(--md-sys-color-surface-container-high)",
              borderRadius: 12,
              boxShadow: "var(--md-sys-elevation-level3)",
              overflow: "hidden",
              border: "1px solid var(--md-sys-color-outline-variant)",
            }}
          >
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                textDecoration: "none",
                color: "var(--md-sys-color-on-surface)",
                fontFamily: "var(--md-sys-typescale-plain-font)",
                fontSize: 14,
              }}
            >
              <span className="md-icon" style={{ fontSize: 18 }}>
                settings
              </span>
              설정
            </a>
            <div
              style={{
                height: 1,
                background: "var(--md-sys-color-outline-variant)",
                margin: "0 16px",
              }}
            />
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  border: "none",
                  background: "transparent",
                  color: "var(--md-sys-color-on-surface)",
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                  fontSize: 14,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span className="md-icon" style={{ fontSize: 18 }}>
                  logout
                </span>
                로그아웃
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   BoardsClient — main export
───────────────────────────────────────────────────────────────── */
export function BoardsClient({
  boards: initialBoards,
  userName,
  userInitials,
  userColor,
  userId,
  createBoard,
}: Props) {
  const [boards, setBoards] = useState<BoardCardData[]>(initialBoards);
  const [filter, setFilter] = useState<"all" | "starred">("all");
  const [creating, setCreating] = useState(false);

  const supabase = createClient();

  // Favorite toggle — optimistic update with rollback on error
  const toggleStar = useCallback(
    async (boardId: string) => {
      const board = boards.find((b) => b.id === boardId);
      if (!board) return;

      const wasStarred = board.starred;

      // Optimistic update
      setBoards((bs) =>
        bs.map((b) =>
          b.id === boardId ? { ...b, starred: !b.starred } : b
        )
      );

      if (wasStarred) {
        const { error } = await supabase
          .from("board_favorites")
          .delete()
          .eq("board_id", boardId)
          .eq("user_id", userId);
        if (error) {
          // Revert
          setBoards((bs) =>
            bs.map((b) =>
              b.id === boardId ? { ...b, starred: wasStarred } : b
            )
          );
        }
      } else {
        const { error } = await supabase
          .from("board_favorites")
          .insert({ board_id: boardId, user_id: userId });
        if (error) {
          // Revert
          setBoards((bs) =>
            bs.map((b) =>
              b.id === boardId ? { ...b, starred: wasStarred } : b
            )
          );
        }
      }
    },
    [boards, supabase, userId]
  );

  const visible = boards.filter((b) => {
    if (filter === "starred") return b.starred;
    return true;
  });

  return (
    <>
      <style>{`
        .boards-topbar-search input::placeholder {
          color: var(--md-sys-color-on-surface-variant);
        }
      `}</style>

      <div
        style={{
          minHeight: "100%",
          background: "var(--md-sys-color-surface)",
        }}
      >
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
            gap: 16,
            padding: "14px 28px",
          }}
        >
          {/* Logo */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <MosaicMark size={30} />
            <span
              style={{
                fontFamily: "var(--md-sys-typescale-brand-font)",
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: "-0.4px",
                color: "var(--md-sys-color-on-surface)",
              }}
            >
              Mosaic
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Search bar — visual only */}
          <div
            className="boards-topbar-search"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 44,
              padding: "0 14px",
              borderRadius: 9999,
              width: 280,
              background: "var(--md-sys-color-surface-container-high)",
            }}
          >
            <span
              className="md-icon"
              style={{
                fontSize: 20,
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              search
            </span>
            <input
              placeholder="보드 검색"
              readOnly
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                flex: 1,
                fontFamily: "var(--md-sys-typescale-plain-font)",
                fontSize: 15,
                color: "var(--md-sys-color-on-surface)",
                cursor: "default",
              }}
            />
          </div>

          {/* Notifications bell — visual only */}
          <button
            type="button"
            title="알림"
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              background: "transparent",
              color: "var(--md-sys-color-on-surface-variant)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="md-icon" style={{ fontSize: 24 }}>
              notifications
            </span>
          </button>

          {/* Avatar + dropdown */}
          <AvatarMenu initials={userInitials} color={userColor} />
        </header>

        {/* ── Main content ── */}
        <main
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            padding: "32px 28px 80px",
          }}
        >
          {/* Greeting row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            <div>
              <div
                className="md-headline-medium"
                style={{ color: "var(--md-sys-color-on-surface)" }}
              >
                안녕하세요, {userName}님
              </div>
              <div
                className="md-body-medium"
                style={{
                  color: "var(--md-sys-color-on-surface-variant)",
                  marginTop: 4,
                }}
              >
                참여 중인 보드 {boards.length}개 · 오늘도 좋은 협업 되세요
              </div>
            </div>

            {/* "새 보드 만들기" primary button */}
            <button
              type="button"
              onClick={() => setCreating(true)}
              style={{
                height: 48,
                padding: "0 24px",
                borderRadius: 9999,
                border: "none",
                cursor: "pointer",
                background: "var(--md-sys-color-primary)",
                color: "var(--md-sys-color-on-primary)",
                fontFamily: "var(--md-sys-typescale-plain-font)",
                fontSize: 15,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="md-icon" style={{ fontSize: 20 }}>
                add
              </span>
              새 보드 만들기
            </button>
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {(
              [
                ["all", "전체 보드", "grid_view"],
                ["starred", "즐겨찾기", "star"],
              ] as const
            ).map(([id, label, icon]) => {
              const sel = filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 36,
                    padding: "0 14px",
                    borderRadius: 9999,
                    cursor: "pointer",
                    border: "none",
                    background: sel
                      ? "var(--md-sys-color-secondary-container)"
                      : "transparent",
                    boxShadow: sel
                      ? "none"
                      : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                    color: sel
                      ? "var(--md-sys-color-on-secondary-container)"
                      : "var(--md-sys-color-on-surface-variant)",
                    fontFamily: "var(--md-sys-typescale-plain-font)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <span className="md-icon" style={{ fontSize: 18 }}>
                    {icon}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Board grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {/* Create tile */}
            <button
              type="button"
              onClick={() => setCreating(true)}
              style={{
                minHeight: 240,
                border: "1.5px dashed var(--md-sys-color-outline-variant)",
                cursor: "pointer",
                background: "transparent",
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                color: "var(--md-sys-color-on-surface-variant)",
                fontFamily: "var(--md-sys-typescale-plain-font)",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 9999,
                  background: "var(--md-sys-color-primary-container)",
                  color: "var(--md-sys-color-on-primary-container)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="md-icon" style={{ fontSize: 26 }}>
                  add
                </span>
              </div>
              <span className="md-title-small">새 보드 만들기</span>
            </button>

            {/* Board cards */}
            {visible.map((b) => (
              <BoardCard key={b.id} board={b} onToggleStar={toggleStar} />
            ))}
          </div>

          {/* Empty state */}
          {visible.length === 0 && filter === "starred" && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <span className="md-icon" style={{ fontSize: 40 }}>
                star_border
              </span>
              <div className="md-title-medium" style={{ marginTop: 8 }}>
                즐겨찾기한 보드가 없어요
              </div>
            </div>
          )}

          {boards.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <span className="md-icon" style={{ fontSize: 40 }}>
                dashboard
              </span>
              <div className="md-title-medium" style={{ marginTop: 8 }}>
                아직 보드가 없어요
              </div>
              <div
                className="md-body-medium"
                style={{ marginTop: 6 }}
              >
                새 보드를 만들어 팀과 협업을 시작해 보세요
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create board modal */}
      <CreateBoardModal
        open={creating}
        onClose={() => setCreating(false)}
        createBoard={createBoard}
      />
    </>
  );
}
