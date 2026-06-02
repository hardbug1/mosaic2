// board.jsx — PostCard (all content types), media placeholders, live cursor

// ---- media placeholders (no external images; drawn with gradients + icons) ----
function ImageBlock({ kind }) {
  const grads = {
    chart:  "linear-gradient(135deg,#386A20,#7FB069)",
    photo:  "linear-gradient(135deg,#6750A4,#A23BB0)",
  };
  return (
    <div style={{
      height: 132, borderRadius: 10, overflow: "hidden", position: "relative",
      background: grads[kind] || grads.photo,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {kind === "chart" ? <MiniChart /> : (
        <span className="md-icon" style={{ fontSize: 40, color: "rgba(255,255,255,0.9)" }}>image</span>
      )}
    </div>
  );
}

function MiniChart() {
  const bars = [38, 52, 47, 66, 72, 81, 95];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 84, padding: "0 6px" }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 16, height: `${h}%`, borderRadius: 3,
          background: "rgba(255,255,255,0.92)", opacity: 0.55 + i * 0.06,
        }} />
      ))}
    </div>
  );
}

function VideoBlock({ dur }) {
  return (
    <div style={{
      height: 132, borderRadius: 10, overflow: "hidden", position: "relative",
      background: "linear-gradient(135deg,#1D1B20,#49454F)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 9999, background: "rgba(255,255,255,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span className="md-icon is-filled" style={{ fontSize: 28, color: "#1D1B20", marginLeft: 3 }}>play_arrow</span>
      </div>
      <span style={{
        position: "absolute", right: 8, bottom: 8, padding: "2px 6px", borderRadius: 4,
        background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, fontWeight: 500,
        fontFamily: "var(--md-sys-typescale-plain-font)",
      }}>{dur}</span>
    </div>
  );
}

function LinkPreview({ title, domain }) {
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "center", padding: 10, borderRadius: 10,
      background: "var(--chip-bg)", boxShadow: "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
        background: "var(--md-sys-color-secondary-container)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span className="md-icon" style={{ fontSize: 22, color: "var(--md-sys-color-on-secondary-container)" }}>link</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="md-label-large" style={{
          color: "var(--md-sys-color-on-surface)", overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{title}</div>
        <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{domain}</div>
      </div>
    </div>
  );
}

function FileChip({ title, size, ext }) {
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "center", padding: 10, borderRadius: 10,
      background: "var(--chip-bg)", boxShadow: "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
        background: "var(--md-sys-color-error-container)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span className="md-label-small" style={{ color: "var(--md-sys-color-on-error-container)", fontWeight: 700 }}>{ext}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="md-label-large" style={{
          color: "var(--md-sys-color-on-surface)", overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{title}</div>
        <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{size}</div>
      </div>
    </div>
  );
}

// ---- reactions ----
function LikeButton({ liked, count, onToggle }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, border: "none",
        background: "transparent", cursor: "pointer", padding: "3px 6px", borderRadius: 9999,
        color: liked ? "#B3261E" : "var(--md-sys-color-on-surface-variant)",
        fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, fontWeight: 500,
      }}>
      <span className={`md-icon ${liked ? "is-filled" : ""}`} style={{
        fontSize: 18, transform: hover && !liked ? "scale(1.12)" : "scale(1)",
        transition: "transform 120ms var(--md-sys-motion-easing-standard)",
      }}>favorite</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

// ---- the post card ----
function PostCard({ post, dense, onToggleLike, onOpen, dragHandleProps, style, ghost }) {
  const tint = window.TINTS[post.tint] || window.TINTS.paper;
  const author = window.PEOPLE[post.author];
  const liked = (post.likedBy || []).includes("mina");
  const [hover, setHover] = React.useState(false);

  return (
    <div
      {...dragHandleProps}
      className={`tint tint-${post.tint}`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={() => onOpen && onOpen(post)}
      style={{
        background: "var(--tint-bg)",
        borderRadius: 16,
        boxShadow: ghost
          ? "var(--md-sys-elevation-level4)"
          : (hover ? "var(--md-sys-elevation-level2)" : "var(--md-sys-elevation-level1)"),
        padding: dense ? 12 : 16,
        display: "flex", flexDirection: "column", gap: dense ? 8 : 10,
        cursor: "pointer", position: "relative",
        outline: "1px solid var(--tint-line)",
        transition: "box-shadow 160ms var(--md-sys-motion-easing-standard), transform 120ms var(--md-sys-motion-easing-standard)",
        transform: hover && !ghost ? "translateY(-2px)" : "none",
        ...style,
      }}>

      {post.type === "image" && <ImageBlock kind={post.img} />}
      {post.type === "video" && <VideoBlock dur={post.dur} />}

      {post.title && post.type !== "link" && post.type !== "file" && (
        <div className="md-title-small" style={{ color: "var(--md-sys-color-on-surface)" }}>{post.title}</div>
      )}

      {post.text && (
        <div className={dense ? "md-body-small" : "md-body-medium"} style={{
          color: "var(--md-sys-color-on-surface)",
          textWrap: "pretty",
          display: "-webkit-box", WebkitLineClamp: dense ? 4 : 8, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{post.text}</div>
      )}

      {post.type === "link" && <LinkPreview title={post.title} domain={post.domain} />}
      {post.type === "file" && <FileChip title={post.title} size={post.size} ext={post.ext} />}

      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 9999, flexShrink: 0,
          background: author.color, color: "#fff",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)",
        }}>{author.initials}</div>
        <span className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {author.you ? "나" : author.name}
        </span>
        {post.comments > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--md-sys-color-on-surface-variant)", fontSize: 13, fontWeight: 500, fontFamily: "var(--md-sys-typescale-plain-font)" }}>
            <span className="md-icon" style={{ fontSize: 17 }}>chat_bubble_outline</span>{post.comments}
          </span>
        )}
        <LikeButton liked={liked} count={post.likes} onToggle={() => onToggleLike(post.id)} />
      </div>
    </div>
  );
}

// ---- live collaborator cursor ----
function Cursor({ person, x, y }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 60,
      transition: "left 1.6s var(--md-sys-motion-easing-standard), top 1.6s var(--md-sys-motion-easing-standard)",
      willChange: "left, top",
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>
        <path d="M5 3l14 7-6 1.5L9.5 18z" fill={person.color} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      <span style={{
        marginLeft: 14, marginTop: -4, display: "inline-block",
        background: person.color, color: "#fff", borderRadius: 9999,
        padding: "2px 8px", fontSize: 11, fontWeight: 600,
        fontFamily: "var(--md-sys-typescale-plain-font)", whiteSpace: "nowrap",
        boxShadow: "var(--md-sys-elevation-level1)",
      }}>{person.name.split(" ")[0]}</span>
    </div>
  );
}

window.PostCard = PostCard;
window.Cursor = Cursor;
