# AGENTS_LOG.md — Shared Execution Ledger for Gemini, Claude, ChatGPT/Codex

> Purpose: coordinate multiple AI coding agents working on this repository.
> `AGENTS.md` is the stable engineering contract. This file stores transient execution state:
> task claims, decisions, verification, blockers, and handoffs.
>
> Never store chain-of-thought, secrets, raw terminal dumps, or chat transcripts here.

## 1. Authority

Instruction precedence:

1. Current explicit user instruction.
2. Safety/tool/environment restrictions.
3. Nearest scoped `AGENTS.md`.
4. Root `AGENTS.md`.
5. This file.
6. Repository docs/conventions.
7. Agent preference.

If this file conflicts with `AGENTS.md`, `AGENTS.md` wins.

Agent IDs:

```text
CLAUDE
CHATGPT
CODEX
GEMINI
```

All agents have equal factual authority. Suggested specialization:

```text
CLAUDE       architecture, cross-cutting reasoning, review
CHATGPT      design/implementation guidance, review
CODEX        implementation, refactors, tests, repository edits
GEMINI       research, debugging, logs, documentation, secondary review
```

The repository, runtime behavior, tests, and primary sources outrank model opinion.

---

## 2. Mandatory Session Start

Before any non-trivial edit:

1. Read applicable `AGENTS.md`.
2. Read this file.
3. Run:
   ```bash
   git status --short
   git branch --show-current
   git rev-parse HEAD
   ```
4. Search this log for active claims, overlapping files, blockers, and accepted decisions.
5. Inspect relevant source, configuration, tests, and call sites.
6. Inspect `package.json`, lockfile, and tool configs before assuming versions or commands.
7. Claim the task before editing.

Never ask the user for facts that the repository can answer.

Never assume another agent left the worktree clean.

---

## 3. Task Claim Protocol

Append before editing:

```md
## TASK TASK-<AGENT>-<YYYYMMDD>-<slug>

AGENT: <CLAUDE|CHATGPT|CODEX|GEMINI>
STATUS: CLAIMED
BASE_COMMIT: <sha>
SCOPE: <one-sentence outcome>

FILES:
- <path-or-glob>

DEPENDENCIES:
- <task-id or NONE>

ASSUMPTIONS:
- <only material assumptions>

ACCEPTANCE:
- <observable criterion>
- <observable criterion>
```

Allowed task states:

```text
CLAIMED
IN_PROGRESS
BLOCKED
READY_FOR_REVIEW
DONE
ABANDONED
SUPERSEDED
```

Normal state flow:

```text
CLAIMED → IN_PROGRESS → READY_FOR_REVIEW → DONE
```

Do not use vague states such as `mostly done`, `probably fixed`, or `should work`.

---

## 4. Collision / Ownership Protocol

Before modifying a file, search active tasks for that path.

If another active task overlaps:

1. Do not overwrite or revert it.
2. Re-scope to non-overlapping files when possible.
3. If overlap is unavoidable, stop before destructive edits and surface the conflict.
4. If the other work is already committed, refresh context and integrate against the new state.

A claim is not stale merely because it is old. Treat it as stale only when explicitly abandoned/superseded or when the user resolves ownership.

Never solve concurrency with destructive Git commands.

---

## 5. Progress Updates

Log only meaningful checkpoints, not every command or thought.

```md
### UPDATE <TASK-ID>

AGENT: <agent>
STATUS: IN_PROGRESS

CHANGED:
- <concrete change>

EVIDENCE:
- `<command>` → exit <code>
- <verified runtime observation>

RISKS:
- <unresolved risk or NONE>

NEXT:
- <next meaningful action>
```

Good evidence:

```text
`npm run typecheck` → exit 0
Recommendation tests: 18/18 pass
Mobile E2E fails on comparison navigation
```

Bad evidence:

```text
Looks great
Should work
Probably fixed
```

---

## 6. Handoff

When another agent may continue:

```md
### HANDOFF <TASK-ID>

FROM: <agent>
STATUS: <READY_FOR_REVIEW|BLOCKED|IN_PROGRESS>
BASE_COMMIT: <sha>
CURRENT_COMMIT: <sha or UNCOMMITTED>

CHANGED_FILES:
- <path>

VERIFIED:
- `<command>` → <result>

NOT_VERIFIED:
- <check and why>

DECISIONS:
- <decision and concise reason>

OPEN_ISSUES:
- <issue or NONE>

NEXT_ACTION:
- <single best next action>
```

A fresh agent must be able to continue from repository state + this handoff without reading the previous chat.

---

## 7. Completion

A task is `DONE` only when requested behavior exists and applicable validation has completed.

```md
### COMPLETE <TASK-ID>

AGENT: <agent>
STATUS: DONE

SUMMARY:
- <what now works>

FILES:
- <path>

VERIFICATION:
- `<command>` → exit 0
- `<command>` → exit 0

LIMITATIONS:
- <known limitation or NONE>

COMMIT:
- <sha or UNCOMMITTED>
```

Never mark `DONE` because code was merely written.

Before completion, inspect:

```bash
git diff --check
git diff
git status --short
```

---

## 8. Blocker Protocol

Do not guess around a real blocker.

```md
### BLOCKED <TASK-ID>

AGENT: <agent>
STATUS: BLOCKED

BLOCKER:
- <exact blocker>

EVIDENCE:
- <error/missing resource/conflicting requirement>

ATTEMPTED:
- <relevant attempt>

NEEDS:
- <smallest concrete requirement to continue>

SAFE_PARALLEL_WORK:
- <work or NONE>
```

Do not declare a blocker before using available repository inspection, logs, tests, or documentation.

---

## 9. Decision Record

Record only decisions another agent may otherwise contradict.

```md
## DECISION <DECISION-ID>

STATUS: ACCEPTED
OWNER: <agent|USER>
DATE: <YYYY-MM-DD>

CONTEXT:
- <problem>

DECISION:
- <chosen approach>

WHY:
- <decisive evidence/trade-off>

REJECTED:
- <alternative>: <reason>

REVERSAL_TRIGGER:
- <condition that justifies revisiting>

AFFECTS:
- <module/files/features>
```

Decision states:

```text
PROPOSED
ACCEPTED
SUPERSEDED
REJECTED
```

Do not create decision records for trivial naming or formatting choices.

---

## 10. Evidence / Truthfulness Standard

Log facts only when observed.

Valid evidence includes:

```text
source/config inspected
tests executed
command exit status
reproducible runtime behavior
trace/profile output
official documentation
primary external data
```

Prefix uncertain statements:

```text
ASSUMPTION:
HYPOTHESIS:
UNVERIFIED:
```

An inherited `UNVERIFIED` statement must be verified before a risky decision depends on it.

Never store private chain-of-thought. Record only concise rationale needed for audit/handoff.

---

## 11. Repository Safety

Without explicit user authorization, do not:

```text
force-push
rewrite shared history
delete branches
discard uncommitted work
deploy to production
run destructive production migrations
delete user data
rotate credentials
change DNS
purchase paid resources
disable security controls
```

Avoid destructive local commands when they may erase work:

```text
git reset --hard
git clean -fd
git checkout -- <path>
git restore --source=<old-commit> <path>
```

Uncommitted user changes are protected.

Prefer reversible patches and explicit commits.

---

## 12. Technical Stack Baseline

The repository config is authoritative. Inspect it first.

If a layer is unspecified and must be created, default to:

```text
Language:        TypeScript
Typing:          strict
Framework:       Next.js App Router
UI:              React
Styling:         Tailwind CSS
Components:      shadcn/ui when useful
Validation:      Zod
Icons:           existing library; Lucide if none exists
Unit tests:      Vitest
Component tests: React Testing Library
E2E:             Playwright
Lint:            ESLint
Format:          existing formatter / Prettier
Deployment:      Vercel for Next.js unless repo says otherwise
```

State priority:

```text
local state
→ URL state when shareable/navigation state matters
→ framework/server state
→ localStorage for demo persistence
→ global state library only for genuinely cross-cutting state
```

Data priority:

```text
curated local data
→ external API when it adds clear value
→ PostgreSQL/Supabase only when persistent server/multi-user behavior requires it
```

Reject by default:

```text
premature microservices
Redis/queues without a concrete need
multiple databases
Redux/Zustand by habit
new package manager
duplicate formatter/linter
dependency for trivial helper code
```

---

## 13. Architecture Standard

Default: modular monolith.

Dependency direction:

```text
presentation/UI
    ↓
application/use-cases
    ↓
domain/rules
    ↓
adapters/infrastructure
```

Rules:

- Domain logic must not depend on React.
- External providers stay behind narrow adapters.
- Side effects stay near system boundaries.
- Do not add abstraction without a concrete pressure.
- Do not create interfaces merely to imitate SOLID.
- Do not add layers that only forward calls.
- Preserve coherent existing structure rather than forcing a preferred template.

Every new abstraction must answer:

```text
What real complexity, variability, or failure mode does this remove?
```

If the answer is weak, do not add it.

---

## 14. TypeScript Code Style

Unless repository conventions explicitly differ:

- `strict: true`.
- Prefer `unknown` over `any`.
- Avoid `any`; isolate unavoidable external `any` and narrow immediately.
- Do not use `@ts-ignore`.
- Use `@ts-expect-error` only with a concrete documented reason.
- Avoid unsafe non-null assertions unless the invariant is clear.
- Prefer discriminated unions for meaningful state variants.
- Prefer explicit domain types over loose records.

Functions:

```text
one clear responsibility
pure domain functions where practical
side effects at boundaries
early returns over deep nesting
options/domain objects over boolean-parameter soup
no one-use helper unless it adds meaning
```

Naming:

```text
ApplicantProfile
ProgramEligibility
filterEligiblePrograms
scoreProgramFit
buildAdmissionRoadmap
explainRecommendation
```

Avoid:

```text
data
thing
doStuff
helper2
tmp
manager
```

Boolean names:

```text
isEligible
hasValidExam
canAffordProgram
shouldRecompute
```

React:

- Keep business logic outside JSX.
- Prefer Server Components when client interactivity is unnecessary.
- Add `"use client"` only when required.
- Keep state local unless sharing is necessary.
- Explicitly model loading/error/empty/success states.
- Avoid giant components and prop-flag explosions.
- Prefer composition.

Comments explain why, invariants, external quirks, or trade-offs — not obvious syntax.

---

## 15. AI / LLM Protocol

Keep credentialed provider calls server-side.

Rules:

- Keys only from environment variables.
- Never commit `.env` secrets.
- Never expose provider keys to client bundles.
- Treat model output as untrusted input.
- Prefer structured output.
- Validate structured output with Zod.
- Use timeouts and graceful failure.
- Avoid repeated model calls for unchanged normalized input.
- Do deterministic work deterministically.

Admission recommendation pipeline:

```text
profile
→ schema validation
→ hard-constraint filtering
→ transparent soft-fit scoring
→ candidate ranking
→ LLM explanation/synthesis when useful
→ schema validation
→ UI
```

The LLM must not invent:

```text
universities
deadlines
tuition
scholarships
eligibility
guaranteed admission
unsupported admission probabilities
```

External admission facts require a source or visible `Demo/Unverified` labeling.

---

## 16. Testing Protocol

Tests verify behavior; never hard-code production logic to visible fixtures.

Priority:

```text
domain logic
→ critical user journey
→ integrations
→ meaningful component behavior
→ regression test for important bug fixes
```

Critical admission E2E:

```text
create profile
→ diagnosis
→ >= 3 recommendations
→ compare >= 2
→ roadmap
→ explicit next action
→ mark progress
→ change key profile input
→ recommendations/roadmap visibly recompute
```

Important failures:

```text
invalid/incomplete profile
no eligible programs
malformed model output
API/model timeout
missing source data
network failure
mobile viewport
persistence restore failure
```

Do not replace behavioral tests with snapshots.

---

## 17. Verification Protocol

Never invent script names. Inspect `package.json` first.

Applicable checks normally include:

```text
format
lint
typecheck
unit/integration tests
E2E
build
```

Run targeted checks first, then broader checks proportional to changed surface.

Record exact results:

```text
`npm run typecheck` → exit 0
`npm test -- recommendation` → exit 0, 18 tests
`npm run build` → exit 0
```

If a check cannot run:

```text
NOT_VERIFIED: Playwright — browser dependency unavailable in sandbox.
```

Never claim:
- tests pass if they were not run;
- build works if it was not built;
- bug fixed if reproduction was not retested.

---

## 18. Debugging Protocol

Use:

```text
symptom
→ reproduce
→ collect evidence
→ competing hypotheses
→ discriminating test
→ root cause
→ smallest fix
→ regression test
→ verify
```

No shotgun debugging.

For large logs, preserve raw output elsewhere and record only decisive evidence here.

---

## 19. Dependency Protocol

Before adding a dependency:

1. Search the repo for equivalent functionality.
2. Check whether runtime/framework already provides it.
3. Verify maintenance/current compatibility when relevant.
4. Consider bundle/runtime/operational cost.
5. Confirm it materially reduces implementation or bug risk.
6. Use the existing package manager/lockfile.

Do not silently change major versions during unrelated work.

Log one-sentence justification for every new dependency.

---

## 20. Security / Privacy

Never write here:

```text
API keys
passwords
tokens
cookies
private keys
secret URLs
real applicant PII
```

Use placeholders:

```text
OPENAI_API_KEY=<configured>
DATABASE_URL=<configured>
```

Validate untrusted input at external boundaries.

Do not render untrusted user/model HTML directly.

Use synthetic/minimized data for debugging.

---

## 21. Research Protocol

Use current web research when facts can change:

```text
framework/library APIs
package versions
security advisories
model/provider capabilities
API limits
deployment constraints
pricing
university requirements
deadlines
scholarships
```

Source priority:

```text
official/primary source
→ official repo/spec
→ vendor docs
→ reputable technical source
→ community evidence for practical edge cases
```

Do not browse merely to decorate output with citations.

If research changes implementation, log the conclusion and source URL/reference concisely.

---

## 22. Multi-Agent Review

Review in this order:

```text
correctness
security/data integrity
requirement compliance
regression risk
architecture boundary
test coverage
performance
maintainability
style
```

Optional severities:

```text
CRITICAL
HIGH
MEDIUM
LOW
NIT
```

Every CRITICAL/HIGH finding must include:
- concrete location;
- failure scenario;
- recommended fix.

Do not rewrite valid code merely to express model preference.

---

## 23. Agent-Specific Rules

### CLAUDE

- Inspect code before theorizing.
- Parallelize independent reads/searches when supported.
- Do not spawn subagents for trivial single-file work.
- Persist state here before handoff or context transition.
- Do not optimize for tests at the expense of general correctness.

### CHATGPT / CODEX

- Obey every applicable scoped `AGENTS.md`.
- Run required validation after changes.
- Preserve uncommitted user/agent work.
- Ground code claims in inspected files/runtime.
- Leave exact verification results in this log.

### GEMINI

- Treat repository context files hierarchically.
- Reload context after coordination files change when necessary.
- Use this file as transient shared state, not as the permanent project policy.
- Verify current docs/API facts instead of relying on stale memory.
- Record concise research/debug conclusions, not raw dumps.

---

## 24. Context-Efficiency / Log Retention

This file must remain cheap to load.

Never store:

```text
raw terminal dumps
full diffs
full source files
chat transcripts
private reasoning
duplicated stable docs
```

One update per meaningful checkpoint, not per command.

Keep active log state compact. When history grows large, archive completed operational entries to:

```text
docs/agent-log/YYYY-MM.md
```

Keep in this file:
- unresolved tasks;
- current handoffs;
- active blockers;
- accepted decisions still constraining work.

Archive:
- old `DONE`;
- old `ABANDONED`;
- superseded operational entries.

Preserve commit references.

Corrections must be append-only:

```md
### CORRECTION <TASK-ID>

AGENT: <agent>
CORRECTS: <entry>
OLD: <incorrect claim>
NEW: <verified claim>
EVIDENCE: <source/test/command>
```

Do not silently rewrite historical facts.

---

## 25. Current Product Baseline

Objective:

```text
Build a coherent personalized admission journey,
not a generic AI chat or static university list.
```

Critical flow:

```text
Landing
→ Profile
→ Diagnosis
→ Recommendations
→ Comparison
→ Roadmap
→ Next Action / Progress
```

Priority:

```text
working end-to-end journey
> UX clarity
> explainable personalization
> stability
> technical sophistication
> optional features
```

Key profile changes must visibly recompute recommendations/roadmap.

Unsupported admission facts must never be presented as verified facts.

---

## 26. Safe Parallelization Rule

Parallel work is allowed only when:
- file ownership does not overlap, or interfaces are stable;
- neither task depends on unfinished output from the other;
- shared schemas/config are not changing concurrently;
- merge risk is low and understood.

Usually safe:

```text
research + unrelated UI
unit tests for stable pure logic + unrelated component work
documentation + non-overlapping implementation
```

Usually unsafe:

```text
two agents editing package.json
two agents changing the same Zod schema
two agents refactoring the same layout
schema migration + code written against the old schema
```

When unsafe, serialize.

---

## 27. Final Checklist

Before stopping substantial work, confirm:

```text
read AGENTS.md + AGENTS_LOG.md
checked active claims
inspected actual code/config/tests
did not overwrite another agent
kept scope minimal
avoided unnecessary architecture/dependencies
preserved uncommitted work
validated real boundaries
ran applicable checks
reviewed final diff
logged exact verification
recorded remaining risks
left a usable handoff
kept private reasoning out of the log
```

If a material item is false, resolve it before claiming completion.

---

# LIVE LOG

> Append task claims, updates, decisions, blockers, handoffs, and completions below this line.
> Do not place transient operational entries above this marker.
