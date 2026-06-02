import { describe, it, expect, beforeAll } from "vitest";
import { signUpUser } from "./helpers";

// 코드 리뷰(2026-06-02) 보안 수정 회귀 테스트: C1 · H1 · H3
// 참고: docs/code-review-2026-06-02.md, migrations 0009/0010

describe("RLS 보안: C1 게시물 board_id/author_id 불변", () => {
  let userA: Awaited<ReturnType<typeof signUpUser>>;
  let userB: Awaited<ReturnType<typeof signUpUser>>;
  let boardA: string;
  let boardB: string;
  let postId: string;

  beforeAll(async () => {
    userA = await signUpUser("김작가");
    userB = await signUpUser("이외부");

    const a = await userA.client.from("boards").insert({ title: "A", owner_id: userA.id }).select().single();
    boardA = a.data!.id;
    await userA.client.from("board_members").insert({ board_id: boardA, user_id: userA.id, role: "owner" });

    // userA 가 소유한 두 번째 보드 (자신은 양쪽 모두 멤버)
    const b = await userA.client.from("boards").insert({ title: "B", owner_id: userA.id }).select().single();
    boardB = b.data!.id;
    await userA.client.from("board_members").insert({ board_id: boardB, user_id: userA.id, role: "owner" });

    const p = await userA.client.from("posts")
      .insert({ board_id: boardA, author_id: userA.id, type: "text", section: "well", text: "원본" })
      .select().single();
    postId = p.data!.id;
  }, 30000);

  it("작성자라도 게시물의 board_id를 다른 보드로 옮길 수 없다 (immutable)", async () => {
    const { error } = await userA.client.from("posts").update({ board_id: boardB }).eq("id", postId);
    expect(error).not.toBeNull();
  });

  it("작성자라도 게시물의 author_id를 바꿀 수 없다 (immutable)", async () => {
    const { error } = await userA.client.from("posts").update({ author_id: userB.id }).eq("id", postId);
    expect(error).not.toBeNull();
  });

  it("정상 필드(section/text)는 작성자가 수정할 수 있다", async () => {
    const { error } = await userA.client.from("posts").update({ section: "ideas", text: "수정" }).eq("id", postId);
    expect(error).toBeNull();
  });
});

describe("RLS 보안: H1 owner 권한 모델 보호", () => {
  let owner: Awaited<ReturnType<typeof signUpUser>>;
  let admin: Awaited<ReturnType<typeof signUpUser>>;
  let boardId: string;

  beforeAll(async () => {
    owner = await signUpUser("박소유");
    admin = await signUpUser("최관리");

    const b = await owner.client.from("boards").insert({ title: "팀", owner_id: owner.id }).select().single();
    boardId = b.data!.id;
    await owner.client.from("board_members").insert({ board_id: boardId, user_id: owner.id, role: "owner" });
    // owner 가 admin 을 추가 (members admin insert, role<>'owner')
    const { error } = await owner.client.from("board_members")
      .insert({ board_id: boardId, user_id: admin.id, role: "admin" });
    expect(error).toBeNull();
  }, 30000);

  it("admin은 새 멤버를 owner 역할로 추가할 수 없다", async () => {
    const stranger = await signUpUser("한방문");
    const { error } = await admin.client.from("board_members")
      .insert({ board_id: boardId, user_id: stranger.id, role: "owner" });
    expect(error).not.toBeNull();
  });

  it("admin은 자신을 owner로 승격할 수 없다", async () => {
    const { error } = await admin.client.from("board_members")
      .update({ role: "owner" }).eq("board_id", boardId).eq("user_id", admin.id);
    // RLS with check 위반 → 에러이거나, 영향 행 0 (정책상 보이지 않음)
    const { data } = await owner.client.from("board_members")
      .select("role").eq("board_id", boardId).eq("user_id", admin.id).single();
    expect(error !== null || data!.role !== "owner").toBe(true);
    expect(data!.role).toBe("admin");
  });

  it("admin은 보드 owner의 멤버 행을 강등할 수 없다", async () => {
    await admin.client.from("board_members")
      .update({ role: "viewer" }).eq("board_id", boardId).eq("user_id", owner.id);
    const { data } = await owner.client.from("board_members")
      .select("role").eq("board_id", boardId).eq("user_id", owner.id).single();
    expect(data!.role).toBe("owner");
  });

  it("admin은 보드 owner를 추방할 수 없다", async () => {
    await admin.client.from("board_members")
      .delete().eq("board_id", boardId).eq("user_id", owner.id);
    const { data } = await owner.client.from("board_members")
      .select("user_id").eq("board_id", boardId).eq("user_id", owner.id);
    expect(data!.length).toBe(1);
  });
});

describe("RLS 보안: H3 초대 합류는 viewer 권한", () => {
  let owner: Awaited<ReturnType<typeof signUpUser>>;
  let joiner: Awaited<ReturnType<typeof signUpUser>>;
  let boardId: string;
  let token: string;

  beforeAll(async () => {
    owner = await signUpUser("정주인");
    joiner = await signUpUser("강합류");

    const b = await owner.client.from("boards").insert({ title: "초대보드", owner_id: owner.id })
      .select("id, invite_token").single();
    boardId = b.data!.id;
    token = b.data!.invite_token;
    await owner.client.from("board_members").insert({ board_id: boardId, user_id: owner.id, role: "owner" });
  }, 30000);

  it("초대 토큰으로 합류하면 role은 viewer(읽기 전용)다", async () => {
    const { data: rpcBoard, error } = await joiner.client.rpc("join_board_via_token", { p_token: token });
    expect(error).toBeNull();
    expect(rpcBoard).toBe(boardId);

    const { data } = await joiner.client.from("board_members")
      .select("role").eq("board_id", boardId).eq("user_id", joiner.id).single();
    expect(data!.role).toBe("viewer");
  });

  it("합류한 viewer는 게시물을 작성할 수 없다", async () => {
    const { error } = await joiner.client.from("posts")
      .insert({ board_id: boardId, author_id: joiner.id, type: "text", section: "well", text: "뷰어글" });
    expect(error).not.toBeNull();
  });
});
