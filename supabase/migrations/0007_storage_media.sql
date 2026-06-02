-- 미디어 업로드용 비공개 버킷 + Storage RLS.
-- 경로 규칙: board-media/{board_id}/{uuid}.{ext} → 첫 세그먼트(board_id)로 멤버십 검사.

insert into storage.buckets (id, name, public)
values ('board-media', 'board-media', false)
on conflict (id) do nothing;

-- 읽기: 보드 멤버
drop policy if exists "board-media member read" on storage.objects;
create policy "board-media member read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'board-media'
    and public.is_board_member((split_part(name, '/', 1))::uuid)
  );

-- 업로드: editor+ (쓰기 권한)
drop policy if exists "board-media writer insert" on storage.objects;
create policy "board-media writer insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'board-media'
    and public.can_write_board((split_part(name, '/', 1))::uuid)
  );

-- 삭제: 업로더 본인 또는 보드 admin/owner
drop policy if exists "board-media owner or admin delete" on storage.objects;
create policy "board-media owner or admin delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'board-media'
    and (owner = auth.uid() or public.is_board_admin((split_part(name, '/', 1))::uuid))
  );
