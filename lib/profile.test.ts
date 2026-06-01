import { describe, it, expect } from "vitest";
import { deriveInitials, pickColor } from "./profile";
import { PALETTE } from "./constants";

describe("deriveInitials", () => {
  it("한글 이름의 끝 두 글자를 반환한다", () => {
    expect(deriveInitials("김민아")).toBe("민아");
  });
  it("두 글자 이름은 그대로 반환한다", () => {
    expect(deriveInitials("이수")).toBe("이수");
  });
  it("한 글자 이름은 그 글자만 반환한다", () => {
    expect(deriveInitials("김")).toBe("김");
  });
  it("공백을 제거한다", () => {
    expect(deriveInitials("  홍길동 ")).toBe("길동");
  });
  it("빈 문자열은 물음표를 반환한다", () => {
    expect(deriveInitials("")).toBe("?");
  });
});

describe("pickColor", () => {
  it("팔레트 안의 색을 반환한다", () => {
    expect(PALETTE).toContain(pickColor("any-uuid"));
  });
  it("같은 입력은 항상 같은 색을 반환한다(결정적)", () => {
    expect(pickColor("abc")).toBe(pickColor("abc"));
  });
});
