# AGENTS.md - QRky

## Quick Start
```bash
pnpm install
pnpm dev
```

Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ADMIN_KEY`

## Quality Gates (run before pushing)
```bash
pnpm lint
pnpm build
```

## Project-Specific Gotchas

1. **Supabase client**: Use `lib/server.ts` for server-side (cookies), `lib/browser.ts` for client-side
2. **QR generation**: Uses custom TypeScript port in `src/lib/qrcode/` - SVG rendering only, no canvas/PNG
3. **No test framework**: Manual testing via dev server
4. **Routes**: `/q/[id]` = QR redirects, `/u/[id]` = URL redirects, `/qr/[uuid]` = SVG generation

## Issue Tracking
Use **beads** exclusively via the `beads` skill. When defining tasks, use the `defining-tasks` skill.

## Session Completion (MANDATORY)
1. Run `pnpm lint && pnpm build`
2. Create issues for any follow-up work
3. Close/complete bd issues
4. Push:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   ```
   Must see "up to date with origin" in git status before ending.
