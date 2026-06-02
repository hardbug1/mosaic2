"use client";

import React from "react";
import { M3Button } from "@/components/m3/Button";
import { M3IconButton } from "@/components/m3/IconButton";

// ---- MosaicMark brand icon ----
function MosaicMark({ size = 40 }: { size?: number }) {
  const tiles = [
    { c: "#6750A4", col: "1 / 3", row: "1 / 2" },
    { c: "#A23BB0", col: "1 / 2", row: "2 / 4" },
    { c: "#00639B", col: "2 / 3", row: "2 / 3" },
    { c: "#386A20", col: "2 / 3", row: "3 / 4" },
  ];
  const gap = Math.round(size * 0.1);
  const r = Math.round(size * 0.13);
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr",
        gap,
      }}
    >
      {tiles.map((t, i) => (
        <div
          key={i}
          style={{
            gridColumn: t.col,
            gridRow: t.row,
            background: t.c,
            borderRadius: r,
          }}
        />
      ))}
    </div>
  );
}

// ---- PresenceStack ----
interface PresenceMember {
  id: string;
  name: string;
  initials: string;
  color: string;
}

interface PresenceStackProps {
  online: PresenceMember[];
  onShare?: () => void;
}

function PresenceStack({ online, onShare }: PresenceStackProps) {
  const shown = online.slice(0, 4);
  const extra = online.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {shown.map((p, i) => (
          <div
            key={p.id}
            title={p.name}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              background: p.color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--md-sys-typescale-plain-font)",
              boxShadow: "0 0 0 2px var(--md-sys-color-surface)",
              marginLeft: i === 0 ? 0 : -8,
              position: "relative",
            }}
          >
            {p.initials}
          </div>
        ))}
        {extra > 0 && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              marginLeft: -8,
              background: "var(--md-sys-color-surface-container-highest)",
              color: "var(--md-sys-color-on-surface-variant)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--md-sys-typescale-plain-font)",
              boxShadow: "0 0 0 2px var(--md-sys-color-surface)",
            }}
          >
            +{extra}
          </div>
        )}
      </div>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          color: "var(--md-sys-color-on-surface-variant)",
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "var(--md-sys-typescale-plain-font)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 9999,
            background: "#386A20",
            display: "inline-block",
          }}
        />
        {online.length}명 접속 중
      </span>
      <M3Button variant="tonal" size="sm" icon="ios_share" onClick={onShare}>
        공유
      </M3Button>
    </div>
  );
}

// ---- LayoutSwitch ----
type Layout = "columns" | "grid" | "canvas";

interface LayoutSwitchProps {
  value: Layout;
  onChange: (v: Layout) => void;
}

function LayoutSwitch({ value, onChange }: LayoutSwitchProps) {
  const opts: { id: Layout; icon: string; label: string }[] = [
    { id: "columns", icon: "view_column", label: "컬럼" },
    { id: "grid", icon: "grid_view", label: "그리드" },
    { id: "canvas", icon: "dashboard", label: "캔버스" },
  ];
  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: 9999,
        padding: 3,
        gap: 2,
        background: "var(--md-sys-color-surface-container-high)",
      }}
    >
      {opts.map((o) => {
        const sel = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            title={o.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 34,
              padding: "0 14px",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              background: sel
                ? "var(--md-sys-color-primary)"
                : "transparent",
              color: sel
                ? "var(--md-sys-color-on-primary)"
                : "var(--md-sys-color-on-surface-variant)",
              fontFamily: "var(--md-sys-typescale-plain-font)",
              fontSize: 13,
              fontWeight: 600,
              transition:
                "background 150ms var(--md-sys-motion-easing-standard)",
            }}
          >
            <span className="md-icon" style={{ fontSize: 18 }}>
              {o.icon}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- SearchField ----
interface SearchFieldProps {
  query: string;
  setQuery: (s: string) => void;
}

function SearchField({ query, setQuery }: SearchFieldProps) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 44,
        padding: "0 14px",
        borderRadius: 9999,
        minWidth: 260,
        maxWidth: 420,
        flex: 1,
        background: "var(--md-sys-color-surface-container-high)",
        boxShadow: focus
          ? "inset 0 0 0 2px var(--md-sys-color-primary)"
          : "none",
        transition: "box-shadow 120ms linear",
      }}
    >
      <span
        className="md-icon"
        style={{
          fontSize: 22,
          color: "var(--md-sys-color-on-surface-variant)",
        }}
      >
        search
      </span>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder="게시물 검색"
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          flex: 1,
          fontFamily: "var(--md-sys-typescale-plain-font)",
          fontSize: 15,
          color: "var(--md-sys-color-on-surface)",
        }}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--md-sys-color-on-surface-variant)",
            display: "flex",
          }}
        >
          <span className="md-icon" style={{ fontSize: 20 }}>
            close
          </span>
        </button>
      )}
    </div>
  );
}

// ---- FilterChip ----
interface FilterChipProps {
  active: boolean;
  icon?: string;
  children: React.ReactNode;
  onClick: () => void;
}

function FilterChip({ active, icon, children, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 36,
        padding: active ? "0 14px 0 10px" : "0 14px",
        borderRadius: 9999,
        cursor: "pointer",
        border: "none",
        background: active
          ? "var(--md-sys-color-secondary-container)"
          : "transparent",
        boxShadow: active
          ? "none"
          : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
        color: active
          ? "var(--md-sys-color-on-secondary-container)"
          : "var(--md-sys-color-on-surface-variant)",
        fontFamily: "var(--md-sys-typescale-plain-font)",
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {active && (
        <span className="md-icon" style={{ fontSize: 18 }}>
          check
        </span>
      )}
      {!active && icon && (
        <span className="md-icon" style={{ fontSize: 18 }}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

// ---- BoardTopBar ----
export interface BoardTopBarProps {
  title: string;
  query: string;
  setQuery: (s: string) => void;
  authorFilter: "all" | string;
  setAuthorFilter: (v: "all" | string) => void;
  layout: Layout;
  setLayout: (v: Layout) => void;
  onShare?: () => void;
  onAdd?: () => void;
  online: PresenceMember[];
  postCount: number;
  currentUserId: string;
}

export default function BoardTopBar({
  title,
  query,
  setQuery,
  authorFilter,
  setAuthorFilter,
  layout,
  setLayout,
  onShare,
  onAdd,
  online,
  postCount,
  currentUserId,
}: BoardTopBarProps) {
  return (
    <header
      style={{
        flexShrink: 0,
        background: "var(--md-sys-color-surface-container-low)",
        borderBottom: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      {/* row 1 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
          }}
        >
          <a
            href="/"
            title="내 보드로"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
              minWidth: 0,
            }}
          >
            <MosaicMark size={36} />
            <span
              style={{
                fontFamily: "var(--md-sys-typescale-brand-font)",
                fontWeight: 800,
                fontSize: 21,
                letterSpacing: "-0.4px",
                color: "var(--md-sys-color-on-surface)",
                whiteSpace: "nowrap",
              }}
            >
              Mosaic
            </span>
          </a>
          <div
            style={{
              width: 1,
              height: 30,
              background: "var(--md-sys-color-outline-variant)",
              margin: "0 4px",
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              className="md-title-large"
              style={{
                color: "var(--md-sys-color-on-surface)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {title}
              <span
                className="md-icon"
                style={{
                  fontSize: 18,
                  color: "var(--md-sys-color-on-surface-variant)",
                }}
              >
                edit
              </span>
            </div>
            <div
              className="md-body-small"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              방금 편집함 · 게시물 {postCount}개
            </div>
          </div>
        </div>
        <div
          style={{ flex: 1, display: "flex", justifyContent: "center" }}
        >
          <SearchField query={query} setQuery={setQuery} />
        </div>
        <PresenceStack online={online} onShare={onShare} />
      </div>

      {/* row 2 — toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 20px 12px",
          flexWrap: "wrap",
        }}
      >
        <LayoutSwitch value={layout} onChange={setLayout} />
        <div
          style={{
            width: 1,
            height: 28,
            background: "var(--md-sys-color-outline-variant)",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <FilterChip
            active={authorFilter === "all"}
            icon="groups"
            onClick={() => setAuthorFilter("all")}
          >
            전체 게시물
          </FilterChip>
          <FilterChip
            active={authorFilter === currentUserId}
            icon="person"
            onClick={() => setAuthorFilter(currentUserId)}
          >
            내 게시물
          </FilterChip>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 4 }}>
          <M3IconButton icon="filter_list" tooltip="필터" />
          <M3IconButton icon="sort" tooltip="정렬" />
          <M3IconButton icon="more_vert" tooltip="더보기" />
          {onAdd && (
            <M3IconButton icon="add" tooltip="새 게시물" onClick={onAdd} />
          )}
        </div>
      </div>
    </header>
  );
}
