"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { relativeKo } from "@/lib/time";

// ---- MosaicMark brand icon ----
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

// ---- type icon colours (matches design) ----
const TYPE_COLOR: Record<AppNotification["type"], string> = {
  comment: "#00639B",
  like: "#B3261E",
  invite: "#9A6A00",
};

const TYPE_ICON: Record<AppNotification["type"], string> = {
  comment: "chat_bubble",
  like: "favorite",
  invite: "group_add",
};

function notifMessage(n: AppNotification): React.ReactNode {
  const actorName = n.actor?.name ?? "누군가";
  switch (n.type) {
    case "comment":
      return (
        <>
          <strong style={{ fontWeight: 700 }}>{actorName}</strong>님이 회원님의
          게시물에 댓글을 남겼어요
        </>
      );
    case "like":
      return (
        <>
          <strong style={{ fontWeight: 700 }}>{actorName}</strong>님이 회원님의
          게시물에 좋아요를 눌렀어요
        </>
      );
    case "invite":
      return (
        <>
          <strong style={{ fontWeight: 700 }}>{actorName}</strong>님이 회원님을
          보드에 초대했어요
        </>
      );
    default:
      return (
        <>
          <strong style={{ fontWeight: 700 }}>{actorName}</strong>님이 알림을
          보냈어요
        </>
      );
  }
}

// ---- Single notification row ----
function NotifRow({
  notif,
  onClick,
}: {
  notif: AppNotification;
  onClick: () => void;
}) {
  const actor = notif.actor;
  const typeColor = TYPE_COLOR[notif.type] ?? "#6750A4";
  const typeIcon = TYPE_ICON[notif.type] ?? "notifications";

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        border: "none",
        cursor: "pointer",
        background: notif.read
          ? "transparent"
          : "var(--md-sys-color-surface-container-low)",
        borderRadius: 14,
        padding: 12,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        marginBottom: 2,
        fontFamily: "var(--md-sys-typescale-plain-font)",
      }}
    >
      {/* Avatar with type badge */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 9999,
            background: actor?.color ?? "#6750A4",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {actor?.initials ?? "?"}
        </div>
        <div
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: typeColor,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 0 2px var(--md-sys-color-surface-container-high)",
          }}
        >
          <span className="md-icon" style={{ fontSize: 13 }}>
            {typeIcon}
          </span>
        </div>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="md-body-medium"
          style={{
            color: "var(--md-sys-color-on-surface)",
            textWrap: "pretty" as React.CSSProperties["textWrap"],
          }}
        >
          {notifMessage(notif)}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 4,
          }}
        >
          <span
            className="md-body-small"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            {relativeKo(notif.createdAt)}
          </span>
        </div>
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 9999,
            background: "var(--md-sys-color-primary)",
            flexShrink: 0,
            marginTop: 6,
          }}
        />
      )}
    </button>
  );
}

// ---- Main client component ----
export default function NotificationsClient({ userId }: { userId: string }) {
  const router = useRouter();
  const { notifications, markAllRead, markRead } = useNotifications(userId);

  // Auto mark all read on mount
  useEffect(() => {
    markAllRead();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRowClick(n: AppNotification) {
    markRead(n.id);
    if (n.boardId) {
      router.push(`/boards/${n.boardId}`);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--md-sys-color-surface)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
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
          padding: "14px 20px",
        }}
      >
        {/* Back to boards */}
        <button
          type="button"
          onClick={() => router.push("/boards")}
          title="보드 목록으로"
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
            flexShrink: 0,
          }}
        >
          <span className="md-icon" style={{ fontSize: 24 }}>
            arrow_back
          </span>
        </button>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

        {/* Title */}
        <div
          className="md-title-large"
          style={{ color: "var(--md-sys-color-on-surface)" }}
        >
          알림
        </div>

        <div style={{ flex: 1 }} />

        {/* Mark all read button */}
        <button
          type="button"
          onClick={() => markAllRead()}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--md-sys-color-primary)",
            fontFamily: "var(--md-sys-typescale-plain-font)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          모두 읽음
        </button>
      </header>

      {/* Notification list */}
      <main
        style={{
          flex: 1,
          maxWidth: 600,
          width: "100%",
          margin: "0 auto",
          padding: "8px 8px 80px",
        }}
      >
        {notifications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "var(--md-sys-color-on-surface-variant)",
            }}
          >
            <span className="md-icon" style={{ fontSize: 40 }}>
              notifications_off
            </span>
            <div className="md-title-medium" style={{ marginTop: 8 }}>
              새 알림이 없어요
            </div>
          </div>
        ) : (
          notifications.map((n) => (
            <NotifRow
              key={n.id}
              notif={n}
              onClick={() => handleRowClick(n)}
            />
          ))
        )}
      </main>
    </div>
  );
}
