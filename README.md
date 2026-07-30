# birthday-site

A private, role-based birthday web application built with **Next.js 15**,
**Firebase**, and **Appwrite** — deployed for one year at **$0 cost** using
GitHub Student Developer Pack benefits.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Hosting | Vercel (Hobby — free) |
| Auth | Firebase Authentication (Google sign-in) |
| Database | Firebase Firestore |
| File storage | Appwrite Storage (2 buckets) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| CI/CD | GitHub Actions |

## Local Development

### Prerequisites

- Node.js >= 20
- npm >= 10

### Setup

1. Clone the repository.
2. Copy `.env.example` to `.env.local` and fill in all values:

   ```bash
   cp .env.example .env.local
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start local dev server (Turbopack) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript typecheck (tsc --noEmit) |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Run Vitest in watch mode |

## Project Structure

See the full folder map in `DESIGN PHASE/diagrams.md` and system architecture
in `ARCHITECTURE.md` at the project root.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values.
Variables prefixed `NEXT_PUBLIC_` are safe to expose to the browser.
All others are server-side secrets — **never** prefix them with `NEXT_PUBLIC_`.

> **Never commit `.env.local` or any file containing real secrets.**

## Architecture Reference

- `ARCHITECTURE.md` — system design, data models, deployment pipeline
- `AI_RULES.md` — coding standards and prohibited actions
- `STATE.md` — project state tracker
- `TODO.md` — Kanban task board
