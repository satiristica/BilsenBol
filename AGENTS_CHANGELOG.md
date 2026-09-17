# AGENTS_LOG.md — Shared AI Engineering History & Execution Ledger

> This file is the shared operational memory for Claude, Gemini, ChatGPT/Codex, and other coding agents working on this repository.
>
> `AGENTS.md` defines stable engineering rules.
> `AGENTS_LOG.md` records what agents are doing, what they changed, why they changed it, what was verified, and what the next agent must know.
>
> The goal is simple: a fresh agent with no access to previous chats must be able to understand the current engineering state from the repository + this file.

---

# 0. Core Rule

Every non-trivial AI coding task MUST leave a useful record here.

Every meaningful AI-created commit MUST be semantically documented.

The log must explain:

- WHAT was implemented;
- WHY it was implemented;
- WHICH files/modules changed;
- WHAT behavior changed;
- WHAT interfaces/contracts changed;
- WHAT architectural or product decisions were made;
- WHAT dependencies/configuration changed;
- WHAT assumptions remain;
- WHAT was verified;
- WHAT is still not verified;
- WHAT limitations remain;
- WHAT other agents must know;
- WHAT should happen next.

Git records the exact code diff.

`AGENTS_LOG.md` records the engineering meaning of that diff.

Do not merely restate commit messages.

Do not store chain-of-thought, raw internal reasoning, secrets, full diffs, or terminal dumps.

---

# 1. Authority

Instruction precedence:

1. Current explicit user instruction.
2. Safety/tool/environment restrictions.
3. Nearest scoped `AGENTS.md`.
4. Root `AGENTS.md`.
5. This file.
6. Repository documentation and established conventions.
7. Agent preference.

If this file conflicts with `AGENTS.md`, `AGENTS.md` wins.

The repository, tests, runtime behavior, and primary sources outrank model opinion.

---

# 2. Agent Identities

Use one of:

```text
CLAUDE
CHATGPT
CODEX
GEMINI
```

Suggested specialization only:

```text
CLAUDE       architecture, difficult reasoning, review
CHATGPT      design/implementation guidance, review
CODEX        implementation, refactors, tests, repository edits
GEMINI       research, debugging, logs, documentation, verification
```

No model has higher factual authority than another.

Any agent may challenge another agent's decision using evidence.

---

# 3. Mandatory Session Start

Before any non-trivial repository task:

1. Read the applicable `AGENTS.md`.
2. Read this file.
3. Inspect Git state:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
```

4. Search this log for:
   - active tasks;
   - overlapping file ownership;
   - blockers;
   - accepted decisions;
   - handoffs relevant to the requested work.
5. Inspect the relevant source files.
6. Inspect relevant tests.
7. Inspect relevant configuration/package files before assuming tools or versions.
8. Search usages/call sites before changing public behavior.
9. Claim the task before editing.

Never assume the previous agent finished cleanly.

Never ask the user for repository facts that can be established by inspection.

---

# 4. Task Claim Protocol

Before editing, append:

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
- <material assumption or NONE>

ACCEPTANCE:
- <observable criterion>
- <observable criterion>
```

Task ID example:

```text
TASK-CODEX-20260917-recommendation-engine
```

Use the narrowest realistic file scope.

Do not claim the whole repository unless the task genuinely requires repository-wide work.

---

# 5. Task States

Allowed states:

```text
CLAIMED
IN_PROGRESS
BLOCKED
READY_FOR_REVIEW
DONE
ABANDONED
SUPERSEDED
```

Normal flow:

```text
CLAIMED
→ IN_PROGRESS
→ READY_FOR_REVIEW
→ DONE
```

Alternative flows:

```text
IN_PROGRESS → BLOCKED → IN_PROGRESS
CLAIMED/IN_PROGRESS → ABANDONED
DONE → SUPERSEDED
```

Do not use vague states:

```text
mostly done
probably fixed
should work
almost complete
```

If verification is incomplete, the task is not `DONE`.

---

# 6. Collision / File Ownership Protocol

Before modifying a file, search active claims for that path.

Active claims are tasks with:

```text
STATUS: CLAIMED
```

or:

```text
STATUS: IN_PROGRESS
```

If another active task overlaps:

1. Do not silently overwrite it.
2. Do not revert it.
3. Re-scope to non-overlapping files when possible.
4. If overlap is unavoidable, surface the collision before destructive edits.
5. If the other work is already committed, refresh context and integrate against the new repository state.

Never solve concurrency by deleting another agent's work.

Never assume a claim is stale merely because it is old.

---

# 7. Mandatory Commit Documentation

Every meaningful AI-created commit MUST have a semantic record in this file.

A meaningful commit is any commit that changes:

- user-visible behavior;
- business/domain logic;
- APIs;
- schemas/types/contracts;
- architecture;
- persistence/data behavior;
- AI behavior/prompts/integrations;
- security behavior;
- dependencies;
- build/deployment configuration;
- tests for important behavior;
- significant refactoring;
- bug behavior;
- documentation that changes how agents/developers operate.

Trivial mechanical edits may be grouped into the meaningful commit that contains them.

Do NOT create separate log entries for:

- every variable rename;
- every import reorder;
- every formatting change;
- every command executed;
- every file read.

The commit record must be detailed enough that another agent can understand the change without the previous chat.

---

# 8. Commit Record Format

For every meaningful commit, append:

```md
## COMMIT <TASK-ID> — <short semantic title>

AGENT: <agent>
TASK: <task-id>
COMMIT: SELF
DATE: <YYYY-MM-DD>

### IMPLEMENTED
- <everything materially implemented in this commit>
- <include all meaningful behavior, not only the headline feature>

### WHY
- <why this change exists>
- <problem or constraint it solves>
- <why this approach was chosen>

### FILES / MODULES
- `<path>` — <what changed here>
- `<path>` — <what changed here>

### BEHAVIORAL CHANGES
BEFORE:
- <relevant old behavior>

AFTER:
- <new behavior>

### CONTRACTS / INTERFACES
ADDED:
- <new public type/function/API/schema or NONE>

CHANGED:
- <changed contract or NONE>

REMOVED:
- <removed contract or NONE>

### DATA / SCHEMA / STATE
- <schema/state/persistence change or NONE>

### ARCHITECTURE / DECISIONS
- <architectural choice and concise reason>
- <important rejected alternative if relevant>

### DEPENDENCIES / CONFIG
ADDED:
- <dependency/config or NONE>

REMOVED:
- <dependency/config or NONE>

CHANGED:
- <dependency/config or NONE>

### ASSUMPTIONS
- <remaining assumption or NONE>

### VERIFICATION
- `<command>` → <exact result>
- <runtime/manual verification>

### NOT VERIFIED
- <check not performed and why, or NONE>

### KNOWN LIMITATIONS
- <limitation or NONE>

### IMPACT ON OTHER AGENTS
- <what future agents must preserve/know>
- <new contract they should consume>
- <area they must not recompute/reimplement>
- <migration/integration concern>

### NEXT
- <best next engineering action or NONE>
```

`COMMIT: SELF` means the log entry is stored in the same Git commit as the code it documents.

The actual SHA is resolved from Git history.

This avoids recursive “commit the SHA of the commit inside the same commit” problems.

To resolve the SHA later:

```bash
git log --oneline -- AGENTS_LOG.md
```

or search by task ID:

```bash
git log -S "TASK-CODEX-20260917-recommendation-engine" --oneline
```

If the log describes an already-existing commit rather than the commit containing the log entry, use:

```text
COMMIT: <actual-sha>
```

---

# 9. Completeness Rule for Commit Records

The `IMPLEMENTED` section must include ALL meaningful implementation contained in that commit.

Do not write:

```text
Implemented recommendations.
```

when the commit actually:

- added filtering;
- changed score calculation;
- added fallback states;
- modified types;
- added tests;
- changed UI handling.

Write all of them.

The `WHY` section must explain the engineering/product reason, not merely restate the change.

Bad:

```text
Added validation because validation was needed.
```

Good:

```text
Moved hard eligibility checks into deterministic domain logic so the LLM
cannot recommend programs that violate objective applicant constraints.
```

The goal is semantic completeness, not line-by-line narration.

---

# 10. Progress Updates

Use progress updates only for meaningful checkpoints.

```md
### UPDATE <TASK-ID>

AGENT: <agent>
STATUS: IN_PROGRESS

CHANGED:
- <meaningful change completed so far>

EVIDENCE:
- `<command>` → <result>
- <verified observation>

RISKS:
- <unresolved risk or NONE>

NEXT:
- <next meaningful action>
```

Do not log every command.

Do not log private reasoning.

Do not duplicate information already captured in a commit record unless the task is still uncommitted.

---

# 11. Handoff Protocol

Before another agent takes over, append:

```md
### HANDOFF <TASK-ID>

FROM: <agent>
STATUS: <READY_FOR_REVIEW|BLOCKED|IN_PROGRESS>

BASE_COMMIT: <sha>
CURRENT_COMMIT: <sha or UNCOMMITTED>

CHANGED_FILES:
- <path>

IMPLEMENTED:
- <what is already complete>

WHY:
- <important rationale the next agent must understand>

CONTRACTS_CHANGED:
- <type/API/schema changes or NONE>

VERIFIED:
- `<command>` → <result>

NOT_VERIFIED:
- <check and why or NONE>

DECISIONS:
- <important decision>

OPEN_ISSUES:
- <issue or NONE>

DO_NOT_BREAK:
- <invariant/contract the next agent must preserve>

NEXT_ACTION:
- <single best next action>
```

A fresh agent must be able to continue using repository state + this handoff alone.

Never write:

```text
continue where I left off
see previous conversation
you know the context
```

Persist the necessary context explicitly.

---

# 12. Completion Protocol

A task may be marked `DONE` only when applicable acceptance criteria and verification are complete.

```md
### COMPLETE <TASK-ID>

AGENT: <agent>
STATUS: DONE

SUMMARY:
- <what now works>

COMMITS:
- <sha or SELF>

FILES:
- <path>

VERIFICATION:
- `<command>` → <result>

LIMITATIONS:
- <known limitation or NONE>

FOLLOW_UP:
- <optional next task or NONE>
```

Before completion:

```bash
git diff --check
git diff
git status --short
```

Do not mark a task `DONE` merely because code exists.

---

# 13. Blocker Protocol

If genuinely blocked:

```md
### BLOCKED <TASK-ID>

AGENT: <agent>
STATUS: BLOCKED

BLOCKER:
- <exact blocker>

EVIDENCE:
- <error / missing resource / conflicting requirement>

ATTEMPTED:
- <relevant attempt>

NEEDS:
- <smallest requirement to continue>

SAFE_PARALLEL_WORK:
- <work or NONE>
```

Do not claim a blocker before using available repository inspection, tests, logs, or documentation.

Do not guess around a real blocker.

---

# 14. Decision Record Protocol

Create a decision record when another agent could plausibly revisit or contradict the decision.

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
- <decisive reason/evidence>

ALTERNATIVES_REJECTED:
- <alternative>: <reason>

REVERSAL_TRIGGER:
- <condition that justifies revisiting>

AFFECTS:
- <modules/features/contracts>
```

Decision states:

```text
PROPOSED
ACCEPTED
SUPERSEDED
REJECTED
```

Examples worth recording:

- recommendation ranking architecture;
- state ownership;
- persistence strategy;
- API contract;
- AI/provider boundary;
- schema decision;
- major dependency;
- architectural pattern.

Not worth a separate decision record:

- variable names;
- local formatting;
- trivial helper extraction.

---

# 15. Evidence Standard

Valid evidence includes:

- source code inspected;
- configuration inspected;
- tests executed;
- command exit status;
- reproducible runtime behavior;
- profiler/trace output;
- official documentation;
- primary-source external data.

Prefix uncertainty:

```text
ASSUMPTION:
HYPOTHESIS:
UNVERIFIED:
```

Never silently convert an assumption into a fact because another model wrote it.

An inherited `UNVERIFIED` statement must be verified before a risky decision depends on it.

---

# 16. Verification Standard

Never invent command names. Inspect repository scripts first.

Applicable checks may include:

```text
format
lint
typecheck
unit tests
integration tests
E2E tests
build
runtime/manual flow verification
```

Record exact outcomes:

```text
`npm run typecheck` → exit 0
`npm test -- recommendation` → 21/21 passed
`npm run build` → exit 0
```

If something was not run:

```text
NOT VERIFIED:
- Playwright E2E — browser dependency unavailable.
```

Never write:

```text
tests pass
build works
fixed
```

unless actually verified.

---

# 17. Repository Safety

Without explicit user authorization, do not:

- force-push;
- rewrite shared history;
- delete branches;
- discard uncommitted user work;
- deploy to production;
- run destructive production migrations;
- delete user data;
- rotate credentials;
- change DNS;
- purchase paid resources;
- disable security controls.

Avoid destructive local operations when they may erase other work:

```text
git reset --hard
git clean -fd
git checkout -- <path>
git restore --source=<old-commit> <path>
```

Uncommitted user changes are protected.

Never “clean up” changes you did not create.

---

# 18. Shared-Contract Rule

Permanent engineering rules belong in `AGENTS.md`, not here.

Do NOT duplicate the full:

- technical stack;
- code style;
- architecture standard;
- testing philosophy;
- AI protocol;
- product specification;
- security standard;
- dependency policy;

unless a task/commit changed one of those contracts.

This file should reference those rules, not copy them.

If a commit changes the project contract itself, document that change explicitly in the commit record.

---

# 19. Multi-Agent Review Protocol

When reviewing another agent's work, prioritize:

```text
correctness
security/data integrity
requirement compliance
regression risk
contract compatibility
test coverage
performance
maintainability
style
```

Optional severity:

```text
CRITICAL
HIGH
MEDIUM
LOW
NIT
```

Every `CRITICAL` or `HIGH` finding must include:

- exact location;
- failure scenario;
- why it matters;
- recommended fix.

Do not rewrite correct code merely to express stylistic preference.

---

# 20. Safe Parallelization

Parallel work is allowed only when:

- file ownership does not overlap, OR integration boundaries are stable;
- neither task depends on unfinished output from the other;
- shared schemas/config are not changing concurrently;
- merge/conflict risk is understood and low.

Usually safe:

```text
external research + unrelated UI
tests for stable pure logic + unrelated component work
documentation + non-overlapping implementation
```

Usually unsafe:

```text
two agents editing package.json
two agents changing the same Zod/schema contract
two agents refactoring the same central layout
schema migration + code written against the old schema
```

When unsafe, serialize the work.

---

# 21. Log Efficiency

This log must be detailed enough for handoff but cheap enough to read.

Do NOT store:

- raw terminal dumps;
- full diffs;
- complete source files;
- chat transcripts;
- private chain-of-thought;
- repeated permanent rules;
- every command;
- every thought;
- every trivial edit.

Store:

- semantic implementation history;
- rationale;
- changed contracts;
- important file/module impact;
- verification;
- limitations;
- cross-agent consequences.

A commit record should explain the change comprehensively without reproducing the diff.

---

# 22. Archival Protocol

When this file becomes large, archive completed historical entries to:

```text
docs/agent-log/YYYY-MM.md
```

Keep in the active file:

- active tasks;
- current handoffs;
- active blockers;
- decisions still affecting current work;
- recent commit records needed for active development.

Archive:

- old completed tasks;
- old commit records;
- abandoned tasks;
- superseded operational history.

Preserve task IDs and commit references.

Do not destroy historical engineering context.

---

# 23. Corrections

Historical records are append-only except for obvious formatting fixes.

If an old record is factually wrong, append:

```md
### CORRECTION <TASK-ID>

AGENT: <agent>
CORRECTS: <entry/task/commit>

OLD:
- <incorrect statement>

NEW:
- <verified statement>

EVIDENCE:
- <test/source/command>
```

Do not silently rewrite history to make it look cleaner.

---

# 24. What Other Agents Must Be Able to Learn

After reading this log, another agent should be able to answer:

- What is being worked on right now?
- Who owns it?
- Which files are being modified?
- What changed recently?
- Why were those changes made?
- Which public contracts changed?
- What assumptions are active?
- Which decisions are intentional?
- What has been tested?
- What is still unverified?
- What limitations remain?
- What can safely be changed?
- What must not be broken?
- What should happen next?

If the log cannot answer these questions for recent meaningful work, the previous agent did not document enough.

---

# 25. Final Checklist for Every Agent

Before stopping substantial work:

```text
[ ] Read AGENTS.md.
[ ] Read AGENTS_LOG.md.
[ ] Checked active claims.
[ ] Inspected Git state.
[ ] Claimed the task.
[ ] Avoided overlapping another agent's work.
[ ] Implemented the requested behavior.
[ ] Documented every meaningful implementation.
[ ] Explained WHY the implementation exists.
[ ] Documented changed contracts/interfaces.
[ ] Documented dependencies/config changes.
[ ] Ran applicable verification.
[ ] Recorded exact verification results.
[ ] Recorded what was NOT verified.
[ ] Recorded known limitations.
[ ] Recorded impact on other agents.
[ ] Added semantic commit record(s).
[ ] Added handoff or completion record.
[ ] Reviewed final diff.
[ ] Preserved user/other-agent work.
[ ] Kept private reasoning out of the log.
```

If an important item is false, resolve it before claiming completion.

---

# LIVE LOG

> Append task claims, commit records, decisions, blockers, handoffs, corrections, and completion records below this line.
>
> Do not place transient operational entries above this marker.
