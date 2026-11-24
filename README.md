# STEM SmartStudy

STEM SmartStudy is a local-first Expo study application backed by a separate Express API and PostgreSQL database. It does not require Clerk, accounts, API keys, or any external authentication service.

## Repository structure

```
apps/
  api/                 Backend: Express API and PostgreSQL integration
  mobile/              Frontend: Expo Router application
  web-preview/         Optional Vite component-preview utility
packages/
  api-client-react/    Generated React Query client used by the mobile app
  api-spec/            OpenAPI contract and Orval generation config
  api-zod/             Generated runtime response schemas shared by the backend
  db/                  Drizzle PostgreSQL schema and seed script
```

The backend is contained in `apps/api`. The mobile app calls it through `EXPO_PUBLIC_API_URL`; shared API types are generated from `packages/api-spec/openapi.yaml`.

## Prerequisites

- Node.js 22 or newer
- pnpm 10 (`corepack enable`; then `corepack prepare pnpm@10.26.1 --activate`)
- PostgreSQL 15 or newer
- Expo Go, Android Emulator, or iOS Simulator

## First-time local setup

Run every command in this section from the **repository root** (`Expo-App-Replica/`).

1. Install workspace dependencies:

   ```powershell
   pnpm install
   ```

2. Create environment files:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/mobile/.env.example apps/mobile/.env
   ```

3. Edit `apps/api/.env` and set `DATABASE_URL`, for example:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stem_smartstudy
   ```

   Optionally set `CORS_ORIGIN=http://localhost:8081` when using Expo web.

4. Edit `apps/mobile/.env`. For an emulator or Expo web, keep:

   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3001
   ```

   For Expo Go on a physical phone, replace `localhost` with your computer’s LAN IP, for example `http://192.168.1.20:3001`.

5. Create the database schema and seed the course catalog plus the 200-question CEN 1103 bank:

   ```powershell
   pnpm --filter @stem-smartstudy/db push
   pnpm --filter @stem-smartstudy/db seed
   ```

## Run with Expo Go

Open two PowerShell terminals. Run both commands from the **repository root**.

**Terminal 1 — backend (`apps/api`)**

```powershell
pnpm dev:backend
```

The backend listens on `http://localhost:3001` and exposes:

- `GET /api/healthz`
- `GET /api/courses`
- `GET /api/courses/elementary-principles-of-electricity/questions?limit=10`
- `POST /api/learning/responses` — records anonymous quiz responses
- `GET /api/learning/topic-difficulty` — ranks topics by aggregate accuracy

Verify it is running:

```powershell
Invoke-RestMethod http://localhost:3001/api/healthz
```

**Terminal 2 — mobile frontend (`apps/mobile`)**

```powershell
pnpm dev:mobile:go
```

This starts Expo Go and clears its cache. Scan the QR code using the current Expo Go app. No sign-in is required; the app opens directly to the study dashboard.

## Development commands

All commands in this table run from the **repository root** unless stated otherwise.

| Command | Runs in | Purpose |
| --- | --- | --- |
| `pnpm dev:backend` | `apps/api` | Start the Express backend with file watching. |
| `pnpm dev:mobile` | `apps/mobile` | Start Expo for the mobile frontend. |
| `pnpm dev:mobile:go` | `apps/mobile` | Start Expo Go and clear its development cache. |
| `pnpm dev:web-preview` | `apps/web-preview` | Start the optional Vite preview tool. |
| `pnpm --filter @stem-smartstudy/db push` | `packages/db` | Apply the Drizzle schema to `DATABASE_URL`. |
| `pnpm --filter @stem-smartstudy/db seed` | `packages/db` | Seed or refresh the course catalogue. |
| `pnpm --filter @stem-smartstudy/api-spec codegen` | `packages/api-spec` | Regenerate client and Zod types from the OpenAPI contract. |
| `pnpm typecheck` | entire workspace | Type-check applications and shared packages. |
| `pnpm build` | entire workspace | Run type checks and production builds. |

## Production backend build

Run from the **repository root**:

```powershell
pnpm --filter @stem-smartstudy/api build
pnpm --filter @stem-smartstudy/api start
```

`apps/api/.env` must be present when starting the backend. Build output is generated in `apps/api/dist/` and ignored by Git.

## API contract workflow

1. Update `packages/api-spec/openapi.yaml`.
2. From the repository root, run `pnpm --filter @stem-smartstudy/api-spec codegen`.
3. Implement matching routes in `apps/api/src/routes/`.
4. Run `pnpm typecheck` before committing.

## Notes

- `.env` files are ignored by Git. Only `.env.example` templates are committed.
- The study dashboard currently stores no personal account data and requires no sign-in.
- The adaptive learning model is an explainable topic-difficulty model: it uses anonymous response correctness, confidence, and response time to identify topics with the lowest aggregate accuracy. It does not train or retain personal profiles.
- If the mobile app shows “The course catalog is unavailable,” ensure `apps/api/.env` exists with a valid `DATABASE_URL`, run the two database commands above, then start `pnpm dev:backend`. On a physical phone, use your computer's LAN IP in `apps/mobile/.env`, not `localhost`.
- Restrict `CORS_ORIGIN` for browser deployments.
