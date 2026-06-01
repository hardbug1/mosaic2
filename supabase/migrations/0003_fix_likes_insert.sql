-- Security fix (final review I1): post_likes INSERT must require board membership.
-- The original policy only checked user_id = auth.uid(), letting any authenticated
-- user like a post in a board they don't belong to (if they know the post_id).
-- drop-if-exists + create → safe on the live DB and on a fresh reset.

drop policy if exists "likes self insert" on public.post_likes;
create policy "likes self insert" on public.post_likes
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.posts p where p.id = post_id and public.is_board_member(p.board_id))
  );
