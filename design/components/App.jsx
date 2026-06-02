// App.jsx — collaborative board shell, layouts (columns/grid/canvas), presence, cursors

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "columns",
  "density": "regular",
  "showCursors": true,
  "dark": false
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [posts, setPosts] = React.useState(window.SEED_POSTS);
  const [query, setQuery] = React.useState("");
  const [authorFilter, setAuthorFilter] = React.useState("all"); // all | mina
  const [composer, setComposer] = React.useState({ open: false, section: "well" });
  const [snack, setSnack] = React.useState(null);
  const [dragId, setDragId] = React.useState(null);
  const [cursors, setCursors] = React.useState({});
  const [openPost, setOpenPost] = React.useState(null);
  const [shareOpen, setShareOpen] = React.useState(false);

  // keep the open detail panel in sync with the latest post data (likes etc.)
  const livePost = openPost ? posts.find((p) => p.id === openPost.id) || null : null;

  // ---- dark mode ----
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.dark ? "dark" : "light");
  }, [t.dark]);

  // ---- live cursors (simulated collaborators) ----
  const others = window.LIVE.filter((id) => id !== "mina");
  React.useEffect(() => {
    if (!t.showCursors) { setCursors({}); return; }
    const rand = () => ({
      x: 120 + Math.random() * (window.innerWidth - 320),
      y: 180 + Math.random() * (window.innerHeight - 320),
    });
    setCursors(Object.fromEntries(others.map((id) => [id, rand()])));
    const iv = setInterval(() => {
      setCursors((prev) => {
        const next = { ...prev };
        // move a random subset each tick so it feels organic
        others.forEach((id) => { if (Math.random() < 0.6) next[id] = rand(); });
        return next;
      });
    }, 1900);
    return () => clearInterval(iv);
  }, [t.showCursors]);

  // ---- derived: filtered posts ----
  const q = query.trim().toLowerCase();
  const visible = posts.filter((p) => {
    if (authorFilter === "mina" && p.author !== "mina") return false;
    if (!q) return true;
    return ((p.text || "") + " " + (p.title || "")).toLowerCase().includes(q);
  });

  const toggleLike = (id) => setPosts((ps) => ps.map((p) => {
    if (p.id !== id) return p;
    const liked = (p.likedBy || []).includes("mina");
    return {
      ...p,
      likedBy: liked ? p.likedBy.filter((x) => x !== "mina") : [...(p.likedBy || []), "mina"],
      likes: liked ? p.likes - 1 : p.likes + 1,
    };
  }));

  const createPost = (post) => {
    setPosts((ps) => [post, ...ps]);
    setSnack({ msg: "게시물이 추가되었습니다", id: post.id });
  };

  const openComposer = (section) => setComposer({ open: true, section: section || "well" });

  // ---- drag & drop (columns + grid) ----
  const onCardDrop = (targetId, sectionId) => {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    setPosts((ps) => {
      const arr = [...ps];
      const from = arr.findIndex((p) => p.id === dragId);
      if (from < 0) return ps;
      const moved = { ...arr[from] };
      if (sectionId) moved.section = sectionId;
      arr.splice(from, 1);
      let to = targetId ? arr.findIndex((p) => p.id === targetId) : arr.length;
      if (to < 0) to = arr.length;
      arr.splice(to, 0, moved);
      return arr;
    });
    setDragId(null);
  };

  // ---- canvas drag (free move) ----
  const canvasRef = React.useRef(null);
  const dragState = React.useRef(null);
  const onCanvasPointerDown = (e, post) => {
    e.preventDefault();
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    dragState.current = { id: post.id, dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    setPosts((ps) => { const i = ps.findIndex((p) => p.id === post.id); if (i < 0) return ps; const a = [...ps]; const [m] = a.splice(i, 1); a.push(m); return a; });
    window.addEventListener("pointermove", onCanvasPointerMove);
    window.addEventListener("pointerup", onCanvasPointerUp);
  };
  const onCanvasPointerMove = (e) => {
    const ds = dragState.current; if (!ds) return;
    const wrap = canvasRef.current; if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const x = e.clientX - r.left + wrap.scrollLeft - ds.dx;
    const y = e.clientY - r.top + wrap.scrollTop - ds.dy;
    setPosts((ps) => ps.map((p) => p.id === ds.id ? { ...p, x: Math.max(0, x), y: Math.max(0, y), rot: 0 } : p));
  };
  const onCanvasPointerUp = () => {
    dragState.current = null;
    window.removeEventListener("pointermove", onCanvasPointerMove);
    window.removeEventListener("pointerup", onCanvasPointerUp);
  };

  const dense = t.density === "compact";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--md-sys-color-surface)" }}>
      <TopBar
        onAdd={() => openComposer()}
        query={query} setQuery={setQuery}
        authorFilter={authorFilter} setAuthorFilter={setAuthorFilter}
        layout={t.layout} setLayout={(v) => setTweak("layout", v)}
        onShare={() => setShareOpen(true)}
      />

      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
        {t.layout === "columns" && (
          <ColumnsView posts={visible} dense={dense} dragId={dragId} setDragId={setDragId}
            onCardDrop={onCardDrop} onToggleLike={toggleLike} onAdd={openComposer} onOpen={setOpenPost} />
        )}
        {t.layout === "grid" && (
          <GridView posts={visible} dense={dense} dragId={dragId} setDragId={setDragId}
            onCardDrop={onCardDrop} onToggleLike={toggleLike} onOpen={setOpenPost} />
        )}
        {t.layout === "canvas" && (
          <CanvasView ref={canvasRef} posts={visible} dense={dense}
            onPointerDown={onCanvasPointerDown} onToggleLike={toggleLike} draggingId={dragState.current?.id} onOpen={setOpenPost} />
        )}
      </div>

      {/* live cursors */}
      {t.showCursors && others.map((id) => cursors[id] && (
        <Cursor key={id} person={window.PEOPLE[id]} x={cursors[id].x} y={cursors[id].y} />
      ))}

      {/* FAB */}
      <button onClick={() => openComposer()} title="새 게시물" style={{
        position: "fixed", right: 28, bottom: 28, zIndex: 80,
        height: 64, padding: "0 22px", borderRadius: 20, border: "none", cursor: "pointer",
        background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-on-primary-container)",
        boxShadow: "var(--md-sys-elevation-level3)", display: "inline-flex", alignItems: "center", gap: 10,
        fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 15, fontWeight: 600,
      }}>
        <span className="md-icon" style={{ fontSize: 24 }}>add</span>새 게시물
      </button>

      <Composer open={composer.open} defaultSection={composer.section}
        sections={window.SECTIONS} onClose={() => setComposer({ open: false })} onCreate={createPost} />

      <PostDetail post={livePost} onClose={() => setOpenPost(null)} onToggleLike={toggleLike} />
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} onToast={(msg) => setSnack({ msg })} />

      <M3Snackbar open={!!snack} message={snack?.msg} actionLabel="확인" onClose={() => setSnack(null)} />

      <TweaksPanel>
        <TweakSection label="보드 레이아웃" />
        <TweakRadio label="레이아웃" value={t.layout}
          options={[{ value: "columns", label: "컬럼" }, { value: "grid", label: "그리드" }, { value: "canvas", label: "캔버스" }]}
          onChange={(v) => setTweak("layout", v)} />
        <TweakRadio label="밀도" value={t.density}
          options={[{ value: "compact", label: "좀게" }, { value: "regular", label: "보통" }]}
          onChange={(v) => setTweak("density", v)} />
        <TweakSection label="협업" />
        <TweakToggle label="실시간 커서 표시" value={t.showCursors} onChange={(v) => setTweak("showCursors", v)} />
        <TweakSection label="테마" />
        <TweakToggle label="다크 모드" value={t.dark} onChange={(v) => setTweak("dark", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
