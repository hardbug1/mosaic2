"use client";
import React from "react";

type Board = { id: string; title: string; updated_at: string };

export function BoardsClient({
  boards, createBoard,
}: { boards: Board[]; createBoard: (fd: FormData) => Promise<void> }) {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 className="md-headline-medium">내 보드</h1>
        <form action="/auth/signout" method="post">
          <button type="submit">로그아웃</button>
        </form>
      </header>

      <form action={createBoard} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input name="title" placeholder="새 보드 제목" style={{ flex: 1 }} />
        <button type="submit">새 보드 만들기</button>
      </form>

      {boards.length === 0 ? (
        <p className="md-body-medium">아직 보드가 없어요. 위에서 새 보드를 만들어 보세요.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {boards.map((b) => (
            <a key={b.id} href={`/boards/${b.id}`} style={{
              display: "block", padding: 20, borderRadius: 16, textDecoration: "none",
              background: "var(--md-sys-color-surface-container-low)",
              boxShadow: "var(--md-sys-elevation-level1)", color: "var(--md-sys-color-on-surface)",
            }}>
              <div className="md-title-medium">{b.title}</div>
              <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                {new Date(b.updated_at).toLocaleDateString("ko-KR")}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
