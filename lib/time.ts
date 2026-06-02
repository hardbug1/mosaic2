/**
 * Relative Korean time helper — converts an ISO timestamp to a
 * human-readable Korean relative string.
 */
export function relativeKo(isoOrDate: string | Date, justNow = "방금 전"): string {
  const date =
    typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return justNow;
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${mins}분 전`;
  }
  if (diffSec < 86400) {
    const hrs = Math.floor(diffSec / 3600);
    return `${hrs}시간 전`;
  }
  if (diffSec < 172800) {
    return "어제";
  }
  if (diffSec < 604800) {
    const days = Math.floor(diffSec / 86400);
    return `${days}일 전`;
  }
  // Older — format as YYYY.MM.DD
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

/**
 * Deterministic scheme picker from a board id string.
 * Returns one of the six scheme keys.
 */
const SCHEMES = ["violet", "green", "blue", "rose", "amber", "teal"] as const;
export type BoardScheme = (typeof SCHEMES)[number];

export function pickScheme(id: string): BoardScheme {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return SCHEMES[hash % SCHEMES.length];
}
