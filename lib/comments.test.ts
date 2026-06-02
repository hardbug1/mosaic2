import { describe, it, expect } from "vitest";
import { rowToComment } from "./comments";
import type { CommentRow } from "./comments";

const baseRow: CommentRow = {
  id: "comment-1",
  post_id: "post-1",
  board_id: "board-1",
  author_id: "user-1",
  text: "Great idea!",
  created_at: "2024-01-01T00:00:00Z",
  author: { name: "Alice", initials: "AL", color: "#6750A4" },
};

describe("rowToComment", () => {
  it("maps snake_case fields to camelCase correctly", () => {
    const comment = rowToComment(baseRow);
    expect(comment.id).toBe("comment-1");
    expect(comment.postId).toBe("post-1");
    expect(comment.boardId).toBe("board-1");
    expect(comment.authorId).toBe("user-1");
    expect(comment.text).toBe("Great idea!");
    expect(comment.createdAt).toBe("2024-01-01T00:00:00Z");
  });

  it("includes author from row when present", () => {
    const comment = rowToComment(baseRow);
    expect(comment.author).toEqual({
      name: "Alice",
      initials: "AL",
      color: "#6750A4",
    });
  });

  it("uses fallback author when row.author is null", () => {
    const row: CommentRow = { ...baseRow, author: null };
    const comment = rowToComment(row);
    expect(comment.author.name).toBe("알 수 없음");
    expect(comment.author.initials).toBe("?");
    expect(comment.author.color).toBe("#79747E");
  });

  it("uses fallback author when row.author is undefined", () => {
    const row: CommentRow = { ...baseRow, author: undefined };
    const comment = rowToComment(row);
    expect(comment.author.name).toBe("알 수 없음");
  });
});
