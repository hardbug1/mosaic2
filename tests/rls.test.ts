import { describe, it, expect, beforeAll } from "vitest";
import { signUpUser } from "./helpers";

describe("RLS: 보드 멤버 경계", () => {
  let owner: Awaited<ReturnType<typeof signUpUser>>;
  let outsider: Awaited<ReturnType<typeof signUpUser>>;
  let boardId: string;

  beforeAll(async () => {
    owner = await signUpUser("김민아");
    outsider = await signUpUser("정태경");

    const { data: board, error } = await owner.client
      .from("boards").insert({ title: "회고", owner_id: owner.id }).select().single();
    expect(error).toBeNull();
    boardId = board!.id;
    await owner.client.from("board_members").insert({ board_id: boardId, user_id: owner.id, role: "owner" });
  }, 30000);

  it("owner는 자기 보드를 조회할 수 있다", async () => {
    const { data } = await owner.client.from("boards").select("*").eq("id", boardId);
    expect(data?.length).toBe(1);
  });

  it("비멤버는 보드를 조회할 수 없다", async () => {
    const { data } = await outsider.client.from("boards").select("*").eq("id", boardId);
    expect(data?.length).toBe(0);
  });

  it("비멤버는 그 보드에 게시물을 작성할 수 없다", async () => {
    const { error } = await outsider.client.from("posts").insert({
      board_id: boardId, author_id: outsider.id, type: "text", section: "well", text: "침입",
    });
    expect(error).not.toBeNull();
  });

  it("멤버는 게시물을 작성하고 조회할 수 있다", async () => {
    const { error: insErr } = await owner.client.from("posts").insert({
      board_id: boardId, author_id: owner.id, type: "text", section: "well", text: "안녕",
    });
    expect(insErr).toBeNull();
    const { data } = await owner.client.from("posts").select("*").eq("board_id", boardId);
    expect(data!.length).toBeGreaterThan(0);
  });
});
