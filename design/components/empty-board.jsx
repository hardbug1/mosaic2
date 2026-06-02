// empty-board.jsx — onboarding state for a brand-new board

function EmptyMosaicMark({ size = 36 }) {
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

const STEPS = [
  { icon: "post_add", color: "#6750A4", title: "첫 게시물 추가하기", desc: "메모, 이미지, 링크, 영상, 파일 무엇이든 올릴 수 있어요." },
  { icon: "group_add", color: "#00639B", title: "팀원 초대하기", desc: "이메일이나 링크로 동료를 불러 함께 채워보세요." },
  { icon: "view_column", color: "#386A20", title: "섹션으로 정리하기", desc: "컬럼·그리드·캔버스 레이아웃으로 자유롭게 배치해요." },
];

const QUICK_TYPES = [
  { id: "text",  icon: "notes",         label: "메모" },
  { id: "image", icon: "image",         label: "이미지" },
  { id: "link",  icon: "link",          label: "링크" },
  { id: "video", icon: "smart_display", label: "영상" },
  { id: "file",  icon: "description",   label: "파일" },
];

function EmptyBoard() {
  const [done, setDone] = React.useState({});
  const go = () => { window.location.href = "모자이크 — 2분기 제품 회고.html"; };

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: "var(--md-sys-color-surface)" }}>
      {/* board top bar (simplified) */}
      <header style={{ flexShrink: 0, background: "var(--md-sys-color-surface-container-low)", borderBottom: "1px solid var(--md-sys-color-outline-variant)", display: "flex", alignItems: "center", gap: 12, padding: "14px 24px" }}>
        <a href="모자이크 — 내 보드.html" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <EmptyMosaicMark size={30} />
          <span style={{ fontFamily: "var(--md-sys-typescale-brand-font)", fontWeight: 800, fontSize: 19, letterSpacing: "-0.3px", color: "var(--md-sys-color-on-surface)" }}>Mosaic</span>
        </a>
        <div style={{ width: 1, height: 26, background: "var(--md-sys-color-outline-variant)", margin: "0 2px" }} />
        <div className="md-title-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>제목 없는 보드</div>
        <span className="md-icon" style={{ fontSize: 18, color: "var(--md-sys-color-on-surface-variant)" }}>edit</span>
        <div style={{ flex: 1 }} />
        <M3Button variant="tonal" size="sm" icon="group_add">초대</M3Button>
      </header>

      {/* centered onboarding */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>

          {/* hero mosaic illustration */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 40px)", gridTemplateRows: "repeat(3, 40px)", gap: 8 }}>
            {[["#6750A4",2,1],["#A23BB0",1,1],["#00639B",1,2],["#386A20",1,1],["#8C4A60",2,1],["#9A6A00",1,1],["#006A60",1,1],["#7B6FB0",1,1]].map((b, i) => (
              <div key={i} style={{ gridColumn: `span ${b[1]}`, gridRow: `span ${b[2]}`, background: b[0], opacity: 0.18 + (i % 4) * 0.1, borderRadius: 10, animation: `fadeUp 500ms ${i * 70}ms var(--md-sys-motion-easing-emphasized-decelerate) both` }} />
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <div className="md-headline-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>보드가 아직 비어 있어요</div>
            <div className="md-body-large" style={{ color: "var(--md-sys-color-on-surface-variant)", marginTop: 8, textWrap: "pretty" }}>
              작은 생각 하나가 모자이크의 시작이에요. 아래에서 첫 게시물을 추가해보세요.
            </div>
          </div>

          {/* quick-add type row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {QUICK_TYPES.map((t) => (
              <button key={t.id} onClick={go} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 88, padding: "16px 8px",
                borderRadius: 16, cursor: "pointer", border: "1px solid var(--md-sys-color-outline-variant)",
                background: "var(--md-sys-color-surface-container-low)", fontFamily: "var(--md-sys-typescale-plain-font)",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--md-sys-color-secondary-container)", color: "var(--md-sys-color-on-secondary-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="md-icon" style={{ fontSize: 22 }}>{t.icon}</span>
                </div>
                <span className="md-label-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>{t.label}</span>
              </button>
            ))}
          </div>

          <M3Button variant="filled" icon="add" onClick={go} style={{ height: 52, borderRadius: 9999, padding: "0 28px" }}>첫 게시물 추가하기</M3Button>

          {/* checklist */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {STEPS.map((s, i) => {
              const isDone = done[i];
              return (
                <button key={i} onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 16, cursor: "pointer",
                  border: "1px solid var(--md-sys-color-outline-variant)", background: "var(--md-sys-color-surface-container-low)",
                  textAlign: "left", fontFamily: "var(--md-sys-typescale-plain-font)",
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: s.color + "1A", color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="md-icon" style={{ fontSize: 22 }}>{s.icon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="md-title-small" style={{ color: "var(--md-sys-color-on-surface)", textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.6 : 1 }}>{s.title}</div>
                    <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{s.desc}</div>
                  </div>
                  <span className={`md-icon ${isDone ? "is-filled" : ""}`} style={{ fontSize: 24, color: isDone ? "#386A20" : "var(--md-sys-color-outline)" }}>{isDone ? "check_circle" : "radio_button_unchecked"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<EmptyBoard />);
