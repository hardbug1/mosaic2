"use client";

import React from "react";
import { SECTIONS } from "@/lib/constants";
import type { Post } from "@/lib/posts";
import PostCard from "@/components/board/PostCard";
import { M3IconButton } from "@/components/m3/IconButton";

interface ColumnsViewProps {
  posts: Post[];
  dense?: boolean;
  currentUserId: string;
  onToggleLike: (id: string) => void;
  onOpen?: (post: Post) => void;
  onCardDrop: (dragId: string, section: string) => void;
  onAdd: (section: string) => void;
}

export default function ColumnsView({
  posts,
  dense,
  currentUserId,
  onToggleLike,
  onOpen,
  onCardDrop,
  onAdd,
}: ColumnsViewProps) {
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overCol, setOverCol] = React.useState<string | null>(null);

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 20 }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          minHeight: "100%",
        }}
      >
        {SECTIONS.map((sec) => {
          const colPosts = posts.filter((p) => p.section === sec.id);
          return (
            <div
              key={sec.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(sec.id);
              }}
              onDragLeave={() =>
                setOverCol((c) => (c === sec.id ? null : c))
              }
              onDrop={() => {
                if (dragId) {
                  onCardDrop(dragId, sec.id);
                }
                setOverCol(null);
                setDragId(null);
              }}
              style={{
                width: 300,
                minWidth: 300,
                flexShrink: 0,
                borderRadius: 20,
                padding: 12,
                background:
                  overCol === sec.id
                    ? "var(--md-sys-color-surface-container)"
                    : "var(--md-sys-color-surface-container-low)",
                boxShadow:
                  overCol === sec.id
                    ? "inset 0 0 0 2px var(--md-sys-color-primary)"
                    : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                transition:
                  "background 120ms linear, box-shadow 120ms linear",
              }}
            >
              {/* column header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "2px 4px",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 9999,
                    background: sec.accent,
                  }}
                />
                <span
                  className="md-icon"
                  style={{ fontSize: 18, color: sec.accent }}
                >
                  {sec.icon}
                </span>
                <span
                  className="md-title-medium"
                  style={{
                    color: "var(--md-sys-color-on-surface)",
                    flex: 1,
                  }}
                >
                  {sec.title}
                </span>
                <span
                  className="md-label-medium"
                  style={{
                    color: "var(--md-sys-color-on-surface-variant)",
                    background:
                      "var(--md-sys-color-surface-container-high)",
                    borderRadius: 9999,
                    padding: "2px 8px",
                  }}
                >
                  {colPosts.length}
                </span>
                <M3IconButton
                  icon="add"
                  size={32}
                  tooltip="여기에 추가"
                  onClick={() => onAdd(sec.id)}
                />
              </div>

              {/* cards */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  minHeight: 60,
                }}
              >
                {colPosts.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => setDragId(p.id)}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.stopPropagation();
                      if (dragId) {
                        onCardDrop(dragId, sec.id);
                      }
                      setDragId(null);
                    }}
                    style={{
                      opacity: dragId === p.id ? 0.4 : 1,
                      cursor: "grab",
                    }}
                  >
                    <PostCard
                      post={p}
                      dense={dense}
                      isMine={p.authorId === currentUserId}
                      onToggleLike={onToggleLike}
                      onOpen={onOpen}
                    />
                  </div>
                ))}
                {colPosts.length === 0 && (
                  <div
                    className="md-body-small"
                    style={{
                      color: "var(--md-sys-color-on-surface-variant)",
                      textAlign: "center",
                      padding: "18px 0",
                      border:
                        "1.5px dashed var(--md-sys-color-outline-variant)",
                      borderRadius: 12,
                    }}
                  >
                    여기에 게시물을 놓으세요
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
