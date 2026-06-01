import { PALETTE } from "./constants";

export function deriveInitials(name: string): string {
  const trimmed = (name || "").trim();
  if (trimmed.length === 0) return "?";
  return trimmed.slice(-2);
}

// 결정적 색상 배정: 문자열 해시 → 팔레트 인덱스
export function pickColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
