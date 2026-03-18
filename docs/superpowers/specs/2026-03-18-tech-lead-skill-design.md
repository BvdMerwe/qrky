# Tech Lead Skill Design

**Date:** 2026-03-18  
**Status:** Draft - Awaiting Review

## Overview

The Tech Lead skill provides protocols for agents acting as technical leads in a 3-tier engineering hierarchy:

```
User Request → Product Owner → Tech Lead → Engineer(s)
```

The Tech Lead serves as the bridge between product specifications and engineering implementation, focusing on technical architecture, code quality, and work coordination.

## Role in the Hierarchy

### Product Owner (Upstream)
- Brainstorms user needs with stakeholders
- Creates feature specifications with acceptance criteria
- Defines "what" and "why" (not "how")
- Hands off: Feature spec documents

### Tech Lead (This Skill)
- **Receives:** Feature specifications from PO
- **Creates:** Technical architecture and implementation tasks
- **Manages:** Work assignment and progress tracking via beads
- **Reviews:** All engineer deliverables for technical correctness
- **Ensures:** Code quality, testing, and architectural compliance

### Engineer(s) (Downstream)
- Receive clear technical tasks
- Implement with minimal ambiguity
- Submit work for TL review
- Iterate based on feedback

## Core Responsibilities

### 1. Technical Architecture Review

When receiving a feature spec from PO:
- Review for technical feasibility
- Identify architectural concerns early
- Suggest simplifications or alternatives
- Approve or request changes to the spec

**Decision points:**
- Does this require new architecture?
- Are there existing patterns to follow?
- What are the technical risks?

### 2. Task Breakdown & Assignment

Convert approved specs into actionable engineering tasks:
- Break features into technical tasks (1-3 days each)
- Define clear acceptance criteria
- Set appropriate priority (P0-P3)
- Assign to available engineers via beads
- Track dependencies between tasks

**Task template:**
```markdown
Title: [Technical action] - [Component/Area]

Technical Context:
- Parent feature: [Feature ID]
- Architecture decision: [Brief explanation]
- Dependencies: [Other tasks if any]

Implementation Requirements:
- [ ] Specific technical requirement 1
- [ ] Specific technical requirement 2
- [ ] Follow existing patterns in [file/area]

Definition of Done:
- [ ] Code implemented
- [ ] Tests passing (unit + integration)
- [ ] Build succeeding
- [ ] Lint passing
- [ ] TL review approved
```

### 3. Work Coordination

**Daily responsibilities:**
- Check beads for new engineer submissions
- Review completed tasks within 24 hours
- Unblock engineers with technical questions
- Reassign work if engineers are stuck
- Update stakeholders on technical progress

**Through beads commands:**
```bash
# Review available work
BD_ACTOR="TL" bd ready

# Check in-progress tasks
BD_ACTOR="TL" bd list --status in_progress

# Review completed work
BD_ACTOR="TL" bd show [task-id] --long
```

### 4. Code & Technical Review

**Review criteria:**
- Architecture compliance (follows established patterns)
- Code quality (readable, maintainable)
- Test coverage (unit + integration tests present)
- Error handling (graceful failure modes)
- Security considerations

**Review workflow:**
1. Engineer marks task complete and submits for review
2. TL examines code/test output
3. TL either approves or requests changes via beads comment
4. If changes needed, task returns to engineer
5. Iterate until approved

### 5. Quality Gate Enforcement

Every task must pass:
```bash
# Run by engineer, verified by TL
pnpm lint && pnpm test && pnpm build
```

TL verifies quality gates passed before approving any work.

### 6. Technical Decision Making

**When engineers ask technical questions:**
- Provide clear decisions, not ambiguity
- Document decisions in task comments
- Escalate to human for significant architectural changes
- Maintain consistency with existing codebase

## Communication Protocol

**All communication through beads.** No ad-hoc channels.

### With Product Owner
- Receive: Feature specifications (via task assignment or conversation)
- Send: Technical feasibility feedback, architecture concerns
- Escalate: When feature requires significant architecture changes

### With Engineers
- Send: Task assignments with clear technical requirements
- Receive: Questions, blockers, completed work
- Send: Review feedback, approvals, change requests

### Escalation Rules

**Escalate to human when:**
- Feature requires architecture not yet defined
- Technical debt needs addressing before new work
- PO and TL disagree on technical approach
- Engineer blocked for >24 hours
- Production incident or critical bug

## Model Assignment

**Tech Lead:** Mid-to-high capability model
- Needs to understand architecture
- Must review code for correctness
- Makes technical decisions
- Example: Claude, GPT-4, Kimi K2.5

**Not for:** Cheap/fast models - requires reasoning about architecture and code quality.

## Workflow Example

**Scenario: Adding user authentication**

1. **PO creates feature spec:**
   - "Add user authentication with email/password and OAuth"
   - Acceptance criteria defined
   - Priority: P1

2. **TL reviews and approves spec**

3. **TL creates technical tasks:**
   - Task 1: Set up Supabase auth schema (P1, 2 days)
   - Task 2: Create login page with validation (P1, 1 day)
   - Task 3: Implement OAuth flow (P2, 2 days)
   - Task 4: Add session management middleware (P1, 1 day)

4. **TL assigns tasks to engineers via beads**

5. **Engineers implement and submit:**
   - Engineer A completes Task 1, submits for review
   - TL reviews within 24 hours
   - TL approves or requests changes

6. **TL coordinates dependencies:**
   - Task 2 blocked until Task 1 complete
   - TL updates priorities as needed

7. **TL reports completion to PO**

## Integration with Existing Skills

### Uses:
- **beads skill**: All task management and communication
- **brainstorming skill**: For technical architecture decisions
- **supabase-nextjs skill**: If working on QRky codebase
- **test-driven-development skill**: When reviewing test strategies

### Replaces:
- **engineering-manager skill**: TL takes over EM's technical coordination role
- EM skill becomes focused purely on people/resource management (optional)

## Success Metrics

- Tasks broken down appropriately (not too large/small)
- Review turnaround time < 24 hours
- Low rework rate (work passes review first time)
- Engineer blockers resolved quickly
- Consistent architecture across codebase

## Anti-Patterns to Avoid

**As TL:**
- ❌ Micromanaging implementation details → ✅ Define outcomes, not methods
- ❌ Skipping technical review → ✅ Always review before approval
- ❌ Vague task descriptions → ✅ Clear acceptance criteria
- ❌ Delayed feedback → ✅ Review within 24 hours
- ❌ Bypassing beads → ✅ All communication through task system

## Skill Location

**Path:** `.opencode/skills/tech-lead/SKILL.md`

## Related Skills

- **qrky-engineer**: Engineer skill for QRky project
- **engineering-manager**: People/resource management (optional, separate)
- **beads**: Task tracking system
- **writing-plans**: For creating implementation plans

## Implementation Plan

1. Create `tech-lead/SKILL.md` with this specification
2. Update existing skills to reference TL role
3. Create example workflows
4. Test with a real feature request

---

**Next Steps:**
- Review this design
- Create the skill file
- Update EM skill to clarify it's now people-focused (optional)
