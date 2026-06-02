import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { rowToPost, type PostRow } from "@/lib/posts";
import { BoardClient } from "./BoardClient";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: board } = await supabase
    .from("boards")
    .select("id, title")
    .eq("id", id)
    .single();
  if (!board) notFound(); // RLS blocks non-members → 404

  const { data: rows } = await supabase
    .from("posts")
    .select(
      "*, author:profiles!author_id(name, initials, color), post_likes(user_id)",
    )
    .eq("board_id", id)
    .order("created_at", { ascending: true });

  const { data: memberRows } = await supabase
    .from("board_members")
    .select("profiles(id, name, initials, color)")
    .eq("board_id", id);

  const { data: me } = await supabase
    .from("profiles")
    .select("id, name, initials, color")
    .eq("id", user.id)
    .single();

  const posts = (rows as PostRow[] ?? []).map((r) => rowToPost(r, user.id));

  // Supabase infers board_members.profiles as array (many-to-one join returns array[]).
  // We cast via any and flatten — each row has exactly one profile.
  const members = (memberRows ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .flatMap((m: any) => {
      const p = m.profiles;
      if (!p) return [];
      // Supabase may return the join as an array or a single object depending on schema inference
      return Array.isArray(p) ? p : [p];
    })
    .filter(
      (p): p is { id: string; name: string; initials: string; color: string } =>
        Boolean(p && p.id),
    );

  return (
    <BoardClient
      boardId={board.id}
      boardTitle={board.title}
      initialPosts={posts}
      members={members}
      me={me ?? { id: user.id, name: "나", initials: "나", color: "#6750A4" }}
    />
  );
}
