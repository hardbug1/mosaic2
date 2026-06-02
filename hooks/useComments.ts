"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { rowToComment } from "@/lib/comments";
import type { Comment, CommentRow } from "@/lib/comments";
import type { Author } from "@/lib/posts";

const FALLBACK_AUTHOR: Author = {
  name: "알 수 없음",
  initials: "?",
  color: "#79747E",
};

export function useComments(
  postId: string,
  boardId: string,
  currentUserId: string,
  membersById: Record<string, Author>,
): {
  comments: Comment[];
  loading: boolean;
  addComment: (text: string) => Promise<void>;
} {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep a stable ref so realtime callbacks see the latest membersById
  // without triggering a re-subscription (mirrors usePosts pattern).
  const membersByIdRef = useRef(membersById);
  membersByIdRef.current = membersById;

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // Fetch existing comments on mount
    supabase
      .from("comments")
      .select("*, author:profiles!author_id(name, initials, color)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("[useComments] fetch error:", error);
        }
        setComments(
          (data as CommentRow[] ?? []).map((row) => rowToComment(row)),
        );
        setLoading(false);
      });

    // Subscribe to realtime INSERTs for this post
    const channel = supabase
      .channel(`comments:post:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const newRow = payload.new as Record<string, unknown>;
          const authorId = newRow.author_id as string;
          const text = newRow.text as string;

          const comment: Comment = {
            id: newRow.id as string,
            postId: newRow.post_id as string,
            boardId: newRow.board_id as string,
            authorId,
            text,
            createdAt: newRow.created_at as string,
            author: membersByIdRef.current[authorId] ?? FALLBACK_AUTHOR,
          };

          setComments((prev) => {
            // Dedupe: skip if exact real id already exists
            if (prev.some((c) => c.id === comment.id)) return prev;
            // Replace any temp comment from the same author with identical text
            const withoutTemp = prev.filter(
              (c) =>
                !(
                  c.id.startsWith("temp-") &&
                  c.authorId === authorId &&
                  c.text === text
                ),
            );
            return [...withoutTemp, comment];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const deletedId = (payload.old as { id: string }).id;
          setComments((prev) => prev.filter((c) => c.id !== deletedId));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const addComment = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;

      const trimmed = text.trim();
      const tempId = `temp-${Date.now()}`;
      const tempComment: Comment = {
        id: tempId,
        postId,
        boardId,
        authorId: currentUserId,
        text: trimmed,
        createdAt: new Date().toISOString(),
        author: membersByIdRef.current[currentUserId] ?? FALLBACK_AUTHOR,
      };

      // Optimistic add
      setComments((prev) => [...prev, tempComment]);

      const supabase = createClient();
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        board_id: boardId,
        author_id: currentUserId,
        text: trimmed,
      });

      if (error) {
        console.error("[useComments] addComment error:", error);
        // Revert the optimistic temp comment
        setComments((prev) => prev.filter((c) => c.id !== tempId));
        throw error;
      }
      // The realtime INSERT will arrive and replace the temp comment via the
      // dedup logic in the INSERT handler (same author + text match).
    },
    [postId, boardId, currentUserId],
  );

  return { comments, loading, addComment };
}
