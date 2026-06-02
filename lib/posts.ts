import type { PostType, SectionId } from "@/lib/constants";

export type Author = { name: string; initials: string; color: string };

export type Post = {
  id: string;
  boardId: string;
  authorId: string;
  type: PostType;
  section: SectionId;
  tint: string;
  title: string | null;
  text: string | null;
  url: string | null;
  domain: string | null;
  mediaPath: string | null;
  fileName: string | null;
  fileSize: string | null;
  fileExt: string | null;
  x: number;
  y: number;
  rot: number;
  createdAt: string;
  author: Author;
  likes: number;
  likedByMe: boolean;
  comments: number;
};

export type PostRow = {
  id: string;
  board_id: string;
  author_id: string;
  type: PostType;
  section: SectionId;
  tint: string;
  title: string | null;
  text: string | null;
  url: string | null;
  domain: string | null;
  media_path: string | null;
  file_name: string | null;
  file_size: string | null;
  file_ext: string | null;
  x: number | null;
  y: number | null;
  rot: number | null;
  created_at: string;
  author: Author | null;
  post_likes: { user_id: string }[];
  /** PostgREST aggregate shape from `comments(count)` */
  comments?: { count: number }[];
};

const FALLBACK_AUTHOR: Author = {
  name: "알 수 없음",
  initials: "?",
  color: "#79747E",
};

export function rowToPost(row: PostRow, currentUserId: string): Post {
  const xVal = row.x != null ? Number(row.x) : 40;
  const yVal = row.y != null ? Number(row.y) : 40;
  const rotVal = row.rot != null ? Number(row.rot) : 0;

  const likes = row.post_likes?.length ?? 0;
  const likedByMe = (row.post_likes ?? []).some(
    (l) => l.user_id === currentUserId
  );

  return {
    id: row.id,
    boardId: row.board_id,
    authorId: row.author_id,
    type: row.type,
    section: row.section,
    tint: row.tint,
    title: row.title,
    text: row.text,
    url: row.url,
    domain: row.domain,
    mediaPath: row.media_path,
    fileName: row.file_name,
    fileSize: row.file_size,
    fileExt: row.file_ext,
    x: xVal,
    y: yVal,
    rot: rotVal,
    createdAt: row.created_at,
    author: row.author ?? FALLBACK_AUTHOR,
    likes,
    likedByMe,
    comments: row.comments?.[0]?.count ?? 0,
  };
}

export function filterPosts(
  posts: Post[],
  query: string,
  authorFilter: "all" | string
): Post[] {
  const q = query.trim().toLowerCase();

  return posts.filter((post) => {
    if (authorFilter !== "all" && post.authorId !== authorFilter) {
      return false;
    }
    if (q) {
      const haystack = `${post.text ?? ""} ${post.title ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }
    return true;
  });
}
