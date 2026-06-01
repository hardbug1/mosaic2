-- ===== profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  initials text not null,
  color text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ===== boards =====
create table public.boards (
  id uuid primary key default gen_random_uuid(),
  title text not null default '제목 없는 보드',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  invite_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.boards enable row level security;

-- ===== board_members =====
create table public.board_members (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  created_at timestamptz not null default now(),
  primary key (board_id, user_id)
);
alter table public.board_members enable row level security;

-- ===== posts =====
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('text','image','link','video','file')),
  section text not null check (section in ('well','work','ideas','actions')),
  tint text not null default 'paper',
  title text,
  text text,
  url text,
  domain text,
  media_path text,
  file_name text,
  file_size text,
  file_ext text,
  x numeric not null default 40,
  y numeric not null default 40,
  rot numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.posts enable row level security;

-- ===== post_likes =====
create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);
alter table public.post_likes enable row level security;

-- ===== helper: 멤버십 검사 (RLS 재귀 방지용 security definer) =====
create or replace function public.is_board_member(b uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.board_members m
    where m.board_id = b and m.user_id = auth.uid()
  );
$$;

-- ===== 신규 가입 시 profiles 자동 생성 =====
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, initials, color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'initials', '?'),
    coalesce(new.raw_user_meta_data->>'color', '#6750A4')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== RLS 정책 =====

-- profiles: 본인 + 같은 보드 멤버 조회, 본인만 수정
create policy "profiles self select" on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1 from public.board_members me
      join public.board_members them on them.board_id = me.board_id
      where me.user_id = auth.uid() and them.user_id = profiles.id
    )
  );
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid());

-- boards: 멤버만 조회, 본인이 owner로 생성, owner만 수정/삭제
create policy "boards member select" on public.boards
  for select using (public.is_board_member(id));
create policy "boards owner insert" on public.boards
  for insert with check (owner_id = auth.uid());
create policy "boards owner update" on public.boards
  for update using (owner_id = auth.uid());
create policy "boards owner delete" on public.boards
  for delete using (owner_id = auth.uid());

-- board_members: 같은 보드 멤버 목록 조회, 본인 행 추가(가입/합류), 본인 또는 owner 삭제
create policy "members select" on public.board_members
  for select using (public.is_board_member(board_id));
create policy "members self insert" on public.board_members
  for insert with check (user_id = auth.uid());
create policy "members owner delete" on public.board_members
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.boards b where b.id = board_id and b.owner_id = auth.uid())
  );

-- posts: 보드 멤버 조회/작성, 작성자 또는 owner 수정/삭제
create policy "posts member select" on public.posts
  for select using (public.is_board_member(board_id));
create policy "posts member insert" on public.posts
  for insert with check (public.is_board_member(board_id) and author_id = auth.uid());
create policy "posts author or owner update" on public.posts
  for update using (
    author_id = auth.uid()
    or exists (select 1 from public.boards b where b.id = board_id and b.owner_id = auth.uid())
  );
create policy "posts author or owner delete" on public.posts
  for delete using (
    author_id = auth.uid()
    or exists (select 1 from public.boards b where b.id = board_id and b.owner_id = auth.uid())
  );

-- post_likes: 보드 멤버 조회, 본인 좋아요만 추가/삭제
create policy "likes member select" on public.post_likes
  for select using (
    exists (select 1 from public.posts p where p.id = post_id and public.is_board_member(p.board_id))
  );
create policy "likes self insert" on public.post_likes
  for insert with check (user_id = auth.uid());
create policy "likes self delete" on public.post_likes
  for delete using (user_id = auth.uid());

-- ===== Realtime 발행 대상 =====
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.post_likes;
alter publication supabase_realtime add table public.boards;
