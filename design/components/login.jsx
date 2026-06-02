// login.jsx — Mosaic sign-in screen (Material 3, Korean)

function MosaicMark({ size = 44 }) {
  const tiles = [
    { c: "#6750A4", col: "1 / 3", row: "1 / 2" },
    { c: "#A23BB0", col: "1 / 2", row: "2 / 4" },
    { c: "#00639B", col: "2 / 3", row: "2 / 3" },
    { c: "#386A20", col: "2 / 3", row: "3 / 4" },
  ];
  const gap = Math.round(size * 0.1);
  const r = Math.round(size * 0.13);
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap,
    }}>
      {tiles.map((t, i) => (
        <div key={i} style={{ gridColumn: t.col, gridRow: t.row, background: t.c, borderRadius: r }} />
      ))}
    </div>
  );
}

// Decorative mosaic field behind the brand panel — soft tonal tiles.
function MosaicField() {
  const cells = React.useMemo(() => {
    const palette = ["#6750A4", "#A23BB0", "#00639B", "#386A20", "#8C4A60", "#7B6FB0"];
    const arr = [];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        arr.push({
          key: r + "-" + c,
          color: palette[(r * 5 + c) % palette.length],
          op: 0.06 + ((r * 3 + c * 7) % 5) * 0.04,
          big: (r * 5 + c) % 9 === 0,
        });
      }
    }
    return arr;
  }, []);
  return (
    <div aria-hidden="true" style={{
      position: "absolute", inset: 0, display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)", gridAutoRows: "1fr", gap: 10, padding: 28,
      opacity: 0.9,
    }}>
      {cells.map((c) => (
        <div key={c.key} style={{
          background: c.color, opacity: c.op, borderRadius: c.big ? 28 : 16,
        }} />
      ))}
    </div>
  );
}

function SocialButton({ icon, label, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        height: 52, width: "100%", borderRadius: 9999, cursor: "pointer",
        border: "1px solid var(--md-sys-color-outline-variant)",
        background: hover ? "var(--md-sys-color-surface-container)" : "var(--md-sys-color-surface)",
        color: "var(--md-sys-color-on-surface)", display: "inline-flex", alignItems: "center",
        justifyContent: "center", gap: 10, fontFamily: "var(--md-sys-typescale-plain-font)",
        fontSize: 15, fontWeight: 600, transition: "background 120ms var(--md-sys-motion-easing-standard)",
      }}>
      <span className="md-icon" style={{ fontSize: 20 }}>{icon}</span>{label}
    </button>
  );
}

function Login() {
  const [tab, setTab] = React.useState("login"); // login | signup
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [name, setName] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState("");

  const go = () => { window.location.href = "모자이크 — 내 보드.html"; };

  const submit = () => {
    if (!email.trim()) { setError("이메일을 입력해주세요."); return; }
    if (!pw) { setError("비밀번호를 입력해주세요."); return; }
    if (tab === "signup") {
      if (!name.trim()) { setError("이름을 입력해주세요."); return; }
      if (pw !== pw2) { setError("비밀번호가 일치하지 않습니다."); return; }
    }
    setError("");
    go();
  };

  const isLogin = tab === "login";

  return (
    <div style={{ minHeight: "100%", display: "flex", background: "var(--md-sys-color-surface)" }}>
      {/* Left brand panel */}
      <div className="login-brand-panel" style={{
        flex: "1 1 0", position: "relative", overflow: "hidden",
        background: "var(--md-sys-color-surface-container-low)",
        display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 48,
      }}>
        <MosaicField />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <MosaicMark size={36} />
          <span style={{
            fontFamily: "var(--md-sys-typescale-brand-font)", fontWeight: 800, fontSize: 22,
            letterSpacing: "-0.4px", color: "var(--md-sys-color-on-surface)",
          }}>Mosaic</span>
        </div>
        <div style={{ position: "relative", maxWidth: 440 }}>
          <h1 style={{
            margin: 0, fontFamily: "var(--md-sys-typescale-brand-font)", fontWeight: 800,
            fontSize: 44, lineHeight: 1.15, letterSpacing: "-1px",
            color: "var(--md-sys-color-on-surface)", textWrap: "balance",
          }}>작은 생각들이 모여<br />하나의 그림이 됩니다</h1>
          <p style={{
            marginTop: 18, marginBottom: 0, fontFamily: "var(--md-sys-typescale-plain-font)",
            fontSize: 17, lineHeight: 1.6, color: "var(--md-sys-color-on-surface-variant)", textWrap: "pretty",
          }}>팀의 메모, 이미지, 링크, 영상을 한 보드에서 함께 모으고 정리하세요. 회의 일정을 잡지 않아도 모두의 생각이 실시간으로 이어집니다.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 26 }}>
            <div style={{ display: "flex" }}>
              {["#6750A4", "#386A20", "#00639B", "#A23BB0"].map((c, i) => (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: 9999, background: c, color: "#fff",
                  marginLeft: i === 0 ? 0 : -8, boxShadow: "0 0 0 2px var(--md-sys-color-surface-container-low)",
                }} />
              ))}
            </div>
            <span style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, color: "var(--md-sys-color-on-surface-variant)" }}>
              이미 12,000개 팀이 모자이크에서 협업하고 있어요
            </span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel" style={{
        flex: "0 0 clamp(420px, 42%, 560px)", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px 32px", background: "var(--md-sys-color-surface)",
      }}>
        <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="login-mobile-brand" style={{ display: "none", alignItems: "center", gap: 10 }}>
            <MosaicMark size={32} />
            <span style={{ fontFamily: "var(--md-sys-typescale-brand-font)", fontWeight: 800, fontSize: 20, color: "var(--md-sys-color-on-surface)" }}>Mosaic</span>
          </div>

          <div>
            <div style={{ fontFamily: "var(--md-sys-typescale-brand-font)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.5px", color: "var(--md-sys-color-on-surface)" }}>
              {isLogin ? "다시 오신 걸 환영해요" : "모자이크 시작하기"}
            </div>
            <div style={{ marginTop: 6, fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 15, color: "var(--md-sys-color-on-surface-variant)" }}>
              {isLogin ? "계정에 로그인하고 보드로 이동하세요" : "무료로 계정을 만들고 팀을 초대하세요"}
            </div>
          </div>

          {/* tab switch */}
          <div style={{ display: "inline-flex", borderRadius: 9999, padding: 3, gap: 2, background: "var(--md-sys-color-surface-container-high)" }}>
            {[["login", "로그인"], ["signup", "회원가입"]].map(([id, label]) => {
              const sel = tab === id;
              return (
                <button key={id} onClick={() => { setTab(id); setError(""); }} style={{
                  flex: 1, height: 38, borderRadius: 9999, border: "none", cursor: "pointer",
                  background: sel ? "var(--md-sys-color-primary)" : "transparent",
                  color: sel ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)",
                  fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, fontWeight: 600,
                  transition: "background 150ms var(--md-sys-motion-easing-standard)",
                }}>{label}</button>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!isLogin && (
              <M3TextField label="이름" value={name} onChange={setName} />
            )}
            <M3TextField label="이메일" value={email} onChange={setEmail} type="email" />
            <div style={{ position: "relative" }}>
              <M3TextField label="비밀번호" value={pw} onChange={setPw} type={showPw ? "text" : "password"} />
              <button onClick={() => setShowPw((v) => !v)} title={showPw ? "숨기기" : "표시"} style={{
                position: "absolute", right: 8, top: 8, width: 40, height: 40, borderRadius: 9999,
                border: "none", background: "transparent", cursor: "pointer",
                color: "var(--md-sys-color-on-surface-variant)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span className="md-icon" style={{ fontSize: 20 }}>{showPw ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
            {!isLogin && (
              <M3TextField label="비밀번호 확인" value={pw2} onChange={setPw2} type="password" />
            )}
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--md-sys-color-error)", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13 }}>
              <span className="md-icon" style={{ fontSize: 18 }}>error</span>{error}
            </div>
          )}

          {isLogin && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, color: "var(--md-sys-color-on-surface-variant)" }}>
                <M3Checkbox checked={remember} onChange={setRemember} />
                로그인 상태 유지
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, color: "var(--md-sys-color-primary)", textDecoration: "none", fontWeight: 600 }}>
                비밀번호 찾기
              </a>
            </div>
          )}

          <M3Button variant="filled" onClick={submit} style={{ width: "100%", height: 52, borderRadius: 9999 }}>
            {isLogin ? "로그인" : "계정 만들기"}
          </M3Button>

          {/* divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--md-sys-color-on-surface-variant)" }}>
            <div style={{ flex: 1, height: 1, background: "var(--md-sys-color-outline-variant)" }} />
            <span style={{ fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13 }}>또는</span>
            <div style={{ flex: 1, height: 1, background: "var(--md-sys-color-outline-variant)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SocialButton icon="mail" label="Google로 계속하기" onClick={go} />
            <SocialButton icon="chat_bubble" label="카카오로 계속하기" onClick={go} />
          </div>

          <div style={{ textAlign: "center", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, color: "var(--md-sys-color-on-surface-variant)" }}>
            {isLogin ? "아직 계정이 없으신가요? " : "이미 계정이 있으신가요? "}
            <button onClick={() => { setTab(isLogin ? "signup" : "login"); setError(""); }} style={{
              border: "none", background: "transparent", cursor: "pointer", padding: 0,
              color: "var(--md-sys-color-primary)", fontFamily: "inherit", fontSize: 14, fontWeight: 700,
            }}>{isLogin ? "회원가입" : "로그인"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Login />);
