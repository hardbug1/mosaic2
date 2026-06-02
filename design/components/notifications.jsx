// notifications.jsx — notification center dropdown panel

const NOTIFS = [
  { id: "n1", type: "mention", who: "jay",   board: "2분기 제품 회고",   text: "댓글에서 회원님을 멘션했어요: \"@민아 이 부분 확인 부탁해요\"", time: "5분 전", unread: true },
  { id: "n2", type: "comment", who: "sora",  board: "2분기 제품 회고",   text: "회원님의 게시물에 댓글을 남겼어요", time: "32분 전", unread: true },
  { id: "n3", type: "like",    who: "ravi",  board: "신규 기능 브레인스토밍", text: "회원님의 게시물을 좋아합니다", time: "1시간 전", unread: true },
  { id: "n4", type: "post",    who: "elise", board: "하반기 로드맵",      text: "새 게시물을 추가했어요", time: "3시간 전", unread: false },
  { id: "n5", type: "invite",  who: "tom",   board: "디자인 크리틱 보드",   text: "회원님을 보드에 초대했어요", time: "어제", unread: false },
  { id: "n6", type: "comment", who: "jay",   board: "온보딩 개선 KPT",    text: "회원님의 액션 아이템에 답글을 달았어요", time: "어제", unread: false },
];

const NOTIF_ICON = {
  mention: { icon: "alternate_email", color: "#6750A4" },
  comment: { icon: "chat_bubble",     color: "#00639B" },
  like:    { icon: "favorite",        color: "#B3261E" },
  post:    { icon: "post_add",        color: "#386A20" },
  invite:  { icon: "group_add",       color: "#9A6A00" },
};

function NotificationCenter({ open, onClose, anchor }) {
  const [items, setItems] = React.useState(NOTIFS);
  const [tab, setTab] = React.useState("all"); // all | unread
  if (!open) return null;

  const unreadCount = items.filter((n) => n.unread).length;
  const visible = tab === "unread" ? items.filter((n) => n.unread) : items;
  const markAll = () => setItems((is) => is.map((n) => ({ ...n, unread: false })));
  const readOne = (id) => setItems((is) => is.map((n) => n.id === id ? { ...n, unread: false } : n));

  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1140 }} />
      <div style={{
        position: "fixed", top: 64, right: 24, zIndex: 1150, width: "min(420px, calc(100vw - 32px))",
        maxHeight: "calc(100vh - 96px)", background: "var(--md-sys-color-surface-container-high)",
        borderRadius: 20, boxShadow: "var(--md-sys-elevation-level3)", display: "flex", flexDirection: "column",
        overflow: "hidden", animation: "slideIn 220ms var(--md-sys-motion-easing-emphasized-decelerate)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px 12px" }}>
          <div className="md-title-large" style={{ color: "var(--md-sys-color-on-surface)", flex: 1 }}>알림</div>
          <button onClick={markAll} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--md-sys-color-primary)", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, fontWeight: 600 }}>모두 읽음</button>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "0 18px 12px" }}>
          {[["all", "전체"], ["unread", `안 읽음${unreadCount ? " " + unreadCount : ""}`]].map(([id, label]) => {
            const sel = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                height: 32, padding: "0 14px", borderRadius: 9999, cursor: "pointer", border: "none",
                background: sel ? "var(--md-sys-color-secondary-container)" : "transparent",
                boxShadow: sel ? "none" : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                color: sel ? "var(--md-sys-color-on-secondary-container)" : "var(--md-sys-color-on-surface-variant)",
                fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 13, fontWeight: 600,
              }}>{label}</button>
            );
          })}
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "0 8px 8px" }}>
          {visible.map((n) => {
            const p = window.PEOPLE[n.who];
            const meta = NOTIF_ICON[n.type];
            return (
              <button key={n.id} onClick={() => readOne(n.id)} style={{
                width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                background: n.unread ? "var(--md-sys-color-surface-container-low)" : "transparent",
                borderRadius: 14, padding: 12, display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 2,
                fontFamily: "var(--md-sys-typescale-plain-font)",
              }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 9999, background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>{p.initials}</div>
                  <div style={{ position: "absolute", right: -2, bottom: -2, width: 20, height: 20, borderRadius: 9999, background: meta.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 2px var(--md-sys-color-surface-container-high)" }}>
                    <span className="md-icon" style={{ fontSize: 13 }}>{meta.icon}</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="md-body-medium" style={{ color: "var(--md-sys-color-on-surface)", textWrap: "pretty" }}>
                    <strong style={{ fontWeight: 700 }}>{p.name}</strong>님이 {n.text}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{n.board}</span>
                    <span style={{ width: 3, height: 3, borderRadius: 9999, background: "var(--md-sys-color-outline)" }} />
                    <span className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{n.time}</span>
                  </div>
                </div>
                {n.unread && <span style={{ width: 8, height: 8, borderRadius: 9999, background: "var(--md-sys-color-primary)", flexShrink: 0, marginTop: 6 }} />}
              </button>
            );
          })}
          {visible.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--md-sys-color-on-surface-variant)" }}>
              <span className="md-icon" style={{ fontSize: 36 }}>notifications_off</span>
              <div className="md-body-medium" style={{ marginTop: 6 }}>읽지 않은 알림이 없어요</div>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

window.NotificationCenter = NotificationCenter;
window.__NOTIF_UNREAD = NOTIFS.filter((n) => n.unread).length;
