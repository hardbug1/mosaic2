"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type PresenceMember = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export function usePresence(
  boardId: string,
  me: PresenceMember,
): PresenceMember[] {
  const [members, setMembers] = useState<PresenceMember[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // private: true → Realtime Authorization(realtime.messages RLS)로 보드 멤버만 접근.
    // 비멤버의 presence 열람/스푸핑 차단 (migration 0010).
    const channel = supabase.channel(`presence:${boardId}`, {
      config: { private: true, presence: { key: me.id } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceMember>();

      // presenceState returns Record<key, PresenceMember[]>
      // Each key maps to an array of tracked payloads for that key.
      // Flatten and dedupe by id (take first entry per key).
      const seen = new Set<string>();
      const online: PresenceMember[] = [];

      for (const presences of Object.values(state)) {
        for (const presence of presences) {
          if (!seen.has(presence.id)) {
            seen.add(presence.id);
            online.push({
              id: presence.id,
              name: presence.name,
              initials: presence.initials,
              color: presence.color,
            });
          }
        }
      }

      setMembers(online);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track(me);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
    // me is intentionally spread to a stable shape; boardId drives re-sub.
    // Callers should memoize `me` to avoid unnecessary re-subscriptions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, me.id]);

  return members;
}
