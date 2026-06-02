import type { Author } from "@/lib/posts";
import { firstOf } from "@/lib/normalize";

export type Comment = {
  id: string;
  postId: string;
  boardId: string;
  authorId: string;
  text: string;
  createdAt: string;
  author: Author;
};

export type CommentRow = {
  id: string;
  post_id: string;
  board_id: string;
  author_id: string;
  text: string;
  created_at: string;
  // 조인은 객체 또는 배열로 올 수 있음(firstOf로 정규화)
  author?: Author | Author[] | null;
};

const FALLBACK_AUTHOR: Author = {
  name: "알 수 없음",
  initials: "?",
  color: "#79747E",
};

export function rowToComment(row: CommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    boardId: row.board_id,
    authorId: row.author_id,
    text: row.text,
    createdAt: row.created_at,
    author: firstOf(row.author) ?? FALLBACK_AUTHOR,
  };
}
