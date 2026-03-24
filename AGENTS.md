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

<!-- BEGIN BEADS INTEGRATION v:1 profile:full hash:d4f96305 -->
## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Dolt-powered version control with native sync
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" --description="Detailed context" -t bug|feature|task -p 0-4 --json
bd create "Issue title" --description="What this issue is about" -p 1 --deps discovered-from:bd-123 --json
```

**Claim and update:**

```bash
bd update <id> --claim --json
bd update bd-42 --priority 1 --json
```

**Complete work:**

```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task atomically**: `bd update <id> --claim`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Auto-Sync

bd automatically syncs via Dolt:

- Each write auto-commits to Dolt history
- Use `bd dolt push`/`bd dolt pull` for remote sync
- No manual export/import needed!

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md and docs/QUICKSTART.md.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

<!-- END BEADS INTEGRATION -->
