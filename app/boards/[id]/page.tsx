import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: board } = await supabase
    .from("boards").select("id, title").eq("id", id).single();
  if (!board) notFound();

  return (
    <main style={{ padding: 24 }}>
      <a href="/boards" className="md-body-small">← 내 보드</a>
      <h1 className="md-headline-medium" style={{ marginTop: 8 }}>{board.title}</h1>
      <p className="md-body-medium" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
        보드 본체(게시물·3뷰·실시간)는 Plan 2에서 구현됩니다.
      </p>
    </main>
  );
}
