# 모자이크 (Mosaic) — 설계 문서

작성일: 2026-06-01

## 1. 개요

**모자이크**는 협업자들이 텍스트·이미지·링크·영상·파일 등 모든 유형의 콘텐츠를
하나의 가상 게시판에 동시에 올리고 정리하는 커뮤니티 중심 협업 보드다.
구성원은 각자 편한 시간에 자료를 올리고, 다른 사람의 기여를 **실시간으로** 확인한다.

이번 작업의 목표는 **동작하는 MVP**다. 이미 완성된 프론트엔드 디자인 프로토타입
(`design/` 폴더, 코드명 "Coboard")을 실제 Supabase 백엔드에 연결하여
다중 보드 · 실제 인증 · 실시간 동기화를 갖춘 제품으로 만든다. 외형은 100% 유지한다.

### 확정된 범위 결정

| 항목 | 결정 |
|---|---|
| 목표 수준 | 동작하는 MVP |
| 실시간성 | 즉시 실시간 동기화 |
| 백엔드 | Supabase (BaaS) |
| 인증 | 이메일 로그인 |
| 보드 구조 | 여러 보드 + 초대 |
| 레이아웃 | 컬럼 / 그리드 / 캔버스 3뷰 (디자인 그대로) |
| 콘텐츠 타입 | 메모 · 이미지 · 링크 · 영상 · 파일 |
| 댓글 | **이번 MVP 제외** (좋아요만 실시간, 댓글 수는 0 표시, 후속 과제) |
| 실시간 협업 표시 | 접속 표시(아바타 스택) + 게시물/좋아요 동기화. **라이브 마우스 커서 제외** |
| 섹션(컬럼) | 4개 고정 (well / work / ideas / actions) |
| 프론트엔드 | **Next.js (App Router) + React** |
| 미디어 | 이미지·파일 → Supabase Storage 직접 업로드 / 영상 → 링크 임베드 / 링크 → URL |

## 2. 아키텍처 & 스택

- **Next.js (App Router) + React** — 라우팅, 서버/클라이언트 컴포넌트
- **Supabase** — Postgres(DB) · Auth(이메일) · Realtime · Storage
- **`@supabase/ssr`** — 쿠키 기반 세션 (서버·미들웨어·클라이언트 일관)
- **디자인 자산 재사용** — Material Design 3 토큰(`colors_and_type.css`), Pretendard 폰트,
  Material Symbols 아이콘. 기존 JSX 컴포넌트를 `window.*` 전역 → ES 모듈로 포팅

### 페이지 구조

| 경로 | 내용 |
|---|---|
| `/login`, `/signup` | 이메일 로그인 / 가입 |
| `/boards` | 내 보드 목록 + 새 보드 만들기 |
| `/boards/[id]` | 보드 본체 (컬럼/그리드/캔버스 3뷰) |
| `/invite/[token]` | 초대 링크로 보드 합류 |

### 핵심 흐름

- 보드를 열면 → 서버에서 초기 게시물 로드 → 클라이언트가 Supabase Realtime 구독 →
  누군가 게시물을 올리거나 좋아요하면 모든 접속자 화면에 즉시 반영
- "공유" 버튼 → 초대 링크 복사 → 받은 사람이 로그인 상태로 열면 보드 멤버로 합류

## 3. 데이터 모델

```
profiles                 -- auth.users와 1:1
  id (uuid, = auth.users.id, PK)
  name (text)            예: "김민아"
  initials (text)        예: "민아"
  color (text)           예: "#6750A4" (가입 시 팔레트에서 자동 배정)
  created_at

boards
  id (uuid, PK)
  title (text)           예: "2분기 제품 회고"
  owner_id (uuid → profiles)
  invite_token (text, unique)   -- 공유 링크용, 생성 시 자동 발급
  created_at, updated_at

board_members            -- 멤버십
  board_id (uuid → boards)
  user_id (uuid → profiles)
  role (text)            owner | member
  PK (board_id, user_id)

posts
  id (uuid, PK)
  board_id (uuid → boards)
  author_id (uuid → profiles)
  type (text)            text | image | link | video | file
  section (text)         well | work | ideas | actions
  tint (text)            butter | blush | lilac | mint | sky | paper
  title, text (text)
  url, domain (text)            -- link, video 타입 (영상은 임베드 URL)
  media_path (text)             -- Storage 경로 (image, file 타입)
  file_name, file_size, file_ext (text)  -- file 타입 표시용
  x, y, rot (numeric)           -- 캔버스 뷰 위치
  created_at, updated_at

post_likes               -- 좋아요 (수는 집계로 도출)
  post_id (uuid → posts)
  user_id (uuid → profiles)
  PK (post_id, user_id)
```

- 댓글 테이블은 만들지 않는다. 카드에는 댓글 수 0으로 표시(후속 과제).
- 섹션은 4개 고정이므로 테이블 없이 `lib/constants.ts` 상수로 관리
  (`well`=좋았던 점, `work`=개선할 점, `ideas`=아이디어·실험, `actions`=실행 항목).
- 모든 보드는 동일한 4개 고정 섹션을 사용한다.

### 보안 규칙 (RLS)

- `boards` / `posts` / `post_likes`: **해당 보드 멤버만** 읽기·쓰기
  (`board_members`에 해당 user 행이 존재해야 함)
- `posts` 수정·삭제: **작성자 본인** 또는 보드 **owner**만
- `board_members`: 본인이 멤버인 보드의 멤버 목록만 조회.
  합류는 유효한 `invite_token`을 통한 경로(서버 액션/라우트)로만 추가
- `profiles`: 같은 보드 멤버끼리 이름·색상 조회 가능

## 4. 실시간 동기화 & 접속 표시

### 게시물/좋아요 실시간 (Postgres Changes)

- 보드 진입 시 `posts` (board_id 필터) 채널 구독 → `INSERT`/`UPDATE`/`DELETE`
  이벤트로 카드가 새로고침 없이 나타남/사라짐/이동(캔버스 위치 포함)
- `post_likes`도 구독 → 좋아요 수 즉시 갱신
- 로컬 낙관적 업데이트(optimistic) 후 서버 이벤트로 확정

### 접속 표시 (Realtime Presence)

- 보드별 presence 채널 입장 → 상단 아바타 스택 + "N명 접속 중"이 실제 접속자로 동작
- 입장/이탈 시 실시간 갱신
- 디자인의 `Cursor` 컴포넌트와 시뮬레이션 로직(`App.jsx`의 cursors)은 제거

### 동기화 경계

- 캔버스 드래그: 드래그 **종료 시점**에만 `x/y` 저장 (매 프레임 전송 안 함)
- 보드 제목 편집도 `boards` 구독으로 실시간 반영

## 5. 인증 · 라우팅 · 초대

### 인증 (Supabase Auth, 이메일)

- 가입: 이메일 + 비밀번호 + 표시 이름 → `auth.users` 생성 + 트리거로 `profiles` 행 자동 생성.
  색상은 6색 팔레트에서 자동 배정, `initials`는 이름 끝 2글자
- 세션은 `@supabase/ssr` 쿠키 저장 → 서버/미들웨어/클라이언트 공유
- 이메일 확인 메일은 MVP 기본 **꺼둠**(마찰 최소화), 필요 시 켜기 가능

### 미들웨어 라우트 보호

- `/boards/**` 로그인 필수 → 비로그인 시 `/login`
- 로그인 상태로 `/login` 접근 시 `/boards`

### 초대 흐름 (공유 링크)

1. "공유" 버튼 → `/invite/{invite_token}` 링크 클립보드 복사 (스낵바 표시)
2. 링크 수신자가 열면:
   - 비로그인 → `/login`(또는 `/signup`) → 로그인 후 초대 페이지로 복귀
   - 로그인 → `board_members`에 `member` 추가 후 `/boards/{id}` 진입
3. 토큰은 보드별 고정값. 재발급/만료는 후속 과제

### 보드 목록 `/boards`

- 내가 owner 또는 member인 보드 카드 목록 + "새 보드 만들기"
- 새 보드 생성: `boards` 행 + 본인을 owner로 `board_members` 추가 + `invite_token` 자동 발급

## 6. 컴포넌트 포팅 · 스토리지 · 테스트

### 컴포넌트 포팅 (디자인 → Next.js)

`window.*` 전역 등록을 ES 모듈로 옮긴다. 외형/스타일은 유지.

| 디자인 파일 | 포팅 후 | 변경점 |
|---|---|---|
| `colors_and_type.css` | `app/globals.css` 통합 | 폰트 로컬 호스팅 |
| `Atoms.jsx` | `components/m3/*` | `window.X =` → `export` |
| `Button/IconButton/tweaks-panel` | `components/m3/*` | 동일 |
| `board.jsx` (PostCard, 미디어 블록) | `components/PostCard.tsx` 등 | Cursor 제거, 실제 미디어 URL 렌더 |
| `views.jsx` (TopBar, Columns/Grid/Canvas) | `components/views/*` | presence 실데이터 연결 |
| `composer.jsx` | `components/Composer.tsx` | 실제 업로드 / 영상·링크 URL 입력 연결 |
| `data.jsx` (시드) | 삭제 → Supabase 쿼리 | SECTIONS/TINTS 상수만 `lib/constants.ts` 유지 |
| `App.jsx` | `app/boards/[id]/BoardClient.tsx` | 인메모리 상태 → Supabase + Realtime 훅 |

- 데이터 레이어: `lib/supabase/`(server/client/middleware 클라이언트),
  `hooks/usePosts.ts`(쿼리+Realtime), `hooks/usePresence.ts`
- 폰트(Pretendard otf), Material Symbols는 로컬/CDN 로드

### 스토리지

- 비공개 버킷 `board-media`, 경로 `{board_id}/{uuid}.{ext}`
- 이미지·파일 업로드 → 표시 시 **서명 URL(1시간 유효)**. Storage RLS로 보드 멤버만 접근
- 영상·링크는 URL만 저장 (업로드 없음). 영상은 썸네일 + 재생 링크/임베드로 표시
- 업로드 용량 제한: 파일당 최대 50MB (Supabase 무료 한도 고려)

### 테스트 접근

- **단위 (Vitest):** 이니셜 생성, 좋아요 토글, 필터/검색, 초대 토큰 검증 등 순수 로직
- **통합:** Supabase 로컬(`supabase start`, Docker)에서 RLS 정책 검증
  (멤버/비멤버 접근, 작성자만 삭제 등)
- **E2E (Playwright):** 가입 → 보드 생성 → 게시물 작성 →
  두 번째 브라우저에서 실시간 반영 확인 → 초대 합류
- **수동 확인:** 3뷰 전환, 다크모드, 미디어 업로드/표시

### 개발 전제

- Supabase 프로젝트(클라우드 또는 로컬 Docker) 필요 — `.env.local`에 URL/anon key.
  로컬 개발은 `supabase` CLI 권장
- 배포 후보: Vercel + Supabase 클라우드

## 7. 후속 과제 (MVP 이후)

- 댓글 스레드 (실시간)
- 라이브 마우스 커서
- 보드별 커스텀 섹션
- 영상 직접 업로드 / 대용량 스토리지
- 초대 토큰 재발급·만료, 이메일 초대
- 알림, 보드 검색, 멤버 권한 관리
