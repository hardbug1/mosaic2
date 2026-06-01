-- Add explicit grants for authenticated role (required since auto_expose_new_tables=false)
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.boards to authenticated;
grant select, insert, update, delete on public.board_members to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.post_likes to authenticated;
