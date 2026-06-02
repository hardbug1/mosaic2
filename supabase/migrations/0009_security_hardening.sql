-- 코드 리뷰(2026-06-02) 보안 수정: C1(교차 보드 주입) · H1(owner 모델) · H3(초대 권한) · M1(definer 실행권한)
-- 참고: docs/code-review-2026-06-02.md

-- ============================================================
-- C1 (Critical): 게시물 교차 보드 주입 방지
--   posts UPDATE가 author_id만 검사하고 결과 행을 검증하지 않아
--   작성자가 board_id를 임의 보드로 바꿔 주입할 수 있었음.
--   → board_id·author_id 불변 트리거 + with check(쓰기권한) 이중 방어.
-- ============================================================
create or replace function public.posts_guard_immutable() returns trigger
  language plpgsql set search_path = public as $$
begin
  if new.board_id is distinct from old.board_id then
    raise exception 'posts.board_id is immutable';
  end if;
  if new.author_id is distinct from old.author_id then
    raise exception 'posts.author_id is immutable';
  end if;
  return new;
end; $$;

drop trigger if exists posts_guard_immutable on public.posts;
create trigger posts_guard_immutable before update on public.posts
  for each row execute function public.posts_guard_immutable();

drop policy if exists "posts author or admin update" on public.posts;
create policy "posts author or admin update" on public.posts
  for update
  using (author_id = auth.uid() or public.is_board_admin(board_id))
  with check (
    (author_id = auth.uid() or public.is_board_admin(board_id))
    and public.can_write_board(board_id)
  );

-- ============================================================
-- H1 (High): admin이 owner 권한 모델을 깨뜨릴 수 있음
--   - admin이 role='owner'를 삽입/승격 불가
--   - 실제 보드 owner(boards.owner_id) 멤버 행은 강등/추방 불가
-- ============================================================

-- admin 추가: owner 역할 부여 금지
drop policy if exists "members admin insert" on public.board_members;
create policy "members admin insert" on public.board_members
  for insert with check (
    public.is_board_admin(board_id)
    and role <> 'owner'
  );

-- 역할 변경: admin/owner만, owner 승격 금지, 보드 owner 행은 변경 불가
drop policy if exists "members admin update" on public.board_members;
create policy "members admin update" on public.board_members
  for update
  using (
    public.is_board_admin(board_id)
    and user_id <> (select b.owner_id from public.boards b where b.id = board_id)
  )
  with check (
    public.is_board_admin(board_id)
    and role <> 'owner'
    and user_id <> (select b.owner_id from public.boards b where b.id = board_id)
  );

-- 삭제(탈퇴/추방): 본인 또는 admin/owner, 단 보드 owner 행은 삭제 불가
drop policy if exists "members admin or self delete" on public.board_members;
create policy "members admin or self delete" on public.board_members
  for delete using (
    (user_id = auth.uid() or public.is_board_admin(board_id))
    and user_id <> (select b.owner_id from public.boards b where b.id = board_id)
  );

-- ============================================================
-- H3 (High): 초대 링크 권한 불일치 (UI '보기' ↔ 실제 'editor')
--   링크 유출 = 쓰기 권한이었음. 기본 viewer 합류로 정정.
--   + 미인증 호출 차단(M1과 동일 취지).
-- ============================================================
create or replace function public.join_board_via_token(p_token text) returns uuid
  language plpgsql security definer set search_path = public as $$
declare b_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  select id into b_id from public.boards where invite_token = p_token;
  if b_id is null then
    raise exception 'invalid_invite_token';
  end if;
  insert into public.board_members (board_id, user_id, role)
  values (b_id, auth.uid(), 'viewer')
  on conflict (board_id, user_id) do nothing;
  return b_id;
end;
$$;

-- ============================================================
-- M1 (Medium): SECURITY DEFINER 함수 실행권한 축소
--   Postgres 함수 기본 PUBLIC EXECUTE → anon 배제 위해 revoke 후 authenticated만 grant.
-- ============================================================
revoke execute on function public.is_board_member(uuid) from public;
revoke execute on function public.board_role(uuid) from public;
revoke execute on function public.can_write_board(uuid) from public;
revoke execute on function public.is_board_admin(uuid) from public;
revoke execute on function public.join_board_via_token(text) from public;

grant execute on function public.is_board_member(uuid) to authenticated;
grant execute on function public.board_role(uuid) to authenticated;
grant execute on function public.can_write_board(uuid) to authenticated;
grant execute on function public.is_board_admin(uuid) to authenticated;
grant execute on function public.join_board_via_token(text) to authenticated;
