"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post, Author } from "@/lib/posts";
import type { PostType, SectionId } from "@/lib/constants";

export type NewPostInput = {
  type: string;
  section: string;
  tint: string;
  title?: string | null;
  text?: string | null;
  url?: string | null;
  domain?: string | null;
  media_path?: string | null;
  file_name?: string | null;
  file_size?: string | null;
  file_ext?: string | null;
  x?: number;
  y?: number;
  rot?: number;
};

const FALLBACK_AUTHOR: Author = {
  name: "알 수 없음",
  initials: "?",
  color: "#79747E",
};

/**
 * Build a Post from a raw postgres_changes INSERT payload.
 * Realtime payloads do NOT include joined author or post_likes,
 * so we resolve author from membersById and default likes to 0.
 */
function rawRowToPost(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: Record<string, any>,
  membersById: Record<string, Author>,
): Post {
  return {
    id: raw.id as string,
    boardId: raw.board_id as string,
    authorId: raw.author_id as string,
    type: raw.type as PostType,
    section: raw.section as SectionId,
    tint: raw.tint as string,
    title: (raw.title as string | null) ?? null,
    text: (raw.text as string | null) ?? null,
    url: (raw.url as string | null) ?? null,
    domain: (raw.domain as string | null) ?? null,
    mediaPath: (raw.media_path as string | null) ?? null,
    fileName: (raw.file_name as string | null) ?? null,
    fileSize: (raw.file_size as string | null) ?? null,
    fileExt: (raw.file_ext as string | null) ?? null,
    x: raw.x != null ? Number(raw.x) : 40,
    y: raw.y != null ? Number(raw.y) : 40,
    rot: raw.rot != null ? Number(raw.rot) : 0,
    createdAt: raw.created_at as string,
    author: membersById[raw.author_id as string] ?? FALLBACK_AUTHOR,
    likes: 0,
    likedByMe: false,
    comments: 0,
  };
}

export function usePosts(
  boardId: string,
  initialPosts: Post[],
  currentUserId: string,
  membersById: Record<string, Author>,
): {
  posts: Post[];
  createPost: (input: NewPostInput) => Promise<void>;
  movePost: (
    id: string,
    patch: { x?: number; y?: number; section?: string },
  ) => Promise<void>;
  removePost: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
} {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // Keep a stable ref to membersById so the realtime callback always has
  // the latest map without needing it as an effect dependency.
  const membersByIdRef = useRef(membersById);
  membersByIdRef.current = membersById;

  useEffect(() => {
    const supabase = createClient();

    // --- posts channel ---
    const postsChannel = supabase
      .channel(`posts:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `board_id=eq.${boardId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new as Record<string, unknown>;
            const newPost = rawRowToPost(
              newRow as Record<string, unknown>,
              membersByIdRef.current,
            );
            setPosts((prev) => {
              // Dedupe: the inserting client already has this post if it was
              // added optimistically — but we don't add optimistically for
              // createPost. Still guard against duplicate realtime events.
              if (prev.some((p) => p.id === newPost.id)) return prev;
              return [...prev, newPost];
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Record<string, unknown>;
            setPosts((prev) =>
              prev.map((p) => {
                if (p.id !== (updated.id as string)) return p;
                // Merge only mutable columns; preserve author/likes/likedByMe/comments
                return {
                  ...p,
                  x: updated.x != null ? Number(updated.x) : p.x,
                  y: updated.y != null ? Number(updated.y) : p.y,
                  rot: updated.rot != null ? Number(updated.rot) : p.rot,
                  section:
                    updated.section != null
                      ? (updated.section as SectionId)
                      : p.section,
                  text:
                    updated.text !== undefined
                      ? ((updated.text as string | null) ?? null)
                      : p.text,
                  title:
                    updated.title !== undefined
                      ? ((updated.title as string | null) ?? null)
                      : p.title,
                  tint:
                    updated.tint != null ? (updated.tint as string) : p.tint,
                  url:
                    updated.url !== undefined
                      ? ((updated.url as string | null) ?? null)
                      : p.url,
                  domain:
                    updated.domain !== undefined
                      ? ((updated.domain as string | null) ?? null)
                      : p.domain,
                };
              }),
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;
            setPosts((prev) => prev.filter((p) => p.id !== deletedId));
          }
        },
      )
      .subscribe();

    // --- likes channel ---
    // post_likes has no board_id column, so we can't filter by board here.
    // We guard by checking whether the affected post exists in state.
    const likesChannel = supabase
      .channel(`likes:${boardId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_likes" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as { post_id: string; user_id: string };
            // Skip own events — toggleLike already applied optimistic update
            if (row.user_id === currentUserId) return;
            setPosts((prev) =>
              prev.map((p) =>
                p.id === row.post_id ? { ...p, likes: p.likes + 1 } : p,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as { post_id: string; user_id: string };
            if (row.user_id === currentUserId) return;
            setPosts((prev) =>
              prev.map((p) =>
                p.id === row.post_id
                  ? { ...p, likes: Math.max(0, p.likes - 1) }
                  : p,
              ),
            );
          }
        },
      )
      .subscribe();

    // --- comments channel ---
    // Track comment inserts/deletes to keep comment counts on cards live.
    const commentsChannel = supabase
      .channel(`comments:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `board_id=eq.${boardId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const row = payload.new as { post_id: string };
          setPosts((prev) =>
            prev.map((p) =>
              p.id === row.post_id
                ? { ...p, comments: p.comments + 1 }
                : p,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `board_id=eq.${boardId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const row = payload.old as { post_id: string };
          setPosts((prev) =>
            prev.map((p) =>
              p.id === row.post_id
                ? { ...p, comments: Math.max(0, p.comments - 1) }
                : p,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
    // currentUserId is intentionally stable per board session; boardId drives re-sub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, currentUserId]);

  const createPost = useCallback(
    async (input: NewPostInput): Promise<void> => {
      const supabase = createClient();
      const { error } = await supabase.from("posts").insert({
        board_id: boardId,
        author_id: currentUserId,
        ...input,
      });
      if (error) {
        console.error("[usePosts] createPost error:", error);
        throw error;
      }
      // Do NOT optimistically add — the realtime INSERT handler adds the post.
      // Dedupe in the INSERT handler prevents a double-add.
    },
    [boardId, currentUserId],
  );

  const movePost = useCallback(
    async (
      id: string,
      patch: { x?: number; y?: number; section?: string },
    ): Promise<void> => {
      // Optimistic update
      let previous: Post | undefined;
      setPosts((prev) => {
        previous = prev.find((p) => p.id === id);
        return prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            ...(patch.x !== undefined && { x: patch.x }),
            ...(patch.y !== undefined && { y: patch.y }),
            ...(patch.section !== undefined && {
              section: patch.section as SectionId,
            }),
          };
        });
      });

      const supabase = createClient();
      const { error } = await supabase
        .from("posts")
        .update(patch)
        .eq("id", id);

      if (error) {
        console.error("[usePosts] movePost error:", error);
        // Best-effort revert
        if (previous) {
          const snapshot = previous;
          setPosts((prev) =>
            prev.map((p) => (p.id === id ? snapshot : p)),
          );
        }
        throw error;
      }
    },
    [],
  );

  const removePost = useCallback(async (id: string): Promise<void> => {
    // Optimistic remove
    let removed: Post | undefined;
    setPosts((prev) => {
      removed = prev.find((p) => p.id === id);
      return prev.filter((p) => p.id !== id);
    });

    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      console.error("[usePosts] removePost error:", error);
      // Best-effort revert
      if (removed) {
        const snapshot = removed;
        setPosts((prev) => [...prev, snapshot]);
      }
      throw error;
    }
  }, []);

  const toggleLike = useCallback(
    async (id: string): Promise<void> => {
      let originalPost: Post | undefined;

      setPosts((prev) => {
        originalPost = prev.find((p) => p.id === id);
        if (!originalPost) return prev;
        return prev.map((p) =>
          p.id === id
            ? {
                ...p,
                likedByMe: !p.likedByMe,
                likes: p.likedByMe
                  ? Math.max(0, p.likes - 1)
                  : p.likes + 1,
              }
            : p,
        );
      });

      // We need the state BEFORE the optimistic flip to know direction.
      // originalPost captured in the setState callback above is the pre-flip value.
      if (!originalPost) return;

      const wasLiked = originalPost.likedByMe;
      const supabase = createClient();

      let error: { message: string } | null = null;

      if (!wasLiked) {
        // Now liking
        const result = await supabase.from("post_likes").insert({
          post_id: id,
          user_id: currentUserId,
        });
        error = result.error;
      } else {
        // Now un-liking
        const result = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", id)
          .eq("user_id", currentUserId);
        error = result.error;
      }

      if (error) {
        console.error("[usePosts] toggleLike error:", error);
        // Revert optimistic flip
        const snapshot = originalPost;
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? snapshot : p)),
        );
        throw error;
      }
    },
    [currentUserId],
  );

  return { posts, createPost, movePost, removePost, toggleLike };
}
