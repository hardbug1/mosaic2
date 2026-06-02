# 모자이크 전체 코드 리뷰 (Codex, 2026-06-02)

> Codex(`gpt-5.5`)로 저장소 전체를 read-only 분석. 로컬 `next@16.2.6` 문서 + best-practices 기준 함께 확인. 토큰 사용 156,585. **분석/보고만, 수정 없음.**

분석 관점: ① 보안/RLS ② 실시간 훅 버그/경쟁상태 ③ Next.js 16 규약 ④ 데이터 정합성 ⑤ 우선순위 정리.

## 수정 현황 (2026-06-02)

| 항목 | 상태 | 조치 |
|---|---|---|
| **C1** 게시물 교차 보드 주입 | ✅ 수정 | `0009` board_id/author_id 불변 트리거 + with check. 회귀 테스트 `tests/rls-security.test.ts` |
| **H1** admin이 owner 모델 파괴 | ✅ 수정 | `0009` owner 역할 삽입/승격 차단, owner 행 강등·추방 차단. 회귀 테스트 |
| **H2** presence RLS 미보호 | ✅ 수정 | `0010` presence private 채널 전환 + `realtime.messages` RLS. ⚠️ 2-브라우저 스모크 권장 |
| **H3** 초대 링크 권한 불일치 | ✅ 수정 | `0009` 초대 합류 기본 `viewer`(RPC). 회귀 테스트 |
| **M1** definer 실행권한 과다 | ✅ 수정 | `0009` `revoke ... from public` + authenticated만 grant + 미인증 차단 |
| **M2** likes 전역 구독 | ✅ 수정 | `0011` `post_likes.board_id` 비정규화 + RLS 일관성 + 클라 보드 필터 구독. 회귀 테스트 |
| **M3** fetch/realtime race | ✅ 수정 | `useComments`·`useNotifications` 초기 fetch를 id 기준 병합(덮어쓰기 제거) |
| **M4** 낙관적 롤백 stale | ✅ 수정 | `usePosts` movePost/toggleLike 실패 시 stale 복원 대신 서버 권위값 재조정 |
| **M5** storage 경로/orphan | ✅ 수정 | `0011` `storage_board_id()` 안전 파서, Composer 저장 실패 시 보상 삭제 + 25MB 제한 |
| **M6** 알림 컬럼 무제한 수정 | ✅ 수정 | `0011` `grant update(read)`만 + `type` check constraint. 회귀 테스트 |
| **M7** OAuth next 유실 | ✅ 수정 | `LoginScreen` redirect 검증값을 OAuth `next`에 전달 (+ `//` open-redirect 방지) |
| **L1** updated_at 미갱신 | ✅ 수정 | `0011` set_updated_at 트리거 + 게시물 활동 시 board.updated_at bump |
| **L2** join shape 취약 | ✅ 수정 | `lib/normalize.ts` `firstOf()`로 posts/comments/notifications 정규화 |
| **L3** RLS 테스트 협소 | ◐ 보강 | C1·H1·H3·M2·M6 회귀 13개 추가(`tests/rls-security.test.ts`). storage/presence는 미커버 |

> 검증: `npm run test` 45개 통과(보안 회귀 13개 포함), `npx tsc --noEmit` clean, `npm run db:push`로 0009·0010·0011 적용 완료.
> 미커버: H2 2-브라우저 presence 스모크, storage 경로 RLS 통합 테스트.

---

## 🔴 Critical

### C1. 게시물 교차 보드 주입 (cross-board injection)
- **위치**: `supabase/migrations/0006_roles_and_invite.sql:38` — `posts author or admin update`
- **문제**: 정책이 `author_id = auth.uid()`만 검사하고 **UPDATE 후 행(`with check`)을 검증하지 않음**. 작성자가 자기 게시물의 `board_id`를 임의의 다른 보드 UUID로 바꿔, 가입하지 않은 보드에 게시물을 주입할 수 있음.
- **권장**: `with check (public.can_write_board(board_id) and author_id = auth.uid())` 명시 + 트리거/RPC로 `board_id`·`author_id` 변경 자체를 금지.

---

## 🟠 High

### H1. admin이 owner 권한 모델을 깨뜨릴 수 있음
- **위치**: `0006_roles_and_invite.sql:69, 74, 80` (members insert/update/delete 정책)
- **문제**: `role='owner'` 삽입/승격, 실제 owner 멤버십 강등·삭제를 막지 않음. admin이 owner를 끌어내리거나 자신을 owner로 승격 가능.
- **권장**: 멤버 관리는 SECURITY DEFINER RPC로 일원화. owner 행 + `boards.owner_id`는 owner 본인만 변경 가능하게 강제.

### H2. Presence가 RLS 보호를 받지 못함
- **위치**: `hooks/usePresence.ts:22` (채널 open), `:54` (track payload)
- **문제**: `presence:${boardId}` 채널을 클라이언트가 직접 열고 임의 payload를 track. 비멤버가 boardId만 알면 접속자 목록 열람·스푸핑 가능.
- **권장**: Supabase Realtime Authorization 정책(topic별) 적용, 또는 RLS가 걸리는 presence 테이블 + heartbeat 방식으로 전환.

### H3. 초대 링크 권한 불일치 (UI=보기 / 실제=편집)
- **위치**: `components/board/ShareDialog.tsx:490` (UI "보기" 표시) vs `0006_roles_and_invite.sql:93` (RPC가 `editor`로 합류)
- **문제**: 링크 유출 = 즉시 쓰기 권한. 표시와 실제 권한이 어긋남.
- **권장**: 기본 `viewer` 합류, 역할을 포함한 초대 토큰, 토큰 만료/재발급 도입.

---

## 🟡 Medium

### M1. SECURITY DEFINER 함수 실행권한 과다
- **위치**: `0001_init.sql:65`, `0006_roles_and_invite.sql:84, 99`
- **문제**: Postgres 함수는 기본 `PUBLIC EXECUTE`. `grant authenticated`만으로는 anon이 배제되지 않음.
- **권장**: `revoke execute ... from public, anon` 후 필요한 role에만 grant + 함수 내부에서 `auth.uid() is not null` 검사.

### M2. 좋아요 realtime 전역 구독
- **위치**: `hooks/usePosts.ts:162`
- **문제**: `post_likes`를 보드 필터 없이 구독 → 가입한 모든 보드의 like 이벤트를 받아 클라이언트 state로 거름(불필요한 트래픽·정보 노출).
- **권장**: `post_likes`에 `board_id` 비정규화 + RLS/Realtime 필터를 보드 단위로.

### M3. 초기 fetch와 realtime 구독 사이 race
- **위치**: `hooks/useComments.ts:37, 55`, `hooks/useNotifications.ts:57, 79`
- **문제**: fetch 결과가 늦게 도착하면 realtime으로 먼저 들어온 항목을 덮어쓸 수 있음.
- **권장**: 구독 준비 후 cursor 기준 fetch, 또는 fetch 결과를 id 기준 merge.

### M4. 낙관적 업데이트 롤백이 최신 상태를 덮어씀
- **위치**: `hooks/usePosts.ts:274, 380`, `components/board/ShareDialog.tsx:164`, `hooks/useNotifications.ts:134`
- **문제**: 실패 시 전체 snapshot 복원/무롤백 → 그 사이 들어온 동시 realtime 변경을 잃음.
- **권장**: pending 상태 표시, inverse patch, 또는 서버 재조회 기반 reconcile.

### M5. Storage 경로 캐스팅 에러 + orphan 업로드
- **위치**: `0007_storage_media.sql:14` (`::uuid` 캐스팅이 malformed path에서 에러), `components/board/Composer.tsx:154`(업로드)→`:187`(게시물 저장)
- **문제**: 업로드 성공 후 게시물 저장이 실패하면 orphan object가 남음. 잘못된 경로는 정책 평가 중 에러.
- **권장**: 안전한 UUID 파서/정규식, 파일 크기·MIME 제한, 저장 실패 시 storage delete 보상 처리.

### M6. 알림 row를 수신자가 거의 전부 수정 가능
- **위치**: `0008_profile_bio_notifications.sql:23`
- **문제**: `read` 외에 `type/actor_id/board_id/post_id`까지 수정 가능.
- **권장**: `type` check constraint + `mark_read` RPC 또는 컬럼 단위 권한으로 제한.

### M7. OAuth가 초대 복귀 경로를 유실
- **위치**: `app/(auth)/LoginScreen.tsx:240`
- **문제**: OAuth redirect가 항상 `next=/boards`. 초대 링크에서 로그인 시 원래 가려던 보드로 못 돌아감.
- **권장**: `redirect` 값을 검증해 OAuth `next`에도 전달.

---

## ⚪ Low

### L1. `updated_at` 미갱신
- **위치**: `0001_init.sql:17, 51`; 보드 목록 표시는 `app/boards/page.tsx:79`가 의존.
- **권장**: `updated_at` trigger + 보드 activity 갱신 정책.

### L2. 변환 로직이 Supabase join shape 변화에 취약
- **위치**: `lib/posts.ts:90`, `lib/comments.ts:37`
- **권장**: object/array/null normalize helper + 런타임 검증 공통화.

### L3. RLS 테스트 범위 협소
- **위치**: `tests/rls.test.ts:20` (기본 멤버 경계만 검증)
- **권장**: post `board_id` spoof, admin owner 조작, invite role, storage path, notification update, presence spoof 케이스 추가.

---

## ✅ Next.js 16 규약
큰 위반 없음. `proxy.ts`, async `params`, async `cookies()` 모두 올바르게 사용됨.
개선점: Proxy가 전 경로에서 세션 확인을 넓게 수행하므로, 필요하면 matcher를 더 좁히는 정도.

---

## 권장 처리 순서
1. **C1** (board_id 주입) — 마이그레이션 0009 `with check` + 변경 금지 트리거
2. **H1~H3** (owner 모델 / presence / 초대 권한)
3. **M1~M7**
4. **L1~L3** (테스트 확장 포함)
