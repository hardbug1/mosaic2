# 모자이크 Phase B — 보드 뷰 · 게시물 · 실시간 Implementation Plan

> 실행: subagent-driven-development. dev 서버 가동 중 → 검증은 `npx tsc --noEmit` (next build 금지, [[dev-server-vs-build]]). 마이그레이션은 `npm run db:push`. Next 16 패턴은 `next-best-practices` 스킬 참고.

**Goal:** `/boards/[id]`에서 보드 멤버가 게시물(메모/링크/영상)을 작성·정렬하고, 컬럼/그리드/캔버스 3뷰로 보며, 다른 멤버의 추가·이동·좋아요가 실시간으로 반영되고, 접속자 표시가 실제로 동작한다.

**Architecture:** 서버 컴포넌트(`page.tsx`)가 보드+초기 게시물+멤버를 로드 → 클라이언트 `BoardClient`가 상태를 들고 Supabase Realtime(postgres_changes: posts/post_likes, presence)을 구독. 디자인의 `board.jsx`/`views.jsx`/`composer.jsx`/`empty-board.jsx`/`App.jsx`를 ES 모듈로 포팅(외형 유지), 시뮬레이션 로직(가짜 커서/시드)은 제거하고 실데이터에 연결.

**범위:** 콘텐츠 타입 text·link·video(URL)만. 이미지·파일 업로드(Storage)는 별도 미디어 단계로 연기. 댓글은 수=0 표시(Phase C). 라이브 커서 제외(접속 스택만).

## 파일 구조
```
lib/posts.ts            -- Post 타입, DB row ↔ Post 매핑, 정렬 헬퍼
hooks/usePosts.ts       -- 초기 posts + Realtime(posts) 구독, CRUD 액션(낙관적)
hooks/useLikes.ts       -- post_likes 토글 + Realtime 좋아요 집계
hooks/usePresence.ts    -- 보드 presence 채널(접속자 목록)
components/board/PostCard.tsx        -- board.jsx 포팅(미디어 블록 포함, like 버튼)
components/board/views/ColumnsView.tsx, GridView.tsx, CanvasView.tsx
components/board/BoardTopBar.tsx     -- 제목·검색·뷰전환·필터·presence·공유(placeholder)
components/board/Composer.tsx        -- 작성 다이얼로그(text/link/video)
components/board/EmptyBoard.tsx      -- 빈 보드 온보딩
app/boards/[id]/page.tsx             -- 서버: 보드+게시물+멤버 로드 + 멤버십 가드
app/boards/[id]/BoardClient.tsx      -- 클라 셸: 상태·realtime·뷰·composer·FAB·presence
app/boards/[id]/actions.ts           -- createPost / updatePost(이동) / deletePost 서버액션(또는 클라 supabase)
```

## Task B1 — posts 데이터 레이어 + 타입 (TDD 일부)
**Files:** `lib/posts.ts`, `lib/posts.test.ts`
- `Post` 타입(컬럼과 1:1: id, board_id, author_id, type, section, tint, title, text, url, domain, x, y, rot, created_at + 조인된 author {initials,color,name}, likes 수, likedByMe, comments=0).
- `rowToPost(row, currentUserId)` 매핑, `filterPosts(posts, query, authorFilter)` (검색/내 게시물), 순수 함수 → 단위 테스트.
- 커밋.

## Task B2 — usePosts / useLikes / usePresence 훅
**Files:** `hooks/usePosts.ts`, `hooks/useLikes.ts`, `hooks/usePresence.ts`
- `usePosts(boardId, initialPosts, userId)`: state=posts. `supabase.channel('posts:'+boardId).on('postgres_changes',{event:'*',schema:'public',table:'posts',filter:'board_id=eq.'+boardId}, handler)` → INSERT 추가/UPDATE 갱신/DELETE 제거. 반환: posts, createPost, movePost(x,y,section,순서), removePost (각각 낙관적 + supabase write). cleanup에서 removeChannel.
- `useLikes`: post_likes 구독(필터는 board 단위가 어려우니 posts의 like 수는 posts.likes를 쓰지 말고 별도 집계 — 간단히: 각 PostCard가 자기 likes 배열을 들고, toggle 시 insert/delete + 낙관적; Realtime은 post_likes 전체 구독 후 board 내 post만 반영). MVP: toggleLike(postId) + 초기 likedByMe/Count는 page에서 로드.
- `usePresence(boardId, me)`: `supabase.channel('presence:'+boardId,{config:{presence:{key:me.id}}})`, track({id,name,initials,color}) on subscribe; presenceState→온라인 멤버 배열 반환.
- Realtime 구독은 useEffect에서 생성/정리. `next-best-practices` 스킬로 RSC/클라 경계 확인.
- 커밋.

## Task B3 — PostCard 포팅 (board.jsx)
- `design/components/board.jsx`의 PostCard·ImageBlock·VideoBlock·LinkPreview·FileChip·LikeButton 포팅. `window.*`→export, 타입 주석, `window.TINTS`→`@/lib/constants` TINTS, `window.PEOPLE[author]`→prop으로 받은 author 객체. Cursor 컴포넌트는 제외. video는 URL 임베드(썸네일+재생) 또는 디자인의 placeholder 유지. like 버튼 onToggle 연결.
- `next-best-practices` 참고, tsc 통과. 커밋.

## Task B4 — 3뷰 + BoardTopBar 포팅 (views.jsx)
- ColumnsView/GridView/CanvasView 포팅, 드래그&드롭: columns/grid 재정렬+섹션 변경, canvas 위치이동 → 드래그 종료 시 movePost로 DB 저장(x,y,section). TopBar: 제목(편집은 추후/placeholder), 검색, 뷰전환(컬럼/그리드/캔버스), 필터(전체/내 게시물), presence 스택+“N명 접속 중”, 공유 버튼(placeholder). EmptyState 포함.
- 커밋.

## Task B5 — Composer 포팅 (text/link/video)
- composer.jsx 포팅. 타입 선택에서 text/link/video만 활성(image/file은 “곧 지원” 비활성 또는 숨김). 제출 → createPost(보드, 작성자, type, section, tint, text, title, url/domain). 커밋.

## Task B6 — EmptyBoard 온보딩
- empty-board.jsx 포팅. 보드에 게시물 0개일 때 표시, “첫 게시물 추가”→composer 오픈. 커밋.

## Task B7 — 보드 페이지 조립 + 실시간 연결
**Files:** `app/boards/[id]/page.tsx`(개편), `app/boards/[id]/BoardClient.tsx`, `app/boards/[id]/actions.ts`
- `page.tsx`(서버): 멤버십 가드(기존), 보드 메타, 초기 posts(작성자 조인 + 좋아요 수/likedByMe), 멤버 목록, 현재 유저 로드 → BoardClient에 전달.
- `BoardClient`(클라): usePosts/useLikes/usePresence 연결, BoardTopBar+선택된 뷰+Composer+FAB+EmptyBoard 렌더. 레이아웃 전환(컬럼/그리드/캔버스) 상태, 검색/필터 상태.
- 초기 좋아요 로드: posts select에 `post_likes(user_id)` 조인 → count + likedByMe 계산.
- 2개 브라우저(또는 2 세션)에서 한쪽 작성/좋아요/이동 → 다른쪽 즉시 반영 확인(런타임 검증은 dev + 2 세션; 자동검증은 쿼리/구독 레벨).
- 커밋 + push.

## 완료 기준
- [ ] tsc 통과, dev 컴파일 무에러
- [ ] 보드에 메모/링크/영상 작성 → DB 저장 + 화면 반영
- [ ] 3뷰 전환, 드래그 이동이 DB에 저장(새로고침 유지)
- [ ] 좋아요 토글 동작, 접속 스택이 실제 presence로 표시
- [ ] 빈 보드 온보딩 표시
- [ ] 비멤버 접근 404 유지(RLS)
```
