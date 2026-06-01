// Atoms.jsx — Avatar, Badge, Switch, Checkbox, ListItem, TextField, Dialog, Snackbar

function M3Avatar({ initials, icon, color = "primary", size = 40 }) {
  const palettes = {
    primary:   { bg: "var(--md-sys-color-primary-container)", fg: "var(--md-sys-color-on-primary-container)" },
    secondary: { bg: "var(--md-sys-color-secondary-container)", fg: "var(--md-sys-color-on-secondary-container)" },
    tertiary:  { bg: "var(--md-sys-color-tertiary-container)", fg: "var(--md-sys-color-on-tertiary-container)" },
    surface:   { bg: "var(--md-sys-color-surface-container-highest)", fg: "var(--md-sys-color-on-surface-variant)" },
  };
  const p = palettes[color] || palettes.primary;
  return (
    <div style={{
      width: size, height: size, minWidth: size,
      borderRadius: 9999, background: p.bg, color: p.fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--md-sys-typescale-plain-font)", fontWeight: 500, fontSize: size * 0.4,
      flexShrink: 0,
    }}>
      {icon ? <span className="md-icon" style={{ fontSize: size * 0.6 }}>{icon}</span> : initials}
    </div>
  );
}

function M3Badge({ count, dot, children }) {
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      {children}
      {(count != null || dot) && (
        <span style={{
          position: "absolute", top: dot ? 4 : 0, right: dot ? 4 : -2,
          minWidth: dot ? 8 : 16, height: dot ? 8 : 16,
          borderRadius: 999, padding: dot ? 0 : "0 4px",
          background: "var(--md-sys-color-error)",
          color: "var(--md-sys-color-on-error)",
          fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 11, fontWeight: 500,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{dot ? "" : (count > 99 ? "99+" : count)}</span>
      )}
    </div>
  );
}

function M3Switch({ checked, onChange }) {
  return (
    <button onClick={() => onChange?.(!checked)}
      style={{
        width: 52, height: 32, borderRadius: 9999, border: "none",
        position: "relative", cursor: "pointer", flexShrink: 0,
        background: checked ? "var(--md-sys-color-primary)" : "var(--md-sys-color-surface-container-highest)",
        boxShadow: checked ? "none" : "inset 0 0 0 2px var(--md-sys-color-outline)",
        transition: "all 200ms cubic-bezier(0.2,0,0,1)",
      }}>
      <span style={{
        position: "absolute", top: "50%",
        left: checked ? 24 : 8,
        width: checked ? 24 : 16, height: checked ? 24 : 16,
        marginTop: checked ? -12 : -8,
        borderRadius: "50%",
        background: checked ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-outline)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--md-sys-color-primary)",
        transition: "all 200ms cubic-bezier(0.2,0,0,1)",
      }}>
        {checked && <span className="md-icon" style={{ fontSize: 16 }}>check</span>}
      </span>
    </button>
  );
}

function M3Checkbox({ checked, onChange }) {
  return (
    <button onClick={() => onChange?.(!checked)} style={{
      width: 18, height: 18, borderRadius: 2,
      background: checked ? "var(--md-sys-color-primary)" : "transparent",
      boxShadow: checked ? "none" : "inset 0 0 0 2px var(--md-sys-color-on-surface-variant)",
      color: "var(--md-sys-color-on-primary)",
      border: "none", cursor: "pointer", padding: 0,
      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {checked && <span className="md-icon" style={{ fontSize: 16, color: "var(--md-sys-color-on-primary)" }}>check</span>}
    </button>
  );
}

function M3ListItem({ leading, headline, supporting, trailing, onClick, selected, lines = 2 }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        position: "relative", display: "flex", alignItems: "center", gap: 16,
        padding: "8px 16px", minHeight: lines === 1 ? 56 : lines === 2 ? 72 : 88,
        cursor: onClick ? "pointer" : "default",
        background: selected ? "var(--md-sys-color-secondary-container)" : "transparent",
      }}>
      {!selected && (
        <span style={{
          position: "absolute", inset: 0,
          background: "var(--md-sys-color-on-surface)",
          opacity: hover ? 0.08 : 0,
          transition: "opacity 100ms linear",
          pointerEvents: "none",
        }}/>
      )}
      {leading && <div style={{ position: "relative" }}>{leading}</div>}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2, position: "relative" }}>
        <div style={{
          fontFamily: "var(--md-sys-typescale-plain-font)", fontWeight: 500, fontSize: 16,
          letterSpacing: 0.15, color: "var(--md-sys-color-on-surface)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{headline}</div>
        {supporting && (
          <div style={{
            fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, letterSpacing: 0.25,
            color: "var(--md-sys-color-on-surface-variant)", lineHeight: "20px",
            overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
            WebkitLineClamp: lines - 1, WebkitBoxOrient: "vertical",
          }}>{supporting}</div>
        )}
      </div>
      {trailing && <div style={{ position: "relative", color: "var(--md-sys-color-on-surface-variant)", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 11 }}>{trailing}</div>}
    </div>
  );
}

function M3TextField({ label, value, onChange, variant = "outlined", supporting, multiline, rows = 1, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const filled = (value || "").length > 0;
  const labelUp = focus || filled;

  if (variant === "outlined") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{
          position: "relative", borderRadius: 4,
          padding: "14px 16px",
          boxShadow: focus
            ? "inset 0 0 0 2px var(--md-sys-color-primary)"
            : "inset 0 0 0 1px var(--md-sys-color-outline)",
          transition: "box-shadow 100ms linear",
        }}>
          <label style={{
            position: "absolute",
            top: labelUp ? -8 : 14, left: labelUp ? 12 : 16,
            padding: labelUp ? "0 4px" : 0,
            background: labelUp ? "var(--md-sys-color-surface)" : "transparent",
            fontFamily: "var(--md-sys-typescale-plain-font)",
            fontSize: labelUp ? 12 : 16,
            color: focus ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface-variant)",
            transition: "all 150ms cubic-bezier(0.2,0,0,1)",
            pointerEvents: "none",
          }}>{label}</label>
          {multiline ? (
            <textarea {...rest} value={value} onChange={e => onChange?.(e.target.value)}
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              rows={rows}
              style={{
                width: "100%", border: "none", outline: "none", background: "transparent",
                fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 16, lineHeight: "24px",
                color: "var(--md-sys-color-on-surface)", resize: "vertical",
              }} />
          ) : (
            <input {...rest} type="text" value={value} onChange={e => onChange?.(e.target.value)}
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              style={{
                width: "100%", border: "none", outline: "none", background: "transparent",
                fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 16, lineHeight: "24px",
                color: "var(--md-sys-color-on-surface)",
              }} />
          )}
        </div>
        {supporting && (
          <span style={{ padding: "0 16px", fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 12, color: "var(--md-sys-color-on-surface-variant)" }}>{supporting}</span>
        )}
      </div>
    );
  }

  // filled variant
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{
        position: "relative", borderTopLeftRadius: 4, borderTopRightRadius: 4,
        background: "var(--md-sys-color-surface-container-highest)",
        padding: labelUp ? "20px 16px 6px" : "16px 16px 10px",
        borderBottom: focus ? "2px solid var(--md-sys-color-primary)" : "1px solid var(--md-sys-color-on-surface-variant)",
        transition: "all 100ms linear",
      }}>
        <label style={{
          position: "absolute",
          top: labelUp ? 6 : "50%",
          transform: labelUp ? "none" : "translateY(-50%)",
          left: 16,
          fontSize: labelUp ? 12 : 16,
          color: focus ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface-variant)",
          fontFamily: "var(--md-sys-typescale-plain-font)",
          transition: "all 150ms cubic-bezier(0.2,0,0,1)",
          pointerEvents: "none",
        }}>{label}</label>
        <input {...rest} type="text" value={value} onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: "100%", border: "none", outline: "none", background: "transparent",
            fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 16,
            color: "var(--md-sys-color-on-surface)",
          }}/>
      </div>
    </div>
  );
}

function M3Dialog({ open, onClose, icon, title, children, actions }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--md-sys-color-surface-container-high)",
        borderRadius: 28, padding: 24, maxWidth: 560, width: "100%",
        boxShadow: "var(--md-sys-elevation-level3)",
      }}>
        {icon && <span className="md-icon" style={{ fontSize: 24, color: "var(--md-sys-color-secondary)", display: "block" }}>{icon}</span>}
        <div style={{
          marginTop: icon ? 16 : 0,
          fontFamily: "var(--md-sys-typescale-brand-font)",
          fontSize: 24, lineHeight: "32px",
          color: "var(--md-sys-color-on-surface)",
        }}>{title}</div>
        <div style={{
          marginTop: 16, marginBottom: 24,
          fontFamily: "var(--md-sys-typescale-plain-font)",
          fontSize: 14, lineHeight: "20px", letterSpacing: 0.25,
          color: "var(--md-sys-color-on-surface-variant)",
        }}>{children}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>{actions}</div>
      </div>
    </div>
  );
}

function M3Snackbar({ open, message, actionLabel, onAction, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)",
      background: "var(--md-sys-color-inverse-surface)",
      color: "var(--md-sys-color-inverse-on-surface)",
      borderRadius: 4, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 24,
      boxShadow: "var(--md-sys-elevation-level3)",
      fontFamily: "var(--md-sys-typescale-plain-font)", fontSize: 14, letterSpacing: 0.25,
      minWidth: 320, maxWidth: 560, zIndex: 1000,
    }}>
      <div style={{ flex: 1 }}>{message}</div>
      {actionLabel && (
        <button onClick={onAction || onClose} style={{
          background: "transparent", border: "none",
          color: "var(--md-sys-color-inverse-primary)",
          fontFamily: "var(--md-sys-typescale-plain-font)",
          fontWeight: 500, fontSize: 14, letterSpacing: 0.1,
          cursor: "pointer",
        }}>{actionLabel}</button>
      )}
    </div>
  );
}

window.M3Avatar = M3Avatar;
window.M3Badge = M3Badge;
window.M3Switch = M3Switch;
window.M3Checkbox = M3Checkbox;
window.M3ListItem = M3ListItem;
window.M3TextField = M3TextField;
window.M3Dialog = M3Dialog;
window.M3Snackbar = M3Snackbar;
