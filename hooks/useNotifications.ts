"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { firstOf } from "@/lib/normalize";

export type AppNotification = {
  id: string;
  type: "comment" | "like" | "invite";
  boardId: string | null;
  postId: string | null;
  read: boolean;
  createdAt: string;
  actor: { name: string; initials: string; color: string } | null;
};

// Row shape coming back from Supabase (with the actor join)
type NotifRow = {
  id: string;
  type: string;
  board_id: string | null;
  post_id: string | null;
  read: boolean;
  created_at: string;
  // 조인은 객체 또는 배열로 올 수 있음(firstOf로 정규화)
  actor:
    | { name: string; initials: string; color: string }
    | { name: string; initials: string; color: string }[]
    | null;
};

function rowToNotif(row: NotifRow): AppNotification {
  return {
    id: row.id,
    type: row.type as AppNotification["type"],
    boardId: row.board_id,
    postId: row.post_id,
    read: row.read,
    createdAt: row.created_at,
    actor: firstOf(row.actor) as AppNotification["actor"],
  };
}

const SELECT_QUERY =
  "*, actor:profiles!actor_id(name, initials, color)";

export function useNotifications(userId: string): {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
} {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Initial fetch
  useEffect(() => {
    if (!userId) return;

    supabase
      .from("notifications")
      .select(SELECT_QUERY)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!data) return;
        const fetched = (data as NotifRow[]).map(rowToNotif);
        // M3: 구독이 fetch보다 먼저 항목을 넣었을 수 있으므로 덮어쓰지 않고 id 기준 병합
        setNotifications((prev) => {
          const byId = new Map<string, AppNotification>();
          for (const n of fetched) byId.set(n.id, n);
          for (const n of prev) if (!byId.has(n.id)) byId.set(n.id, n);
          return [...byId.values()].sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
          );
        });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const newId = (payload.new as { id: string }).id;
          // Fetch the full row with actor join
          const { data } = await supabase
            .from("notifications")
            .select(SELECT_QUERY)
            .eq("id", newId)
            .single();
          if (data) {
            const notif = rowToNotif(data as NotifRow);
            setNotifications((prev) => {
              // Dedupe by id
              if (prev.some((n) => n.id === notif.id)) return prev;
              return [notif, ...prev];
            });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; read: boolean };
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updated.id ? { ...n, read: updated.read } : n,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(
    async (id: string) => {
      // Optimistic
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const markAllRead = useCallback(
    async () => {
      // Optimistic
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId],
  );

  return { notifications, unreadCount, markAllRead, markRead };
}
