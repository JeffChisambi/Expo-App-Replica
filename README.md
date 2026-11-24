# STEM SmartStudy

STEM SmartStudy is a local-first Expo mobile application with an Express API, PostgreSQL database, and shared TypeScript packages. It has no Replit runtime requirements.

## Project layout

```
apps/
  api/               Express API (port 3001 by default)
  mobile/            Expo Router application
  web-preview/       Standalone Vite component-preview utility
packages/
  api-client-react/  Generated API hooks and fetch client
  api-spec/          OpenAPI source and code-generation config
  api-zod/           Shared API schemas
  db/                Drizzle schema and seed script
```

## Requirements

- Node.js 22 or newer
- pnpm 10 (`corepack enable` then `corepack prepare pnpm@10.26.1 --activate`)
- PostgreSQL 15 or newer
- A Clerk application for sign-in and protected API routes
- Expo Go on a physical device, or an Android/iOS simulator

## Start locally

1. Install dependencies from the repository root:

   ```powershell
   pnpm install
   ```

2. Create local environment files and enter your credentials:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/mobile/.env.example apps/mobile/.env
   ```

   Set `DATABASE_URL` in `apps/api/.env`. Add the Clerk publishable key to both environment files and the secret key to `apps/api/.env`.

3. Create the database schema and seed the course catalogue:

   ```powershell
   pnpm --filter @stem-smartstudy/db push
   pnpm --filter @stem-smartstudy/db seed
   ```

4. In one terminal, start the API:

   ```powershell
   pnpm dev:api
   ```

   Verify it at `http://localhost:3001/api/healthz`.

5. In a second terminal, start Expo:

   ```powershell
   pnpm dev:mobile
   ```

   Use Expo's terminal menu to open an Android emulator, iOS simulator, or Expo Go. For a physical device, replace `EXPO_PUBLIC_API_URL` with your computer's LAN address, for example `http://192.168.1.20:3001`.

## Other commands

```powershell
pnpm typecheck
pnpm build
pnpm dev:web-preview
pnpm --filter @stem-smartstudy/api-spec codegen
```

## Notes

- Environment files are intentionally ignored by Git; `.env.example` files are safe templates.
- The API defaults to port `3001`, while the web preview defaults to `5173`. Override either with `PORT`.
- The mobile app needs a Clerk publishable key to render authentication screens. The API and database need their matching values before protected routes can work.
