"use client";

import React, { useMemo, useState } from "react";
import { usePosts } from "@/hooks/usePosts";
import { usePresence, type PresenceMember } from "@/hooks/usePresence";
import { useNotifications } from "@/hooks/useNotifications";
import { filterPosts, type Post } from "@/lib/posts";
import BoardTopBar from "@/components/board/BoardTopBar";
import { useRouter } from "next/navigation";
import ColumnsView from "@/components/board/views/ColumnsView";
import GridView from "@/components/board/views/GridView";
import CanvasView from "@/components/board/views/CanvasView";
import { EmptyBoard } from "@/components/board/EmptyBoard";
import { Composer } from "@/components/board/Composer";
import PostDetail from "@/components/board/PostDetail";
import { ShareDialog } from "@/components/board/ShareDialog";

type Layout = "columns" | "grid" | "canvas";

type BoardMemberRole = "owner" | "admin" | "editor" | "viewer";

interface BoardClientProps {
  boardId: string;
  boardTitle: string;
  initialPosts: Post[];
  members: PresenceMember[];
  me: PresenceMember;
  inviteToken: string;
  currentUserRole: BoardMemberRole;
}

export function BoardClient({
  boardId,
  boardTitle,
  initialPosts,
  members,
  me,
  inviteToken,
  currentUserRole,
}: BoardClientProps) {
  // Stable membersById map for usePosts realtime callbacks
  const membersById = useMemo(
    () =>
      Object.fromEntries(
        members.map((m) => [
          m.id,
          { name: m.name, initials: m.initials, color: m.color },
        ]),
      ),
    [members],
  );

  const { posts, createPost, movePost, removePost: _removePost, toggleLike } =
    usePosts(boardId, initialPosts, me.id, membersById);

  // Memoize `me` by identity so usePresence doesn't re-subscribe on every render
  const meMemo = useMemo(() => me, [me.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const online = usePresence(boardId, meMemo);

  const router = useRouter();
  const { unreadCount } = useNotifications(me.id);

  // Share dialog state
  const [shareOpen, setShareOpen] = useState(false);

  // Detail modal state
  const [detailPost, setDetailPost] = useState<Post | null>(null);

  // View / filter state
  const [layout, setLayout] = useState<Layout>("columns");
  const [query, setQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState<"all" | string>("all");

  // Composer state
  const [composer, setComposer] = useState<{ open: boolean; section: string }>({
    open: false,
    section: "well",
  });

  const visible = useMemo(
    () => filterPosts(posts, query, authorFilter),
    [posts, query, authorFilter],
  );

  const openComposer = (section: string) =>
    setComposer({ open: true, section });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--md-sys-color-surface)",
      }}
    >
      <BoardTopBar
        title={boardTitle}
        query={query}
        setQuery={setQuery}
        authorFilter={authorFilter}
        setAuthorFilter={setAuthorFilter}
        layout={layout}
        setLayout={setLayout}
        onShare={() => setShareOpen(true)}
        onAdd={() => openComposer("well")}
        online={online}
        postCount={posts.length}
        currentUserId={me.id}
        unreadCount={unreadCount}
        onNotifications={() => router.push("/notifications")}
      />

      {/* Content area */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {posts.length === 0 ? (
          <EmptyBoard
            onAddPost={() => openComposer("well")}
            /* onInvite placeholder — not wired yet */
          />
        ) : layout === "columns" ? (
          <ColumnsView
            posts={visible}
            currentUserId={me.id}
            onToggleLike={toggleLike}
            onCardDrop={(dragId, section) => movePost(dragId, { section })}
            onAdd={(section) => openComposer(section)}
            onOpen={(p) => setDetailPost(p)}
          />
        ) : layout === "grid" ? (
          <GridView
            posts={visible}
            currentUserId={me.id}
            onToggleLike={toggleLike}
            onCardDrop={(_dragId) => {
              // Grid reorder is visual-only — no persistent section/order column yet
            }}
            onOpen={(p) => setDetailPost(p)}
          />
        ) : (
          <CanvasView
            posts={visible}
            currentUserId={me.id}
            onToggleLike={toggleLike}
            onMove={(id, x, y) => movePost(id, { x, y })}
            onOpen={(p) => setDetailPost(p)}
          />
        )}
      </div>

      {/* Floating "새 게시물" FAB — bottom-right pill button */}
      <button
        onClick={() => openComposer("well")}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 56,
          padding: "0 24px 0 16px",
          borderRadius: 9999,
          border: "none",
          cursor: "pointer",
          background: "var(--md-sys-color-primary-container)",
          color: "var(--md-sys-color-on-primary-container)",
          fontFamily: "var(--md-sys-typescale-plain-font)",
          fontSize: 15,
          fontWeight: 600,
          boxShadow: "var(--md-sys-elevation-level3)",
        }}
      >
        <span className="md-icon" style={{ fontSize: 24 }}>
          add
        </span>
        새 게시물
      </button>

      <Composer
        open={composer.open}
        defaultSection={composer.section}
        boardId={boardId}
        onClose={() => setComposer((c) => ({ ...c, open: false }))}
        onCreate={async (input) => {
          await createPost(input);
        }}
      />

      {detailPost && (
        <PostDetail
          post={detailPost}
          me={me}
          currentUserId={me.id}
          boardId={boardId}
          membersById={membersById}
          onClose={() => setDetailPost(null)}
        />
      )}

      {shareOpen && (
        <ShareDialog
          open
          boardId={boardId}
          boardTitle={boardTitle}
          inviteToken={inviteToken}
          currentUserId={me.id}
          currentUserRole={currentUserRole}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
