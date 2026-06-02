-- Phase E: 프로필 소개(bio) + 알림(notifications) + 댓글/좋아요 알림 트리거.

-- 1) 프로필 소개
alter table public.profiles add column if not exists bio text;

-- 2) 알림 테이블
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,   -- 수신자
  actor_id uuid references public.profiles(id) on delete cascade,           -- 행위자
  type text not null,                                                       -- comment | like | invite
  board_id uuid references public.boards(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;

-- 본인 알림만 조회/읽음처리/삭제. INSERT 정책 없음 → 트리거(security definer)만 생성.
drop policy if exists "notif self select" on public.notifications;
create policy "notif self select" on public.notifications for select using (user_id = auth.uid());
drop policy if exists "notif self update" on public.notifications;
create policy "notif self update" on public.notifications for update using (user_id = auth.uid());
drop policy if exists "notif self delete" on public.notifications;
create policy "notif self delete" on public.notifications for delete using (user_id = auth.uid());

-- 3) 트리거: 내 게시물에 댓글/좋아요가 달리면 작성자에게 알림 (본인 행위는 제외)
create or replace function public.notify_on_comment() returns trigger
  language plpgsql security definer set search_path = public as $$
declare post_author uuid;
begin
  select author_id into post_author from public.posts where id = new.post_id;
  if post_author is not null and post_author <> new.author_id then
    insert into public.notifications(user_id, actor_id, type, board_id, post_id)
    values (post_author, new.author_id, 'comment', new.board_id, new.post_id);
  end if;
  return new;
end; $$;
drop trigger if exists on_comment_notify on public.comments;
create trigger on_comment_notify after insert on public.comments
  for each row execute function public.notify_on_comment();

create or replace function public.notify_on_like() returns trigger
  language plpgsql security definer set search_path = public as $$
declare post_author uuid; b_id uuid;
begin
  select author_id, board_id into post_author, b_id from public.posts where id = new.post_id;
  if post_author is not null and post_author <> new.user_id then
    insert into public.notifications(user_id, actor_id, type, board_id, post_id)
    values (post_author, new.user_id, 'like', b_id, new.post_id);
  end if;
  return new;
end; $$;
drop trigger if exists on_like_notify on public.post_likes;
create trigger on_like_notify after insert on public.post_likes
  for each row execute function public.notify_on_like();

-- 4) 실시간 발행
alter publication supabase_realtime add table public.notifications;
