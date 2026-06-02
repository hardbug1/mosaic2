// settings.jsx — profile & settings page

function SettingsMosaicMark({ size = 30 }) {
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

const NAV = [
  { id: "profile",  icon: "person",        label: "프로필" },
  { id: "account",  icon: "lock",          label: "계정 · 보안" },
  { id: "notif",    icon: "notifications", label: "알림" },
  { id: "appearance", icon: "palette",     label: "테마 · 표시" },
];

const AVATAR_COLORS = ["#6750A4", "#386A20", "#00639B", "#A23BB0", "#8C4A60", "#9A6A00"];

function Row({ title, desc, children, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: last ? "none" : "1px solid var(--md-sys-color-outline-variant)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="md-title-small" style={{ color: "var(--md-sys-color-on-surface)" }}>{title}</div>
        {desc && <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)", marginTop: 2, textWrap: "pretty" }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: "var(--md-sys-color-surface-container-low)", border: "1px solid var(--md-sys-color-outline-variant)", borderRadius: 20, padding: "8px 20px 16px" }}>
      {title && <div className="md-title-medium" style={{ color: "var(--md-sys-color-on-surface)", padding: "14px 0 4px" }}>{title}</div>}
      {children}
    </div>
  );
}

function Settings() {
  const [section, setSection] = React.useState("profile");
  const [name, setName] = React.useState("김민아");
  const [bio, setBio] = React.useState("프로덕트 디자이너 · 협업과 회고를 좋아해요");
  const [avatarColor, setAvatarColor] = React.useState("#6750A4");
  const [theme, setTheme] = React.useState("light"); // light | dark | system
  const [density, setDensity] = React.useState("regular");
  const [notif, setNotif] = React.useState({ mention: true, comment: true, invite: true, digest: false, marketing: false });
  const [twoFA, setTwoFA] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  }, [theme]);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  return (
    <div style={{ minHeight: "100%", background: "var(--md-sys-color-surface)" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--md-sys-color-surface-container-low)", borderBottom: "1px solid var(--md-sys-color-outline-variant)", display: "flex", alignItems: "center", gap: 12, padding: "14px 28px" }}>
        <a href="모자이크 — 내 보드.html" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <SettingsMosaicMark size={28} />
          <span style={{ fontFamily: "var(--md-sys-typescale-brand-font)", fontWeight: 800, fontSize: 19, letterSpacing: "-0.3px", color: "var(--md-sys-color-on-surface)" }}>Mosaic</span>
        </a>
        <div style={{ width: 1, height: 24, background: "var(--md-sys-color-outline-variant)" }} />
        <div className="md-title-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>설정</div>
        <div style={{ flex: 1 }} />
        <M3Button variant="filled" icon={saved ? "check" : "save"} onClick={save}>{saved ? "저장됨" : "변경사항 저장"}</M3Button>
      </header>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 28px 80px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 28, alignItems: "start" }}>
        {/* side nav */}
        <nav style={{ position: "sticky", top: 92, display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map((n) => {
            const sel = section === n.id;
            return (
              <button key={n.id} onClick={() => setSection(n.id)} style={{
                display: "flex", alignItems: "center", gap: 12, height: 48, padding: "0 16px", borderRadius: 9999, cursor: "pointer", border: "none",
                background: sel ? "var(--md-sys-color-secondary-container)" : "transparent",
                color: sel ? "var(--md-sys-color-on-secondary-container)" : "var(--md-sys-color-on-surface-variant)",
                fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, fontWeight: 600, textAlign: "left",
              }}>
                <span className={`md-icon ${sel ? "is-filled" : ""}`} style={{ fontSize: 20 }}>{n.icon}</span>{n.label}
              </button>
            );
          })}
        </nav>

        {/* content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {section === "profile" && (
            <React.Fragment>
              <Card title="프로필">
                <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "12px 0", borderBottom: "1px solid var(--md-sys-color-outline-variant)" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 9999, background: avatarColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)" }}>{name.slice(-2)}</div>
                  <div>
                    <div className="md-label-large" style={{ color: "var(--md-sys-color-on-surface-variant)", marginBottom: 8 }}>아바타 색상</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {AVATAR_COLORS.map((c) => (
                        <button key={c} onClick={() => setAvatarColor(c)} style={{ width: 28, height: 28, borderRadius: 9999, border: "none", cursor: "pointer", background: c, boxShadow: avatarColor === c ? "0 0 0 2px var(--md-sys-color-surface-container-low), 0 0 0 4px var(--md-sys-color-primary)" : "none" }} />
                      ))}
                    </div>
                  </div>
                </div>
                <Row title="이름"><div style={{ width: 240 }}><M3TextField label="" value={name} onChange={setName} /></div></Row>
                <Row title="소개" last><div style={{ width: 240 }}><M3TextField label="" value={bio} onChange={setBio} /></div></Row>
              </Card>
              <Card title="조직">
                <Row title="워크스페이스" desc="모자이크 디자인팀"><M3Button variant="outlined" size="sm">전환</M3Button></Row>
                <Row title="이메일" desc="mina@team.com" last><span className="md-body-small" style={{ color: "#386A20", fontWeight: 600 }}>인증됨</span></Row>
              </Card>
            </React.Fragment>
          )}

          {section === "account" && (
            <Card title="계정 · 보안">
              <Row title="비밀번호" desc="마지막 변경 32일 전"><M3Button variant="outlined" size="sm">변경</M3Button></Row>
              <Row title="2단계 인증" desc="로그인 시 인증 코드를 추가로 요구해요"><M3Switch checked={twoFA} onChange={setTwoFA} /></Row>
              <Row title="연결된 계정" desc="Google · 카카오"><M3Button variant="text" size="sm">관리</M3Button></Row>
              <Row title="로그인 기기" desc="현재 3대에서 로그인됨"><M3Button variant="text" size="sm">보기</M3Button></Row>
              <Row title="계정 삭제" desc="모든 보드와 데이터가 영구 삭제돼요" last><M3Button variant="danger" size="sm">삭제</M3Button></Row>
            </Card>
          )}

          {section === "notif" && (
            <React.Fragment>
              <Card title="활동 알림">
                <Row title="멘션" desc="누군가 회원님을 멘션할 때"><M3Switch checked={notif.mention} onChange={(v) => setNotif({ ...notif, mention: v })} /></Row>
                <Row title="댓글" desc="내 게시물에 댓글이 달릴 때"><M3Switch checked={notif.comment} onChange={(v) => setNotif({ ...notif, comment: v })} /></Row>
                <Row title="초대" desc="새 보드에 초대될 때" last><M3Switch checked={notif.invite} onChange={(v) => setNotif({ ...notif, invite: v })} /></Row>
              </Card>
              <Card title="이메일">
                <Row title="주간 다이제스트" desc="한 주간의 보드 활동 요약"><M3Switch checked={notif.digest} onChange={(v) => setNotif({ ...notif, digest: v })} /></Row>
                <Row title="제품 소식" desc="새 기능과 팁 안내" last><M3Switch checked={notif.marketing} onChange={(v) => setNotif({ ...notif, marketing: v })} /></Row>
              </Card>
            </React.Fragment>
          )}

          {section === "appearance" && (
            <React.Fragment>
              <Card title="테마">
                <div style={{ display: "flex", gap: 12, padding: "14px 0" }}>
                  {[["light", "라이트", "light_mode"], ["dark", "다크", "dark_mode"], ["system", "시스템", "contrast"]].map(([id, label, icon]) => {
                    const sel = theme === id;
                    return (
                      <button key={id} onClick={() => setTheme(id)} style={{
                        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 8px", borderRadius: 16, cursor: "pointer",
                        border: "none", background: sel ? "var(--md-sys-color-secondary-container)" : "var(--md-sys-color-surface-container)",
                        boxShadow: sel ? "inset 0 0 0 2px var(--md-sys-color-primary)" : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                        color: sel ? "var(--md-sys-color-on-secondary-container)" : "var(--md-sys-color-on-surface-variant)", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, fontWeight: 600,
                      }}>
                        <span className="md-icon" style={{ fontSize: 26 }}>{icon}</span>{label}
                      </button>
                    );
                  })}
                </div>
              </Card>
              <Card title="표시">
                <Row title="카드 밀도" desc="보드에서 게시물 카드의 간격">
                  <div style={{ display: "inline-flex", borderRadius: 9999, padding: 3, gap: 2, background: "var(--md-sys-color-surface-container-high)" }}>
                    {[["compact", "좁게"], ["regular", "보통"]].map(([id, label]) => {
                      const sel = density === id;
                      return <button key={id} onClick={() => setDensity(id)} style={{ height: 32, padding: "0 14px", borderRadius: 9999, border: "none", cursor: "pointer", background: sel ? "var(--md-sys-color-primary)" : "transparent", color: sel ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, fontWeight: 600 }}>{label}</button>;
                    })}
                  </div>
                </Row>
                <Row title="언어" desc="한국어" last><M3Button variant="text" size="sm">변경</M3Button></Row>
              </Card>
            </React.Fragment>
          )}
        </div>
      </div>

      <M3Snackbar open={saved} message="변경사항이 저장되었습니다" actionLabel="확인" onClose={() => setSaved(false)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Settings />);
