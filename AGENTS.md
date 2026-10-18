<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🤖 Agent Context & Project Memory

This file serves as the permanent contextual memory for all AI agents working on this repository. Read this file before planning or modifying code.

---

## 📌 Project Overview & Identity
- **Repository**: `Portfolio` (Antigravity Digital Space & Maimai DX Telemetry Portal)
- **Primary Package Manager**: `pnpm` (`packageManager: pnpm@9.15.4`, `pnpm-lock.yaml`)
- **Core Stack**: Next.js 16.2.6 (App Router with Turbopack), React 19.2.4, Tailwind CSS v4, Framer Motion 12, Drizzle ORM 0.45 with `@libsql/client` (SQLite), Recharts 3.8, Base UI primitives.

---

## 🗺️ System Architecture

### 1. Antigravity Single-Page Portfolio (`/`, `src/app/page.tsx`)
- **Canvas Physics (`SpaceParticles.tsx`)**: Procedural starfield particle canvas with inverse-square cursor repulsion and dynamic constellation line linking.
- **Gravity System (`GravityPhysics.tsx` & `GravityControls.tsx`)**: Global React context managing 3 gravity levels (`normal` 1.0G, `low` 0.3G, `zero` 0.0G), dynamically scaling particle speed, repulsion force, and UI float distances.
- **Interactive UI Primitives**:
  - `GlassCard.tsx`: 3D spring-damped perspective tilting container.
  - `GravityButton.tsx`: Magnetic pull button attracting toward cursor coordinates.
  - `Projects.tsx`: 4 interactive showcase items (`Matter Orbit`, `Aether Glass UI`, `Nebula Core Compiler`, `Maimai Telemetry Sync`) with Base UI telemetry modals.
  - `Contact.tsx`: Upward anti-gravity confetti animation using `canvas-confetti`.

### 2. Maimai DX Telemetry Portal (`/maimai` & `/maimai/dashboard`)
- **Authentication**: SEGA ID login (`src/app/maimai/page.tsx`) issuing cryptographic tokens stored in SQLite and transmitted via secure, HTTP-only cookies (`maimai_session`, 10-day expiration).
- **Database Engine (`src/db/`)**: Local LibSQL SQLite (`file:db.sqlite`) via Drizzle ORM.
  - `users`: Sega ID, nickname, rating, trophy, plate, syncTime.
  - `auth_tokens`: Session tokens linked to users with cascade deletion.
  - `scores`: Song title, difficulty, level, achievement float, clear badge, play count, liked status.
- **Atomic Synchronization (`/api/auth/sync`)**: Upsert transactions updating player profiles and syncing songs.
- **Analytics Dashboard (`DashboardClient.tsx`)**: Recharts AreaChart (ratings), PieChart (difficulty), and BarChart (level distribution) with search, multi-criteria filtering, and optimistic like toggling.

---

## 📜 What Has Been Done So Far

| Milestone / Commit | Description |
|---|---|
| `4464a66` | Initialized Antigravity portfolio landing page (Next.js 16, Tailwind v4, HTML5 canvas zero-g physics, shadcn/Base UI components). |
| `695d98d` | Completed Maimai DX Telemetry Portal integration with SQLite Drizzle ORM, auth cookie sessions, and Recharts analytics. |
| `2a59c04` | Fixed Base UI `DialogTrigger` accessibility button semantics warning in `Projects.tsx`. |
| `21f4fc6` | Fixed Next.js dynamic `Date` locale hydration mismatch on Maimai dashboard. |
| `56dd5dd` (HEAD) | Integrated automated unit tests running before Next.js production builds (`tsx --test`). |
| **Current Cleanup** | Removed wasted files (`dropdown-menu.tsx`, unused Next.js boilerplate SVGs, `CLAUDE.md`, `package-lock.json`), standardized package manager to `pnpm` (declared `packageManager: pnpm@9.15.4`, configured `pnpm-workspace.yaml`, updated build scripts to `pnpm test && next build`), and rewritten `README.md`. |

---

## 🔍 Last Commit Analysis (`56dd5dd`)

- **Commit Hash**: `56dd5dd21604fd5cf30e05116bf280cf01e1fd04`
- **Commit Message**: `feat: integrate unit tests running before Next.js production builds`
- **What Was Changed**:
  1. Added `tsx` (v4.22.3) to `devDependencies`.
  2. Added `"test": "tsx --test src/lib/maimai.test.ts"` to `package.json`.
  3. Modified `"build"` script to run `npm run test && next build`.
  4. Created [`src/lib/maimai.test.ts`](file:///home/darkchan/Projects/Code/Portfolio/src/lib/maimai.test.ts) covering:
     - Deterministic score ID generation (`userId_songTitle_difficulty`).
     - Floating point precision truncation (up to 4 decimal places).
     - SQLite integer boolean conversion (`liked: 1 | 0`).
     - Session cookie security attributes (`httpOnly`, `sameSite: lax`, 10-day `maxAge`).

### 💡 What Can Be Upgraded in the Last Commit
1. **Dynamic Test File Pattern**:
   - *Current*: `"test": "tsx --test src/lib/maimai.test.ts"` (only targets a single hardcoded file).
   - *Upgrade*: Change to `"tsx --test 'src/**/*.test.ts'"` so any new test files created in the repository are automatically discovered and executed.
2. **Database & Session Unit Testing**:
   - Currently, `createSession`, `validateSession`, and `destroySession` in `src/lib/auth.ts` are not unit tested. An in-memory SQLite database (`:memory:`) test suite can test session expiration and cascade deletion safely without mutating `db.sqlite`.
3. **Pre-build Quality Pipeline Completeness**:
   - The build script only ran tests before building (`pnpm test && next build`). Upgrading to `pnpm lint && pnpm test && next build` ensures TypeScript and ESLint regressions are caught before Turbopack bundles the output.
4. **Mock API Integration Testing**:
   - Add unit tests for `fetchLiveMaimaiScores` handling network simulation, edge-case song titles, and error responses.

---

## 📝 Big Change Protocol for Future Agents
- **Minor changes**: Refactoring a single line, fixing a typo, updating styles, or formatting do **NOT** need to be written here.
- **Major changes**: Architectural updates, new route additions, schema migrations, new API endpoints, or package manager adjustments **MUST** be recorded under the table in **What Has Been Done So Far** with a brief summary.
