// L2: Supabase 조인 결과가 단일 객체/배열/null 등 모양이 흔들리는 것을 흡수.
// PostgREST는 관계에 따라 조인을 객체로도, 배열로도 돌려줄 수 있어
// 변환 로직이 깨지기 쉬웠음(코드 리뷰 2026-06-02 L2).

/** 객체 | 배열 | null 어떤 형태든 첫 요소(또는 객체 자체)를 반환. */
export function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value.length > 0 ? (value[0] ?? null) : null;
  return value;
}
