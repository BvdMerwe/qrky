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
pnpm test
pnpm build
```

## Test Coverage
```bash
pnpm test:coverage    # Generate coverage report (HTML + JSON + terminal)
```

Current baseline: 96.59% statements, 95.23% branches, 100% functions

## Project-Specific Gotchas

1. **Supabase client**: Use `lib/server.ts` for server-side (cookies), `lib/browser.ts` for client-side
2. **QR generation**: Uses custom TypeScript port in `src/lib/qrcode/` - SVG rendering only, no canvas/PNG
3. **Tests**: Vitest with 153 tests (run with `pnpm test`)
4. **Testing Strategy (3-Layer):**
   - **Unit tests** (`pnpm test`): Vitest tests for logic/functions (157 tests)
   - **Build validation** (`pnpm build`): Catches Server/Client serialization errors, prerender issues
   - **Component integration** (page.test.tsx): Tests page rendering with mocked data
   
   Always run all three before pushing. Build catches what unit tests miss (e.g., passing JSX from Server → Client Components).

## Issue Tracking
Use **beads** exclusively via the `beads` skill. When defining tasks, use the `defining-tasks` skill.

## Session Completion (MANDATORY)
1. Run `pnpm lint && pnpm test && pnpm build`
2. Create issues for any follow-up work
3. Close/complete bd issues and add a comment.
4. Commit the changes according to the commit conventions.
5. Push:
   ```bash
   git pull --rebase
   git push
   ```
   Must see "up to date with origin" in git status before ending.

## Commit Conventions
- Use [Conventional Commits](https://www.conventionalcommits.org/) format: `<type>(<scope>): <description>`
- Always include issue reference (e.g., "fix(login): remove password validation (#qrky-nw8)")
- Types: `fix`, `feat`, `docs`, `style`, `refactor`, `test`, `chore`
- Keep subject line under 72 characters
- NEVER commit to main. Always work on the current branch. If the current branch is main, branch off.
