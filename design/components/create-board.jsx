// create-board.jsx — new board dialog with template picker

const BOARD_TEMPLATES = [
  { id: "blank",      title: "빈 보드",          desc: "처음부터 자유롭게",        icon: "add",          accent: "#6750A4" },
  { id: "retro",      title: "회고 (KPT)",       desc: "Keep · Problem · Try",    icon: "task_alt",     accent: "#386A20" },
  { id: "brainstorm", title: "브레인스토밍",      desc: "아이디어를 자유롭게 발산",  icon: "lightbulb",    accent: "#9A6A00" },
  { id: "roadmap",    title: "로드맵",           desc: "분기별 계획 정리",         icon: "calendar_month", accent: "#00639B" },
];

function CreateBoard({ open, onClose, onCreate }) {
  const [title, setTitle] = React.useState("");
  const [tpl, setTpl] = React.useState("retro");

  React.useEffect(() => { if (open) { setTitle(""); setTpl("retro"); } }, [open]);
  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.32)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 520, background: "var(--md-sys-color-surface-container-high)",
        borderRadius: 28, padding: 24, boxShadow: "var(--md-sys-elevation-level3)",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="md-headline-small" style={{ color: "var(--md-sys-color-on-surface)" }}>새 보드 만들기</div>
          <M3IconButton icon="close" onClick={onClose} />
        </div>

        <M3TextField label="보드 이름" value={title} onChange={setTitle} />

        <div>
          <div className="md-label-large" style={{ color: "var(--md-sys-color-on-surface-variant)", marginBottom: 10 }}>템플릿 선택</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {BOARD_TEMPLATES.map((t) => {
              const sel = tpl === t.id;
              return (
                <button key={t.id} onClick={() => setTpl(t.id)} style={{
                  textAlign: "left", cursor: "pointer", borderRadius: 16, padding: 14, display: "flex", gap: 12, alignItems: "center",
                  border: "none", background: sel ? "var(--md-sys-color-secondary-container)" : "var(--md-sys-color-surface-container)",
                  boxShadow: sel ? "inset 0 0 0 2px var(--md-sys-color-primary)" : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: t.accent + "22", color: t.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="md-icon" style={{ fontSize: 22 }}>{t.icon}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="md-title-small" style={{ color: "var(--md-sys-color-on-surface)" }}>{t.title}</div>
                    <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{t.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <M3Button variant="text" onClick={onClose}>취소</M3Button>
          <M3Button variant="filled" icon="add" onClick={() => onCreate(title, tpl)} disabled={!title.trim()}>만들기</M3Button>
        </div>
      </div>
    </div>
  );
}

window.CreateBoard = CreateBoard;
