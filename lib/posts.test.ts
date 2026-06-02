import { describe, it, expect } from "vitest";
import { rowToPost, filterPosts } from "./posts";
import type { PostRow, Post } from "./posts";

const baseRow: PostRow = {
  id: "post-1",
  board_id: "board-1",
  author_id: "user-1",
  type: "text",
  section: "well",
  tint: "butter",
  title: "Hello World",
  text: "Some body text",
  url: null,
  domain: null,
  media_path: null,
  file_name: null,
  file_size: null,
  file_ext: null,
  x: 100,
  y: 200,
  rot: 15,
  created_at: "2024-01-01T00:00:00Z",
  author: { name: "Alice", initials: "AL", color: "#6750A4" },
  post_likes: [],
};

describe("rowToPost", () => {
  it("maps snake_case fields to camelCase correctly", () => {
    const post = rowToPost(baseRow, "user-1");
    expect(post.id).toBe("post-1");
    expect(post.boardId).toBe("board-1");
    expect(post.authorId).toBe("user-1");
    expect(post.type).toBe("text");
    expect(post.section).toBe("well");
    expect(post.tint).toBe("butter");
    expect(post.title).toBe("Hello World");
    expect(post.text).toBe("Some body text");
    expect(post.createdAt).toBe("2024-01-01T00:00:00Z");
    expect(post.x).toBe(100);
    expect(post.y).toBe(200);
    expect(post.rot).toBe(15);
  });

  it("resolves author from row.author when present", () => {
    const post = rowToPost(baseRow, "user-1");
    expect(post.author).toEqual({ name: "Alice", initials: "AL", color: "#6750A4" });
  });

  it("counts likes from post_likes array", () => {
    const row: PostRow = {
      ...baseRow,
      post_likes: [{ user_id: "user-2" }, { user_id: "user-3" }],
    };
    const post = rowToPost(row, "user-1");
    expect(post.likes).toBe(2);
  });

  it("sets likedByMe true when currentUserId is in post_likes", () => {
    const row: PostRow = {
      ...baseRow,
      post_likes: [{ user_id: "user-1" }, { user_id: "user-2" }],
    };
    const post = rowToPost(row, "user-1");
    expect(post.likedByMe).toBe(true);
  });

  it("sets likedByMe false when currentUserId is not in post_likes", () => {
    const row: PostRow = {
      ...baseRow,
      post_likes: [{ user_id: "user-2" }],
    };
    const post = rowToPost(row, "user-1");
    expect(post.likedByMe).toBe(false);
  });

  it("uses fallback author when row.author is null", () => {
    const row: PostRow = { ...baseRow, author: null };
    const post = rowToPost(row, "user-1");
    expect(post.author.initials).toBe("?");
    expect(post.author.name).toBe("알 수 없음");
    expect(post.author.color).toBe("#79747E");
  });

  it("defaults x=40, y=40, rot=0 when null/undefined", () => {
    const row: PostRow = { ...baseRow, x: null as any, y: null as any, rot: null as any };
    const post = rowToPost(row, "user-1");
    expect(post.x).toBe(40);
    expect(post.y).toBe(40);
    expect(post.rot).toBe(0);
  });

  it("coerces numeric string fields to numbers", () => {
    const row: PostRow = { ...baseRow, x: "120" as any, y: "80" as any, rot: "5" as any };
    const post = rowToPost(row, "user-1");
    expect(post.x).toBe(120);
    expect(post.y).toBe(80);
    expect(post.rot).toBe(5);
  });

  it("sets comments to 0 always", () => {
    const post = rowToPost(baseRow, "user-1");
    expect(post.comments).toBe(0);
  });
});

describe("filterPosts", () => {
  const posts: Post[] = [
    {
      id: "1", boardId: "b1", authorId: "user-1", type: "text", section: "well",
      tint: "butter", title: "Sprint Review", text: "Things went well", url: null,
      domain: null, mediaPath: null, fileName: null, fileSize: null, fileExt: null,
      x: 40, y: 40, rot: 0, createdAt: "2024-01-01T00:00:00Z",
      author: { name: "Alice", initials: "AL", color: "#6750A4" },
      likes: 0, likedByMe: false, comments: 0,
    },
    {
      id: "2", boardId: "b1", authorId: "user-2", type: "text", section: "work",
      tint: "blush", title: "Needs Improvement", text: "Deploy process is slow", url: null,
      domain: null, mediaPath: null, fileName: null, fileSize: null, fileExt: null,
      x: 40, y: 40, rot: 0, createdAt: "2024-01-01T00:00:00Z",
      author: { name: "Bob", initials: "BO", color: "#386A20" },
      likes: 1, likedByMe: false, comments: 0,
    },
    {
      id: "3", boardId: "b1", authorId: "user-1", type: "text", section: "ideas",
      tint: "lilac", title: "Automate Deploy", text: "Use CI/CD pipeline", url: null,
      domain: null, mediaPath: null, fileName: null, fileSize: null, fileExt: null,
      x: 40, y: 40, rot: 0, createdAt: "2024-01-01T00:00:00Z",
      author: { name: "Alice", initials: "AL", color: "#6750A4" },
      likes: 2, likedByMe: true, comments: 0,
    },
  ];

  it("returns all posts when authorFilter is 'all' and query is empty", () => {
    expect(filterPosts(posts, "", "all")).toHaveLength(3);
  });

  it("filters by specific author", () => {
    const result = filterPosts(posts, "", "user-1");
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.authorId === "user-1")).toBe(true);
  });

  it("filters by query matching text (case-insensitive)", () => {
    const result = filterPosts(posts, "deploy", "all");
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(expect.arrayContaining(["2", "3"]));
  });

  it("filters by query matching title (case-insensitive)", () => {
    const result = filterPosts(posts, "SPRINT", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns all posts when query is whitespace only", () => {
    expect(filterPosts(posts, "   ", "all")).toHaveLength(3);
  });

  it("applies both author filter and query together", () => {
    const result = filterPosts(posts, "deploy", "user-1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });
});
