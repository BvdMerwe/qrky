# Product Guardrails + Generic Engineer Skill Design

**Date:** 2026-03-18  
**Status:** Draft - Awaiting Review

## Overview

Make the engineer skill generic and reusable across projects by separating:
1. **Generic skills** (global): `engineer`, `tech-lead`, `product-owner`
2. **Project guardrails** (local): `GUARDRAILS.md` or `.opencode/GUARDRAILS.md`

## GUARDRAILS.md Structure

Standardized file that provides project-specific context to all agents:

```markdown
# Project Guardrails - [Project Name]

## Tech Stack
- [ ] Framework: [e.g., Next.js 15, React 19]
- [ ] Language: [e.g., TypeScript 5]
- [ ] Database: [e.g., Supabase, PostgreSQL]
- [ ] Auth: [e.g., Supabase Auth, NextAuth]
- [ ] Testing: [e.g., Vitest, Jest]
- [ ] Styling: [e.g., Tailwind CSS, DaisyUI]
- [ ] Package Manager: [e.g., pnpm, npm, yarn]

## Quality Gates
```bash
# Run these before every commit
pnpm lint && pnpm test && pnpm build
```

## Key Commands
| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start development server |
| `pnpm test` | Run test suite |
| `pnpm build` | Production build |
| `pnpm lint` | Check code style |

## Key Files
| File | Purpose |
|------|---------|
| `/AGENTS.md` | Project conventions and workflow |
| `/README.md` | Project overview |
| `[path]` | [description] |

## Common Patterns

**[Pattern Name]:**
```[language]
[code example]
```

## Project-Specific Gotchas
1. [Important thing to know]
2. [Another important thing]

## Branch Strategy
- **main** - [description]
- **[branch]** - [description]

## Communication
- Task tracking: [beads/GitHub Issues/etc]
- Task ID prefix: [e.g., #proj-123]
```

## Agent Workflow with GUARDRAILS.md

### On Session Start:

1. **Check for GUARDRAILS.md:**
   ```bash
   if [ -f "GUARDRAILS.md" ]; then
     cat GUARDRAILS.md
   elif [ -f ".opencode/GUARDRAILS.md" ]; then
     cat .opencode/GUARDRAILS.md
   fi
   ```

2. **If file doesn't exist:**
   - Ask user: "No GUARDRAILS.md found. Should I create one?"
   - If yes: Interview user to fill it out
   - If no: Work with limited context

3. **Load project context:**
   - Read GUARDRAILS.md
   - Read AGENTS.md (if exists)
   - Now ready to work

## Engineer Skill Structure

**Generic Engineer Skill** (`~/.opencode/skills/engineer/SKILL.md`):

```markdown
# Engineer Agent

## Overview
You are an Engineer responsible for implementing tasks. You work at the end of a 3-tier hierarchy.

**Hierarchy:**
```
User Request → Product Owner → Tech Lead → Engineer (You)
```

**Core Principle:** Read GUARDRAILS.md first. All work follows project conventions.

## Session Start Protocol (CRITICAL)

**Step 1: Check for GUARDRAILS.md**
```bash
if [ -f "GUARDRAILS.md" ]; then
  echo "Found GUARDRAILS.md"
elif [ -f ".opencode/GUARDRAILS.md" ]; then
  echo "Found .opencode/GUARDRAILS.md"
else
  echo "No GUARDRAILS.md found"
fi
```

**Step 2: If not found, offer to create it**
```
No project guardrails file found. This helps me understand:
- Your tech stack and commands
- Project-specific patterns
- Quality gates to run

Should I create GUARDRAILS.md? (y/n)
```

**If user says yes:**
- Ask: "What tech stack are you using?"
- Ask: "What commands should I run for quality gates?"
- Ask: "Any project-specific patterns I should know?"
- Create the file

**Step 3: Read the file**
- Load project context
- Understand tech stack
- Know quality gates

## Generic Responsibilities

### 1. Quality Gates (Always Required)
**Before EVERY commit, run project quality gates from GUARDRAILS.md**

If GUARDRAILS.md specifies:
```bash
pnpm lint && pnpm test && pnpm build
```

Then that's what you run.

### 2. Communication
**All through task tracking system** (specified in GUARDRAILS.md)
- Report to Tech Lead via beads/GitHub/etc
- Use task IDs from GUARDRAILS.md format

### 3. Git Workflow (Generic)
**NEVER push directly to main.**

1. Start from main/develop branch
2. Create feature branch: `feature/[task-id]-description`
3. Work and run quality gates
4. Commit with conventional format: `type(scope): description (#[task-id])`
5. Push to origin
6. Create PR for human review

### 4. Testing Requirements
Every task must include (from GUARDRAILS.md):
- Unit tests
- Integration tests  
- Build validation
- Lint checks

## When GUARDRAILS.md is Missing

**Option 1: Create it** (Recommended for ongoing work)
- Ask user questions
- Write the file
- Follow it going forward

**Option 2: Work without it** (One-off tasks)
- Ask user for quality gates
- Ask user for tech stack
- Infer patterns from codebase

## Model Tier
**Engineer:** Cheap model
- Follows clear instructions
- Implements to spec
- Reports blockers

## Related Skills
- **product-owner**: Upstream - creates specs
- **tech-lead**: Upstream - assigns tasks, reviews work
- **beads**: Task tracking
```

## Implementation Plan

### Phase 1: Create Generic Skills
1. Create `~/.opencode/skills/engineer/SKILL.md` (generic version)
2. Keep `~/.opencode/skills/tech-lead/SKILL.md` (already generic enough)
3. Keep `~/.opencode/skills/product-owner/SKILL.md` (already generic enough)

### Phase 2: Update QRky Project
1. Create `GUARDRAILS.md` in QRky project root
2. Move QRky-specific content from old qrky-engineer skill
3. Update AGENTS.md to reference GUARDRAILS.md

### Phase 3: Update QRky Engineer Skill
1. Rename `qrky-engineer` to `engineer`
2. Make it check for GUARDRAILS.md on start
3. Add "create if missing" logic
4. Keep in `.opencode/skills/` (project-specific override possible)

## Benefits

1. **Reusability:** Same engineer skill works on any project
2. **Context:** GUARDRAILS.md gives project-specific knowledge
3. **Discoverability:** Skills auto-create guardrails if missing
4. **Flexibility:** Projects can customize without changing skills
5. **Onboarding:** New agents quickly understand the project

## Example Usage

**New project without GUARDRAILS.md:**
```
User: I need to add user authentication
Agent: No GUARDRAILS.md found. Should I create one to capture your project setup?
User: Yes
Agent: What tech stack? [...questions...]
Agent: [Creates GUARDRAILS.md]
Agent: Now I can implement authentication following your conventions
```

**Existing project with GUARDRAILS.md:**
```
User: I need to add user authentication
Agent: [Reads GUARDRAILS.md - sees Next.js + Supabase]
Agent: I see you're using Next.js with Supabase. I'll implement auth following your existing patterns.
```

---

**Next Steps:**
- Review this design
- Create the generic engineer skill
- Create GUARDRAILS.md for QRky project
- Test the workflow
