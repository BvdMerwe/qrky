---
name: qrky-engineer
description: Use when working as an engineer on the QRky project. Uses generic engineer skill with QRky GUARDRAILS.md.
---

# QRky Engineer Agent

## Quick Reference

This skill uses the generic **engineer** skill with QRky-specific guardrails.

**Project:** QRky - URL shortening and QR code generation service

## Session Start

**Step 1: GUARDRAILS.md exists for this project**

```bash
cat GUARDRAILS.md
```

This file contains all QRky-specific:
- Tech stack (Next.js 15, Supabase, etc.)
- Quality gates (`pnpm lint && pnpm test && pnpm build`)
- Key files and patterns
- QR-specific gotchas

**Step 2: Read AGENTS.md**

```bash
cat AGENTS.md
```

Contains workflow details and conventions.

**Step 3: Use generic engineer protocols**

Follow the **engineer** skill for:
- Quality gates (from GUARDRAILS.md)
- Git workflow
- Testing requirements
- Communication with Tech Lead
- Common mistakes to avoid
- Emergency procedures

## QRky-Specific Context

From GUARDRAILS.md:
- **Tech:** Next.js 15 + React 19 + TypeScript + Supabase
- **Tests:** Vitest (174 tests currently passing)
- **Quality Gates:** `pnpm lint && pnpm test && pnpm build`
- **Task Tracking:** beads (always use `BD_ACTOR="[Your Name]"`)
- **Integration Branch:** `mvp-completion` (not main)
- **Key Gotcha:** Supabase server vs browser clients

## Getting Started

1. **Verify setup:**
   ```bash
   pnpm install
   pnpm test
   ```

2. **Check for work:**
   ```bash
   BD_ACTOR="[Your Name]" bd ready
   ```

3. **Claim task:**
   ```bash
   BD_ACTOR="[Your Name]" bd update [task-id] --claim
   ```

4. **Follow engineer skill** for implementation

## Related Skills

- **engineer** - Base skill with all protocols (REFER TO THIS)
- **product-owner** - Upstream, creates specs
- **tech-lead** - Upstream, assigns and reviews work
- **beads** - Task tracking system

## Key Files

See GUARDRAILS.md for:
- `/AGENTS.md` - Project conventions
- `/src/lib/supabase/server.ts` - Server client
- `/src/lib/supabase/browser.ts` - Browser client
- All other key files and patterns

---

**Note:** This is a lightweight project marker. All actual protocols are in the **engineer** skill. GUARDRAILS.md provides the QRky-specific context that the engineer skill needs.
