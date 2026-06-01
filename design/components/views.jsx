// views.jsx — TopBar + ColumnsView, GridView, CanvasView

function PresenceStack({ onShare }) {
  const live = window.LIVE.map((id) => window.PEOPLE[id]);
  const shown = live.slice(0, 4);
  const extra = live.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {shown.map((p, i) => (
          <div key={p.id} title={p.name + (p.you ? " (you)" : "")} style={{
            width: 32, height: 32, borderRadius: 9999, background: p.color, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)",
            boxShadow: "0 0 0 2px var(--md-sys-color-surface)", marginLeft: i === 0 ? 0 : -8,
            position: "relative",
          }}>{p.initials}</div>
        ))}
        {extra > 0 && (
          <div style={{
            width: 32, height: 32, borderRadius: 9999, marginLeft: -8,
            background: "var(--md-sys-color-surface-container-highest)", color: "var(--md-sys-color-on-surface-variant)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)",
            boxShadow: "0 0 0 2px var(--md-sys-color-surface)",
          }}>+{extra}</div>
        )}
      </div>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--md-sys-color-on-surface-variant)", fontSize: 13, fontWeight: 500, fontFamily: "var(--md-sys-typescale-plain-font)" }}>
        <span style={{ width: 8, height: 8, borderRadius: 9999, background: "#386A20", display: "inline-block" }} />
        {window.LIVE.length}명 접속 중
      </span>
      <M3Button variant="tonal" size="sm" icon="ios_share" onClick={onShare}>공유</M3Button>
    </div>
  );
}

function LayoutSwitch({ value, onChange }) {
  const opts = [
    { id: "columns", icon: "view_column", label: "컬럼" },
    { id: "grid",    icon: "grid_view",   label: "그리드" },
    { id: "canvas",  icon: "dashboard",   label: "캔버스" },
  ];
  return (
    <div style={{ display: "inline-flex", borderRadius: 9999, padding: 3, gap: 2, background: "var(--md-sys-color-surface-container-high)" }}>
      {opts.map((o) => {
        const sel = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} title={o.label} style={{
            display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px",
            borderRadius: 9999, border: "none", cursor: "pointer",
            background: sel ? "var(--md-sys-color-primary)" : "transparent",
            color: sel ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)",
            fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, fontWeight: 600,
            transition: "background 150ms var(--md-sys-motion-easing-standard)",
          }}>
            <span className="md-icon" style={{ fontSize: 18 }}>{o.icon}</span>{o.label}
          </button>
        );
      })}
    </div>
  );
}

function SearchField({ query, setQuery }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 14px",
      borderRadius: 9999, minWidth: 260, maxWidth: 420, flex: 1,
      background: "var(--md-sys-color-surface-container-high)",
      boxShadow: focus ? "inset 0 0 0 2px var(--md-sys-color-primary)" : "none",
      transition: "box-shadow 120ms linear",
    }}>
      <span className="md-icon" style={{ fontSize: 22, color: "var(--md-sys-color-on-surface-variant)" }}>search</span>
      <input value={query} onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        placeholder="게시물 검색"
        style={{
          border: "none", outline: "none", background: "transparent", flex: 1,
          fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 15,
          color: "var(--md-sys-color-on-surface)",
        }} />
      {query && (
        <button onClick={() => setQuery("")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--md-sys-color-on-surface-variant)", display: "flex" }}>
          <span className="md-icon" style={{ fontSize: 20 }}>close</span>
        </button>
      )}
    </div>
  );
}

function FilterChip({ active, icon, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: active ? "0 14px 0 10px" : "0 14px",
      borderRadius: 9999, cursor: "pointer", border: "none",
      background: active ? "var(--md-sys-color-secondary-container)" : "transparent",
      boxShadow: active ? "none" : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
      color: active ? "var(--md-sys-color-on-secondary-container)" : "var(--md-sys-color-on-surface-variant)",
      fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, fontWeight: 500,
    }}>
      {active && <span className="md-icon" style={{ fontSize: 18 }}>check</span>}
      {!active && icon && <span className="md-icon" style={{ fontSize: 18 }}>{icon}</span>}
      {children}
    </button>
  );
}

function TopBar({ onAdd, query, setQuery, authorFilter, setAuthorFilter, layout, setLayout, onShare }) {
  return (
    <header style={{
      flexShrink: 0, background: "var(--md-sys-color-surface-container-low)",
      borderBottom: "1px solid var(--md-sys-color-outline-variant)",
    }}>
      {/* row 1 */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg,#6750A4,#A23BB0)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span className="md-icon is-filled" style={{ fontSize: 24, color: "#fff" }}>dashboard</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="md-title-large" style={{ color: "var(--md-sys-color-on-surface)", display: "flex", alignItems: "center", gap: 8 }}>
              2분기 제품 회고
              <span className="md-icon" style={{ fontSize: 18, color: "var(--md-sys-color-on-surface-variant)" }}>edit</span>
            </div>
            <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>방금 편집함 · 게시물 11개</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <SearchField query={query} setQuery={setQuery} />
        </div>
        <PresenceStack onShare={onShare} />
      </div>

      {/* row 2 — toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px 12px", flexWrap: "wrap" }}>
        <LayoutSwitch value={layout} onChange={setLayout} />
        <div style={{ width: 1, height: 28, background: "var(--md-sys-color-outline-variant)" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <FilterChip active={authorFilter === "all"} icon="groups" onClick={() => setAuthorFilter("all")}>전체 게시물</FilterChip>
          <FilterChip active={authorFilter === "mina"} icon="person" onClick={() => setAuthorFilter("mina")}>내 게시물</FilterChip>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 4 }}>
          <M3IconButton icon="filter_list" tooltip="필터" />
          <M3IconButton icon="sort" tooltip="정렬" />
          <M3IconButton icon="more_vert" tooltip="더보기" />
        </div>
      </div>
    </header>
  );
}

// ---------- COLUMNS ----------
function ColumnsView({ posts, dense, dragId, setDragId, onCardDrop, onToggleLike, onAdd }) {
  const [overCol, setOverCol] = React.useState(null);
  return (
    <div style={{ height: "100%", overflow: "auto", padding: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", minHeight: "100%" }}>
        {window.SECTIONS.map((sec) => {
          const colPosts = posts.filter((p) => p.section === sec.id);
          return (
            <div key={sec.id}
              onDragOver={(e) => { e.preventDefault(); setOverCol(sec.id); }}
              onDragLeave={() => setOverCol((c) => c === sec.id ? null : c)}
              onDrop={() => { onCardDrop(null, sec.id); setOverCol(null); }}
              style={{
                width: 300, minWidth: 300, flexShrink: 0, borderRadius: 20, padding: 12,
                background: overCol === sec.id ? "var(--md-sys-color-surface-container)" : "var(--md-sys-color-surface-container-low)",
                boxShadow: overCol === sec.id ? "inset 0 0 0 2px var(--md-sys-color-primary)" : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                display: "flex", flexDirection: "column", gap: 12,
                transition: "background 120ms linear, box-shadow 120ms linear",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px" }}>
                <span style={{ width: 10, height: 10, borderRadius: 9999, background: sec.accent }} />
                <span className="md-icon" style={{ fontSize: 18, color: sec.accent }}>{sec.icon}</span>
                <span className="md-title-medium" style={{ color: "var(--md-sys-color-on-surface)", flex: 1 }}>{sec.title}</span>
                <span className="md-label-medium" style={{ color: "var(--md-sys-color-on-surface-variant)", background: "var(--md-sys-color-surface-container-high)", borderRadius: 9999, padding: "2px 8px" }}>{colPosts.length}</span>
                <M3IconButton icon="add" size={32} tooltip="여기에 추가" onClick={() => onAdd(sec.id)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 60 }}>
                {colPosts.map((p) => (
                  <div key={p.id} draggable
                    onDragStart={() => setDragId(p.id)}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.stopPropagation(); onCardDrop(p.id, sec.id); }}
                    style={{ opacity: dragId === p.id ? 0.4 : 1, cursor: "grab" }}>
                    <PostCard post={p} dense={dense} onToggleLike={onToggleLike} />
                  </div>
                ))}
                {colPosts.length === 0 && (
                  <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)", textAlign: "center", padding: "18px 0", border: "1.5px dashed var(--md-sys-color-outline-variant)", borderRadius: 12 }}>
                    여기에 게시물을 놓으세요
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- GRID (masonry) ----------
function GridView({ posts, dense, dragId, setDragId, onCardDrop, onToggleLike }) {
  return (
    <div style={{ height: "100%", overflow: "auto", padding: 20 }}>
      <div style={{ columnWidth: 260, columnGap: 16 }}>
        {posts.map((p) => (
          <div key={p.id} draggable
            onDragStart={() => setDragId(p.id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.stopPropagation(); onCardDrop(p.id, null); }}
            style={{ breakInside: "avoid", marginBottom: 16, opacity: dragId === p.id ? 0.4 : 1, cursor: "grab" }}>
            <PostCard post={p} dense={dense} onToggleLike={onToggleLike} />
          </div>
        ))}
        {posts.length === 0 && <EmptyState />}
      </div>
    </div>
  );
}

// ---------- CANVAS (free move) ----------
const CanvasView = React.forwardRef(function CanvasView({ posts, dense, onPointerDown, onToggleLike, draggingId }, ref) {
  return (
    <div ref={ref} style={{
      height: "100%", overflow: "auto", position: "relative",
      backgroundColor: "var(--md-sys-color-surface)",
      backgroundImage: "radial-gradient(var(--md-sys-color-outline-variant) 1px, transparent 1px)",
      backgroundSize: "26px 26px",
    }}>
      <div style={{ position: "relative", width: 1100, height: 1000, minWidth: "100%" }}>
        {posts.map((p) => (
          <div key={p.id}
            onPointerDown={(e) => onPointerDown(e, p)}
            style={{
              position: "absolute", left: p.x || 40, top: p.y || 40, width: 256,
              transform: `rotate(${p.rot || 0}deg)`,
              cursor: draggingId === p.id ? "grabbing" : "grab",
              touchAction: "none",
              zIndex: draggingId === p.id ? 50 : 1,
            }}>
            <PostCard post={p} dense={dense} onToggleLike={onToggleLike} ghost={draggingId === p.id} />
          </div>
        ))}
        {posts.length === 0 && <div style={{ position: "absolute", top: 80, left: 0, right: 0 }}><EmptyState /></div>}
      </div>
    </div>
  );
});

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--md-sys-color-on-surface-variant)" }}>
      <span className="md-icon" style={{ fontSize: 40 }}>search_off</span>
      <div className="md-title-medium" style={{ marginTop: 8 }}>일치하는 게시물이 없어요</div>
      <div className="md-body-small">다른 검색어나 필터를 사용해 보세요</div>
    </div>
  );
}

window.TopBar = TopBar;
window.ColumnsView = ColumnsView;
window.GridView = GridView;
window.CanvasView = CanvasView;
window.EmptyState = EmptyState;
