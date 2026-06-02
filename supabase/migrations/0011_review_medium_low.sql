-- 코드 리뷰(2026-06-02) Medium/Low 수정: M2·M5·M6·L1
-- 참고: docs/code-review-2026-06-02.md

-- ============================================================
-- M2 (Medium): post_likes 전역 구독 → board_id 비정규화로 보드 단위 필터
-- ============================================================
alter table public.post_likes add column if not exists board_id uuid references public.boards(id) on delete cascade;

update public.post_likes pl
  set board_id = p.board_id
  from public.posts p
  where p.id = pl.post_id and pl.board_id is null;

alter table public.post_likes alter column board_id set not null;
create index if not exists post_likes_board_id_idx on public.post_likes(board_id);

-- 삽입 시 board_id가 실제 post의 board와 일치하도록 강제
drop policy if exists "likes self insert" on public.post_likes;
create policy "likes self insert" on public.post_likes
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.posts p
      where p.id = post_id
        and p.board_id = post_likes.board_id
        and public.is_board_member(p.board_id)
    )
  );

-- ============================================================
-- M5 (Medium): Storage 경로 uuid 캐스팅이 malformed path에서 에러나던 문제
--   → 안전 파서(잘못된 경로는 null) + is_board_member(null)=false 로 차단
-- ============================================================
create or replace function public.storage_board_id(object_name text) returns uuid
  language plpgsql immutable set search_path = public as $$
begin
  return nullif(split_part(object_name, '/', 1), '')::uuid;
exception when others then
  return null;
end; $$;
revoke execute on function public.storage_board_id(text) from public;
grant execute on function public.storage_board_id(text) to authenticated;

drop policy if exists "board-media member read" on storage.objects;
create policy "board-media member read" on storage.objects
  for select to authenticated
  using (bucket_id = 'board-media' and public.is_board_member(public.storage_board_id(name)));

drop policy if exists "board-media writer insert" on storage.objects;
create policy "board-media writer insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'board-media' and public.can_write_board(public.storage_board_id(name)));

drop policy if exists "board-media owner or admin delete" on storage.objects;
create policy "board-media owner or admin delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'board-media'
    and (owner = auth.uid() or public.is_board_admin(public.storage_board_id(name)))
  );

-- ============================================================
-- M6 (Medium): 알림 row를 수신자가 거의 전부 수정 가능 → read 컬럼만 허용 + type 제약
-- ============================================================
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in ('comment','like','invite'));

revoke update on public.notifications from authenticated;
grant update (read) on public.notifications to authenticated;

-- ============================================================
-- L1 (Low): updated_at 미갱신 → 트리거 + 게시물 활동 시 보드 updated_at 갱신
-- ============================================================
create or replace function public.set_updated_at() returns trigger
  language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

drop trigger if exists boards_set_updated_at on public.boards;
create trigger boards_set_updated_at before update on public.boards
  for each row execute function public.set_updated_at();

-- 게시물 추가/수정/삭제 시 보드 활동시각 갱신 (멤버 권한과 무관하게 동작해야 하므로 definer)
create or replace function public.bump_board_activity() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  update public.boards set updated_at = now()
  where id = coalesce(new.board_id, old.board_id);
  return null;
end; $$;

drop trigger if exists posts_bump_board on public.posts;
create trigger posts_bump_board after insert or update or delete on public.posts
  for each row execute function public.bump_board_activity();
