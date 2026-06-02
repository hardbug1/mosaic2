-- 코드 리뷰(2026-06-02) H2: presence 채널이 RLS 보호를 못 받던 문제.
--   비멤버가 boardId만 알면 'presence:{id}' 채널을 열어 접속자 열람/스푸핑 가능했음.
--   → 클라이언트에서 presence 채널을 private로 전환(hooks/usePresence.ts)하고,
--     Realtime Authorization(realtime.messages RLS)으로 보드 멤버만 허용.
-- 참고: docs/code-review-2026-06-02.md
--
-- 주의: realtime.messages RLS는 private 채널에만 적용됨.
--   posts/post_likes/comments/notifications의 postgres_changes 구독은 public이라 영향 없음.

-- 토픽 'presence:{board_id}' 에서 board_id를 안전하게 추출 (presence 토픽이 아니면 null)
create or replace function public.realtime_presence_board() returns uuid
  language plpgsql stable set search_path = public as $$
declare t text := realtime.topic();
begin
  if t is null or t not like 'presence:%' then
    return null;
  end if;
  begin
    return nullif(split_part(t, ':', 2), '')::uuid;
  exception when others then
    return null;
  end;
end; $$;

revoke execute on function public.realtime_presence_board() from public;
grant execute on function public.realtime_presence_board() to authenticated;

-- 읽기(presence sync 수신): 보드 멤버만
drop policy if exists "realtime board presence read" on realtime.messages;
create policy "realtime board presence read" on realtime.messages
  for select to authenticated
  using (public.is_board_member(public.realtime_presence_board()));

-- 쓰기(presence track): 보드 멤버만
drop policy if exists "realtime board presence write" on realtime.messages;
create policy "realtime board presence write" on realtime.messages
  for insert to authenticated
  with check (public.is_board_member(public.realtime_presence_board()));
