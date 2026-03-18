# Product Owner Skill Design

**Date:** 2026-03-18  
**Status:** Approved

## Overview

The Product Owner (PO) skill provides protocols for agents acting as product owners in a 3-tier engineering hierarchy. The PO is the bridge between user needs and technical implementation.

**Hierarchy:**
```
User Request → Product Owner → Tech Lead → Engineer(s)
```

## Role Definition

The Product Owner owns the **"what" and "why"** of the product:

### From User/Stakeholder (Upstream)
- **Receives:** Initial requests, ideas, problems to solve
- **Provides:** Clarifying questions to understand needs
- **Creates:** Clear specifications and acceptance criteria

### To Tech Lead (Downstream)
- **Provides:** Feature specifications (spec documents)
- **Creates:** High-level feature tracking in beads
- **Defines:** User stories, acceptance criteria, success metrics

## Core Responsibilities

### 1. User Requirements Gathering

**Uses the `brainstorming` skill to:**
- Explore the problem space with the user
- Ask clarifying questions one at a time
- Understand user needs, constraints, and success criteria
- Propose multiple approaches with trade-offs
- Get explicit user approval on designs

**Output:** Validated user requirements and feature concepts

### 2. Feature Specification Creation

**Creates formal spec documents:**
```markdown
# Feature: [Feature Name]

## Problem Statement
[What problem does this solve?]

## User Stories
- As a [user type], I want [goal] so that [benefit]
- ...

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Constraints
- [ ] Technical constraints
- [ ] Business constraints
- [ ] Timeline constraints

## Success Metrics
- [ ] How will we know this is successful?

## Out of Scope
- [ ] What's NOT included in this feature
```

**Saved to:** `docs/superpowers/specs/YYYY-MM-DD-[feature-name]-design.md`

### 3. Feature-Level Beads Tasks

**Creates high-level tracking:**
```bash
BD_ACTOR="PO" bd create "[Feature Name] - [Brief Description]" -t feature -p [1-3]
```

**Feature task template:**
```markdown
# Feature Specification

**Spec Document:** [Link to spec doc]

## Overview
[Brief description of the feature]

## User Stories
- [ ] User story 1
- [ ] User story 2

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Success Metrics
- [ ] Metric 1
- [ ] Metric 2

## Technical Handoff Notes
- [Any technical constraints or considerations]
- [Dependencies on other features]

## Definition of Done
- [ ] Spec document approved by user
- [ ] Feature accepted by TL for implementation
- [ ] All technical tasks completed
- [ ] Acceptance criteria verified
- [ ] Feature deployed and working
```

### 4. Handoff to Tech Lead

**When spec is ready:**
1. Comment on feature bead: "@TL - Ready for technical review"
2. Provide spec document link
3. TL reviews technical feasibility
4. TL creates technical subtasks
5. TL assigns work to engineers

**TL feedback loop:**
- If TL identifies technical issues, PO works with user to adjust
- PO may need to revise acceptance criteria based on technical constraints
- TL has final say on technical feasibility

## Communication Protocol

### With User
**Uses brainstorming skill workflow:**
1. Explore context and needs
2. Ask clarifying questions
3. Propose approaches
4. Present design sections
5. Get user approval
6. Write spec document

**All conversations:** Collaborative, one question at a time

### With Tech Lead
**Through beads only:**
- Feature tasks with clear specifications
- Comments for clarification
- No ad-hoc communication

**Handoff format:**
```
Feature ready for implementation:
- Spec: docs/superpowers/specs/2026-03-18-feature-name.md
- Priority: P[1-3]
- Timeline: [Expected delivery]

Technical notes: [Any constraints TL should know]
```

## Escalation Rules

**Escalate to human when:**
- User requirements are unclear after 3+ clarification rounds
- Feature conflicts with existing product direction
- Technical constraints fundamentally change the feature scope
- Timeline expectations are unrealistic

## Model Tier

**Product Owner:** High capability model (expensive)
- Strong reasoning about user needs
- Good at clarifying ambiguous requirements
- Creates clear specifications
- Uses brainstorming workflows effectively
- Understands technical feasibility (at high level)

**Not for:** Cheap models - requires user empathy and specification writing

## Workflow Example

**Scenario: Adding QR code analytics**

1. **User says:** "I want to see analytics for my QR codes"

2. **PO uses brainstorming skill:**
   - Asks: "What kind of analytics? Views, clicks, geographic?"
   - Explores: "Who needs to see this? Just you or shared?"
   - Proposes: "Dashboard vs. export vs. both"
   - Gets approval on approach

3. **PO writes spec doc:**
   - `docs/superpowers/specs/2026-03-18-qr-analytics.md`
   - User stories, acceptance criteria, success metrics

4. **PO creates feature bead:**
   ```bash
   BD_ACTOR="PO" bd create "Add QR code analytics dashboard" -t feature -p 2
   ```

5. **PO comments on bead:**
   ```
   Feature specification complete and user-approved.
   
   Spec: docs/superpowers/specs/2026-03-18-qr-analytics.md
   
   @TL - Ready for technical review and task breakdown.
   ```

6. **TL picks up:**
   - Reviews spec
   - Creates technical tasks:
     - Task 1: Database schema for analytics
     - Task 2: API endpoints for data aggregation
     - Task 3: Analytics dashboard page
   - Assigns to engineers

## Integration with Other Skills

### Uses:
- **brainstorming skill**: For user requirement gathering
- **beads skill**: For feature tracking and handoff
- **writing-plans skill**: Not typically (TL handles implementation plans)

### Provides input to:
- **tech-lead skill**: Spec documents and feature tasks

## Success Metrics

- Spec documents are clear and user-approved
- TL can create technical tasks without ambiguity
- Features delivered match user expectations
- Minimal rework due to misunderstood requirements

## Anti-Patterns to Avoid

**As PO:**
- ❌ Vague user stories → ✅ Clear acceptance criteria
- ❌ Skipping user approval → ✅ Always get explicit approval
- ❌ Writing technical specs → ✅ Focus on user needs
- ❌ Bypassing brainstorming skill → ✅ Follow the process
- ❌ Micromanaging implementation → ✅ Hand off to TL
- ❌ Creating too-detailed technical tasks → ✅ Stay at feature level

## Skill Location

**Path:** `.opencode/skills/product-owner/SKILL.md`

## Related Skills

- **brainstorming**: For user requirement gathering (MUST use)
- **tech-lead**: Receives PO work and manages implementation
- **beads**: Task tracking system

## Implementation Notes

The PO skill is essentially a **brainstorming agent** that:
1. Uses the brainstorming workflow
2. Creates formal specifications
3. Tracks features in beads
4. Hands off to TL for execution

The key difference from generic brainstorming: the PO understands this is for product features, creates beads tasks, and knows they're handing off to a Tech Lead.

---

**Next Steps:**
- Create `product-owner/SKILL.md` file
- Test with a real feature request
