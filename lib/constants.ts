export const SECTIONS = [
  { id: "well",    title: "좋았던 점",       icon: "sentiment_satisfied", accent: "#386A20" },
  { id: "work",    title: "개선할 점",       icon: "build",               accent: "#B3261E" },
  { id: "ideas",   title: "아이디어 · 실험", icon: "lightbulb",           accent: "#6750A4" },
  { id: "actions", title: "실행 항목",       icon: "task_alt",            accent: "#00639B" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export const TINTS: Record<string, { bg: string; line: string }> = {
  butter: { bg: "#FFF3D6", line: "#EAD9A6" },
  blush:  { bg: "#FFE0E6", line: "#F2C0CB" },
  lilac:  { bg: "#EADDFF", line: "#D3C0F0" },
  mint:   { bg: "#D7F2E0", line: "#B4DEC2" },
  sky:    { bg: "#D9ECFF", line: "#B6D6F2" },
  paper:  { bg: "#FFFFFF", line: "#E2DDE7" },
};

export const PALETTE = ["#6750A4", "#386A20", "#00639B", "#8C4A60", "#A23BB0", "#B3261E"];

export const POST_TYPES = ["text", "image", "link", "video", "file"] as const;
export type PostType = (typeof POST_TYPES)[number];
