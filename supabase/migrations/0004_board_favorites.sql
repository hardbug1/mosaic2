-- 즐겨찾기(별표) 보드. 사용자별 즐겨찾기 표시.
create table if not exists public.board_favorites (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (board_id, user_id)
);
alter table public.board_favorites enable row level security;

-- 본인 즐겨찾기만 조회/추가/삭제. 추가 시 해당 보드 멤버여야 함.
drop policy if exists "favorites self select" on public.board_favorites;
create policy "favorites self select" on public.board_favorites
  for select using (user_id = auth.uid());

drop policy if exists "favorites self insert" on public.board_favorites;
create policy "favorites self insert" on public.board_favorites
  for insert with check (user_id = auth.uid() and public.is_board_member(board_id));

drop policy if exists "favorites self delete" on public.board_favorites;
create policy "favorites self delete" on public.board_favorites
  for delete using (user_id = auth.uid());
