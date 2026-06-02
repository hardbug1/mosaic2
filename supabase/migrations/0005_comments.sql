-- 댓글. board_id 비정규화로 RLS 멤버십 검사 + 실시간 board 필터를 단순화.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  board_id uuid not null references public.boards(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;

-- 보드 멤버만 조회.
drop policy if exists "comments member select" on public.comments;
create policy "comments member select" on public.comments
  for select using (public.is_board_member(board_id));

-- 본인이 작성 + 보드 멤버 + board_id가 해당 post의 board와 일치(스푸핑 방지).
drop policy if exists "comments member insert" on public.comments;
create policy "comments member insert" on public.comments
  for insert with check (
    author_id = auth.uid()
    and public.is_board_member(board_id)
    and exists (select 1 from public.posts p where p.id = post_id and p.board_id = comments.board_id)
  );

-- 작성자 본인 또는 보드 owner만 삭제.
drop policy if exists "comments author or owner delete" on public.comments;
create policy "comments author or owner delete" on public.comments
  for delete using (
    author_id = auth.uid()
    or exists (select 1 from public.boards b where b.id = board_id and b.owner_id = auth.uid())
  );

-- 실시간 발행 대상.
alter publication supabase_realtime add table public.comments;
