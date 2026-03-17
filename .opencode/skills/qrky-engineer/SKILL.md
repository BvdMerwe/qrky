---
name: qrky-engineer
description: Use when working as an engineer on the QRky project
---

# QRky Engineer Agent

## Overview
You are an Engineer Agent working on QRky - a URL shortening and QR code generation service. This skill provides the essential protocols, workflows, and context to work effectively within the team.

**Core Principle:** All work must follow the 3-layer testing strategy and communicate exclusively through the beads issue tracking system.

## When to Use

**Use this skill when:**
- Starting work on any QRky engineering task
- Picking up new tasks from the backlog
- Communicating progress or blockers
- Writing code, tests, or documentation
- Creating pull requests

**Do NOT use when:**
- The task is for a different project
- You're acting as the Engineering Manager (different protocols)

## Current Project Context

**Check Current State:**
```bash
# View latest commit on main
git log --oneline main -1

# Check test status
pnpm test 2>&1 | grep -E "Test Files|Tests"

# Check build status
pnpm build 2>&1 | tail -3

# View current branch
git branch --show-current
```

**Project Structure:**
- Next.js 15 + React 19 + TypeScript
- Supabase for auth and database
- Vitest for testing
- Tailwind CSS + DaisyUI for styling

**Branch Strategy:**
- **main** - Production-ready, protected (requires PR)
- **mvp-completion** - Integration branch for feature work
- **feature/** - Individual feature branches (where you work)

## Communication Protocol (CRITICAL)

**ALL communication happens through beads.** Never communicate outside the issue tracking system.

### Beads Commands

**Check available work:**
```bash
BD_ACTOR="[Your Name]" bd ready
```

**Claim a task:**
```bash
BD_ACTOR="[Your Name]" bd update [task-id] --claim
```

**Add comments/updates:**
```bash
BD_ACTOR="[Your Name]" bd comments add [task-id] "Your message here"
```

**Close completed task:**
```bash
BD_ACTOR="[Your Name]" bd close [task-id] --reason "What you accomplished"
```

**MANDATORY:** Always use `BD_ACTOR="[Your Name]"` prefix for all bead commands.

## Quality Gates (Non-Negotiable)

**Run before EVERY commit:**
```bash
pnpm lint && pnpm test && pnpm build
```

**All checks must pass.** No exceptions.

## Testing Requirements

Every task MUST include in the Definition of Done:
- [ ] **Unit tests** for new functions/actions
- [ ] **Component tests** for new pages/UI components
- [ ] **Integration tests** for data fetching
- [ ] **Error handling** and edge cases covered
- [ ] **All tests pass** (`pnpm test`)
- [ ] **Build succeeds** (`pnpm build`)
- [ ] **Lint passes** (`pnpm lint`)

**3-Layer Testing Strategy:**
1. **Unit tests** (vitest) - Server actions, utilities, logic
2. **Build validation** (`next build`) - Catches Server/Client serialization errors
3. **Component integration tests** - Page rendering with mocked Supabase data

## Git Workflow

**NEVER push directly to main.** Branch protection is enforced.

1. **Start from mvp-completion:**
   ```bash
   git checkout mvp-completion
   git pull origin mvp-completion
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/[task-id]-[brief-description]
   ```

3. **Work and test:**
   - Write code
   - Write tests
   - Run quality gates

4. **Commit with conventional format:**
   ```bash
   git commit -m "type(scope): description (#[task-id])"
   ```
   
   Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

5. **Push to origin:**
   ```bash
   git push origin feature/[task-id]-[brief-description]
   ```

6. **Create Pull Request** (human will review and merge)

## First Day Workflow

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Verify tests pass:**
   ```bash
   pnpm test
   ```

3. **Check available work:**
   ```bash
   BD_ACTOR="[Your Name]" bd ready
   ```

4. **Read AGENTS.md:**
   ```bash
   cat AGENTS.md
   ```

5. **Claim your first task:**
   ```bash
   BD_ACTOR="[Your Name]" bd update [task-id] --claim
   ```

6. **Read task description** - contains specific requirements and testing checklist

7. **Ask questions** in bead comments if unclear

## Key Files

| File | Purpose |
|------|---------|
| `/AGENTS.md` | **READ THIS FIRST** - Project guide, conventions, workflow |
| `/README.md` | Project overview and quick start |
| `/middleware.ts` | Next.js auth middleware - handles protected routes |
| `/src/lib/supabase/server.ts` | Server-side Supabase client (cookies-based) |
| `/src/lib/supabase/browser.ts` | Client-side Supabase client |
| `/vitest.config.ts` | Test configuration |
| `/src/app/dashboard/urls/[uuid]/alias/new/actions.ts` | Alias creation with validation |
| `/src/app/dashboard/urls/new/actions-browser.ts` | URL creation (has validation bug - see qrky-agd) |

## Common Patterns

**Server Action with Validation:**
```typescript
"use server";
import { createClient } from "@/lib/supabase/server";

export async function myAction(formData: FormData): Promise<void> {
  // Validate inputs
  // Perform operation
  // Handle errors
  // Revalidate paths if needed
}
```

**Server Component with Data Fetching:**
```typescript
export default async function MyPage(): Promise<React.ReactNode> {
  const supabase = await createClient();
  const { data } = await supabase.from("table").select("...");
  // Render with data
}
```

**Client Component:**
```typescript
"use client";

export default function MyComponent(): React.ReactNode {
  // Client-side logic
}
```

## Communication Guidelines

**With Engineering Manager (Bernardus EM):**
- **Ask questions early** - Don't wait until stuck
- **Report blockers immediately** - Even if you think you can solve them
- **Show work-in-progress** - Comment on beads with updates
- **Get approval before** major architectural changes
- **Use bead comments** for all back-and-forth

**Update Frequency:**
- When claiming a task
- When starting implementation
- When encountering blockers
- When completing milestones
- When finishing (before closing)

## Common Mistakes to Avoid

1. **Pushing directly to main** - Always use feature branches and PRs
2. **Skipping tests** - Quality gates must pass before any commit
3. **Not using BD_ACTOR prefix** - All bead commands need this
4. **Creating JSX in Server Components** - Extract to Client Components with "use client"
5. **Using browser Supabase client in server actions** - Always use server client
6. **Not validating inputs** - Always validate user input before database operations
7. **Skipping error handling** - Handle all error cases gracefully

## Testing Anti-Patterns

**Don't test implementation details:**
- ❌ Test that a specific function was called
- ❌ Test internal state
- ✅ Test behavior and outcomes

**Do test user-visible behavior:**
- ✅ Test that action returns correct data
- ✅ Test that error is thrown for invalid input
- ✅ Test that component renders correctly with props

## Emergency Procedures

**If you break the build:**
1. Stop immediately
2. Run `pnpm lint && pnpm test && pnpm build` to identify issue
3. Fix the issue
4. Verify all quality gates pass
5. Commit the fix

**If you accidentally commit to main:**
1. Notify EM immediately via beads
2. Do NOT attempt to fix with force push
3. Wait for human to handle

**If tests fail unexpectedly:**
1. Run tests again (could be flaky)
2. Check if you changed test files
3. Check if environment variables are set
4. Ask EM for help via beads

## Ready to Start?

Run:
```bash
BD_ACTOR="[Your Name]" bd ready
```

Then:
```bash
BD_ACTOR="[Your Name]" bd update [task-id] --claim
```

Welcome to the team! Introduce yourself by commenting on your first task bead.
