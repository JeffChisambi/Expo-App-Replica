# STEM SmartStudy

A student-focused STEM study app with authenticated accounts and a course catalog.

## Run & Operate

- `pnpm install --frozen-lockfile` — install the workspace dependencies
- `pnpm --filter @workspace/db run push` — apply the development PostgreSQL schema
- `pnpm --filter @workspace/db run seed` — create or refresh the course catalog
- `pnpm --filter @workspace/api-server run dev` — run the Express API
- `pnpm --filter @workspace/mobile run dev` — run the Expo student app
- `pnpm --filter @workspace/api-spec run codegen` — regenerate shared API clients and schemas
- `pnpm --filter @workspace/api-server run typecheck` and `pnpm --filter @workspace/mobile run typecheck` — typecheck both services
- Replit PostgreSQL provides `DATABASE_URL`; Replit-managed Clerk provides authentication keys.
- API routes include `/api/healthz`, `/api/students/me`, and `/api/courses`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile` — Expo Router app and student sign-in/sign-up UI
- `artifacts/api-server` — Express API, Clerk middleware, and protected student routes
- `lib/db/src/schema` — Drizzle PostgreSQL schema
- `lib/db/src/seed.ts` — initial course catalog and availability flags
- `lib/api-spec/openapi.yaml` — source of truth for API types and generated hooks

## Architecture decisions

- Student passwords and sessions are managed by Clerk; PostgreSQL stores the app's student record and course catalog.
- Student and course API routes require a valid Clerk session token.
- Course availability is stored in PostgreSQL; only Elementary Principles of Electricity is enabled by the seed.

## Product

- Students can create or access an account using email/password with email verification or Google sign-in.
- Students can browse the course catalog; unavailable courses are labeled “Coming soon.”
- Elementary Principles of Electricity is the initial available course, designated for future model-training content.
- Course lessons, quizzes, progress tracking, and model-training workflows are not implemented yet.
