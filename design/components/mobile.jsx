// mobile.jsx — Mosaic board on a phone (two iOS frames: feed + detail)

function MobileMark({ size = 24 }) {
  const tiles = [
    { c: "#6750A4", col: "1 / 3", row: "1 / 2" }, { c: "#A23BB0", col: "1 / 2", row: "2 / 4" },
    { c: "#00639B", col: "2 / 3", row: "2 / 3" }, { c: "#386A20", col: "2 / 3", row: "3 / 4" },
  ];
  const gap = Math.round(size * 0.1), r = Math.round(size * 0.13);
  return (
    <div style={{ width: size, height: size, flexShrink: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap }}>
      {tiles.map((t, i) => <div key={i} style={{ gridColumn: t.col, gridRow: t.row, background: t.c, borderRadius: r }} />)}
    </div>
  );
}

function MobileTopBar() {
  const live = window.LIVE.slice(0, 3).map((id) => window.PEOPLE[id]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px 12px" }}>
      <MobileMark size={26} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--md-sys-typescale-brand-font)", fontWeight: 800, fontSize: 17, color: "var(--md-sys-color-on-surface)", lineHeight: 1.1 }}>2분기 제품 회고</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: "#386A20" }} />
          <span style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 11, color: "var(--md-sys-color-on-surface-variant)" }}>5명 접속 중</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {live.map((p, i) => (
          <div key={p.id} style={{ width: 26, height: 26, borderRadius: 9999, background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)", marginLeft: i === 0 ? 0 : -7, boxShadow: "0 0 0 2px var(--md-sys-color-surface)" }}>{p.initials}</div>
        ))}
      </div>
    </div>
  );
}

function MobileSectionTabs({ active, onChange }) {
  const tabs = [{ id: "all", title: "전체", accent: "#6750A4" }, ...window.SECTIONS];
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 12px", scrollbarWidth: "none" }}>
      {tabs.map((t) => {
        const sel = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flexShrink: 0, height: 34, padding: "0 14px", borderRadius: 9999, border: "none", cursor: "pointer",
            background: sel ? "var(--md-sys-color-primary)" : "var(--md-sys-color-surface-container-high)",
            color: sel ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)",
            fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
          }}>{t.title}</button>
        );
      })}
    </div>
  );
}

function MobileBottomNav() {
  const items = [["dashboard", "보드", true], ["notifications", "알림", false], ["search", "검색", false], ["person", "내 정보", false]];
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 40,
      background: "rgba(255,255,255,0.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid var(--md-sys-color-outline-variant)", display: "flex", padding: "8px 8px 26px",
    }}>
      {items.map(([icon, label, sel]) => (
        <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: sel ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface-variant)" }}>
          <span className={`md-icon ${sel ? "is-filled" : ""}`} style={{ fontSize: 24 }}>{icon}</span>
          <span style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 10, fontWeight: 600 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function MobileFeed() {
  const [section, setSection] = React.useState("all");
  const [posts, setPosts] = React.useState(window.SEED_POSTS);
  const toggleLike = (id) => setPosts((ps) => ps.map((p) => {
    if (p.id !== id) return p;
    const liked = (p.likedBy || []).includes("mina");
    return { ...p, likedBy: liked ? p.likedBy.filter((x) => x !== "mina") : [...(p.likedBy || []), "mina"], likes: liked ? p.likes - 1 : p.likes + 1 };
  }));
  const visible = section === "all" ? posts : posts.filter((p) => p.section === section);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--md-sys-color-surface)" }}>
      <div style={{ flexShrink: 0, paddingTop: 54 }}>
        <MobileTopBar />
        <MobileSectionTabs active={section} onChange={setSection} />
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "4px 16px 96px", display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map((p) => <PostCard key={p.id} post={p} dense onToggleLike={toggleLike} />)}
      </div>
      {/* FAB */}
      <button style={{
        position: "absolute", right: 18, bottom: 92, zIndex: 45, width: 56, height: 56, borderRadius: 18, border: "none", cursor: "pointer",
        background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-on-primary-container)",
        boxShadow: "var(--md-sys-elevation-level3)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span className="md-icon" style={{ fontSize: 26 }}>add</span>
      </button>
      <MobileBottomNav />
    </div>
  );
}

// A focused post + comments on mobile
function MobileDetail() {
  const post = window.SEED_POSTS.find((p) => p.id && p.type === "video") || window.SEED_POSTS[6];
  const author = window.PEOPLE[post.author];
  const tint = window.TINTS[post.tint] || window.TINTS.paper;
  const comments = [
    { who: "mina", text: "이거 진짜 좋네요. 다음 스프린트에 바로 넣어봐요.", time: "방금" },
    { who: "jay",  text: "구현 난이도만 확인하면 될 것 같아요 👍", time: "2분 전" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--md-sys-color-surface)" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "58px 12px 10px", borderBottom: "1px solid var(--md-sys-color-outline-variant)" }}>
        <span className="md-icon" style={{ fontSize: 24, color: "var(--md-sys-color-on-surface)" }}>arrow_back</span>
        <span style={{ flex: 1, fontFamily: "var(--md-sys-typescale-plain-font)", fontWeight: 700, fontSize: 16, color: "var(--md-sys-color-on-surface)" }}>게시물</span>
        <span className="md-icon" style={{ fontSize: 22, color: "var(--md-sys-color-on-surface-variant)" }}>more_horiz</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 96px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: tint.bg, outline: `1px solid ${tint.line}`, borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ height: 150, borderRadius: 10, background: "linear-gradient(135deg,#1D1B20,#49454F)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 9999, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="md-icon is-filled" style={{ fontSize: 28, color: "#1D1B20", marginLeft: 3 }}>play_arrow</span>
            </div>
          </div>
          <div style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontWeight: 600, fontSize: 15, color: "var(--md-sys-color-on-surface)" }}>{post.title}</div>
          <div style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, color: "var(--md-sys-color-on-surface)" }}>{post.text}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9999, background: author.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)" }}>{author.initials}</div>
          <span style={{ flex: 1, fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, fontWeight: 600, color: "var(--md-sys-color-on-surface)" }}>{author.name}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#B3261E", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, fontWeight: 600 }}>
            <span className="md-icon is-filled" style={{ fontSize: 18 }}>favorite</span>{post.likes}
          </span>
        </div>
        <div style={{ height: 1, background: "var(--md-sys-color-outline-variant)" }} />
        <div style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontWeight: 700, fontSize: 14, color: "var(--md-sys-color-on-surface)" }}>댓글 {comments.length}개</div>
        {comments.map((c, i) => {
          const p = window.PEOPLE[c.who];
          return (
            <div key={i} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9999, flexShrink: 0, background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)" }}>{p.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontWeight: 600, fontSize: 13, color: "var(--md-sys-color-on-surface)" }}>{p.you ? "나" : p.name}</span>
                  <span style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 11, color: "var(--md-sys-color-on-surface-variant)" }}>{c.time}</span>
                </div>
                <div style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, color: "var(--md-sys-color-on-surface)", marginTop: 2 }}>{c.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* comment bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 40, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid var(--md-sys-color-outline-variant)", padding: "10px 14px 28px", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1, height: 40, padding: "0 14px", borderRadius: 9999, background: "var(--md-sys-color-surface-container-high)", display: "flex", alignItems: "center", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, color: "var(--md-sys-color-on-surface-variant)" }}>댓글 남기기</div>
        <div style={{ width: 40, height: 40, borderRadius: 9999, background: "var(--md-sys-color-primary)", color: "var(--md-sys-color-on-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="md-icon" style={{ fontSize: 20 }}>send</span>
        </div>
      </div>
    </div>
  );
}

function MobileApp() {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexWrap: "wrap", gap: 48, alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <IOSDevice><MobileFeed /></IOSDevice>
        <span style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, fontWeight: 600, color: "var(--md-sys-color-on-surface-variant)" }}>보드 피드</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <IOSDevice><MobileDetail /></IOSDevice>
        <span style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, fontWeight: 600, color: "var(--md-sys-color-on-surface-variant)" }}>게시물 상세 · 댓글</span>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MobileApp />);
