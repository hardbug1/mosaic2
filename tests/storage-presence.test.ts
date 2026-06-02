import { describe, it, expect, beforeAll } from "vitest";
import { signUpUser } from "./helpers";

// 코드 리뷰 후속 검증: H2(presence 권한) · M5/storage RLS 통합 테스트
// 실제 Storage 업로드/서명URL, 실제 Realtime presence 웹소켓을 구동해 확인.

describe("Storage RLS: board-media 버킷 (M5)", () => {
  let member: Awaited<ReturnType<typeof signUpUser>>;
  let outsider: Awaited<ReturnType<typeof signUpUser>>;
  let boardId: string;
  let path: string;

  beforeAll(async () => {
    member = await signUpUser("업로더");
    outsider = await signUpUser("외부인");

    const b = await member.client.from("boards").insert({ title: "S", owner_id: member.id }).select().single();
    boardId = b.data!.id;
    await member.client.from("board_members").insert({ board_id: boardId, user_id: member.id, role: "owner" });
    path = `${boardId}/${crypto.randomUUID()}.txt`;
  }, 30000);

  it("멤버는 자기 보드 경로에 업로드할 수 있다", async () => {
    const { error } = await member.client.storage
      .from("board-media")
      .upload(path, new Blob(["hello"]), { contentType: "text/plain" });
    expect(error).toBeNull();
  });

  it("멤버는 자기 보드 파일의 서명 URL을 만들 수 있다", async () => {
    const { data, error } = await member.client.storage.from("board-media").createSignedUrl(path, 60);
    expect(error).toBeNull();
    expect(data?.signedUrl).toBeTruthy();
  });

  it("비멤버는 그 파일의 서명 URL을 만들 수 없다", async () => {
    const { data, error } = await outsider.client.storage.from("board-media").createSignedUrl(path, 60);
    expect(error !== null || !data?.signedUrl).toBe(true);
  });

  it("비멤버는 그 보드 경로에 업로드할 수 없다", async () => {
    const p2 = `${boardId}/${crypto.randomUUID()}.txt`;
    const { error } = await outsider.client.storage
      .from("board-media")
      .upload(p2, new Blob(["x"]), { contentType: "text/plain" });
    expect(error).not.toBeNull();
  });

  it("malformed 경로(첫 세그먼트가 uuid 아님)는 캐스팅 에러 없이 정책으로 거부된다", async () => {
    const { error } = await member.client.storage
      .from("board-media")
      .upload(`not-a-uuid/x.txt`, new Blob(["x"]), { contentType: "text/plain" });
    expect(error).not.toBeNull();
  });
});

describe("Realtime presence 권한 (H2)", () => {
  let member: Awaited<ReturnType<typeof signUpUser>>;
  let outsider: Awaited<ReturnType<typeof signUpUser>>;
  let boardId: string;

  async function authRealtime(u: Awaited<ReturnType<typeof signUpUser>>) {
    const { data } = await u.client.auth.getSession();
    const token = data.session?.access_token;
    if (token) u.client.realtime.setAuth(token);
  }

  function subscribeStatus(
    u: Awaited<ReturnType<typeof signUpUser>>,
    key: string,
  ): Promise<string> {
    const ch = u.client.channel(`presence:${boardId}`, {
      config: { private: true, presence: { key } },
    });
    return new Promise<string>((resolve) => {
      const timer = setTimeout(() => {
        u.client.removeChannel(ch);
        resolve("TIMEOUT");
      }, 10000);
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timer);
          u.client.removeChannel(ch);
          resolve(status);
        }
      });
    });
  }

  beforeAll(async () => {
    member = await signUpUser("접속자");
    outsider = await signUpUser("침입자");

    const b = await member.client.from("boards").insert({ title: "P", owner_id: member.id }).select().single();
    boardId = b.data!.id;
    await member.client.from("board_members").insert({ board_id: boardId, user_id: member.id, role: "owner" });

    await authRealtime(member);
    await authRealtime(outsider);
  }, 30000);

  it("멤버는 presence 채널을 구독할 수 있다 (SUBSCRIBED)", async () => {
    const status = await subscribeStatus(member, member.id);
    expect(status).toBe("SUBSCRIBED");
  }, 20000);

  it("비멤버는 presence 채널 구독이 거부된다 (CHANNEL_ERROR)", async () => {
    const status = await subscribeStatus(outsider, outsider.id);
    // 단순 네트워크 타임아웃이 아니라 RLS에 의한 실제 거부여야 함
    expect(status).toBe("CHANNEL_ERROR");
  }, 20000);
});
