---
name: Scoped mobile dependency installs
description: Installing an Expo workspace when unrelated package downloads block the full install
---

If a full pnpm workspace install is blocked by an unrelated package fetch, filter installation to `@workspace/mobile...` and use `--frozen-lockfile` to install the Expo app and its local dependencies without changing package versions.

**Why:** The full workspace install received a 403 fetching the separate Vite dependency, while the filtered mobile install succeeded with locked packages and restored Expo.

**How to apply:** When restoring the mobile artifact in a similar environment, install the mobile package and its dependency closure first; install unrelated workspace packages only if those artifacts are also needed.
