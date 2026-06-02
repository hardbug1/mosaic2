// home.jsx — Mosaic board list / dashboard

function HomeMosaicMark({ size = 32 }) {
  const tiles = [
    { c: "#6750A4", col: "1 / 3", row: "1 / 2" },
    { c: "#A23BB0", col: "1 / 2", row: "2 / 4" },
    { c: "#00639B", col: "2 / 3", row: "2 / 3" },
    { c: "#386A20", col: "2 / 3", row: "3 / 4" },
  ];
  const gap = Math.round(size * 0.1), r = Math.round(size * 0.13);
  return (
    <div style={{ width: size, height: size, flexShrink: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap }}>
      {tiles.map((t, i) => <div key={i} style={{ gridColumn: t.col, gridRow: t.row, background: t.c, borderRadius: r }} />)}
    </div>
  );
}

const BOARD_COLORS = {
  violet: ["#6750A4", "#A23BB0"], green: ["#386A20", "#7FB069"],
  blue: ["#00639B", "#4AA3D1"], rose: ["#8C4A60", "#C77D94"],
  amber: ["#9A6A00", "#E0A93B"], teal: ["#006A60", "#3FA89C"],
};

// Mini thumbnail: a tiny mosaic of tinted blocks, evoking the board's layout.
function BoardThumb({ scheme, layout }) {
  const [a, b] = BOARD_COLORS[scheme] || BOARD_COLORS.violet;
  const blocks = layout === "columns"
    ? [[0,0,1,2],[1,0,1,1],[1,1,1,1],[2,0,1,2],[3,0,1,1]]
    : layout === "grid"
    ? [[0,0,1,1],[1,0,1,2],[2,0,1,1],[0,1,1,1],[2,1,1,1]]
    : [[0,0,2,1],[2,1,1,2],[0,2,1,1],[1,2,1,1],[0,1,1,1]];
  return (
    <div style={{
      height: 132, borderRadius: 14, padding: 12, position: "relative", overflow: "hidden",
      background: `linear-gradient(135deg, ${a}22, ${b}14)`,
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(3, 1fr)", gap: 6,
    }}>
      {blocks.map((bl, i) => (
        <div key={i} style={{
          gridColumn: `${bl[0] + 1} / span ${bl[2]}`, gridRow: `${bl[1] + 1} / span ${bl[3]}`,
          background: i % 2 === 0 ? a : b, opacity: 0.16 + (i % 3) * 0.08, borderRadius: 7,
        }} />
      ))}
    </div>
  );
}

const BOARDS = [
  { id: "retro-q2", title: "2분기 제품 회고", scheme: "violet", layout: "columns", posts: 11, members: ["mina","jay","sora","ravi","elise"], updated: "방금 편집함", starred: true, live: 5 },
  { id: "brainstorm", title: "신규 기능 브레인스토밍", scheme: "green", layout: "grid", posts: 24, members: ["jay","sora","tom"], updated: "1시간 전", starred: true, live: 2 },
  { id: "roadmap", title: "하반기 로드맵", scheme: "blue", layout: "columns", posts: 18, members: ["mina","ravi","elise","tom"], updated: "어제", starred: false, live: 0 },
  { id: "research", title: "사용자 인터뷰 정리", scheme: "rose", layout: "canvas", posts: 32, members: ["sora","elise"], updated: "2일 전", starred: false, live: 0 },
  { id: "design-crit", title: "디자인 크리틱 보드", scheme: "amber", layout: "grid", posts: 9, members: ["mina","jay","elise"], updated: "3일 전", starred: false, live: 1 },
  { id: "onboarding", title: "온보딩 개선 KPT", scheme: "teal", layout: "columns", posts: 15, members: ["mina","jay","sora","ravi"], updated: "지난주", starred: false, live: 0 },
];

function MemberDots({ ids }) {
  const shown = ids.slice(0, 3);
  const extra = ids.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((id, i) => {
        const p = window.PEOPLE[id];
        return (
          <div key={id} title={p.name} style={{
            width: 26, height: 26, borderRadius: 9999, background: p.color, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600,
            fontFamily: "var(--md-sys-typescale-plain-font)", marginLeft: i === 0 ? 0 : -7,
            boxShadow: "0 0 0 2px var(--md-sys-color-surface-container-low)",
          }}>{p.initials}</div>
        );
      })}
      {extra > 0 && (
        <div style={{
          width: 26, height: 26, borderRadius: 9999, marginLeft: -7,
          background: "var(--md-sys-color-surface-container-highest)", color: "var(--md-sys-color-on-surface-variant)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600,
          fontFamily: "var(--md-sys-typescale-plain-font)", boxShadow: "0 0 0 2px var(--md-sys-color-surface-container-low)",
        }}>+{extra}</div>
      )}
    </div>
  );
}

function BoardCard({ board, onOpen, onToggleStar }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={() => onOpen(board)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left", border: "1px solid var(--md-sys-color-outline-variant)", cursor: "pointer",
        background: "var(--md-sys-color-surface-container-low)", borderRadius: 20, padding: 12,
        display: "flex", flexDirection: "column", gap: 12, fontFamily: "var(--md-sys-typescale-plain-font)",
        boxShadow: hover ? "var(--md-sys-elevation-level2)" : "var(--md-sys-elevation-level1)",
        transform: hover ? "translateY(-2px)" : "none",
        transition: "box-shadow 160ms var(--md-sys-motion-easing-standard), transform 120ms var(--md-sys-motion-easing-standard)",
      }}>
      <div style={{ position: "relative" }}>
        <BoardThumb scheme={board.scheme} layout={board.layout} />
        <button onClick={(e) => { e.stopPropagation(); onToggleStar(board.id); }} title="즐겨찾기" style={{
          position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 9999, border: "none", cursor: "pointer",
          background: "var(--md-sys-color-surface)", display: "flex", alignItems: "center", justifyContent: "center",
          color: board.starred ? "#E0A93B" : "var(--md-sys-color-on-surface-variant)", boxShadow: "var(--md-sys-elevation-level1)",
        }}>
          <span className={`md-icon ${board.starred ? "is-filled" : ""}`} style={{ fontSize: 18 }}>star</span>
        </button>
        {board.live > 0 && (
          <span style={{
            position: "absolute", bottom: 8, left: 8, display: "inline-flex", alignItems: "center", gap: 5,
            background: "var(--md-sys-color-surface)", borderRadius: 9999, padding: "3px 9px",
            fontSize: 11, fontWeight: 600, color: "var(--md-sys-color-on-surface-variant)", boxShadow: "var(--md-sys-elevation-level1)",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: "#386A20" }} />{board.live}명 접속
          </span>
        )}
      </div>
      <div style={{ padding: "0 4px 4px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="md-title-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>{board.title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <MemberDots ids={board.members} />
          <span className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
            게시물 {board.posts}개 · {board.updated}
          </span>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [boards, setBoards] = React.useState(BOARDS);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all"); // all | starred
  const [creating, setCreating] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifBadge, setNotifBadge] = React.useState(window.__NOTIF_UNREAD || 0);

  const openBoard = (b) => { window.location.href = "모자이크 — 2분기 제품 회고.html"; };
  const toggleStar = (id) => setBoards((bs) => bs.map((b) => b.id === id ? { ...b, starred: !b.starred } : b));

  const q = query.trim().toLowerCase();
  const visible = boards.filter((b) => {
    if (filter === "starred" && !b.starred) return false;
    return !q || b.title.toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: "100%", background: "var(--md-sys-color-surface)" }}>
      {/* top bar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10, background: "var(--md-sys-color-surface-container-low)",
        borderBottom: "1px solid var(--md-sys-color-outline-variant)",
        display: "flex", alignItems: "center", gap: 16, padding: "14px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <HomeMosaicMark size={30} />
          <span style={{ fontFamily: "var(--md-sys-typescale-brand-font)", fontWeight: 800, fontSize: 20, letterSpacing: "-0.4px", color: "var(--md-sys-color-on-surface)" }}>Mosaic</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 14px", borderRadius: 9999, width: 280, background: "var(--md-sys-color-surface-container-high)" }}>
          <span className="md-icon" style={{ fontSize: 20, color: "var(--md-sys-color-on-surface-variant)" }}>search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="보드 검색"
            style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 15, color: "var(--md-sys-color-on-surface)" }} />
        </div>
        <div style={{ position: "relative" }}>
          <M3IconButton icon="notifications" tooltip="알림" onClick={() => { setNotifOpen((v) => !v); setNotifBadge(0); }} />
          {notifBadge > 0 && (
            <span style={{ position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 9999, background: "var(--md-sys-color-error)", color: "var(--md-sys-color-on-error)", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--md-sys-typescale-plain-font)", pointerEvents: "none" }}>{notifBadge}</span>
          )}
        </div>
        <a href="모자이크 — 로그인.html" title="내 계정" style={{ textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 9999, background: "#6750A4", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)" }}>민아</div>
        </a>
      </header>

      <main style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 28px 80px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <div className="md-headline-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>안녕하세요, 민아님</div>
            <div className="md-body-medium" style={{ color: "var(--md-sys-color-on-surface-variant)", marginTop: 4 }}>참여 중인 보드 {boards.length}개 · 오늘도 좋은 협업 되세요</div>
          </div>
          <M3Button variant="filled" icon="add" onClick={() => setCreating(true)} style={{ height: 48, borderRadius: 9999 }}>새 보드 만들기</M3Button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["all", "전체 보드", "grid_view"], ["starred", "즐겨찾기", "star"]].map(([id, label, icon]) => {
            const sel = filter === id;
            return (
              <button key={id} onClick={() => setFilter(id)} style={{
                display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px", borderRadius: 9999, cursor: "pointer", border: "none",
                background: sel ? "var(--md-sys-color-secondary-container)" : "transparent",
                boxShadow: sel ? "none" : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                color: sel ? "var(--md-sys-color-on-secondary-container)" : "var(--md-sys-color-on-surface-variant)",
                fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, fontWeight: 500,
              }}>
                <span className="md-icon" style={{ fontSize: 18 }}>{icon}</span>{label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {/* create tile */}
          <button onClick={() => setCreating(true)} style={{
            minHeight: 240, border: "1.5px dashed var(--md-sys-color-outline-variant)", cursor: "pointer",
            background: "transparent", borderRadius: 20, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10, color: "var(--md-sys-color-on-surface-variant)",
            fontFamily: "var(--md-sys-typescale-plain-font)",
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 9999, background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-on-primary-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="md-icon" style={{ fontSize: 26 }}>add</span>
            </div>
            <span className="md-title-small">새 보드 만들기</span>
          </button>

          {visible.map((b) => <BoardCard key={b.id} board={b} onOpen={openBoard} onToggleStar={toggleStar} />)}
        </div>

        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--md-sys-color-on-surface-variant)" }}>
            <span className="md-icon" style={{ fontSize: 40 }}>search_off</span>
            <div className="md-title-medium" style={{ marginTop: 8 }}>일치하는 보드가 없어요</div>
          </div>
        )}
      </main>

      <CreateBoard open={creating} onClose={() => setCreating(false)} onCreate={() => { setCreating(false); openBoard(); }} />
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Home />);
