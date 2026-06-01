"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createBoard(formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "제목 없는 보드";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: board, error } = await supabase
    .from("boards").insert({ title, owner_id: user.id }).select().single();
  if (error) throw error;

  const { error: memErr } = await supabase
    .from("board_members").insert({ board_id: board.id, user_id: user.id, role: "owner" });
  if (memErr) throw memErr;

  redirect(`/boards/${board.id}`);
}
