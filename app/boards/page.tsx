import { createClient } from "@/lib/supabase/server";
import { BoardsClient } from "./BoardsClient";
import { createBoard } from "./actions";
import { relativeKo, pickScheme } from "@/lib/time";
import type { BoardCardData } from "./BoardsClient";

export default async function BoardsPage() {
  const supabase = await createClient();

  // Current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should handle this, but guard anyway
    const { redirect } = await import("next/navigation");
    redirect("/login");
    // The above never returns, but TypeScript doesn't know that — add an explicit return
    return null as never;
  }

  // User profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, initials, color")
    .eq("id", user.id)
    .single();

  // Boards with nested members (profiles) + post count
  const { data: rawBoards } = await supabase
    .from("boards")
    .select(
      "id, title, updated_at, board_members(profiles(name, initials, color)), posts(count)"
    )
    .order("updated_at", { ascending: false });

  // Favorites
  const { data: favs } = await supabase
    .from("board_favorites")
    .select("board_id");

  const favSet = new Set((favs ?? []).map((f) => f.board_id as string));

  // Map to card data
  const boards: BoardCardData[] = (rawBoards ?? []).map((b) => {
    // posts comes back as [{ count: number }]
    const postsArr = b.posts as { count: number }[] | null;
    const postCount =
      Array.isArray(postsArr) && postsArr.length > 0 ? postsArr[0].count : 0;

    // board_members comes back as { profiles: {...} }[]
    // Supabase returns profiles as array when using foreign key joins — flatten
    const membersRaw = (b.board_members as unknown as { profiles: unknown }[]) ?? [];

    const members: { name: string; initials: string; color: string }[] = [];
    for (const m of membersRaw) {
      const p = m.profiles;
      if (!p || typeof p !== "object") continue;
      // Could be a single object or an array (Supabase TS quirk)
      const items = Array.isArray(p) ? p : [p];
      for (const item of items) {
        if (item && typeof item === "object" && "name" in item) {
          const prof = item as Record<string, unknown>;
          members.push({
            name: String(prof.name ?? ""),
            initials: String(prof.initials ?? "?"),
            color: String(prof.color ?? "#6750A4"),
          });
        }
      }
    }

    return {
      id: b.id as string,
      title: b.title as string,
      members,
      posts: postCount,
      updated: relativeKo(b.updated_at as string, "방금 편집함"),
      starred: favSet.has(b.id as string),
      live: 0,
      scheme: pickScheme(b.id as string),
    };
  });

  const userName =
    profile?.name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "사용자";

  const userInitials =
    profile?.initials ??
    (userName.length >= 2 ? userName.slice(-2) : userName);

  const userColor = profile?.color ?? "#6750A4";

  return (
    <BoardsClient
      boards={boards}
      userName={userName}
      userInitials={userInitials}
      userColor={userColor}
      userId={user.id}
      createBoard={createBoard}
    />
  );
}
