import type { Author } from "@/lib/posts";

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
  author?: { name: string; initials: string; color: string } | null;
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
    author: row.author ?? FALLBACK_AUTHOR,
  };
}
