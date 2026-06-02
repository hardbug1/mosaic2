"use client";

import React, { useState, useRef, useEffect } from "react";
import { TINTS } from "@/lib/constants";
import { useComments } from "@/hooks/useComments";
import { relativeKo } from "@/lib/time";
import type { Post } from "@/lib/posts";
import type { PresenceMember } from "@/hooks/usePresence";
import type { Comment } from "@/lib/comments";

// ---------------------------------------------------------------------------
// Media blocks (reused from PostCard style)
// ---------------------------------------------------------------------------

function ImageBlock() {
  return (
    <div
      style={{
        height: 150,
        borderRadius: 10,
        background: "linear-gradient(135deg,#386A20,#7FB069)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        className="md-icon"
        style={{ fontSize: 40, color: "rgba(255,255,255,0.9)" }}
      >
        image
      </span>
    </div>
  );
}

function VideoBlock({ url }: { url?: string | null }) {
  const inner = (
    <div
      style={{
        height: 150,
        borderRadius: 10,
        background: "linear-gradient(135deg,#1D1B20,#49454F)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 9999,
          background: "rgba(255,255,255,0.92)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="md-icon is-filled"
          style={{ fontSize: 28, color: "#1D1B20", marginLeft: 3 }}
        >
          play_arrow
        </span>
      </div>
    </div>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ display: "block", textDecoration: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </a>
    );
  }
  return inner;
}

function LinkPreview({
  title,
  domain,
  url,
}: {
  title?: string | null;
  domain?: string | null;
  url?: string | null;
}) {
  const displayDomain =
    domain ??
    (() => {
      if (!url) return null;
      try {
        return new URL(url).hostname;
      } catch {
        return url;
      }
    })();

  const inner = (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        background: "rgba(0,0,0,0.04)",
        boxShadow: "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          flexShrink: 0,
          background: "var(--md-sys-color-secondary-container)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="md-icon"
          style={{
            fontSize: 22,
            color: "var(--md-sys-color-on-secondary-container)",
          }}
        >
          link
        </span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          className="md-label-large"
          style={{
            color: "var(--md-sys-color-on-surface)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title ?? ""}
        </div>
        <div
          className="md-body-small"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          {displayDomain ?? ""}
        </div>
      </div>
    </div>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ display: "block", textDecoration: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </a>
    );
  }
  return inner;
}

function FileChip({
  title,
  size,
  ext,
}: {
  title?: string | null;
  size?: string | null;
  ext?: string | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        background: "rgba(0,0,0,0.04)",
        boxShadow: "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          flexShrink: 0,
          background: "var(--md-sys-color-error-container)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="md-label-small"
          style={{
            color: "var(--md-sys-color-on-error-container)",
            fontWeight: 700,
          }}
        >
          {ext ?? ""}
        </span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          className="md-label-large"
          style={{
            color: "var(--md-sys-color-on-surface)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title ?? ""}
        </div>
        <div
          className="md-body-small"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          {size ?? ""}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommentRow
// ---------------------------------------------------------------------------

function CommentRow({
  comment,
  isMe,
}: {
  comment: Comment;
  isMe: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9999,
          flexShrink: 0,
          background: comment.author.color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "var(--md-sys-typescale-plain-font)",
        }}
      >
        {comment.author.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            className="md-label-large"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            {isMe ? "나" : comment.author.name}
          </span>
          <span
            className="md-body-small"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            {relativeKo(comment.createdAt)}
          </span>
        </div>
        <div
          className="md-body-medium"
          style={{
            color: "var(--md-sys-color-on-surface)",
            marginTop: 2,
            textWrap: "pretty",
          } as React.CSSProperties}
        >
          {comment.text}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PostDetail modal
// ---------------------------------------------------------------------------

export interface PostDetailProps {
  post: Post;
  me: PresenceMember;
  currentUserId: string;
  boardId: string;
  membersById: Record<string, { name: string; initials: string; color: string }>;
  onClose: () => void;
}

export default function PostDetail({
  post,
  me,
  currentUserId,
  boardId,
  membersById,
  onClose,
}: PostDetailProps) {
  const { comments, loading, addComment } = useComments(
    post.id,
    boardId,
    currentUserId,
    membersById,
  );

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new comments arrive
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  const tint = TINTS[post.tint] ?? TINTS.paper;
  const author = post.author;
  const isMyPost = post.authorId === currentUserId;

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    try {
      await addComment(text);
    } catch {
      // addComment already logs; restore draft on failure
      setDraft(text);
    } finally {
      setSending(false);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,0.32)",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(480px, 100%)",
          height: "100%",
          background: "var(--md-sys-color-surface)",
          boxShadow: "var(--md-sys-elevation-level3)",
          display: "flex",
          flexDirection: "column",
          animation:
            "slideIn 280ms var(--md-sys-motion-easing-emphasized-decelerate)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderBottom: "1px solid var(--md-sys-color-outline-variant)",
          }}
        >
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            title="닫기"
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--md-sys-color-on-surface-variant)",
            }}
          >
            <span className="md-icon" style={{ fontSize: 22 }}>
              close
            </span>
          </button>
        </div>

        {/* Scrollable body */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Post content card */}
          <div
            style={{
              background: tint.bg,
              outline: `1px solid ${tint.line}`,
              borderRadius: 16,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {post.type === "image" && <ImageBlock />}
            {post.type === "video" && <VideoBlock url={post.url} />}

            {post.title && post.type !== "link" && post.type !== "file" && (
              <div
                className="md-title-medium"
                style={{ color: "var(--md-sys-color-on-surface)" }}
              >
                {post.title}
              </div>
            )}

            {post.text && (
              <div
                className="md-body-large"
                style={{
                  color: "var(--md-sys-color-on-surface)",
                  textWrap: "pretty",
                } as React.CSSProperties}
              >
                {post.text}
              </div>
            )}

            {post.type === "link" && (
              <LinkPreview
                title={post.title}
                domain={post.domain}
                url={post.url}
              />
            )}

            {post.type === "file" && (
              <FileChip
                title={post.fileName}
                size={post.fileSize}
                ext={post.fileExt}
              />
            )}
          </div>

          {/* Author row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9999,
                flexShrink: 0,
                background: author.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "var(--md-sys-typescale-plain-font)",
              }}
            >
              {author.initials}
            </div>
            <span
              className="md-label-large"
              style={{
                color: "var(--md-sys-color-on-surface)",
                flex: 1,
              }}
            >
              {isMyPost ? "나" : author.name}
            </span>
            <span
              className="md-body-small"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              {relativeKo(post.createdAt)}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "var(--md-sys-color-outline-variant)",
            }}
          />

          {/* Comment section header */}
          <div
            className="md-title-small"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            댓글 {comments.length}개
          </div>

          {/* Comment list */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {loading && (
              <div
                className="md-body-small"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                불러오는 중…
              </div>
            )}

            {!loading && comments.length === 0 && (
              <div
                className="md-body-small"
                style={{
                  color: "var(--md-sys-color-on-surface-variant)",
                  textAlign: "center",
                  padding: "12px 0",
                }}
              >
                첫 댓글을 남겨보세요
              </div>
            )}

            {comments.map((c) => (
              <CommentRow
                key={c.id}
                comment={c}
                isMe={c.authorId === currentUserId}
              />
            ))}

            <div ref={commentsEndRef} />
          </div>
        </div>

        {/* Composer */}
        <div
          style={{
            borderTop: "1px solid var(--md-sys-color-outline-variant)",
            padding: 12,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {/* My avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              flexShrink: 0,
              background: me.color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "var(--md-sys-typescale-plain-font)",
            }}
          >
            {me.initials}
          </div>

          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="댓글 남기기"
            disabled={sending}
            style={{
              flex: 1,
              height: 44,
              padding: "0 16px",
              borderRadius: 9999,
              border: "1px solid var(--md-sys-color-outline-variant)",
              background: "var(--md-sys-color-surface-container-high)",
              outline: "none",
              fontFamily: "var(--md-sys-typescale-plain-font)",
              fontSize: 14,
              color: "var(--md-sys-color-on-surface)",
            }}
          />

          <button
            onClick={() => void send()}
            disabled={!draft.trim() || sending}
            title="보내기"
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              border: "none",
              cursor: draft.trim() && !sending ? "pointer" : "default",
              background:
                draft.trim() && !sending
                  ? "var(--md-sys-color-primary)"
                  : "var(--md-sys-color-surface-container-high)",
              color:
                draft.trim() && !sending
                  ? "var(--md-sys-color-on-primary)"
                  : "var(--md-sys-color-on-surface-variant)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span className="md-icon" style={{ fontSize: 20 }}>
              send
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
