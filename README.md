# 🌌 Antigravity // Digital Persona & Maimai DX Telemetry Portal

An interactive, gravity-defying digital portfolio and live rhythm game telemetry portal built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **Drizzle ORM** with **SQLite / LibSQL**.

---

## 🚀 Key Features

### 1. Zero-G Interactive Canvas Engine
- **HTML5 2D Canvas Physics**: Procedural drifting space particles reacting dynamically to cursor velocity with inverse-square repulsion vectors.
- **Constellation Connectors**: Real-time Euclidean distance calculations linking nearby nodes with luminous gradient filaments.
- **Multi-Level Gravity Controller**: Live toggle between **Normal G (1.0)**, **Lunar G (0.3)**, and **Zero G (0.0)** that modulates particle drift velocity, repulsion radius, and 3D floating amplitudes.

### 2. Kinetic UI Components
- **3D Tilt Perspective Cards (`GlassCard`)**: Spring-damped rotation responding to mouse position, framed in translucent glassmorphism with subtle gradient borders.
- **Magnetic Action Buttons (`GravityButton`)**: Elastic spring attraction drawing buttons toward the cursor when hovering nearby.
- **Upward Antigravity Confetti**: Physics-inverted particle bursts defying downward gravity on contact submission.
- **Base UI Dialog Modals**: Accessible, GPU-accelerated telemetry inspection dialogs for featured experiments.

### 3. Maimai DX Telemetry Portal (`/maimai`)
- **Secure SEGA ID Authentication**: Cookie-based cryptographic session management (10-day expiration) stored directly in SQLite via Drizzle ORM.
- **Atomic Database Synchronization**: Multi-record upsert transactions syncing player ratings, play counts, achievements, and clear badges.
- **Interactive Visual Analytics (Recharts)**:
  - Rating progression and target metrics (AreaChart)
  - Difficulty distribution ratio (PieChart)
  - Level spectrum breakdown (BarChart)
- **Live Song Telemetry Matrix**: Real-time search, multi-criteria filtering (difficulty, clear badge), multi-column sorting (achievement, play count, level), and optimistic UI like toggling.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.2.6 (App Router, Turbopack) | Server Components & Route Handlers |
| **Runtime & Core** | React 19.2.4 & TypeScript 5 | UI rendering & strict type safety |
| **Styling** | Tailwind CSS v4 & tw-animate-css | Utility-first CSS & theme tokens |
| **Motion & Physics** | Framer Motion 12 & HTML5 2D Canvas | Kinetic animations, 3D tilt, particle engine |
| **Database & ORM** | Drizzle ORM 0.45 & `@libsql/client` (SQLite) | Precompiled zero-build native SQLite database |
| **Primitives & Icons** | Base UI (`@base-ui/react`), Lucide React | Accessible headless primitives & icons |
| **Data Visualization**| Recharts 3.8 | Telemetry charts & data distributions |
| **Testing** | Node.js Test Runner (`tsx --test`) | Pre-build unit testing suite |

---

## 📂 Project Directory Structure

```text
├── src/
│   ├── app/
│   │   ├── api/auth/               # Authentication & data synchronization API routes
│   │   │   ├── like/route.ts       # Toggle song like state in SQLite
│   │   │   ├── login/route.ts      # SEGA ID auth & session cookie generation
│   │   │   ├── logout/route.ts     # Invalidate session token & clear cookie
│   │   │   └── sync/route.ts       # Atomic transaction upserting Maimai scores
│   │   ├── maimai/                 # Maimai DX Telemetry Portal
│   │   │   ├── dashboard/          # Player telemetry analytics & score matrix
│   │   │   │   ├── DashboardClient.tsx
│   │   │   │   └── page.tsx        # Dynamic server-side auth guard
│   │   │   └── page.tsx            # SEGA ID login portal
│   │   ├── globals.css             # Tailwind v4 theme, glassmorphism, animations
│   │   ├── layout.tsx              # Root HTML wrapper with typography & metadata
│   │   └── page.tsx                # Antigravity single-page portfolio
│   ├── components/
│   │   ├── sections/               # Modular landing page sections
│   │   │   ├── About.tsx           # Engineering philosophy & telemetry indicators
│   │   │   ├── Contact.tsx         # Transmission form with anti-gravity confetti
│   │   │   ├── Hero.tsx            # Headline, gravity well orb, floating skill chips
│   │   │   └── Projects.tsx        # Project showcase with Base UI telemetry modals
│   │   ├── ui/                     # Reusable design system components
│   │   │   ├── GlassCard.tsx       # 3D interactive tilt & floating container
│   │   │   ├── GravityButton.tsx   # Cursor-attracting magnetic spring button
│   │   │   ├── button.tsx          # Base UI button primitive wrapper
│   │   │   ├── dialog.tsx          # Base UI dialog modal primitive
│   │   │   ├── input.tsx           # Styled text input
│   │   │   └── textarea.tsx        # Auto-resizing textarea
│   │   └── visual/                 # Core physics & simulation system
│   │       ├── GravityControls.tsx # Fixed widget to switch gravity states
│   │       ├── GravityPhysics.tsx  # React context managing physics constants
│   │       └── SpaceParticles.tsx  # Fullscreen HTML5 2D canvas particle loop
│   ├── db/
│   │   ├── client.ts               # LibSQL client instantiation (`file:db.sqlite`)
│   │   ├── index.ts                # Unified database & schema re-exports
│   │   └── schema.ts               # Drizzle schemas (users, authTokens, scores)
│   └── lib/
│       ├── auth.ts                 # Cryptographic token generation & validation
│       ├── maimai-api.ts           # External API client connector & data mappers
│       ├── maimai.test.ts          # Unit tests for scoring & cookie configurations
│       └── utils.ts                # ClassName merger (`clsx` + `tailwind-merge`)
├── drizzle.config.ts               # Drizzle Kit migration configuration
├── components.json                 # Shadcn / Base UI component registry
├── package.json                    # Dependencies & npm scripts
└── tsconfig.json                   # TypeScript configuration
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 20.x or higher
- pnpm 9.x or higher

### Installation
```bash
pnpm install
```

### Development Server
Run the local Next.js development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Automated Unit Testing
Execute the test suite powered by Node's native test runner:
```bash
pnpm test
```

### Production Build
Linting, testing, and bundling with Next.js Turbopack:
```bash
pnpm build
pnpm start
```

---

## 🧪 Developer Sandbox Credentials
When exploring the Maimai DX Telemetry Portal at `/maimai`:
- **SEGA ID**: `SEGA-USER-777` (or any string)
- **Password**: `••••••••••••` (any string)
- An active SQLite profile will be initialized and populated with high-fidelity scores, play records, and achievement analytics.

---

## 🧹 Codebase Maintenance & Simplification Notes
- **Dead Code Cleaned**: Unused Shadcn component `dropdown-menu.tsx` and unused boilerplate SVGs in `public/` have been removed.
- **Package Manager Standardized**: Project is standardized on `pnpm` using `pnpm-lock.yaml` and `packageManager: pnpm@9.15.4`.
- **Dependency Cleaned**: Removed redundant `@types/better-sqlite3` as the project operates directly on `@libsql/client`.
