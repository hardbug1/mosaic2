// detail.jsx — post detail / comments side panel + share dialog

const SEED_COMMENTS = {
  // keyed by post id; falls back to a default thread
  _default: [
    { author: "jay",  text: "좋은 지적이에요. 다음 스프린트에 반영해보면 좋겠어요.", time: "2시간 전" },
    { author: "sora", text: "저도 동의합니다. 관련해서 자료 하나 더 공유할게요.", time: "1시간 전" },
  ],
};

function CommentRow({ c }) {
  const p = window.PEOPLE[c.author] || { name: c.author, initials: "?", color: "#777" };
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9999, flexShrink: 0, background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)" }}>{p.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="md-label-large" style={{ color: "var(--md-sys-color-on-surface)" }}>{p.you ? "나" : p.name}</span>
          <span className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{c.time}</span>
        </div>
        <div className="md-body-medium" style={{ color: "var(--md-sys-color-on-surface)", marginTop: 2, textWrap: "pretty" }}>{c.text}</div>
      </div>
    </div>
  );
}

function PostDetail({ post, onClose, onToggleLike }) {
  const [comments, setComments] = React.useState([]);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => {
    if (post) {
      setComments(SEED_COMMENTS[post.id] || SEED_COMMENTS._default);
      setDraft("");
    }
  }, [post && post.id]);

  if (!post) return null;
  const author = window.PEOPLE[post.author];
  const tint = window.TINTS[post.tint] || window.TINTS.paper;
  const liked = (post.likedBy || []).includes("mina");
  const sec = window.SECTIONS.find((s) => s.id === post.section);

  const send = () => {
    if (!draft.trim()) return;
    setComments((cs) => [...cs, { author: "mina", text: draft.trim(), time: "방금" }]);
    setDraft("");
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.32)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "min(480px, 100%)", height: "100%", background: "var(--md-sys-color-surface)",
        boxShadow: "var(--md-sys-elevation-level3)", display: "flex", flexDirection: "column",
        animation: "slideIn 280ms var(--md-sys-motion-easing-emphasized-decelerate)",
      }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--md-sys-color-outline-variant)" }}>
          {sec && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 9999, background: sec.accent + "1A", color: sec.accent, fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, fontWeight: 600 }}>
            <span className="md-icon" style={{ fontSize: 16 }}>{sec.icon}</span>{sec.title}
          </span>}
          <div style={{ flex: 1 }} />
          <M3IconButton icon="more_horiz" tooltip="더보기" />
          <M3IconButton icon="close" tooltip="닫기" onClick={onClose} />
        </div>

        {/* body (scrolls) */}
        <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: tint.bg, outline: `1px solid ${tint.line}`, borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {post.type === "image" && <div style={{ height: 150, borderRadius: 10, background: "linear-gradient(135deg,#386A20,#7FB069)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="md-icon" style={{ fontSize: 40, color: "rgba(255,255,255,0.9)" }}>image</span></div>}
            {post.type === "video" && <div style={{ height: 150, borderRadius: 10, background: "linear-gradient(135deg,#1D1B20,#49454F)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="md-icon is-filled" style={{ fontSize: 40, color: "#fff" }}>play_circle</span></div>}
            {post.title && <div className="md-title-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>{post.title}</div>}
            {post.text && <div className="md-body-large" style={{ color: "var(--md-sys-color-on-surface)", textWrap: "pretty" }}>{post.text}</div>}
            {post.type === "file" && <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 10, borderRadius: 10, background: "rgba(0,0,0,0.05)" }}><div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--md-sys-color-error-container)", color: "var(--md-sys-color-on-error-container)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, fontFamily: "var(--md-sys-typescale-plain-font)" }}>{post.ext}</div><div><div className="md-label-large">{post.title}</div><div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{post.size}</div></div></div>}
          </div>

          {/* author + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9999, background: author.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)" }}>{author.initials}</div>
            <span className="md-label-large" style={{ color: "var(--md-sys-color-on-surface)", flex: 1 }}>{author.you ? "나" : author.name}</span>
            <button onClick={() => onToggleLike(post.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--md-sys-color-outline-variant)", background: liked ? "var(--md-sys-color-error-container)" : "transparent", cursor: "pointer", padding: "6px 14px", borderRadius: 9999, color: liked ? "#B3261E" : "var(--md-sys-color-on-surface-variant)", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, fontWeight: 600 }}>
              <span className={`md-icon ${liked ? "is-filled" : ""}`} style={{ fontSize: 18 }}>favorite</span>{post.likes}
            </button>
          </div>

          <div style={{ height: 1, background: "var(--md-sys-color-outline-variant)" }} />

          <div className="md-title-small" style={{ color: "var(--md-sys-color-on-surface)" }}>댓글 {comments.length}개</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {comments.map((c, i) => <CommentRow key={i} c={c} />)}
          </div>
        </div>

        {/* composer */}
        <div style={{ borderTop: "1px solid var(--md-sys-color-outline-variant)", padding: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9999, flexShrink: 0, background: "#6750A4", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)" }}>민아</div>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="댓글 남기기" style={{ flex: 1, height: 44, padding: "0 16px", borderRadius: 9999, border: "1px solid var(--md-sys-color-outline-variant)", background: "var(--md-sys-color-surface-container-high)", outline: "none", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, color: "var(--md-sys-color-on-surface)" }} />
          <button onClick={send} disabled={!draft.trim()} title="보내기" style={{ width: 44, height: 44, borderRadius: 9999, border: "none", cursor: draft.trim() ? "pointer" : "default", background: draft.trim() ? "var(--md-sys-color-primary)" : "var(--md-sys-color-surface-container-high)", color: draft.trim() ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="md-icon" style={{ fontSize: 20 }}>send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

window.PostDetail = PostDetail;
