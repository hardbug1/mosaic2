"use client";

import React from "react";
import type { Post } from "@/lib/posts";
import PostCard from "@/components/board/PostCard";
import { EmptyState } from "./EmptyState";

interface GridViewProps {
  posts: Post[];
  dense?: boolean;
  currentUserId: string;
  onToggleLike: (id: string) => void;
  onOpen?: (post: Post) => void;
  onCardDrop: (dragId: string, section: null) => void;
}

export default function GridView({
  posts,
  dense,
  currentUserId,
  onToggleLike,
  onOpen,
  onCardDrop,
}: GridViewProps) {
  const [dragId, setDragId] = React.useState<string | null>(null);

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 20 }}>
      <div style={{ columnWidth: 260, columnGap: 16 }}>
        {posts.map((p) => (
          <div
            key={p.id}
            draggable
            onDragStart={() => setDragId(p.id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.stopPropagation();
              if (dragId) {
                onCardDrop(dragId, null);
              }
              setDragId(null);
            }}
            style={{
              breakInside: "avoid",
              marginBottom: 16,
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
        {posts.length === 0 && <EmptyState />}
      </div>
    </div>
  );
}
