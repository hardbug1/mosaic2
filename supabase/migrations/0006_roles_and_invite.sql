-- Phase D: 3단계 역할(viewer/editor/admin + owner), 권한 RLS, 안전한 초대 합류 RPC.
-- 기존 self-insert 갭(I2) 해소: 임의 보드에 스스로 멤버 추가 불가 → 토큰 RPC/소유자/관리자만.

-- 1) 기존 'member' → 'editor' 로 이관 후 역할 체크 확장
update public.board_members set role = 'editor' where role = 'member';
alter table public.board_members drop constraint if exists board_members_role_check;
alter table public.board_members
  add constraint board_members_role_check check (role in ('owner','admin','editor','viewer'));

-- 2) 역할 헬퍼 (security definer — board_members RLS 재귀 방지)
create or replace function public.board_role(b uuid) returns text
  language sql security definer set search_path = public as $$
  select role from public.board_members where board_id = b and user_id = auth.uid();
$$;

create or replace function public.can_write_board(b uuid) returns boolean
  language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.board_members
    where board_id = b and user_id = auth.uid() and role in ('owner','admin','editor')
  );
$$;

create or replace function public.is_board_admin(b uuid) returns boolean
  language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.board_members
    where board_id = b and user_id = auth.uid() and role in ('owner','admin')
  );
$$;

-- 3) posts: 작성은 editor+ , 수정/삭제는 작성자 또는 admin/owner
drop policy if exists "posts member insert" on public.posts;
create policy "posts writer insert" on public.posts
  for insert with check (public.can_write_board(board_id) and author_id = auth.uid());

drop policy if exists "posts author or owner update" on public.posts;
create policy "posts author or admin update" on public.posts
  for update using (author_id = auth.uid() or public.is_board_admin(board_id));

drop policy if exists "posts author or owner delete" on public.posts;
create policy "posts author or admin delete" on public.posts
  for delete using (author_id = auth.uid() or public.is_board_admin(board_id));

-- 4) comments: 작성은 editor+ , 삭제는 작성자 또는 admin/owner
drop policy if exists "comments member insert" on public.comments;
create policy "comments writer insert" on public.comments
  for insert with check (
    author_id = auth.uid()
    and public.can_write_board(board_id)
    and exists (select 1 from public.posts p where p.id = post_id and p.board_id = comments.board_id)
  );

drop policy if exists "comments author or owner delete" on public.comments;
create policy "comments author or admin delete" on public.comments
  for delete using (author_id = auth.uid() or public.is_board_admin(board_id));

-- 5) board_members: self-insert 갭 제거 → (a) 보드 소유자가 본인을 owner로, (b) admin이 타인 추가
drop policy if exists "members self insert" on public.board_members;

drop policy if exists "members creator self insert" on public.board_members;
create policy "members creator self insert" on public.board_members
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.boards b where b.id = board_id and b.owner_id = auth.uid())
  );

drop policy if exists "members admin insert" on public.board_members;
create policy "members admin insert" on public.board_members
  for insert with check (public.is_board_admin(board_id));

-- 역할 변경: admin/owner만
drop policy if exists "members admin update" on public.board_members;
create policy "members admin update" on public.board_members
  for update using (public.is_board_admin(board_id))
  with check (public.is_board_admin(board_id));

-- 삭제(탈퇴/추방): 본인 또는 admin/owner (기존 owner-only 대체)
drop policy if exists "members owner delete" on public.board_members;
create policy "members admin or self delete" on public.board_members
  for delete using (user_id = auth.uid() or public.is_board_admin(board_id));

-- 6) 초대 토큰으로 합류 (security definer — RLS 우회해 본인을 editor로 추가)
create or replace function public.join_board_via_token(p_token text) returns uuid
  language plpgsql security definer set search_path = public as $$
declare b_id uuid;
begin
  select id into b_id from public.boards where invite_token = p_token;
  if b_id is null then
    raise exception 'invalid_invite_token';
  end if;
  insert into public.board_members (board_id, user_id, role)
  values (b_id, auth.uid(), 'editor')
  on conflict (board_id, user_id) do nothing;
  return b_id;
end;
$$;

grant execute on function public.join_board_via_token(text) to authenticated;
