# 모자이크 (Mosaic)

협업자들이 **텍스트·이미지·링크·영상·파일** 등 모든 유형의 콘텐츠를 하나의 가상 게시판에
함께 올리고 정리하는 **실시간 협업 보드** (Padlet류). 팀원들이 각자 편한 시간에 자료를 올리고,
다른 사람의 기여를 실시간으로 확인합니다.

> 저장소: [hardbug1/mosaic2](https://github.com/hardbug1/mosaic2)

---

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | **Next.js 16** (App Router) + **React 19** + TypeScript |
| 백엔드 | **Supabase** — Postgres · Auth · Realtime · Storage |
| 인증 세션 | `@supabase/ssr` (쿠키 기반, 서버·미들웨어·클라이언트 일관) |
| 디자인 | Material Design 3 토큰 + Pretendard 폰트 + Material Symbols (디자인 `design/` 포팅) |
| 테스트 | Vitest (단위 + RLS 통합) |

> ⚠️ Next.js 16 주의: 라우트 미들웨어는 `middleware.ts`가 아니라 **`proxy.ts`**(export `proxy`).
> `cookies()`·route `params`는 **async**(`await`). 자세한 내용은 코드 주석 및 `AGENTS.md` 참고.

---

## 주요 기능

- **인증** — 이메일 가입/로그인(즉시 로그인, 확인메일 off), 구글·카카오 OAuth(버튼·콜백 구현, *provider 등록 필요*)
- **보드** — 여러 보드 생성, 홈에서 카드(썸네일·멤버 아바타·게시물 수·수정시각·즐겨찾기)로 관리
- **게시물** — 메모·이미지·링크·영상·파일 5종. 작성 다이얼로그에서 업로드/URL 입력
- **3가지 뷰** — 컬럼(섹션 칸반) · 그리드(메이슨리) · 캔버스(자유 배치), 드래그로 이동(컬럼 섹션·캔버스 위치 영속)
- **실시간** — 게시물·좋아요·댓글·보드 변경이 모든 접속자에게 즉시 반영(Supabase Realtime), 접속자 아바타 스택(Presence)
- **댓글** — 게시물 상세 모달의 실시간 댓글 스레드, 카드에 댓글 수 표시
- **공유·권한** — 초대 링크 합류, 3단계 역할(보기/편집/관리 + 소유자), 공유 다이얼로그에서 역할 변경·제거
- **알림** — 내 게시물에 댓글/좋아요 시 알림 생성(트리거), 알림 페이지 + 실시간 벨 배지
- **설정** — 프로필(이름·아바타색·소개) 편집, 다크모드 토글(영속)
- **모바일** — 반응형 레이아웃 + 하단 탭 네비게이션
- **다크모드** — 전체 테마 전환, localStorage 영속, 깜빡임 방지

---

## 라우트

| 경로 | 설명 | 보호 |
|---|---|---|
| `/login`, `/signup` | 이메일 로그인 / 가입 (스플릿 디자인, OAuth 버튼) | 공개 |
| `/auth/callback` | OAuth·매직링크 코드 교환 | 공개 |
| `/auth/signout` | 로그아웃 (POST) | — |
| `/boards` | 내 보드 목록 + 새 보드 만들기 | 🔒 |
| `/boards/[id]` | 보드 본체 (3뷰·작성기·실시간·댓글·공유) | 🔒 멤버만(RLS) |
| `/invite/[token]` | 초대 링크 합류 → 보드 진입 | 로그인 필요 |
| `/settings` | 프로필·테마 설정 | 🔒 |
| `/notifications` | 알림 목록 | 🔒 |

라우트 보호는 `proxy.ts`가 담당(`/boards`·`/settings`·`/notifications` → 비로그인 시 `/login`).

---

## 데이터 모델 (Postgres)

| 테이블 | 핵심 컬럼 | 비고 |
|---|---|---|
| `profiles` | id(=auth.users), name, initials, color, bio | 가입 시 트리거로 자동 생성 |
| `boards` | id, title, owner_id, invite_token | 초대 토큰 자동 발급 |
| `board_members` | board_id, user_id, role | role ∈ `owner/admin/editor/viewer` |
| `posts` | board_id, author_id, type, section, tint, title, text, url, domain, media_path, file_*, x/y/rot | 섹션 4종 고정 |
| `post_likes` | post_id, user_id | 좋아요 |
| `comments` | post_id, board_id, author_id, text | board_id 비정규화(RLS·실시간) |
| `board_favorites` | board_id, user_id | 즐겨찾기 |
| `notifications` | user_id, actor_id, type, board_id, post_id, read | 트리거로 생성 |

- **Storage**: 비공개 버킷 `board-media`, 경로 `{board_id}/{uuid}.{ext}`, 표시 시 서명 URL.
- **섹션(고정 4종)**: `well`(좋았던 점) · `work`(개선할 점) · `ideas`(아이디어·실험) · `actions`(실행 항목).

### 권한 모델 (RLS)

- 모든 보드 데이터는 **해당 보드 멤버만** 조회.
- **작성**(게시물·댓글): `editor` 이상. **뷰어는 읽기 전용**.
- **수정·삭제**: 작성자 본인 또는 `admin`/`owner`.
- **멤버 관리**(추가·역할변경·추방): `admin`/`owner`.
- **합류**: 안전한 `join_board_via_token(token)` RPC(SECURITY DEFINER)로만 — 임의 보드 self-join 불가.
- 좋아요·즐겨찾기: 멤버 누구나. 알림: 본인 것만 조회/읽음/삭제(생성은 트리거 전용).

### 실시간 채널

- `posts`·`post_likes`·`comments`·`boards`·`notifications` (postgres_changes)
- 보드별 **Presence** 채널(접속자 표시)
- 클라이언트 훅: `usePosts`, `usePresence`, `useComments`, `useNotifications`

---

## 마이그레이션

`supabase/migrations/` (0001~0010). 적용은 **`npm run db:push`** (수동 SQL 붙여넣기 불필요).

| # | 내용 |
|---|---|
| 0001 | 스키마 + RLS + 프로필 트리거 |
| 0002 | boards SELECT 정책에 owner 포함 |
| 0003 | post_likes 멤버십 게이트(보안 수정) |
| 0004 | board_favorites |
| 0005 | comments |
| 0006 | 3단계 역할 + 권한 RLS + 초대 RPC (self-join 갭 해소) |
| 0007 | Storage 버킷 + RLS |
| 0008 | profiles.bio + notifications + 댓글/좋아요 알림 트리거 |
| 0009 | 보안 수정 C1(게시물 board_id/author_id 불변)·H1(owner 모델 보호)·H3(초대=viewer)·M1(definer 실행권한) |
| 0010 | 보안 수정 H2(presence private 채널 + realtime.messages RLS) |
| 0011 | 리뷰 Medium/Low — M2(post_likes.board_id 비정규화)·M5(storage 경로 안전 파서)·M6(알림 read 컬럼만)·L1(updated_at 트리거) |

```bash
npm run db:push        # 미적용 마이그레이션을 클라우드에 적용
npm run db:migrations  # 로컬 vs 원격 이력 확인
```

---

## 로컬 실행

```bash
npm install
# .env.local 작성 (.env.local.example 참고):
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   SUPABASE_DB_URL=...   (마이그레이션 push용, Session pooler 연결문자열)
npm run dev            # http://localhost:3000
npm run test           # Vitest (단위 + RLS 통합)
```

> 개발 중 `next build`를 dev 서버와 동시에 돌리지 말 것(같은 `.next`를 덮어써 옛 화면 서빙).
> 타입체크는 `npx tsc --noEmit` 사용. 새 라우트/컴포넌트가 stale로 보이면 dev 재시작.

---

## 디렉토리 구조 (요약)

```
app/
  (auth)/                 로그인·가입 (LoginScreen)
  auth/callback, signout  OAuth 콜백 / 로그아웃
  boards/                 홈(목록) + [id] 보드 본체(BoardClient)
  invite/[token]/         초대 합류
  settings/, notifications/
components/
  m3/                     M3 원자 컴포넌트(Button, TextField, Dialog ...)
  board/                  PostCard, views(Columns/Grid/Canvas), Composer, PostDetail, ShareDialog, ...
  ThemeToggle, MobileNav
hooks/                    usePosts, usePresence, useComments, useNotifications
lib/                      supabase/ (server·client·middleware), posts, comments, profile, constants, time
supabase/migrations/      0001~0008
design/                   원본 디자인(포팅 소스)
docs/superpowers/         스펙·계획 문서
```

---

## 알려진 한계 / 후속 과제

- **OAuth provider 미등록** — 구글·카카오 버튼/콜백은 구현됨. Supabase 대시보드에 provider(클라이언트 ID/시크릿) 등록해야 실제 동작.
- **이메일 초대 미지원** — 초대는 링크 공유로만(RLS상 임의 이메일 조회 불가).
- **그리드 재정렬 미영속** — 게시물 순서 컬럼이 없어 그리드 드래그 순서는 시각만(컬럼 섹션·캔버스 위치는 저장).
- **댓글 삭제 UI 없음** — 정책은 존재(작성자/admin), UI 미구현.
- **설정의 계정·보안 / 조직 섹션** — placeholder.

## 배포

Vercel(프론트) + Supabase 클라우드(백엔드). 환경변수는 Vercel 프로젝트 설정에 동일하게 등록.
