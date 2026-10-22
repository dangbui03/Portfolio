<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🤖 Agent Context & Project Memory

This file serves as the permanent contextual memory for all AI agents working on this repository. Read this file before planning or modifying code.

---

## 📌 Project Overview & Identity
- **Repository**: `Portfolio`
- **Primary Package Manager**: `pnpm` (`packageManager: pnpm@9.15.4`, `pnpm-lock.yaml`)
- **Core Stack**: Next.js 16.2.6 (App Router with Turbopack), React 19.2.4, Tailwind CSS v4.

---

## 🗺️ System Architecture

### 1. Portfolio (`/`, `src/app/page.tsx`)
- Clean starter landing page layout.
- Global styling configured with Tailwind CSS v4 in `src/app/globals.css`.
- Root layout configured in `src/app/layout.tsx`.

---

## 📜 What Has Been Done So Far

| Milestone / Commit | Description |
|---|---|
| `4464a66` | Initialized Antigravity portfolio landing page. |
| `695d98d` | Completed Maimai DX Telemetry Portal integration. |
| `2a59c04` | Fixed Base UI `DialogTrigger` accessibility button semantics warning in `Projects.tsx`. |
| `21f4fc6` | Fixed Next.js dynamic `Date` locale hydration mismatch on Maimai dashboard. |
| `56dd5dd` | Integrated automated unit tests running before Next.js production builds (`tsx --test`). |
| **Clean Start** | Erased Maimai module, database, galaxy theme, and reset `src` to clean starter portfolio. Pre-change state backed up in `backup/2026-10-22_140800`. |

---

## 📝 Big Change Protocol for Future Agents
- **Minor changes**: Refactoring a single line, fixing a typo, updating styles, or formatting do **NOT** need to be written here.
- **Major changes**: Architectural updates, new route additions, schema migrations, new API endpoints, or package manager adjustments **MUST** be recorded under the table in **What Has Been Done So Far** with a brief summary.
