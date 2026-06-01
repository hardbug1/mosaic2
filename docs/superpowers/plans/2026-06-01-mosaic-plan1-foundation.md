# 모자이크 Plan 1 — 기반 & 인증 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js + Supabase 기반 위에서 사용자가 가입·로그인하고, 보드를 만들고, 빈 보드 화면에 진입할 수 있는 동작하는 슬라이스를 만든다.

**Architecture:** Next.js(App Router)와 Supabase(Postgres/Auth/Realtime/Storage)를 `@supabase/ssr` 쿠키 세션으로 연결한다. DB 스키마와 RLS는 SQL 마이그레이션으로 관리하고 로컬 Supabase(Docker)에서 검증한다. 디자인 프로토타입(`design/`)의 Material Design 3 토큰·폰트·원자 컴포넌트를 ES 모듈로 포팅한다.

**Tech Stack:** Next.js 14(App Router), React 18, TypeScript, `@supabase/supabase-js`, `@supabase/ssr`, Supabase CLI(로컬), Vitest(단위), Playwright(E2E, Plan 4에서 본격화).

---

## 사전 준비 (참고)

- 이 디렉토리는 이미 git 저장소이며 `origin`은 `https://github.com/hardbug1/mosaic2.git`이다. 푸시는 [[git-push-via-gh-helper]] 방식(`gh auth git-credential`)을 쓴다.
- 디자인 원본은 `design/` 폴더에 있다. 이 계획은 그 파일을 읽어 포팅한다(원본은 그대로 두고 새 위치에 작성).
- 섹션 상수: `well`=좋았던 점, `work`=개선할 점, `ideas`=아이디어·실험, `actions`=실행 항목.
- 색상 팔레트(프로필 자동 배정): `#6750A4 #386A20 #00639B #8C4A60 #A23BB0 #B3261E`.

## 파일 구조 (이 계획에서 생성/수정)

```
package.json, tsconfig.json, next.config.mjs, .gitignore, .env.local.example   -- 프로젝트 셋업
supabase/config.toml                                                            -- supabase init 산출물
supabase/migrations/0001_init.sql                                               -- 스키마 + RLS + 트리거
app/layout.tsx, app/globals.css, app/page.tsx                                   -- 루트
app/(auth)/login/page.tsx, app/(auth)/signup/page.tsx                           -- 인증 페이지
app/boards/page.tsx, app/boards/BoardsClient.tsx                                -- 보드 목록
app/boards/[id]/page.tsx                                                        -- 빈 보드 셸 (Plan 2에서 채움)
app/auth/signout/route.ts                                                       -- 로그아웃
middleware.ts                                                                   -- 라우트 보호 + 세션 갱신
lib/constants.ts                                                                -- SECTIONS, TINTS, PALETTE
lib/profile.ts                                                                  -- initials/color 순수 로직
lib/supabase/client.ts, lib/supabase/server.ts, lib/supabase/middleware.ts      -- Supabase 클라이언트
components/m3/Avatar.tsx, Button.tsx, IconButton.tsx, TextField.tsx,
  Dialog.tsx, Snackbar.tsx, Switch.tsx                                          -- M3 원자 포팅
lib/profile.test.ts                                                             -- 단위 테스트
tests/rls.test.ts                                                               -- RLS 통합 테스트
public/fonts/*                                                                  -- Pretendard otf 복사
```

---

### Task 1: Next.js + TypeScript 프로젝트 초기화

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `.gitignore`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: package.json 작성**

Create `package.json`:

```json
{
  "name": "mosaic2",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@supabase/supabase-js": "2.45.0",
    "@supabase/ssr": "0.5.1"
  },
  "devDependencies": {
    "typescript": "5.5.4",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "@types/node": "20.14.0",
    "vitest": "2.0.5"
  }
}
```

- [ ] **Step 2: tsconfig.json, next.config.mjs, .gitignore 작성**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "design"]
}
```

Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

Create `.gitignore`:

```
node_modules/
.next/
.env.local
.env*.local
.superpowers/
supabase/.branches/
supabase/.temp/
*.log
.DS_Store
```

- [ ] **Step 3: 루트 레이아웃과 임시 홈 페이지 작성**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모자이크",
  description: "협업자들이 모든 유형의 콘텐츠를 함께 올리고 정리하는 가상 게시판",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
```

Create `app/globals.css` (Task 5에서 디자인 토큰으로 교체. 지금은 최소):

```css
html, body { height: 100%; margin: 0; }
* { box-sizing: border-box; }
```

Create `app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/boards");
}
```

- [ ] **Step 4: 의존성 설치 및 빌드 검증**

Run:
```bash
npm install
npx next build
```
Expected: 설치 성공, `Compiled successfully` 출력(타입 에러 없음).

- [ ] **Step 5: 커밋**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs .gitignore app/ 
git commit -m "chore: scaffold Next.js + TypeScript project

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: 상수 + 프로필 순수 로직 (TDD)

**Files:**
- Create: `lib/constants.ts`, `lib/profile.ts`
- Test: `lib/profile.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: vitest 설정 작성**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["**/*.test.ts"] },
});
```

- [ ] **Step 2: 실패하는 테스트 작성**

Create `lib/profile.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { deriveInitials, pickColor } from "./profile";
import { PALETTE } from "./constants";

describe("deriveInitials", () => {
  it("한글 이름의 끝 두 글자를 반환한다", () => {
    expect(deriveInitials("김민아")).toBe("민아");
  });
  it("두 글자 이름은 그대로 반환한다", () => {
    expect(deriveInitials("이수")).toBe("이수");
  });
  it("한 글자 이름은 그 글자만 반환한다", () => {
    expect(deriveInitials("김")).toBe("김");
  });
  it("공백을 제거한다", () => {
    expect(deriveInitials("  홍길동 ")).toBe("길동");
  });
  it("빈 문자열은 물음표를 반환한다", () => {
    expect(deriveInitials("")).toBe("?");
  });
});

describe("pickColor", () => {
  it("팔레트 안의 색을 반환한다", () => {
    expect(PALETTE).toContain(pickColor("any-uuid"));
  });
  it("같은 입력은 항상 같은 색을 반환한다(결정적)", () => {
    expect(pickColor("abc")).toBe(pickColor("abc"));
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npx vitest run lib/profile.test.ts`
Expected: FAIL — `lib/constants` / `lib/profile` 모듈을 찾을 수 없음.

- [ ] **Step 4: 상수와 로직 구현**

Create `lib/constants.ts`:

```ts
export const SECTIONS = [
  { id: "well",    title: "좋았던 점",       icon: "sentiment_satisfied", accent: "#386A20" },
  { id: "work",    title: "개선할 점",       icon: "build",               accent: "#B3261E" },
  { id: "ideas",   title: "아이디어 · 실험", icon: "lightbulb",           accent: "#6750A4" },
  { id: "actions", title: "실행 항목",       icon: "task_alt",            accent: "#00639B" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export const TINTS: Record<string, { bg: string; line: string }> = {
  butter: { bg: "#FFF3D6", line: "#EAD9A6" },
  blush:  { bg: "#FFE0E6", line: "#F2C0CB" },
  lilac:  { bg: "#EADDFF", line: "#D3C0F0" },
  mint:   { bg: "#D7F2E0", line: "#B4DEC2" },
  sky:    { bg: "#D9ECFF", line: "#B6D6F2" },
  paper:  { bg: "#FFFFFF", line: "#E2DDE7" },
};

export const PALETTE = ["#6750A4", "#386A20", "#00639B", "#8C4A60", "#A23BB0", "#B3261E"];

export const POST_TYPES = ["text", "image", "link", "video", "file"] as const;
export type PostType = (typeof POST_TYPES)[number];
```

Create `lib/profile.ts`:

```ts
import { PALETTE } from "./constants";

export function deriveInitials(name: string): string {
  const trimmed = (name || "").trim();
  if (trimmed.length === 0) return "?";
  return trimmed.slice(-2);
}

// 결정적 색상 배정: 문자열 해시 → 팔레트 인덱스
export function pickColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx vitest run lib/profile.test.ts`
Expected: PASS (7개 테스트 통과).

- [ ] **Step 6: 커밋**

```bash
git add lib/constants.ts lib/profile.ts lib/profile.test.ts vitest.config.ts
git commit -m "feat: add section/tint constants and profile helpers with tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Supabase 로컬 초기화 + DB 스키마/RLS 마이그레이션

**Files:**
- Create: `supabase/migrations/0001_init.sql`
- Create: `.env.local.example`
- (생성됨) `supabase/config.toml`

- [ ] **Step 1: Supabase CLI 초기화 및 로컬 기동**

Run:
```bash
npx supabase init
npx supabase start
```
Expected: 로컬 스택 기동 후 `API URL`, `anon key`, `service_role key` 출력. (Docker 필요)

- [ ] **Step 2: .env.local 작성**

`supabase start`가 출력한 값으로 `.env.local` 작성, 그리고 `.env.local.example`도 생성:

`.env.local` (커밋 안 함):
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<로컬 anon key>
SUPABASE_SERVICE_ROLE_KEY=<로컬 service_role key>
```

`.env.local.example` (커밋함):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 3: 스키마 + RLS 마이그레이션 작성**

Create `supabase/migrations/0001_init.sql`:

```sql
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

-- boards: 멤버만 조회, 본인이 owner로 생성, owner만 수정
create policy "boards member select" on public.boards
  for select using (public.is_board_member(id));
create policy "boards owner insert" on public.boards
  for insert with check (owner_id = auth.uid());
create policy "boards owner update" on public.boards
  for update using (owner_id = auth.uid());
create policy "boards owner delete" on public.boards
  for delete using (owner_id = auth.uid());

-- board_members: 같은 보드 멤버 목록 조회, 본인 행 추가(가입/합류), owner는 멤버 관리
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
```

- [ ] **Step 4: 마이그레이션 적용 및 검증**

Run:
```bash
npx supabase db reset
```
Expected: `0001_init.sql` 적용 성공, 에러 없음. (테이블·정책·트리거 생성)

- [ ] **Step 5: 커밋**

```bash
git add supabase/config.toml supabase/migrations/0001_init.sql .env.local.example
git commit -m "feat: add database schema, RLS policies, and profile trigger

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: RLS 통합 테스트 (TDD — 권한 경계 검증)

**Files:**
- Test: `tests/rls.test.ts`
- Create: `tests/helpers.ts`

이 테스트는 로컬 Supabase가 기동된 상태에서 실행한다. anon key로 사용자 2명을 가입시키고 보드/게시물 접근 권한을 검증한다.

- [ ] **Step 1: 테스트 헬퍼 작성**

Create `tests/helpers.ts`:

```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function anonClient(): SupabaseClient {
  return createClient(URL, ANON, { auth: { persistSession: false } });
}

// 고유 이메일로 가입 후 로그인된 클라이언트 반환
export async function signUpUser(name: string): Promise<{ client: SupabaseClient; id: string }> {
  const client = anonClient();
  const email = `u_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
  const { data, error } = await client.auth.signUp({
    email, password: "password123",
    options: { data: { name, initials: name.slice(-2), color: "#6750A4" } },
  });
  if (error) throw error;
  return { client, id: data.user!.id };
}
```

> 참고: 로컬 Supabase는 기본적으로 이메일 확인이 꺼져 있어 signUp 후 바로 세션이 생긴다. 꺼져 있지 않다면 `supabase/config.toml`의 `[auth.email] enable_confirmations = false` 확인.

- [ ] **Step 2: 실패하는 RLS 테스트 작성**

Create `tests/rls.test.ts`:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import { signUpUser } from "./helpers";

describe("RLS: 보드 멤버 경계", () => {
  let owner: Awaited<ReturnType<typeof signUpUser>>;
  let outsider: Awaited<ReturnType<typeof signUpUser>>;
  let boardId: string;

  beforeAll(async () => {
    owner = await signUpUser("김민아");
    outsider = await signUpUser("정태경");

    // owner가 보드 생성 + 본인을 owner 멤버로 추가
    const { data: board, error } = await owner.client
      .from("boards").insert({ title: "회고", owner_id: owner.id }).select().single();
    expect(error).toBeNull();
    boardId = board!.id;
    await owner.client.from("board_members").insert({ board_id: boardId, user_id: owner.id, role: "owner" });
  });

  it("owner는 자기 보드를 조회할 수 있다", async () => {
    const { data } = await owner.client.from("boards").select("*").eq("id", boardId);
    expect(data?.length).toBe(1);
  });

  it("비멤버는 보드를 조회할 수 없다", async () => {
    const { data } = await outsider.client.from("boards").select("*").eq("id", boardId);
    expect(data?.length).toBe(0);
  });

  it("비멤버는 그 보드에 게시물을 작성할 수 없다", async () => {
    const { error } = await outsider.client.from("posts").insert({
      board_id: boardId, author_id: outsider.id, type: "text", section: "well", text: "침입",
    });
    expect(error).not.toBeNull(); // RLS 위반
  });

  it("멤버는 게시물을 작성하고 조회할 수 있다", async () => {
    const { error: insErr } = await owner.client.from("posts").insert({
      board_id: boardId, author_id: owner.id, type: "text", section: "well", text: "안녕",
    });
    expect(insErr).toBeNull();
    const { data } = await owner.client.from("posts").select("*").eq("board_id", boardId);
    expect(data!.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: 테스트 실행(환경변수 로드 포함)**

`package.json`의 test 스크립트가 `.env.local`을 읽도록 `vitest.config.ts`에 dotenv 로딩 추가:

Modify `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import { config } from "dotenv";
config({ path: ".env.local" });

export default defineConfig({
  test: { environment: "node", include: ["**/*.test.ts"] },
});
```

Run:
```bash
npm i -D dotenv
npx vitest run tests/rls.test.ts
```
Expected: 4개 테스트 PASS (owner 조회 성공 / 비멤버 조회 0건 / 비멤버 작성 실패 / 멤버 작성·조회 성공).

- [ ] **Step 4: 커밋**

```bash
git add tests/rls.test.ts tests/helpers.ts vitest.config.ts package.json package-lock.json
git commit -m "test: add RLS integration tests for board membership boundaries

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: 디자인 토큰 · 폰트 · M3 원자 컴포넌트 포팅

**Files:**
- Modify: `app/globals.css` (디자인 토큰 통합)
- Create: `public/fonts/` (Pretendard otf 복사)
- Create: `components/m3/Avatar.tsx`, `Button.tsx`, `IconButton.tsx`, `TextField.tsx`, `Dialog.tsx`, `Snackbar.tsx`, `Switch.tsx`

- [ ] **Step 1: 폰트 복사 및 globals.css 작성**

Run:
```bash
mkdir -p public/fonts
cp design/fonts/*.otf public/fonts/
```

`design/colors_and_type.css` 전체를 `app/globals.css`로 복사하되, 다음을 추가/보정한다:
- `@font-face`의 Pretendard `src` 경로를 `/fonts/Pretendard-*.otf`로 지정(로컬 호스팅)
- Material Symbols와 Roboto Mono는 `app/layout.tsx`의 `<head>`에서 Google Fonts로 로드
- 기존 `Coboard - Q2 Product Retro.html`의 `<style>` 블록(html/body/스크롤바)도 `globals.css`에 포함

Modify `app/layout.tsx` (head에 아이콘/폰트 링크 추가):

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모자이크",
  description: "협업자들이 모든 유형의 콘텐츠를 함께 올리고 정리하는 가상 게시판",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200&display=block"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: M3 원자 컴포넌트 포팅**

`design/components/Atoms.jsx`, `Button.jsx`, `IconButton.jsx`의 각 함수를 개별 `.tsx` 파일로 옮긴다. 규칙:
- `window.X = X;` 줄 삭제 → 파일 끝에 `export`
- 다른 컴포넌트 참조는 상대경로 `import`로 교체 (예: `IconButton`은 `import { M3IconButton } from "./IconButton"`)
- props에 TypeScript 타입 주석 추가
- 내부 JSX/스타일은 **변경하지 않는다**(외형 동일 유지)

예 — Create `components/m3/Avatar.tsx` (Atoms.jsx의 M3Avatar 그대로, export만 변경):

```tsx
"use client";
import React from "react";

export function M3Avatar({
  initials, icon, color = "primary", size = 40,
}: { initials?: string; icon?: string; color?: "primary" | "secondary" | "tertiary" | "surface"; size?: number }) {
  const palettes = {
    primary:   { bg: "var(--md-sys-color-primary-container)", fg: "var(--md-sys-color-on-primary-container)" },
    secondary: { bg: "var(--md-sys-color-secondary-container)", fg: "var(--md-sys-color-on-secondary-container)" },
    tertiary:  { bg: "var(--md-sys-color-tertiary-container)", fg: "var(--md-sys-color-on-tertiary-container)" },
    surface:   { bg: "var(--md-sys-color-surface-container-highest)", fg: "var(--md-sys-color-on-surface-variant)" },
  };
  const p = palettes[color] || palettes.primary;
  return (
    <div style={{
      width: size, height: size, minWidth: size, borderRadius: 9999, background: p.bg, color: p.fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--md-sys-typescale-plain-font)", fontWeight: 500, fontSize: size * 0.4, flexShrink: 0,
    }}>
      {icon ? <span className="md-icon" style={{ fontSize: size * 0.6 }}>{icon}</span> : initials}
    </div>
  );
}
```

> 나머지 컴포넌트(`M3Button`, `M3IconButton`, `M3TextField`, `M3Dialog`, `M3Snackbar`, `M3Switch`)도 같은 규칙으로 포팅한다. 원본 JSX 본문은 `design/components/`에서 그대로 가져오고, `"use client";` 추가, `window.* =` 제거, `export` 추가, 상호 참조는 import로 연결. `M3TextField`/`M3Dialog`/`M3Snackbar`/`M3Switch`는 `Atoms.jsx`, `M3Button`은 `Button.jsx`, `M3IconButton`은 `IconButton.jsx`가 원본이다.

- [ ] **Step 3: 타입체크/빌드 검증**

Run: `npx next build`
Expected: 컴파일 성공, 타입 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add app/globals.css app/layout.tsx public/fonts components/m3
git commit -m "feat: port M3 design tokens, fonts, and atom components

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Supabase 클라이언트 (server/client/middleware)

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`

- [ ] **Step 1: 브라우저 클라이언트**

Create `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 2: 서버 클라이언트**

Create `lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch { /* 서버 컴포넌트에서 set 호출 시 무시 (middleware가 갱신) */ }
        },
      },
    },
  );
}
```

- [ ] **Step 3: 미들웨어용 세션 갱신 헬퍼**

Create `lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  return { response, user };
}
```

- [ ] **Step 4: 빌드 검증 및 커밋**

Run: `npx next build`
Expected: 성공.

```bash
git add lib/supabase
git commit -m "feat: add Supabase server/client/middleware helpers

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: 미들웨어 라우트 보호

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: 미들웨어 작성**

Create `middleware.ts`:

```ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  const isProtected = path.startsWith("/boards");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/boards";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.(?:png|jpg|svg)).*)"],
};
```

- [ ] **Step 2: 수동 검증**

Run: `npm run dev`
브라우저에서 `http://localhost:3000/boards` 접근 → `/login?redirect=/boards`로 리다이렉트되는지 확인.
Expected: 비로그인 시 로그인 페이지로 이동(로그인 페이지는 Task 8에서 작성하므로 지금은 404가 아니라 리다이렉트 동작만 확인).

- [ ] **Step 3: 커밋**

```bash
git add middleware.ts
git commit -m "feat: protect /boards routes with auth middleware

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: 인증 페이지 (가입 / 로그인 / 로그아웃)

**Files:**
- Create: `app/(auth)/signup/page.tsx`, `app/(auth)/login/page.tsx`, `app/auth/signout/route.ts`
- Create: `app/(auth)/AuthForm.tsx` (공통 클라이언트 폼)

- [ ] **Step 1: 공통 인증 폼 컴포넌트**

Create `app/(auth)/AuthForm.tsx`:

```tsx
"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deriveInitials, pickColor } from "@/lib/profile";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const supabase = createClient();
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, initials: deriveInitials(name), color: pickColor(email) } },
      });
      if (error) { setError(error.message); setBusy(false); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setBusy(false); return; }
    }
    router.push(params.get("redirect") || "/boards");
    router.refresh();
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16, width: 360 }}>
      <h1 className="md-headline-small">{mode === "signup" ? "모자이크 가입" : "모자이크 로그인"}</h1>
      {mode === "signup" && (
        <input required placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      )}
      <input required type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input required type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div style={{ color: "var(--md-sys-color-error)" }}>{error}</div>}
      <button disabled={busy} type="submit">{busy ? "처리 중…" : (mode === "signup" ? "가입" : "로그인")}</button>
      <a href={mode === "signup" ? "/login" : "/signup"}>
        {mode === "signup" ? "이미 계정이 있나요? 로그인" : "계정이 없나요? 가입"}
      </a>
    </form>
  );
}
```

> 스타일은 MVP 최소 수준. M3 `M3TextField`/`M3Button`으로 다듬는 것은 Task 9 이후 선택 개선.

- [ ] **Step 2: 페이지 작성**

Create `app/(auth)/signup/page.tsx`:

```tsx
import { Suspense } from "react";
import { AuthForm } from "../AuthForm";

export default function SignupPage() {
  return (
    <main style={{ display: "grid", placeItems: "center", height: "100%" }}>
      <Suspense><AuthForm mode="signup" /></Suspense>
    </main>
  );
}
```

Create `app/(auth)/login/page.tsx`:

```tsx
import { Suspense } from "react";
import { AuthForm } from "../AuthForm";

export default function LoginPage() {
  return (
    <main style={{ display: "grid", placeItems: "center", height: "100%" }}>
      <Suspense><AuthForm mode="login" /></Suspense>
    </main>
  );
}
```

- [ ] **Step 3: 로그아웃 라우트**

Create `app/auth/signout/route.ts`:

```ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
```

- [ ] **Step 4: 수동 검증 (가입→리다이렉트)**

Run: `npm run dev`
- `/signup`에서 이름/이메일/비밀번호로 가입 → `/boards`로 이동(빈 화면 또는 다음 Task 전까지 404 가능)
- Supabase Studio(`http://127.0.0.1:54323`)에서 `auth.users`와 `public.profiles`에 행이 생성됐는지 확인 → 트리거 동작 검증

Expected: 가입 후 profiles에 name/initials/color가 채워진 행 존재.

- [ ] **Step 5: 커밋**

```bash
git add "app/(auth)" app/auth/signout/route.ts
git commit -m "feat: add signup/login/logout with profile metadata

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: 보드 목록 + 새 보드 만들기

**Files:**
- Create: `app/boards/page.tsx`, `app/boards/BoardsClient.tsx`, `app/boards/actions.ts`

- [ ] **Step 1: 서버 액션 (보드 생성)**

Create `app/boards/actions.ts`:

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createBoard(formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "제목 없는 보드";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: board, error } = await supabase
    .from("boards").insert({ title, owner_id: user.id }).select().single();
  if (error) throw error;

  const { error: memErr } = await supabase
    .from("board_members").insert({ board_id: board.id, user_id: user.id, role: "owner" });
  if (memErr) throw memErr;

  redirect(`/boards/${board.id}`);
}
```

- [ ] **Step 2: 서버 컴포넌트 — 목록 조회**

Create `app/boards/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { BoardsClient } from "./BoardsClient";
import { createBoard } from "./actions";

export default async function BoardsPage() {
  const supabase = await createClient();
  // 내가 멤버인 보드만 (RLS가 자동 필터)
  const { data: boards } = await supabase
    .from("boards").select("id, title, updated_at").order("updated_at", { ascending: false });

  return <BoardsClient boards={boards ?? []} createBoard={createBoard} />;
}
```

- [ ] **Step 3: 클라이언트 — 목록 UI + 생성 폼 + 로그아웃**

Create `app/boards/BoardsClient.tsx`:

```tsx
"use client";
import React from "react";

type Board = { id: string; title: string; updated_at: string };

export function BoardsClient({
  boards, createBoard,
}: { boards: Board[]; createBoard: (fd: FormData) => Promise<void> }) {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 className="md-headline-medium">내 보드</h1>
        <form action="/auth/signout" method="post">
          <button type="submit">로그아웃</button>
        </form>
      </header>

      <form action={createBoard} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input name="title" placeholder="새 보드 제목" style={{ flex: 1 }} />
        <button type="submit">새 보드 만들기</button>
      </form>

      {boards.length === 0 ? (
        <p className="md-body-medium">아직 보드가 없어요. 위에서 새 보드를 만들어 보세요.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {boards.map((b) => (
            <a key={b.id} href={`/boards/${b.id}`} style={{
              display: "block", padding: 20, borderRadius: 16, textDecoration: "none",
              background: "var(--md-sys-color-surface-container-low)",
              boxShadow: "var(--md-sys-elevation-level1)", color: "var(--md-sys-color-on-surface)",
            }}>
              <div className="md-title-medium">{b.title}</div>
              <div className="md-body-small" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                {new Date(b.updated_at).toLocaleDateString("ko-KR")}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 4: 수동 검증**

Run: `npm run dev`
- 로그인 → `/boards`에서 "새 보드 만들기" → `/boards/{id}`로 이동
- `/boards`로 돌아오면 생성한 보드가 목록에 보임
- Studio에서 `board_members`에 owner 행이 생성됐는지 확인

Expected: 보드 생성·목록 표시·멤버 추가 정상.

- [ ] **Step 5: 커밋**

```bash
git add app/boards/page.tsx app/boards/BoardsClient.tsx app/boards/actions.ts
git commit -m "feat: add boards list and create-board flow

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: 빈 보드 셸 페이지 (Plan 2 진입점)

**Files:**
- Create: `app/boards/[id]/page.tsx`

- [ ] **Step 1: 보드 셸 작성 (멤버십 확인 + 제목 표시)**

Create `app/boards/[id]/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // RLS: 멤버가 아니면 board가 조회되지 않음 → notFound
  const { data: board } = await supabase
    .from("boards").select("id, title").eq("id", id).single();
  if (!board) notFound();

  return (
    <main style={{ padding: 24 }}>
      <a href="/boards" className="md-body-small">← 내 보드</a>
      <h1 className="md-headline-medium" style={{ marginTop: 8 }}>{board.title}</h1>
      <p className="md-body-medium" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
        보드 본체(게시물·3뷰·실시간)는 Plan 2에서 구현됩니다.
      </p>
    </main>
  );
}
```

- [ ] **Step 2: 수동 검증 (멤버십 경계)**

Run: `npm run dev`
- 본인이 만든 보드 `/boards/{id}` 진입 → 제목 표시
- 다른 계정으로 로그인 후 그 보드 id로 직접 접근 → `notFound`(404) 확인 (RLS 경계 동작)

Expected: 멤버만 보드 페이지 접근 가능.

- [ ] **Step 3: 커밋 및 푸시**

```bash
git add "app/boards/[id]/page.tsx"
git commit -m "feat: add board shell page with membership guard

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
gh auth switch --user hardbug1
git config --local credential.helper "!gh auth git-credential"
GIT_TERMINAL_PROMPT=0 git push
```

---

## 완료 기준 (Plan 1)

- [ ] `npm run test`로 단위 + RLS 통합 테스트 모두 통과
- [ ] `npm run dev`에서: 가입 → 프로필 자동 생성 → 보드 생성 → 목록 표시 → 보드 셸 진입
- [ ] 비멤버는 타 보드 조회/접근 불가(404), 게시물 작성 불가(RLS)
- [ ] `npx next build` 성공
- [ ] 변경분 GitHub `main`에 푸시 완료

## 다음 (Plan 2 예고)

PostCard·TopBar·Columns/Grid/Canvas 뷰 포팅, 작성기(메모/링크/영상), `usePosts`(쿼리+Realtime 구독), 좋아요+`post_likes` 실시간, presence 접속 스택.
