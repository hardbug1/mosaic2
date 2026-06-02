// share.jsx — share / invite members dialog

const ROLES = [
  { id: "view", label: "보기" },
  { id: "edit", label: "편집" },
  { id: "admin", label: "관리" },
];

const INITIAL_SHARE = [
  { id: "mina",  role: "admin", owner: true },
  { id: "jay",   role: "edit" },
  { id: "sora",  role: "edit" },
  { id: "ravi",  role: "view" },
  { id: "elise", role: "edit" },
];

function RolePicker({ value, disabled, onChange }) {
  return (
    <div style={{ display: "inline-flex", borderRadius: 9999, padding: 2, gap: 2, background: "var(--md-sys-color-surface-container-high)", opacity: disabled ? 0.5 : 1 }}>
      {ROLES.map((r) => {
        const sel = value === r.id;
        return (
          <button key={r.id} disabled={disabled} onClick={() => onChange(r.id)} style={{
            height: 28, padding: "0 10px", borderRadius: 9999, border: "none", cursor: disabled ? "default" : "pointer",
            background: sel ? "var(--md-sys-color-primary)" : "transparent",
            color: sel ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)",
            fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 12, fontWeight: 600,
          }}>{r.label}</button>
        );
      })}
    </div>
  );
}

function ShareDialog({ open, onClose, onToast }) {
  const [members, setMembers] = React.useState(INITIAL_SHARE);
  const [invite, setInvite] = React.useState("");
  const [linkRole, setLinkRole] = React.useState("view");

  React.useEffect(() => { if (open) { setMembers(INITIAL_SHARE); setInvite(""); } }, [open]);
  if (!open) return null;

  const setRole = (id, role) => setMembers((ms) => ms.map((m) => m.id === id ? { ...m, role } : m));
  const remove = (id) => setMembers((ms) => ms.filter((m) => m.id !== id));
  const sendInvite = () => {
    if (!invite.trim()) return;
    onToast && onToast(invite.trim() + " 님에게 초대를 보냈습니다");
    setInvite("");
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 520, background: "var(--md-sys-color-surface-container-high)",
        borderRadius: 28, padding: 24, boxShadow: "var(--md-sys-elevation-level3)", display: "flex", flexDirection: "column", gap: 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="md-headline-small" style={{ color: "var(--md-sys-color-on-surface)" }}>보드 공유</div>
            <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)", marginTop: 2 }}>2분기 제품 회고</div>
          </div>
          <M3IconButton icon="close" onClick={onClose} />
        </div>

        {/* invite by email */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 14px", borderRadius: 9999, border: "1px solid var(--md-sys-color-outline-variant)", background: "var(--md-sys-color-surface)" }}>
            <span className="md-icon" style={{ fontSize: 20, color: "var(--md-sys-color-on-surface-variant)" }}>mail</span>
            <input value={invite} onChange={(e) => setInvite(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendInvite(); }}
              placeholder="이메일로 초대" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 15, color: "var(--md-sys-color-on-surface)" }} />
          </div>
          <M3Button variant="filled" onClick={sendInvite} disabled={!invite.trim()} style={{ height: 48, borderRadius: 9999 }}>초대</M3Button>
        </div>

        {/* member list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflow: "auto" }}>
          {members.map((m) => {
            const p = window.PEOPLE[m.id];
            return (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 4px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 9999, flexShrink: 0, background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, fontFamily: "var(--md-sys-typescale-plain-font)" }}>{p.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="md-label-large" style={{ color: "var(--md-sys-color-on-surface)" }}>{p.name}{m.owner && " (소유자)"}</div>
                  <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{p.you ? "나" : m.id + "@team.com"}</div>
                </div>
                <RolePicker value={m.role} disabled={m.owner} onChange={(r) => setRole(m.id, r)} />
                {!m.owner && <M3IconButton icon="close" size={32} tooltip="제거" onClick={() => remove(m.id)} />}
              </div>
            );
          })}
        </div>

        <div style={{ height: 1, background: "var(--md-sys-color-outline-variant)" }} />

        {/* link sharing */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9999, background: "var(--md-sys-color-secondary-container)", color: "var(--md-sys-color-on-secondary-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="md-icon" style={{ fontSize: 20 }}>link</span>
          </div>
          <div style={{ flex: 1 }}>
            <div className="md-label-large" style={{ color: "var(--md-sys-color-on-surface)" }}>링크가 있는 모든 사용자</div>
            <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>이 보드에 접근할 수 있어요</div>
          </div>
          <RolePicker value={linkRole} onChange={setLinkRole} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <M3Button variant="outlined" icon="link" onClick={() => onToast && onToast("초대 링크가 복사되었습니다")}>링크 복사</M3Button>
          <M3Button variant="filled" onClick={onClose}>완료</M3Button>
        </div>
      </div>
    </div>
  );
}

window.ShareDialog = ShareDialog;
