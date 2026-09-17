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

## TASK TASK-CODEX-20260917-initial-scaffold

AGENT: CODEX
STATUS: DONE
BASE_COMMIT: df01d4b1e0d8886ad9e780deb7ded6e8222b552f
SCOPE: Create the minimum documented application architecture and a runnable BilsenBol website shell.

FILES:
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `next-env.d.ts`
- `eslint.config.mjs`
- `src/**`
- `public/**`
- `README.md`
- `AGENTS_CHANGELOG.md`

DEPENDENCIES:
- NONE

ASSUMPTIONS:
- The documentation-only repository should adopt the default Next.js App Router stack specified in `AGENTS.md`.
- Empty architecture directories may use `.gitkeep` files until their product slices are implemented.

ACCEPTANCE:
- The repository has a small modular architecture matching the documented product journey.
- The application installs, type-checks, lints, builds, and can serve an initial responsive page.

### COMPLETE TASK-CODEX-20260917-initial-scaffold

AGENT: CODEX
STATUS: DONE

SUMMARY:
- Added a minimal Next.js App Router application with strict TypeScript and ESLint configuration.
- Added a responsive, accessible BilsenBol landing page that honestly identifies itself as a foundation preview.
- Created empty feature boundaries for profile, diagnosis, recommendations, comparison, roadmap, and progress, plus shared component, domain, data, library, server, and test directories.
- Documented local setup, quality commands, current limitations, and the initial architecture.

COMMITS:
- UNCOMMITTED

FILES:
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `next-env.d.ts`
- `eslint.config.mjs`
- `README.md`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/.gitkeep`
- `src/features/*/.gitkeep`
- `src/domain/.gitkeep`
- `src/data/.gitkeep`
- `src/lib/.gitkeep`
- `src/server/.gitkeep`
- `src/test/.gitkeep`
- `public/.gitkeep`
- `AGENTS_CHANGELOG.md`

VERIFICATION:
- `npm install` with Node.js 22.23.2 → 362 packages audited with 0 vulnerabilities; generated `package-lock.json`.
- `npm run lint` → exit 0.
- `npm run typecheck` → exit 0.
- `npm run build` → exit 0; Next.js generated static `/` and `/_not-found` routes.
- Production `npm run start -- --hostname 127.0.0.1 --port 3100` plus `curl http://127.0.0.1:3100/` → HTTP 200 with the BilsenBol title and landing-page content.
- `jq empty package.json package-lock.json tsconfig.json` → exit 0; all JSON files are syntactically valid.
- `git diff --check` and trailing-whitespace scan → exit 0.

LIMITATIONS:
- The product journey features remain placeholders; only the initial application shell is implemented.
- ESLint 9 is pinned because `eslint-config-next` 16.3.5's bundled React lint plugin fails under ESLint 10; npm warns that ESLint 9 is out of support, so this should be revisited when the Next.js lint bundle becomes compatible.

FOLLOW_UP:
- Implement the profile step as the first real product feature, keeping profile state as the source for later recommendation and roadmap recomputation.

## TASK TASK-CODEX-20260917-russian-localization

AGENT: CODEX
STATUS: DONE
BASE_COMMIT: df01d4b1e0d8886ad9e780deb7ded6e8222b552f
SCOPE: Localize the current BilsenBol landing page for Russian-speaking students from CIS countries.

FILES:
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `AGENTS_CHANGELOG.md`

DEPENDENCIES:
- `TASK-CODEX-20260917-initial-scaffold`

ASSUMPTIONS:
- Russian is the initial interface language; multi-language switching is outside the current minimal scope.

ACCEPTANCE:
- All user-visible landing-page copy, metadata, and accessibility labels are in Russian.
- The HTML language is set to Russian and the application still lints, type-checks, and builds.

### COMPLETE TASK-CODEX-20260917-russian-localization

AGENT: CODEX
STATUS: DONE

SUMMARY:
- Localized all landing-page copy, metadata, document language, CTA text, progress labels, and accessibility labels into Russian.
- Adapted the hero message to explicitly address applicants and students from CIS countries while preserving the honest foundation-preview state.
- Kept the BilsenBol brand name and the existing architecture and visual design unchanged.

COMMITS:
- UNCOMMITTED

FILES:
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `AGENTS_CHANGELOG.md`

VERIFICATION:
- English user-visible text scan in `src/app` → only the BilsenBol brand name remains in Latin characters.
- `npm run lint` → exit 0.
- `npm run typecheck` → exit 0.
- `npm run build` → exit 0; static `/` and `/_not-found` routes generated.
- `git diff --check` → exit 0.

LIMITATIONS:
- Russian is currently the only interface language; no locale switcher or translation framework has been added.

FOLLOW_UP:
- Implement the profile step using the same Russian terminology and tone.

## TASK TASK-CLAUDE-20260917-journey-frontend

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: c7d99401e2c4502fcb7197f35334f4f8a0c108fe
SCOPE: Implement the clickable end-to-end admission journey frontend for CIS school students, from profile input to interactive roadmap, comparison, and progress.

FILES:
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/journey/**`
- `src/components/**`
- `src/domain/**`
- `src/data/**`
- `src/lib/**`
- `src/features/{profile,diagnosis,recommendations,comparison,roadmap,progress,journey}/**`
- `AGENTS_CHANGELOG.md`

DEPENDENCIES:
- `TASK-CODEX-20260917-russian-localization`

ASSUMPTIONS:
- The program catalogue is demo data; institutions are intentionally fictional and every surface carries a visible `Демо-данные` label, per AGENTS.md section 4.
- GPA is captured on a 3.0-5.0 five-point scale (the requested 4.5-5.0 band is highlighted as the grant-competitive zone) so weaker applicants can still be represented honestly.
- Journey state lives in memory plus a URL preset parameter; no persistence layer is introduced in this task.
- No new runtime dependency is added: styling uses CSS Modules on the existing design tokens instead of a UI kit.

ACCEPTANCE:
- Landing page offers three one-click presets that prefill the profile and open the computed result.
- Profile step captures grade, GPA, English level, budget, fields, and regions.
- Diagnosis shows a readiness status plus strength, bottleneck, and time-runway insights.
- At least three recommendation cards render with program and match badges, and two programs can be compared face to face.
- Roadmap renders three seasonal phases with a highlighted next action and checkboxes that recompute a readiness percentage.
- Changing a profile input from the result screen recomputes recommendations, roadmap, and diagnosis immediately.
- `npm run typecheck`, `npm run lint`, and `npm run build` exit 0; mobile layout holds at 360px width.

### COMPLETE TASK-CLAUDE-20260917-journey-frontend

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- The full admission journey is clickable end to end: landing presets, profile, diagnosis, recommendations, comparison, roadmap and progress.
- Landing offers three one-click presets that prefill a profile and open the computed result at `/journey?preset=<id>`.
- The profile step captures grade, GPA, English level, family budget, fields and regions; recommendations, diagnosis and roadmap are always derived from it.
- Recommendations separate hard constraints from soft fit: a programme that violates budget, GPA, region or language eligibility is never shown, and every card explains its score, trade-off, blocker and improvement action.
- Two programmes can be sent to a floating tray and compared face to face in a modal across ten criteria with a per-row winner.
- The roadmap renders three seasonal phases, a highlighted next action and checkboxes that recompute a readiness percentage; completed step ids survive profile edits because step ids are semantic.
- A quick-adjust bar on the result screens changes budget, English level or GPA and recomputes everything immediately.

COMMITS:
- UNCOMMITTED

FILES:
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/journey/page.tsx`
- `src/components/ChoiceGroup.tsx`, `src/components/ChoiceGroup.module.css`
- `src/data/programs.ts`
- `src/domain/{profile,matching,diagnosis,roadmap,comparison}.ts`
- `src/lib/classNames.ts`
- `src/features/journey/{JourneyExperience.tsx,JourneyExperience.module.css,steps.ts}`
- `src/features/profile/{ProfileForm,QuickAdjustBar}.{tsx,module.css}`
- `src/features/diagnosis/DiagnosisPanel.{tsx,module.css}`
- `src/features/recommendations/{RecommendationCard,RecommendationList}.{tsx,module.css}`
- `src/features/comparison/{ComparisonTray,ComparisonDialog}.{tsx,module.css}`
- `src/features/roadmap/RoadmapTimeline.{tsx,module.css}`
- `src/features/progress/{ProgressPanel.tsx,Progress.module.css}`
- `README.md`
- Deleted `.gitkeep` placeholders in the ten directories that now hold real files.

ARCHITECTURE / DECISIONS:
- Domain rules are pure and UI-free: `rankPrograms`, `buildDiagnosis`, `buildRoadmap` and `buildComparisonRows` take a profile and return data, so the client layer only renders.
- `JourneyStep` and its type guard live in `src/features/journey/steps.ts` rather than the `"use client"` module, because the server route reads the step from the URL; calling a client export from the server throws at request time.
- No runtime dependency was added. Styling uses CSS Modules on the existing design tokens in `globals.css`; no UI kit, no Tailwind, no state library.
- Journey state is in-memory React state plus two URL parameters (`preset`, `step`), matching the "narrowest tool that works" rule.

DATA / SCHEMA / STATE:
- `src/data/programs.ts` adds a fourteen-programme demo catalogue of deliberately fictional institutions, exported alongside `DEMO_DATA_NOTICE` and `DEMO_DATA_BADGE`.
- Per AGENTS.md section 4 no unsourced admission fact is attributed to a real university, every card and the comparison modal carry the `Демо-данные` label, and the product publishes no admission probability.

DEPENDENCIES / CONFIG:
- No package change.
- `next dev` appended its own `nextjs-agent-rules` block to `AGENTS.md` and rewrote generated `next-env.d.ts`; both are tool-generated and were left in place.

ASSUMPTIONS:
- GPA is captured on a 3.0-5.0 scale so applicants below the grant-competitive band can still be represented; 4.5 is surfaced in the UI as the grant threshold rather than as the floor of the input.
- A four-value readiness status is used instead of three: `strengthen-academics` was added so an applicant with a certificate but a low average is not told they are grant-ready.

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0; `/` and `/_not-found` static, `/journey` dynamic.
- `git diff --check` → exit 0.
- Server-rendered journey checked with curl for all three presets: readiness statuses resolve to `Готов к подаче на гранты`, `В запасе ещё год`, `Требуется подтянуть язык` respectively; the recommendations step renders 4, 6 and 4 programme cards with the expected grant, budget and Foundation badges and a `Демо-данные` label on each.
- Roadmap step renders three seasonal phases, ten checkboxes, `aria-valuenow="0"` on the readiness meter and exactly one highlighted next action; the language step differs correctly between a profile with and without a certificate.
- Domain rules executed directly through a compiled harness in the session scratchpad, 24 assertions, all passing: every preset and the default profile return at least three programmes; no shown match violates a budget, GPA, region or language constraint; ordering is descending by score; an impossible profile returns zero matches with every one of the fourteen programmes accounted for in the exclusion summary; raising the budget widens the set 4 → 11 and lowering it narrows 6 → 5; changing the English level changes scores, badges, the diagnosis status and the roadmap steps; progress maths gives 0 / 50 / 100 percent with the next action selected in phase order; nine of ten roadmap steps keep their ids across a profile edit; comparison returns ten criteria with decided winners.

NOT VERIFIED:
- Client-side interaction was not exercised in a real browser: the Chrome extension was not connected in this session, so checkbox toggling, the comparison tray and modal, and the quick-adjust recompute were verified through their pure domain rules and server-rendered markup, not by clicking.
- Mobile rendering was reviewed through the stylesheets (single-column base layouts, 44px minimum touch targets, horizontally scrollable stepper, `min()`-bounded containers) rather than measured at 360px in a browser.

LIMITATIONS:
- Journey state is not persisted: a reload restarts at the profile step and clears marked progress.
- No automated test suite exists in the repository; the domain harness used here lived in the scratchpad and was not committed.
- The comparison modal compares exactly two programmes.
- The catalogue is demo data, so recommendations demonstrate the rules rather than real admission routes.

FOLLOW_UP:
- Add Vitest and port the scratchpad domain assertions into committed unit tests, then a Playwright run of the critical path.
- Persist profile and progress to localStorage so a reload keeps the journey.
- Replace the demo catalogue with source-backed programme data carrying a source URL per fact.

## TASK TASK-CLAUDE-20260917-dark-visual-system

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: a90f2e38294f715d7c83b05c8f5188032dbbf1d0
SCOPE: Replace the light cream theme with a dark green visual system, add motion throughout the journey, and rebuild the call-to-action buttons as a creative shared primitive.

FILES:
- `src/app/globals.css`
- `src/app/page.tsx`
- `src/components/**`
- `src/lib/**`
- `src/features/**/*.module.css`
- `src/features/**/*.tsx`
- `AGENTS_CHANGELOG.md`

DEPENDENCIES:
- `TASK-CLAUDE-20260917-journey-frontend`

ASSUMPTIONS:
- User asked for a dark green palette, strong animation and creative buttons; motion is implemented in CSS plus a small IntersectionObserver helper rather than an animation dependency.
- All motion must degrade to no motion under `prefers-reduced-motion`, and the dark palette must keep text contrast at WCAG AA.

ACCEPTANCE:
- Every screen of the journey renders on the dark green palette with no leftover light-theme surfaces.
- Landing and journey use entrance, scroll-reveal and hover motion; numbers animate when they change.
- Primary actions use one shared creative button primitive with a visible focus state.
- `npm run typecheck`, `npm run lint`, `npm run build` exit 0.

### COMPLETE TASK-CLAUDE-20260917-dark-visual-system

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- Replaced the cream/green light theme with a deep green dark system driven entirely by tokens in `globals.css`, so every CSS Module re-themed without duplicating colour values.
- Added motion across the product: a drifting aurora behind the landing, staggered entrance animations, scroll-triggered reveals, hover lift and light sweeps on cards, a rotating dialog close control, a shimmering progress bar, and a vertical rail per roadmap phase that fills as steps are completed.
- Built `ActionButton`/`ActionLink` as the single call-to-action primitive: gradient fill, a highlight that tracks the pointer, a one-shot sheen on hover, a sliding arrow, and press feedback. It replaced six separate bespoke button styles.
- Numbers now animate to their new value with `useCountUp`, so changing the profile visibly counts the match score and the readiness percentage up or down.
- The recommendation score became a conic-gradient dial, and each scoring factor gained a proportional bar.
- Dropped the serif display face in favour of a heavier sans with tighter tracking, and gave the hero a gradient keyword plus an honest stats strip.

COMMITS:
- UNCOMMITTED

FILES:
- `src/app/globals.css` (rewritten)
- `src/app/page.tsx`
- `src/components/{ActionButton.tsx,ActionButton.module.css,Reveal.tsx,Reveal.module.css,ChoiceGroup.module.css}`
- `src/lib/useCountUp.ts`
- `src/features/profile/{ProfileForm.tsx,ProfileForm.module.css,QuickAdjustBar.module.css}`
- `src/features/diagnosis/{DiagnosisPanel.tsx,DiagnosisPanel.module.css}`
- `src/features/recommendations/{RecommendationCard.tsx,RecommendationCard.module.css,RecommendationList.tsx,RecommendationList.module.css}`
- `src/features/comparison/{ComparisonTray.tsx,ComparisonTray.module.css,ComparisonDialog.tsx,ComparisonDialog.module.css}`
- `src/features/roadmap/{RoadmapTimeline.tsx,RoadmapTimeline.module.css}`
- `src/features/progress/{ProgressPanel.tsx,Progress.module.css}`
- `src/features/journey/{JourneyExperience.tsx,JourneyExperience.module.css}`

BEHAVIORAL CHANGES:
- Presentation only. No domain module, no recommendation rule and no roadmap rule was touched; `src/domain` and `src/data` are byte-identical to the previous task.
- The journey content wrapper is keyed by the current step so each step replays its entrance animation on navigation.

ARCHITECTURE / DECISIONS:
- `Reveal` toggles classes on the DOM node inside its effect rather than through React state. The first implementation used `useState` and tripped `react-hooks/set-state-in-effect`; the DOM approach is what that rule recommends and it also keeps content visible when JavaScript never runs, since the hidden class is only applied once the observer is armed.
- No animation library was added; everything is CSS keyframes plus one IntersectionObserver and one requestAnimationFrame loop.

DEPENDENCIES / CONFIG:
- No package change.

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0 (after fixing the `set-state-in-effect` error described above).
- `npm run build` → exit 0; `/` and `/_not-found` static, `/journey` dynamic.
- `git diff --check` → exit 0.
- Grep for the old light palette hex values, `rgb(255 253 247`, `rgb(243 241 233`, `Georgia` and the removed `--accent-dark` token across `src/**/*.css` → no matches, so no light-theme surface survives.
- Script comparing every `styles.X` reference in TSX against the classes defined in its CSS Module → no orphaned references after the button consolidation.
- WCAG contrast computed for eleven foreground/background pairs of the new palette: all pass AA, nine of eleven pass AAA, lowest is muted text on a raised card at 5.22:1.
- Server-rendered markup checked with curl: landing emits the aurora layer, 12 staggered entrance elements, the stats strip and three preset cards; the recommendations step emits six score dials; the roadmap step emits three phase-progress variables and eleven checkboxes; the dev log reports no errors.

NOT VERIFIED:
- No visual confirmation in a real browser: the Chrome extension is still not connected in this session, so the animations, hover states and the dark palette were verified through stylesheets, computed contrast and rendered markup, never by looking at the page.
- Mobile rendering again reviewed through the stylesheets rather than measured at 360px.

LIMITATIONS:
- `prefers-reduced-motion` is honoured by a global override plus per-component rules; that path was not exercised with the media feature actually enabled.
- The pointer-tracking button highlight is a hover affordance and does nothing on touch devices, where the button still reads correctly but shows only its gradient.

FOLLOW_UP:
- View the running app and adjust motion intensity; the entrance timings are deliberately conservative and can be pushed further.
- Consider a light-theme token set behind `prefers-color-scheme` if a judge views the demo in a bright room.

## TASK TASK-CLAUDE-20260918-profile-wizard

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: c7d6e0d5ba01a0799db836f60b634009101b5c9f
SCOPE: Replace the single long profile form with a one-question-at-a-time wizard so the applicant never faces a wall of buttons.

FILES:
- `src/features/profile/**`
- `src/features/journey/JourneyExperience.tsx`
- `src/components/ChoiceGroup.*`
- `AGENTS_CHANGELOG.md`

DEPENDENCIES:
- `TASK-CLAUDE-20260917-dark-visual-system`

ASSUMPTIONS:
- Single-choice questions may auto-advance; slider and multi-select questions need an explicit continue, because the user is not finished choosing.
- The domain profile shape stays unchanged; this is a presentation change only.

ACCEPTANCE:
- At most one question is visible at a time, with at most five options on screen.
- Progress through the six questions is visible, and any answered question can be reopened from a summary rail.
- Keyboard: digits select an option, arrows move within a group, Enter continues.
- `npm run typecheck`, `npm run lint`, `npm run build` exit 0.

### COMPLETE TASK-CLAUDE-20260918-profile-wizard

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- The profile step is now a six-question wizard instead of one long form. The first screen shows three options where the old form showed roughly twenty controls at once.
- Single-choice questions apply the answer and open the next question after 260 ms; the GPA scale and the two multi-select questions wait for an explicit continue, because the user has not finished answering when the first control changes.
- Each question owns the screen: large title, one-line rationale, and option cards with a numbered key hint, a label, a supporting line and a fill-in check indicator.
- A summary rail under the question shows all six answers as chips; clicking any chip reopens that question, so nothing is buried.
- Keyboard: digits 1-9 pick an option, arrow keys move within the native radio group, Enter continues. The handler steps aside when the slider or a button has focus.
- Removed `ProfileForm` and the `ChoiceGroup` primitive it was the only consumer of.

COMMITS:
- UNCOMMITTED

FILES:
- `src/features/profile/{ProfileWizard.tsx,ProfileWizard.module.css,profileQuestions.ts}` (new)
- `src/features/profile/{ProfileForm.tsx,ProfileForm.module.css}` (deleted)
- `src/components/{ChoiceGroup.tsx,ChoiceGroup.module.css}` (deleted)
- `src/features/journey/JourneyExperience.tsx`

BEHAVIORAL CHANGES:
- The outer section heading is suppressed on the profile step: the wizard carries its own title and progress, and showing both read as two competing headers.
- Profile validation moved from a blocking message under the submit button to a per-question rule: continue is disabled only on the question that is actually unanswered.

ARCHITECTURE / DECISIONS:
- Question order, copy and chip labels live in `profileQuestions.ts` as data, so adding a question is a data change rather than a JSX change.
- No domain change: the wizard writes the same `ApplicantProfile` shape the form did, so diagnosis, ranking and roadmap rules are untouched and remain covered by the earlier verification.

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0.
- `git diff --check` → exit 0.
- Type-check and lint both pass after deleting `ProfileForm` and `ChoiceGroup`, which confirms nothing else referenced them.
- Orphaned-CSS-reference script → no `styles.X` reference without a matching class.
- Server-rendered `/journey`: the first screen emits exactly three radio options and no checkboxes, the progress control reports "Вопрос 1 из 6", six summary chips render, and each option carries its numbered key hint. No other question's text appears in the markup, so only one question is on screen.
- Dev server log clean.

NOT VERIFIED:
- The Chrome extension is still not connected, so auto-advance timing, the keyboard shortcuts, chip navigation and the entrance animation between questions were not exercised by interacting with the page.
- Mobile layout reviewed through the stylesheet (single-column options, 68px option targets) rather than measured.

LIMITATIONS:
- Changing an already-answered single-choice question from the summary rail auto-advances to the following question rather than returning to where the user came from.
- Question order is fixed; there is no conditional branching.

FOLLOW_UP:
- Consider a final review screen before the diagnosis so the applicant confirms all six answers at once.

## TASK TASK-CLAUDE-20260918-living-background

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: c7b5e2a-successor (working tree on top of the profile wizard task)
SCOPE: Replace the static landing aurora with an ambient animated background in the existing palette.

FILES:
- `src/components/{LivingBackground.tsx,LivingBackground.module.css}` (new)
- `src/app/page.tsx`
- `src/app/globals.css`

DEPENDENCIES:
- `TASK-CLAUDE-20260917-dark-visual-system`

ASSUMPTIONS:
- Ambient decoration must stay inert: no pointer events, hidden from assistive tech, and never a reason for the page to re-render.

### COMPLETE TASK-CLAUDE-20260918-living-background

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- The landing background is now four layers in the existing green palette: four aurora blobs that morph their shape as they drift, a dot grid that lights up only around the pointer, eighteen motes drifting upward on staggered loops, and a fine grain that kills gradient banding, closed by a vertical veil that fades the stack into the page.
- The background is `position: fixed`, so it stays alive while the page scrolls instead of scrolling away.
- Pointer position is written directly to CSS custom properties and coalesced into one write per animation frame, so moving the mouse never triggers a React render.

COMMITS:
- UNCOMMITTED

FILES:
- `src/components/{LivingBackground.tsx,LivingBackground.module.css}` (new)
- `src/app/page.tsx` (rewritten wrapper; background now a sibling of `main`)
- `src/app/globals.css` (removed the `.aurora` block, the `drift` keyframes and `overflow: clip` on `main`)

ARCHITECTURE / DECISIONS:
- CSS animations plus one pointer listener instead of a canvas or an animation dependency: the effect is ambient, so per-frame JavaScript painting would cost battery for no visual gain.
- Mote geometry is derived from the element index rather than `Math.random()`, because server and client markup must match or hydration breaks.
- The background renders as a sibling of `main` rather than a child, so a fixed layer is never at the mercy of a containing block created on an ancestor.

DEPENDENCIES / CONFIG:
- No package change.

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0.
- `git diff --check` → exit 0.
- Server-rendered `/`: four blob layers, eighteen motes carrying their `--duration` custom property, the grid, grain and veil layers all present; no `class="aurora"` remains; hero content and the primary call to action still render. Dev server log clean.
- Grep confirms `.aurora` and the `drift` keyframes are gone from `globals.css`, so no dead rule was left behind.

NOT VERIFIED:
- The Chrome extension is still not connected, so the motion itself, the pointer-tracked grid reveal and the frame cost were never observed in a browser. Performance was addressed by construction, not by measurement.

LIMITATIONS:
- Four large blurred layers are the expensive part of this effect. Phones drop to two blobs at a smaller blur radius, half the motes and no grain, but this was reasoned about rather than profiled on a device.
- The pointer-tracked grid reveal is a desktop affordance; on touch it simply keeps its default centre.
- `prefers-reduced-motion` freezes the blobs, hides the motes and pins the grid highlight, but that path was not exercised with the media feature enabled.

FOLLOW_UP:
- Profile the landing on a mid-range phone and cut the blur radius further if frames drop.
