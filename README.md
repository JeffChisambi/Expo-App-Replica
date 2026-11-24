# STEM SmartStudy

STEM SmartStudy is an Expo mobile application backed by a separate Express API and PostgreSQL database. It runs locally with pnpm; Replit is not required.

## Repository structure

```
apps/
  api/                 Backend: Express, Clerk authentication, API routes
  mobile/              Frontend: Expo Router mobile application
  web-preview/         Optional Vite component-preview utility
packages/
  api-client-react/    Generated React Query client used by the mobile app
  api-spec/            OpenAPI contract and Orval generation config
  api-zod/             Generated runtime response schemas shared by the backend
  db/                  Drizzle PostgreSQL schema and seed script
```

The backend lives exclusively in `apps/api`. The mobile app calls it through `EXPO_PUBLIC_API_URL`; shared API types are generated from `packages/api-spec/openapi.yaml`.

## Prerequisites

- Node.js 22 or newer
- pnpm 10 (`corepack enable`; then `corepack prepare pnpm@10.26.1 --activate`)
- PostgreSQL 15 or newer
- A Clerk application for sign-in and protected API routes
- Expo Go, Android Emulator, or iOS Simulator to run the mobile app

## First-time local setup

Run every command in this section from the **repository root** (`Expo-App-Replica/`).

1. Install workspace dependencies:

   ```powershell
   pnpm install
   ```

2. Create the local environment files:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/mobile/.env.example apps/mobile/.env
   ```

3. Edit `apps/api/.env`:

   - Set `DATABASE_URL` to your local PostgreSQL database, for example `postgresql://postgres:postgres@localhost:5432/stem_smartstudy`.
   - Set `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from your Clerk application.
   - Optionally set `CORS_ORIGIN` when using the Expo web client (for example `http://localhost:8081`).

4. Edit `apps/mobile/.env` and set the same Clerk publishable key. Keep `EXPO_PUBLIC_API_URL=http://localhost:3001` for an emulator or Expo web. For a physical phone, replace `localhost` with your computer’s LAN IP, for example `http://192.168.1.20:3001`.

5. Create the schema and seed courses:

   ```powershell
   pnpm --filter @stem-smartstudy/db push
   pnpm --filter @stem-smartstudy/db seed
   ```

## Run the integrated application

Open two PowerShell terminals. Both commands below run from the **repository root**.

**Terminal 1 — backend (`apps/api`)**

```powershell
pnpm dev:backend
```

The backend loads `apps/api/.env`, listens on `http://localhost:3001`, and exposes:

- `GET /api/healthz` — no authentication required
- `GET /api/students/me` — requires a Clerk bearer token
- `GET /api/courses` — requires a Clerk bearer token

Confirm the backend is running:

```powershell
Invoke-RestMethod http://localhost:3001/api/healthz
```

**Terminal 2 — mobile frontend (`apps/mobile`)**

```powershell
pnpm dev:mobile:go
```

This command starts Expo Go and clears its cache. Scan the QR code with the current Expo Go app. Sign in through Clerk; the mobile app automatically passes the session token to the backend and loads the student profile and course catalogue.

If Expo displays **“Clerk setup required”**, `apps/mobile/.env` is missing or still contains the placeholder key. Add the real `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from Clerk Dashboard > Developers > API Keys, stop Expo, and run `pnpm dev:mobile:go` again.

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

Run these commands from the **repository root**:

```powershell
pnpm --filter @stem-smartstudy/api build
pnpm --filter @stem-smartstudy/api start
```

`apps/api/.env` must be present when starting the backend. Build output is generated in `apps/api/dist/` and is ignored by Git.

## API contract workflow

1. Update `packages/api-spec/openapi.yaml`.
2. From the repository root, run `pnpm --filter @stem-smartstudy/api-spec codegen`.
3. Implement matching routes in `apps/api/src/routes/`.
4. Run `pnpm typecheck` before committing.

## Security and environment notes

- `.env` files are ignored by Git. Only the `.env.example` templates are committed.
- Never place Clerk secret keys in `apps/mobile/.env`; only `EXPO_PUBLIC_` values are visible to the mobile application.
- The backend accepts authenticated mobile requests using Clerk bearer tokens. Restrict `CORS_ORIGIN` for browser deployments.
- If Expo Go reports a missing native module, update Expo Go from the App Store or Play Store, then restart with `pnpm dev:mobile:go`. The project’s Expo dependencies are validated with `expo install --check`.
