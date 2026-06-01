// data.jsx — seed content for the collaborative board (team retro)

// Collaborators. Each has a distinct, M3-harmonious cursor/avatar color.
const PEOPLE = {
  mina:  { id: "mina",  name: "김민아", initials: "민아", color: "#6750A4", you: true },
  jay:   { id: "jay",   name: "조재현", initials: "재현", color: "#386A20" },
  sora:  { id: "sora",  name: "이소라", initials: "소라", color: "#00639B" },
  ravi:  { id: "ravi",  name: "박지훈", initials: "지훈", color: "#8C4A60" },
  elise: { id: "elise", name: "최은비", initials: "은비", color: "#A23BB0" },
  tom:   { id: "tom",   name: "정태경", initials: "태경", color: "#B3261E" },
};

// People who appear as "live" right now (drive the cursors + presence stack).
const LIVE = ["mina", "jay", "sora", "ravi", "elise"];

// Board sections (used by the Columns layout, and as a filter everywhere).
const SECTIONS = [
  { id: "well",    title: "좋았던 점",        icon: "sentiment_satisfied",   accent: "#386A20" },
  { id: "work",    title: "개선할 점",        icon: "build",                 accent: "#B3261E" },
  { id: "ideas",   title: "아이디어 · 실험",  icon: "lightbulb",             accent: "#6750A4" },
  { id: "actions", title: "실행 항목",        icon: "task_alt",              accent: "#00639B" },
];

// Card tint palette — soft tonal washes (sticky-note feel, M3-tonal).
const TINTS = {
  butter: { bg: "#FFF3D6", line: "#EAD9A6" },
  blush:  { bg: "#FFE0E6", line: "#F2C0CB" },
  lilac:  { bg: "#EADDFF", line: "#D3C0F0" },
  mint:   { bg: "#D7F2E0", line: "#B4DEC2" },
  sky:    { bg: "#D9ECFF", line: "#B6D6F2" },
  paper:  { bg: "#FFFFFF", line: "#E2DDE7" },
};

let _id = 100;
const nid = () => "p" + (++_id);

// Seed posts. type ∈ text | image | link | video | file
const SEED_POSTS = [
  {
    id: nid(), type: "text", section: "well", author: "jay", tint: "butter",
    text: "쓰레드 기반 비동기 스탠드업으로 회의 시간이 거의 절반으로 줄었어요. 캘린더 잡는 일 없이요.",
    likes: 5, likedBy: ["mina", "sora"], comments: 2,
    x: 40, y: 30, rot: -1.5,
  },
  {
    id: nid(), type: "text", section: "well", author: "sora", tint: "mint",
    text: "온보딩 개편을 일정대로 출시한 게 정말 뿌뚜했어요. 새로운 빈 화면 디자인이 사용자들한테 반응이 좋아요.",
    likes: 8, likedBy: ["mina", "jay", "ravi"], comments: 4,
    x: 320, y: 70, rot: 1,
  },
  {
    id: nid(), type: "image", section: "well", author: "elise", tint: "paper",
    title: "출시 후 활성화 23% 상승", img: "chart",
    text: "새 플로우 출시 이후 주차 활성화율입니다.",
    likes: 6, likedBy: ["mina"], comments: 1,
    x: 620, y: 40, rot: -0.5,
  },
  {
    id: nid(), type: "text", section: "work", author: "ravi", tint: "blush",
    text: "디자인과 개발 간 핸드오프가 금요일마다 병목이에요. 스펙이 늦게 나와서 월요일을 날려요.",
    likes: 4, likedBy: ["tom", "jay"], comments: 3,
    x: 60, y: 250, rot: 1.2,
  },
  {
    id: nid(), type: "link", section: "work", author: "tom", tint: "paper",
    title: "장애 회고: API 타임아웃 연쇄", url: "notion.so", domain: "notion.so",
    text: "지난주 장애의 근본 원인 문서예요. 실행 항목 투표 전에 꾭 읽어보세요.",
    likes: 3, likedBy: ["mina"], comments: 0,
    x: 360, y: 270, rot: -1,
  },
  {
    id: nid(), type: "text", section: "work", author: "mina", tint: "butter",
    text: "같은 엣지 케이스를 계속 다시 발견해요. 공용 QA 체크리스트가 있으면 시간을 크게 아끰 수 있을 거예요.",
    likes: 7, likedBy: ["jay", "sora", "ravi", "tom"], comments: 2,
    x: 650, y: 250, rot: 0.6,
  },
  {
    id: nid(), type: "video", section: "ideas", author: "sora", tint: "paper",
    title: "프로토타입: 드래그로 카드 합치기", dur: "0:48",
    text: "제가 만들어본 합치기 인터랙션 룰 영상이에요.",
    likes: 9, likedBy: ["mina", "jay", "elise"], comments: 5,
    x: 90, y: 470, rot: -1.3,
  },
  {
    id: nid(), type: "text", section: "ideas", author: "elise", tint: "lilac",
    text: "회고에서 좋아요를 가장 많이 받은 카드로 실행 항목을 자동 생성하면 어떨까요? 끝에 수작업 분류가 줄어들죠.",
    likes: 11, likedBy: ["mina", "jay", "sora", "ravi"], comments: 6,
    x: 380, y: 500, rot: 0.8,
  },
  {
    id: nid(), type: "file", section: "ideas", author: "jay", tint: "paper",
    title: "Q3-실험-백로그.pdf", size: "2.4 MB", ext: "PDF",
    text: "지난 분기에 보류해둔 실험 아이디어들이에요.",
    likes: 2, likedBy: [], comments: 1,
    x: 690, y: 480, rot: -0.7,
  },
  {
    id: nid(), type: "text", section: "actions", author: "mina", tint: "sky",
    text: "팀 위키에 공용 QA 체크리스트를 만들기. 담당: 민아. 다음 스프린트 전까지.",
    likes: 4, likedBy: ["ravi", "tom"], comments: 0,
    x: 130, y: 690, rot: 1,
  },
  {
    id: nid(), type: "text", section: "actions", author: "ravi", tint: "sky",
    text: "디자인 핸드오프 마감을 수요일 오후 6시로 옮기기. 담당: 지훈.",
    likes: 5, likedBy: ["mina", "jay"], comments: 1,
    x: 420, y: 710, rot: -1.1,
  },
];

window.PEOPLE = PEOPLE;
window.LIVE = LIVE;
window.SECTIONS = SECTIONS;
window.TINTS = TINTS;
window.SEED_POSTS = SEED_POSTS;
window.nid = nid;
