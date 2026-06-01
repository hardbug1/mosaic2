import { createClient } from "@/lib/supabase/server";
import { BoardsClient } from "./BoardsClient";
import { createBoard } from "./actions";

export default async function BoardsPage() {
  const supabase = await createClient();
  const { data: boards } = await supabase
    .from("boards").select("id, title, updated_at").order("updated_at", { ascending: false });

  return <BoardsClient boards={boards ?? []} createBoard={createBoard} />;
}
