"use client";

import React from "react";
import type { Post } from "@/lib/posts";
import PostCard from "@/components/board/PostCard";
import { EmptyState } from "./EmptyState";

interface CanvasViewProps {
  posts: Post[];
  dense?: boolean;
  currentUserId: string;
  onToggleLike: (id: string) => void;
  onOpen?: (post: Post) => void;
  onMove: (id: string, x: number, y: number) => void;
}

export default function CanvasView({
  posts,
  dense,
  currentUserId,
  onToggleLike,
  onOpen,
  onMove,
}: CanvasViewProps) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const dragState = React.useRef<{
    id: string;
    dx: number;
    dy: number;
  } | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  // Stable refs for the handlers so we can add/remove exact same references
  const onPointerMove = React.useCallback((e: PointerEvent) => {
    const ds = dragState.current;
    if (!ds) return;
    const wrap = canvasRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const x = e.clientX - r.left + wrap.scrollLeft - ds.dx;
    const y = e.clientY - r.top + wrap.scrollTop - ds.dy;
    // We use a custom event to propagate position updates up to parent
    // The parent's onMove will be called on pointer-up (once); during drag
    // we update positions locally via a DOM transform to avoid re-rendering
    // the full post list on every pointer move. We store the live position
    // on the card element directly.
    const el = wrap.querySelector<HTMLElement>(
      `[data-canvas-card="${ds.id}"]`
    );
    if (el) {
      el.style.left = `${Math.max(0, x)}px`;
      el.style.top = `${Math.max(0, y)}px`;
    }
  }, []);

  const onPointerUp = React.useCallback(
    (e: PointerEvent) => {
      const ds = dragState.current;
      if (ds) {
        const wrap = canvasRef.current;
        if (wrap) {
          const r = wrap.getBoundingClientRect();
          const x = e.clientX - r.left + wrap.scrollLeft - ds.dx;
          const y = e.clientY - r.top + wrap.scrollTop - ds.dy;
          onMove(ds.id, Math.max(0, x), Math.max(0, y));
        }
      }
      dragState.current = null;
      setDraggingId(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    },
    [onMove, onPointerMove]
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>, post: Post) => {
      e.preventDefault();
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      dragState.current = {
        id: post.id,
        dx: e.clientX - rect.left,
        dy: e.clientY - rect.top,
      };
      setDraggingId(post.id);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [onPointerMove, onPointerUp]
  );

  // Cleanup listeners on unmount
  React.useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  return (
    <div
      ref={canvasRef}
      style={{
        height: "100%",
        overflow: "auto",
        position: "relative",
        backgroundColor: "var(--md-sys-color-surface)",
        backgroundImage:
          "radial-gradient(var(--md-sys-color-outline-variant) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 1100,
          height: 1000,
          minWidth: "100%",
        }}
      >
        {posts.map((p) => (
          <div
            key={p.id}
            data-canvas-card={p.id}
            onPointerDown={(e) => handlePointerDown(e, p)}
            style={{
              position: "absolute",
              left: p.x || 40,
              top: p.y || 40,
              width: 256,
              transform: `rotate(${p.rot || 0}deg)`,
              cursor: draggingId === p.id ? "grabbing" : "grab",
              touchAction: "none",
              zIndex: draggingId === p.id ? 50 : 1,
            }}
          >
            <PostCard
              post={p}
              dense={dense}
              isMine={p.authorId === currentUserId}
              onToggleLike={onToggleLike}
              ghost={draggingId === p.id}
              onOpen={onOpen}
            />
          </div>
        ))}
        {posts.length === 0 && (
          <div style={{ position: "absolute", top: 80, left: 0, right: 0 }}>
            <EmptyState />
          </div>
        )}
      </div>
    </div>
  );
}
