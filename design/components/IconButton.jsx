// IconButton.jsx — round icon-only button with state layer
function M3IconButton({ icon, onClick, selected, tooltip, size = 40, variant = "standard", filled = false, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);

  const palettes = {
    standard: { bg: "transparent", fg: "var(--md-sys-color-on-surface-variant)", selectedBg: "var(--md-sys-color-secondary-container)", selectedFg: "var(--md-sys-color-on-secondary-container)" },
    filled:   { bg: "var(--md-sys-color-primary)", fg: "var(--md-sys-color-on-primary)", selectedBg: "var(--md-sys-color-primary)", selectedFg: "var(--md-sys-color-on-primary)" },
    tonal:    { bg: "var(--md-sys-color-secondary-container)", fg: "var(--md-sys-color-on-secondary-container)", selectedBg: "var(--md-sys-color-secondary-container)", selectedFg: "var(--md-sys-color-on-secondary-container)" },
  };
  const p = palettes[variant] || palettes.standard;

  return (
    <button {...rest}
      title={tooltip}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      onClick={onClick}
      style={{
        position: "relative", overflow: "hidden",
        width: size, height: size, minWidth: size,
        borderRadius: 9999,
        background: selected ? p.selectedBg : p.bg,
        color: selected ? p.selectedFg : p.fg,
        border: "none", cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
      <span style={{
        position: "absolute", inset: 0,
        background: "currentColor",
        opacity: press ? 0.10 : hover ? 0.08 : 0,
        transition: "opacity 100ms linear",
      }}/>
      <span className={`md-icon ${filled || selected ? "is-filled" : ""}`} style={{ fontSize: 24, position: "relative" }}>{icon}</span>
    </button>
  );
}

window.M3IconButton = M3IconButton;
