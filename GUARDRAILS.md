# Project Guardrails - QRky

## Tech Stack
- Framework: Next.js 15 + React 19
- Language: TypeScript 5
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth
- Testing: Vitest
- Styling: Tailwind CSS + DaisyUI
- Package Manager: pnpm

## Quality Gates
```bash
# Run these before EVERY commit
pnpm lint && pnpm test && pnpm build
```

**All checks must pass. No exceptions.**

Current baseline: 96.59% statements, 95.23% branches, 100% functions

## Key Commands
| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start development server |
| `pnpm test` | Run test suite (174 tests) |
| `pnpm test:coverage` | Generate coverage report |
| `pnpm build` | Production build |
| `pnpm lint` | Check code style |

## Key Files
| File | Purpose |
|------|---------|
| `/AGENTS.md` | **READ THIS FIRST** - Project conventions and workflow |
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

## Testing Strategy (3-Layer)

1. **Unit tests** (`pnpm test`): Vitest for logic/functions
2. **Build validation** (`pnpm build`): Catches Server/Client serialization errors
3. **Component integration tests**: Page rendering with mocked data

**Always run all three before pushing.** Build catches what unit tests miss.

## Project-Specific Gotchas

1. **Supabase client**: Use `lib/server.ts` for server-side (cookies), `lib/browser.ts` for client-side
2. **QR generation**: Uses custom TypeScript port in `src/lib/qrcode/` - SVG rendering only, no canvas/PNG
3. **Server/Client boundary**: Never pass JSX from Server → Client Components. Extract to Client Components with "use client"
4. **Validation**: Always validate user input before database operations
5. **Branch strategy**: Never push to main. Always use `mvp-completion` as integration branch

## Branch Strategy
- **main** - Production-ready, protected (requires PR)
- **mvp-completion** - Integration branch for feature work (start here)
- **feature/** - Individual feature branches (where you work)

## Communication
- Task tracking: **beads** (via beads skill)
- Task ID prefix: `qrky-[id]`
- **ALWAYS use** `BD_ACTOR="[Your Name]"` prefix for all bead commands

## Emergency Contacts
- **Tech Lead**: Report blockers, ask technical questions
- **Production incidents**: Create P0 task immediately

## Session Checklist

When starting work:
1. ✓ Read AGENTS.md
2. ✓ Read this GUARDRAILS.md
3. ✓ Run `pnpm install`
4. ✓ Verify `pnpm test` passes
5. ✓ Check `BD_ACTOR="[Your Name]" bd ready` for available work
