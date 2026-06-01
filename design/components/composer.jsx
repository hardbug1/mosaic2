// composer.jsx — add-post dialog. Pick a type, write content, choose tint + section.

function Composer({ open, onClose, onCreate, sections, defaultSection }) {
  const TYPES = [
    { id: "text",  icon: "notes",       label: "메모" },
    { id: "image", icon: "image",       label: "이미지" },
    { id: "link",  icon: "link",        label: "링크" },
    { id: "video", icon: "smart_display", label: "영상" },
    { id: "file",  icon: "description",  label: "파일" },
  ];
  const [type, setType] = React.useState("text");
  const [text, setText] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [tint, setTint] = React.useState("butter");
  const [section, setSection] = React.useState(defaultSection || "well");

  React.useEffect(() => {
    if (open) {
      setType("text"); setText(""); setTitle(""); setTint("butter");
      setSection(defaultSection || "well");
    }
  }, [open, defaultSection]);

  if (!open) return null;

  const tintKeys = Object.keys(window.TINTS);
  const needsTitle = type === "link" || type === "video" || type === "file";
  const canCreate = (text.trim().length > 0) || (needsTitle && title.trim().length > 0);

  const submit = () => {
    if (!canCreate) return;
    const base = { id: window.nid(), type, section, author: "mina", tint, text: text.trim(),
      likes: 0, likedBy: [], comments: 0, rot: (Math.random() * 3 - 1.5) };
    if (type === "image") base.img = "photo";
    if (type === "video") { base.title = title.trim() || "새 클립"; base.dur = "0:30"; }
    if (type === "link")  { base.title = title.trim() || "제목 없는 링크"; base.domain = "example.com"; }
    if (type === "file")  { base.title = title.trim() || "문서.pdf"; base.size = "1.2 MB"; base.ext = "PDF"; }
    onCreate(base);
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.32)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480, background: "var(--md-sys-color-surface-container-high)",
        borderRadius: 28, padding: 24, boxShadow: "var(--md-sys-elevation-level3)",
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="md-headline-small" style={{ color: "var(--md-sys-color-on-surface)" }}>새 게시물</div>
          <M3IconButton icon="close" onClick={onClose} />
        </div>

        {/* type chooser */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TYPES.map((t) => {
            const sel = type === t.id;
            return (
              <button key={t.id} onClick={() => setType(t.id)} style={{
                display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px",
                borderRadius: 9999, cursor: "pointer", border: "none",
                background: sel ? "var(--md-sys-color-secondary-container)" : "transparent",
                boxShadow: sel ? "none" : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                color: sel ? "var(--md-sys-color-on-secondary-container)" : "var(--md-sys-color-on-surface-variant)",
                fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, fontWeight: 500,
              }}>
                <span className="md-icon" style={{ fontSize: 18 }}>{t.icon}</span>{t.label}
              </button>
            );
          })}
        </div>

        {/* type-specific media affordance */}
        {(type === "image" || type === "video" || type === "file") && (
          <div style={{
            height: 96, borderRadius: 14, border: "1.5px dashed var(--md-sys-color-outline-variant)",
            display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center",
            color: "var(--md-sys-color-on-surface-variant)", background: "rgba(0,0,0,0.02)",
          }}>
            <span className="md-icon" style={{ fontSize: 26 }}>upload</span>
            <span className="md-body-small">{({ image: "이미지", video: "영상", file: "파일" }[type])}를(을) 여기에 끌어다 놓거나 클릭해 선택하세요</span>
          </div>
        )}

        {needsTitle && (
          <M3TextField label={type === "link" ? "링크 제목" : type === "video" ? "영상 제목" : "파일 이름"}
            value={title} onChange={setTitle} />
        )}

        <M3TextField label={needsTitle ? "메모 추가 (선택)" : "어떤 생각을 공유할까요?"}
          value={text} onChange={setText} multiline rows={3} />

        {/* tint */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="md-label-medium" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>색상</span>
          <div style={{ display: "flex", gap: 8 }}>
            {tintKeys.map((k) => (
              <button key={k} onClick={() => setTint(k)} title={k} style={{
                width: 26, height: 26, borderRadius: 9999, cursor: "pointer", border: "none",
                background: window.TINTS[k].bg,
                boxShadow: tint === k
                  ? "0 0 0 2px var(--md-sys-color-surface-container-high), 0 0 0 4px var(--md-sys-color-primary)"
                  : `inset 0 0 0 1px ${window.TINTS[k].line}`,
              }} />
            ))}
          </div>
        </div>

        {/* section */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="md-label-medium" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>섹션</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {sections.map((s) => {
              const sel = section === s.id;
              return (
                <button key={s.id} onClick={() => setSection(s.id)} style={{
                  height: 32, padding: "0 12px", borderRadius: 9999, cursor: "pointer", border: "none",
                  background: sel ? "var(--md-sys-color-primary)" : "transparent",
                  boxShadow: sel ? "none" : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                  color: sel ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)",
                  fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, fontWeight: 500,
                }}>{s.title}</button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <M3Button variant="text" onClick={onClose}>취소</M3Button>
          <M3Button variant="filled" icon="add" onClick={submit} disabled={!canCreate}>게시</M3Button>
        </div>
      </div>
    </div>
  );
}

window.Composer = Composer;
