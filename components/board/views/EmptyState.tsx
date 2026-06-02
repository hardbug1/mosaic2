"use client";

export function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 0",
        color: "var(--md-sys-color-on-surface-variant)",
      }}
    >
      <span className="md-icon" style={{ fontSize: 40 }}>
        search_off
      </span>
      <div className="md-title-medium" style={{ marginTop: 8 }}>
        일치하는 게시물이 없어요
      </div>
      <div className="md-body-small">다른 검색어나 필터를 사용해 보세요</div>
    </div>
  );
}
