-- Fix: boards SELECT 정책이 owner를 포함하도록 수정.
-- 기존 정책은 is_board_member(id)만 허용 → 보드 생성 직후(멤버십 행 추가 전)
-- owner가 자기 보드를 읽지 못해 insert().select() 및 보드 진입이 RLS로 막혔다.
-- drop-if-exists + create 라 이미 적용된 클라우드 DB와 fresh reset 모두에서 안전.

drop policy if exists "boards member select" on public.boards;
create policy "boards member select" on public.boards
  for select using (owner_id = auth.uid() or public.is_board_member(id));
