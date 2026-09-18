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

## TASK TASK-CLAUDE-20260918-less-text-more-visuals

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: 835ad3a66feaa4f8a81de9caebf7c072b465a417
SCOPE: Cut on-screen copy across the journey and replace text with Lucide icons and licensed photography.

FILES:
- `package.json`, `package-lock.json` (lucide-react)
- `public/images/**`
- `src/app/**`
- `src/components/**`
- `src/domain/profile.ts` (option copy only)
- `src/features/**`
- `README.md`, `AGENTS_CHANGELOG.md`

DEPENDENCIES:
- `TASK-CLAUDE-20260918-living-background`

ASSUMPTIONS:
- Lucide is the icon set named by AGENTS.md section 6; it is added as the single icon dependency.
- Photos come only from Unsplash under the Unsplash License and show generic student life, never an identifiable real campus: the catalogue institutions are fictional, and pairing them with a real building would fabricate a fact.
- Photos are stored locally so the demo does not depend on a third-party CDN at presentation time.

ACCEPTANCE:
- Every screen shows materially less prose; explanations required by AGENTS.md section 8 remain reachable.
- Emoji and text glyphs used as icons are replaced by Lucide icons.
- Landing shows licensed photography with credits recorded in the repository.
- `npm run typecheck`, `npm run lint`, `npm run build` exit 0.

### COMPLETE TASK-CLAUDE-20260918-less-text-more-visuals

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- Visible text across the five main screens dropped by 38% (1273 → 787 words), measured against the previous commit rather than estimated. Landing −50%, roadmap −52%, recommendations −33%, profile wizard −30%, diagnosis −18%.
- Lucide icons replaced every emoji and text glyph used as an icon, and replaced the explanatory hint lines under the wizard options.
- The landing now leads with a photo and floating badges, and the "how it works" cards each carry a photo. The three presets became compact icon chips with short titles.
- Recommendation cards show at most three badges and two reasons; the remaining reasons and the programme-format badges moved into the collapsed "Подробнее" section instead of disappearing. Facts became an icon row.
- Roadmap steps show their explanation only on the step the user is on now; season headers carry icons.

COMMITS:
- UNCOMMITTED

FILES:
- `package.json`, `package-lock.json` (added `lucide-react@^1.47.0`)
- `public/images/{hero-students,step-profile,step-match,step-plan}.jpg` (new)
- `src/components/optionIcons.ts` (new)
- `src/app/{page.tsx,globals.css}`
- `src/components/{ActionButton.tsx,ActionButton.module.css}`
- `src/domain/{profile.ts,roadmap.ts}`, `src/data/programs.ts`
- `src/features/profile/{ProfileWizard.tsx,ProfileWizard.module.css,profileQuestions.ts,QuickAdjustBar.tsx,QuickAdjustBar.module.css}`
- `src/features/diagnosis/{DiagnosisPanel.tsx,DiagnosisPanel.module.css}`
- `src/features/recommendations/{RecommendationCard.tsx,RecommendationCard.module.css,RecommendationList.tsx,RecommendationList.module.css}`
- `src/features/comparison/{ComparisonDialog.tsx,ComparisonDialog.module.css,ComparisonTray.tsx}`
- `src/features/roadmap/{RoadmapTimeline.tsx,RoadmapTimeline.module.css}`
- `src/features/progress/{ProgressPanel.tsx,Progress.module.css}`
- `src/features/journey/JourneyExperience.tsx`
- `README.md`

CONTRACTS / INTERFACES:
- `LabelledOption` lost its optional `hint` field and the domain options lost their hint strings: nothing rendered them once icons took their place.
- `ProfilePreset` lost `emoji` and `description`; icons are a presentation concern and now live in the UI.
- `RoadmapPhase` lost `summary`, which no screen rendered any more.
- `DEMO_DATA_NOTICE` was shortened and is now the single source for the disclaimer in both the recommendation list and the comparison dialog.

DATA / SCHEMA / STATE:
- The diagnosis explanations were kept on purpose: AGENTS.md section 8 requires each recommendation and status to be explainable, which is why that screen shrank least.
- Four photos were downloaded from `images.unsplash.com`, each viewed before use. Two further candidates were rejected: an ABC-blocks still life that reads as preschool, and a conference room of adults. No image depicts an identifiable real campus, because the catalogue institutions are fictional and pairing them with a real building would fabricate a fact. Source URLs and the licence are recorded in `README.md`; photographer names are not recorded because they were not verified.

DEPENDENCIES / CONFIG:
- `lucide-react@^1.47.0`: the icon set AGENTS.md section 6 names, one package with no transitive dependencies, peer range covers React 19, `npm audit` reports 0 vulnerabilities.

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0.
- `git diff --check` → exit 0.
- Domain harness recreated in the scratchpad (the previous copy was lost when the scratchpad reset between days) and run against the changed domain: 25 of 25 assertions pass with the same figures as before (4 / 6 / 4 / 4 matches per preset, budget widening 4 → 11), so removing the presentational fields changed no ranking, diagnosis or roadmap behaviour.
- Word counts: the previous commit was built in a temporary git worktree (webpack, because Turbopack rejects a symlinked `node_modules`) and served beside the current build; visible words were counted from the rendered HTML of both, excluding scripts, collapsed `<details>` bodies, screen-reader-only labels and the closed dialog. The worktree was removed afterwards.
- All four photos return HTTP 200 through the Next image optimiser as WebP, 16–32 KB at 640 px width; every `<img>` carries a Russian `alt`.
- Script checks: no `styles.X` reference without a matching class; no emoji or text glyph icon left in any TSX file.

NOT VERIFIED:
- The Chrome extension is still not connected, so the new layout, the photo tinting and the icon alignment were checked through markup and stylesheets, never by looking at the rendered page.
- Mobile width: floating badges were pulled inside the gutter at ≤520 px by construction, but no 360 px measurement was taken.

LIMITATIONS:
- The keyboard digit shortcuts in the wizard still work but are no longer advertised, because the numbered badges gave way to icons.
- Photographer attribution is not shown; the Unsplash License does not require it, but it is customary.

FOLLOW_UP:
- Add photographer credits once the names are confirmed on each Unsplash photo page.

## TASK TASK-CLAUDE-20260918-wizard-manual-advance

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: 2ccf6ee58f045b8c525755550ae3875b2748c376
SCOPE: Stop the profile wizard from advancing on its own after a single-choice answer.

### COMPLETE TASK-CLAUDE-20260918-wizard-manual-advance

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- User report: picking an option on a single-choice question (grade, English, budget) jumped to the next question without pressing "Далее". The user wants to confirm each answer themselves.
- Selecting an option now only records the answer. The only ways to move are "Далее", Enter, "Назад" and the summary chips.

FILES:
- `src/features/profile/ProfileWizard.tsx` (removed the 260 ms advance timer, its ref, its cleanup effect and the three call sites that cleared it)
- `src/features/profile/profileQuestions.ts` (comment no longer claims single-choice questions advance)

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0.
- `git diff --check` → exit 0.
- Grep for `setTimeout`, `AUTO_ADVANCE`, `advanceTimer`, `clearTimer` in the wizard → no matches.

NOT VERIFIED:
- Not clicked through in a browser; the Chrome extension is not connected.

LIMITATIONS:
- NONE

## TASK TASK-CLAUDE-20260918-mobile-tap-fix

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: 1c2f3c20c8f930359348f914ffff260820c99063
SCOPE: Make buttons respond to the first tap on mobile.

### COMPLETE TASK-CLAUDE-20260918-mobile-tap-fix

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- User report: on mobile, tapping most buttons shows a highlight but does not trigger the action.
- Every :hover rule in the project (28 rules across 9 stylesheets) now sits inside `@media (hover: hover)`, so touch devices never receive hover styles.
- The pointer-tracked highlight on `ActionButton` and the pointer-tracked grid in `LivingBackground` now ignore non-mouse pointers.
- The convention is documented in the header comment of `globals.css`.

ROOT CAUSE:
- Most likely iOS Safari: when a hover rule reveals content, Safari spends the first tap on the hover state and dispatches the click only on a second tap. `ActionButton`, the primitive behind most buttons, revealed two pseudo-elements on hover (a pointer-tracked highlight at opacity 0→1 and a sheen animation), and it wrote inline styles on every pointer move, including during a touch. That matches the reported "a frame appears but nothing happens" and "almost all buttons".
- This mechanism is iOS-only and could not be reproduced here. It is the diagnosis the evidence supports, not a confirmed one.

DEBUG TRAIL:
- Built a CDP harness that drives headless Chrome 153 at a 390x844 mobile viewport and sends real touch events. The first two runs reported failures that turned out to be harness bugs, not app bugs: (1) the project sets `scroll-behavior: smooth`, so coordinates were read before scrolling finished; (2) page-space `getBoundingClientRect` coordinates do not match the space `Input.dispatchTouchEvent` uses under mobile emulation. An event trace showed the taps landing on neighbouring elements. Switching to `DOM.getContentQuads`, which is what Puppeteer uses, fixed the harness.
- With correct coordinates, all ten tested controls worked on the first tap in Chrome **before** the fix. So the defect does not reproduce in Chromium, which points to a WebKit-specific cause.

FILES:
- `src/app/globals.css`, `src/components/ActionButton.module.css`, `src/features/comparison/ComparisonDialog.module.css`, `src/features/diagnosis/DiagnosisPanel.module.css`, `src/features/journey/JourneyExperience.module.css`, `src/features/profile/ProfileWizard.module.css`, `src/features/profile/QuickAdjustBar.module.css`, `src/features/recommendations/RecommendationCard.module.css`, `src/features/roadmap/RoadmapTimeline.module.css` (hover rules wrapped in place; source order preserved so the later reduced-motion overrides still win)
- `src/components/ActionButton.tsx`, `src/components/LivingBackground.tsx` (mouse-only pointer tracking)

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0.
- `git diff --check` → exit 0.
- Inventory script: 28 top-level :hover rules before, 0 after outside `@media (hover: hover)`; the 9 remaining nested hover selectors are all inside `prefers-reduced-motion` blocks and only cancel motion. The grep count of 43 hover selector lines agrees.
- Phone (headless Chrome, `hover: none`, touch): tapping "Далее" advances the wizard, and the button's `::before` highlight stays at opacity 0 after the tap.
- Desktop (Chrome with a fine hover-capable pointer, via `--blink-settings`): `(hover: hover)` matches, the `::before` highlight reaches opacity 1 under the cursor, and the pointer tracking writes `--mx`. Desktop effects are intact.
- Full touch suite after the fix, 10 of 10 pass: wizard option, "Далее", "Назад", summary chip, landing "Начать", a preset chip, "Сравнить", a quick-adjust budget chip, the stepper, "Выполнено".

NOT VERIFIED:
- Not verified on an actual iPhone or in WebKit. The iOS click-suppression behaviour cannot be reproduced in Chromium, so the fix removes the known trigger without a direct before/after on the affected browser. The user should confirm on their device.

LIMITATIONS:
- If the reporting device was not iOS Safari, this diagnosis may not be the cause.

### CORRECTION TASK-CLAUDE-20260918-mobile-tap-fix

AGENT: CLAUDE
CORRECTS: the ROOT CAUSE section of `COMPLETE TASK-CLAUDE-20260918-mobile-tap-fix`

OLD:
- The dead buttons were most likely iOS Safari spending the first tap on hover-revealed content, and gating :hover behind `@media (hover: hover)` was the fix.

NEW:
- The actual cause was the Next.js dev server blocking cross-origin access to its dev assets. The phone opened the dev server by its LAN address (`http://192.168.1.49:3000`). The dev server only trusts `localhost` and the hostname it was started with, so it blocked those requests. The HTML and CSS still arrived, which is why a tap drew a highlight, but React never hydrated, so every `onClick` button was dead. Plain `<a>` links and native radio inputs kept working, which explains "almost all buttons".
- Fix: `allowedDevOrigins: ["192.168.*.*"]` in `next.config.ts`. It affects the dev server only; `next build` / `next start` and deployments never had this problem.
- The hover gating from the original entry did not fix this bug. It stays as a separate improvement (no sticky hover on touch screens, and it removes the known iOS double-tap trigger), but it was not the cause.

EVIDENCE:
- The dev server log contained `Blocked cross-origin request to Next.js dev resource /_next/hmr from "192.168.1.49"`.
- Same CDP touch harness, same headless Chrome, 390x844 viewport:
  - via `http://localhost:3000`: 10/10 controls work, both before and after the hover change;
  - via `http://192.168.1.49:3000` **with the hover change already applied** but without `allowedDevOrigins`: 7 controls fail. Every React button receives the click with no effect, while links, preset chips and the native radio still work;
  - via `http://192.168.1.49:3000` after adding `allowedDevOrigins` and restarting dev: 10/10 work, and the new dev log has 0 blocked requests.
- The allowlist semantics come from the version-matched docs at `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.md`: `*` matches exactly one hostname label, so `192.168.*.*` covers `192.168.x.y` and nothing broader.
- `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` → exit 0.

FILES:
- `next.config.ts`

SECURITY NOTE:
- This relaxes a dev-server safety default for the private `192.168.0.0/16` range only, and only in development. It does not affect production builds.

## TASK TASK-CLAUDE-20260918-journey-persistence

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: d660e106020913b2c790b9d9b6a1651607ce6990
SCOPE: Persist the journey (profile, current step, completed roadmap steps) across reloads, with a way to start over.

FILES:
- `src/app/journey/page.tsx`
- `src/domain/profile.ts` (stored-profile validation)
- `src/lib/**`
- `src/features/journey/**`
- `AGENTS_CHANGELOG.md`

DEPENDENCIES:
- NONE

ASSUMPTIONS:
- localStorage is the persistence layer (AGENTS.md section 6 allows it for demo persistence); no backend.
- Stored data is untrusted input and is validated on read; anything invalid or from another schema version is discarded, never partially trusted.
- A preset in the URL is an explicit request to start from that example: it wins over stored state and starts with a clean roadmap. URL parameters are consumed once and then removed, so a reload restores the saved session instead of re-applying the preset.
- The comparison selection and the wizard's current question are transient and are not persisted.

ACCEPTANCE:
- Reloading any journey step keeps the profile, the step and the marked roadmap progress.
- Corrupt, foreign or unavailable storage never breaks the page; the journey falls back to defaults or in-memory state.
- A visible control resets the journey and clears the saved state.
- No hydration mismatch.
- `npm run typecheck`, `npm run lint`, `npm run build` exit 0.

### COMPLETE TASK-CLAUDE-20260918-journey-persistence

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- The journey survives reloads: the profile, the current step and the marked roadmap steps are written to localStorage on every change and restored on the next visit.
- A preset link is an explicit fresh start: it wins over saved state and begins with an empty roadmap. `?preset` and `?step` are consumed once and then removed from the address with `history.replaceState`, so reloading after a preset restores the session instead of re-applying the preset.
- "Начать заново" in the top bar resets the journey after an inline confirmation; the safe "Нет" receives focus.
- A skeleton covers the moment between server render and the client reading storage.

COMMITS:
- UNCOMMITTED

FILES:
- `src/domain/profile.ts` (added `parseApplicantProfile`)
- `src/lib/browserStorage.ts` (new)
- `src/features/journey/{journeyPersistence.ts,JourneyEntry.tsx,JourneySkeleton.tsx,JourneySkeleton.module.css,ResetControl.tsx,ResetControl.module.css}` (new)
- `src/features/journey/{JourneyExperience.tsx,JourneyExperience.module.css}`
- `src/app/journey/page.tsx`

CONTRACTS / INTERFACES:
- `JourneyExperience` now takes a single `initial: JourneySnapshot` prop instead of `initialProfile` / `initialStep`; `JourneyEntry` is the only caller.
- Storage key `bilsenbol.journey`, payload `{ version: 1, profile, step, completedStepIds }`. Changing that shape requires bumping `STORAGE_VERSION`, which discards older payloads rather than misreading them.

ARCHITECTURE / DECISIONS:
- Hydration: the server cannot see localStorage. `JourneyEntry` uses `useSyncExternalStore` with a server snapshot of `false`, so the server render and the hydration pass both output the skeleton, and the client mounts the real journey only after hydration. That rules out a mismatch without an effect that sets state (which `react-hooks/set-state-in-effect` rejects) and without `next/dynamic`.
- Stored data is untrusted. `parseApplicantProfile` and `parseStoredJourney` validate every field against the domain option lists and reject the whole payload on any invalid field, never repairing it: a guessed field would silently change the recommendations. The one normalisation is de-duplicating list entries.
- A hand-written validator instead of Zod: the shape has six enumerable fields, so adding a dependency would not pay for itself (AGENTS.md section 11).
- Every storage access goes through `browserStorage.ts`, which never throws, because storage can be absent, blocked by privacy settings, or full.
- The comparison selection and the wizard's current question are deliberately not persisted.

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0.
- `git diff --check` → exit 0.
- Pure-function checks (compiled into the scratchpad), 20/20: valid profile accepted; unknown grade, out-of-range, string or NaN GPA, unknown field, and non-object inputs rejected; duplicate fields collapsed; payloads with the wrong or a missing version, an unknown step, non-string ids, more than 100 ids, or one invalid nested field rejected whole; the resolution rules give defaults when nothing is stored, restore the saved session, let a preset win and clear progress, let `?step` override the saved step, and keep an incomplete profile on the profile step.
- Headless Chrome with touch at 390x844 against the dev server, 20/20 scenarios:
  - A: a preset link loses its query string after use; "Выполнено" gives 9%; a budget chip switches; after a reload the step, the 9% and the budget are all intact.
  - B: with saved progress, a preset link opens diagnosis and the roadmap restarts at 0%.
  - C: non-JSON, foreign-version, and invalid-enum payloads each fall back to the first wizard question, and the page stays alive.
  - D: with `window.localStorage` made to throw on access, the page renders and the buttons work.
  - E: the reset asks for confirmation with focus on "Нет"; "Да" returns to the first question; the reset survives a reload; the stored payload is the default profile with empty progress.
  - Zero console errors or warnings across the whole run, and no hydration message.
- The 10-control tap suite still passes 10/10.

NOT VERIFIED:
- Not exercised on a physical phone.
- The skeleton's appearance was not visually reviewed.

LIMITATIONS:
- Progress is per browser: no account or sync, as expected for localStorage.
- The landing page still labels its call to action "Начать" even when a saved session exists; it now resumes that session rather than starting fresh.

FOLLOW_UP:
- Consider showing "Продолжить" on the landing page when a saved session exists.

## TASK TASK-CLAUDE-20260918-ux-requirements-audit

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: bd7e6d04a210418a111b19885abf723cf7d1a87f (on top of the uncommitted journey-persistence work)
SCOPE: Audit the product against the hackathon's mandatory UX/UI requirements and fix the gaps found.

FILES:
- `src/**` as the audit requires
- `AGENTS_CHANGELOG.md`

DEPENDENCIES:
- `TASK-CLAUDE-20260918-journey-persistence`

ACCEPTANCE:
- Each of the six mandatory requirements is checked against rendered screens, not only against source.
- Every gap found is fixed or reported with a reason.
- `npm run typecheck`, `npm run lint`, `npm run build` exit 0.

### COMPLETE TASK-CLAUDE-20260918-ux-requirements-audit

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- First audit against rendered pages rather than source: headless Chrome screenshots at 390 and 1280 px, plus a scripted horizontal-overflow measurement at 360, 390 and 1280 px on every screen, the comparison dialog included.
- Found and fixed eight problems against the six mandatory requirements:
  1. (req. 4) Every journey screen scrolled sideways on phones: 74 px at 360, 44 px at 390. Measured cause: the shell grid's single `1fr` column blew out to the stepper's 418 px min-content. Fixed with `minmax(0, 1fr)`; now 0 px everywhere.
  2. (req. 1) The phone stepper hid step 4 off-screen. It is now four equal columns at every width; the step is renamed "Разбор" so all names fit (the landing already says "разбор"), and the word "Шаг" hides on phones.
  3. (req. 2) Number agreement was wrong ("1 программ требуют", "года/лет", "из 11 шагов" regardless of count). Added `pluralRu` on `Intl.PluralRules("ru-RU")` and fixed every count phrase; the edge cases 0, 1, 2, 4, 5, 11–14, 21, 22, 25, 101, 111 were checked. Where verb agreement would be clumsy, the sentence was rebuilt as "Подходящих программ: N".
  4. (req. 2) The roadmap said "start from the shortlist above" on a screen that has none; reworded.
  5. (req. 4) The comparison dialog clipped long Russian words on phones. The heading size is now 0.86rem so they fit whole, with `overflow-wrap: break-word` as a last resort. `hyphens: auto` alone was not enough: headless Linux Chrome has no Russian hyphenation.
  6. (req. 3) On desktop, the English chips stretched to the height of the budget row; fixed with `align-items: start`.
  7. (req. 4) On a phone, the first screen of the recommendations step was all controls. The conditions panel now collapses to a single "Ваши условия" line with an "Изменить" disclosure, so a programme card is visible on the first screen.
  8. (req. 5) A profile edit only changed numbers in place, and on the roadmap step often nothing visible changed. Added a "Что изменилось" banner next to the control used. It reports the programme count (with direction), the new status, a new leading programme, and plan steps added or removed, named individually. When an edit changes nothing, it says so. The plan comparison uses step ids, not counts, because swapping one step for another keeps the count identical.
  9. (req. 6) The roadmap's general advice about documents and deadlines had no label nearby; added a notice between the next action and the timeline.
- Checked and found satisfied without change: req. 2 explanation depth (reasons, trade-off, blocker, improvement per card) and req. 6 on cards, the comparison dialog and the top bar.

FILES:
- `src/lib/plural.ts` (new)
- `src/features/journey/{profileImpact.ts,ProfileImpact.tsx,ProfileImpact.module.css}` (new)
- `src/features/journey/{JourneyExperience.tsx,JourneyExperience.module.css,steps.ts}`
- `src/features/profile/{QuickAdjustBar.tsx,QuickAdjustBar.module.css}`
- `src/features/comparison/ComparisonDialog.module.css`
- `src/features/progress/ProgressPanel.tsx`
- `src/features/recommendations/RecommendationList.tsx`
- `src/domain/{diagnosis.ts,roadmap.ts,matching.ts,comparison.ts}` (copy and pluralisation only; no ranking, eligibility or roadmap rule changed)

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0.
- `git diff --check` → exit 0.
- Horizontal overflow at 360 / 390 / 1280 px on landing, wizard, diagnosis, recommendations, roadmap and the comparison dialog → 0 px everywhere; before the fix, 74 and 44 px on every journey screen at phone widths.
- Impact banner scenarios in the browser, all pass:
  - the panel starts collapsed and shows the current conditions;
  - no banner appears before an edit;
  - budget $8k → $3k shows "Программ: 6 → 5" and the collapsed line updates;
  - Duolingo → TOEFL shows the no-change message;
  - school → IELTS on the roadmap names the new status and the swapped plan step;
  - the banner clears on step change;
  - the roadmap notice is present.
- Regressions: the tap suite at 11/11 (one step added to open the collapsed panel), the persistence suite passes in full with zero console errors and no hydration warning, no `styles.X` without a CSS class, and 0 top-level :hover rules outside `@media (hover: hover)`.
- Screenshots reviewed by eye for the phone stepper, the phone recommendations first screen, the comparison dialog, the roadmap notice and the impact banner.

NOT VERIFIED:
- Still no physical-device run; phone behaviour is headless Chrome emulation.

LIMITATIONS:
- The collapsed conditions line truncates with an ellipsis on narrow phones (for example "До $8 000 в год · Duoling…"); the full values are one tap away.
- The impact banner reports only edits made from result screens; edits in the wizard are not diffed, because nothing has been shown to the user yet.

## TASK TASK-CLAUDE-20260918-case-pdf-gaps

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: ba5e121e17a830ba5eed693a622905bd46a94f7d
SCOPE: Close the product gaps found against the official case PDF (LOCUS Hackathon 2026, case 02).

FILES:
- `src/domain/{matching,roadmap,diagnosis}.ts`
- `src/features/{recommendations,profile,diagnosis,journey}/**`
- `AGENTS_CHANGELOG.md`

ACCEPTANCE:
- No badge implies an admission or scholarship chance (the PDF forbids invented precision and guarantees).
- Interests and regions can be changed from the result screens, and the change banner reports their effect (the jury scenario says "change budget, interest, country or exam").
- The roadmap contains an activities step, as the PDF's roadmap stage requires.
- The diagnosis states a profile summary and the educational goal, as the PDF's diagnosis stage requires.
- `npm run typecheck`, `npm run lint`, `npm run build` exit 0.

### COMPLETE TASK-CLAUDE-20260918-case-pdf-gaps

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- Removed the "Высокий шанс на стипендию" badge. It was set only because a programme has a grant track, which says nothing about this applicant's chance, and the case PDF forbids invented precision and guarantees. The card never showed it anyway (the "100% грант" badge suppressed it), so it was also dead output. Two phrases using "шанс" were reworded; the word no longer appears anywhere in the UI.
- The collapsed "Ваши условия" panel now changes interests and regions as well as budget, English and GPA, because the PDF's jury scenario is "change budget, interest, country or exam". The last selected interest or region cannot be switched off (`aria-disabled`); the row label says so.
- The roadmap gained a field-specific extracurricular step (IT project or hackathon, economics olympiad, robotics, medical volunteering, debates), because the PDF's roadmap stage lists activities. Its id carries the field, so changing the main interest swaps the step and the change banner names it.
- The diagnosis now opens with a profile summary and the educational goal, as the PDF's diagnosis stage requires.
- Bug found by the new browser checks and fixed: adding a second interest reorders programmes without changing their count, leader or plan, and the change banner wrongly said "nothing changed". The banner now compares the ranking too: it names the biggest climber ("«Медицина» поднялась: 6 → 2 место"), or reports that scores were recalculated. The no-change message now appears only when ids, scores, status and plan are all identical.

FILES:
- `src/domain/{matching,roadmap,diagnosis}.ts`
- `src/features/recommendations/RecommendationCard.tsx`
- `src/features/profile/{QuickAdjustBar.tsx,QuickAdjustBar.module.css}`
- `src/features/diagnosis/{DiagnosisPanel.tsx,DiagnosisPanel.module.css}`
- `src/features/journey/{profileImpact.ts,ProfileImpact.tsx}`

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0.
- `git diff --check` → exit 0.
- 0 top-level :hover rules outside `@media (hover: hover)`.
- Domain harness recompiled with `lib/plural`: all original assertions still pass. Twelve new ones pass: for every preset, no badge mentions "шанс", the roadmap has an activities step, and the diagnosis has a summary and a goal; changing the interest swaps the activities step and changes the ranking; changing the region changes the match count (6 → 2).
- Browser change-banner suite, all pass:
  - budget $8k → $3k: "Программ: 6 → 5" plus the climber;
  - Duolingo → TOEFL: exactly the no-change message (asserted strictly);
  - school → IELTS: new status and the swapped plan step;
  - adding Медицина: "«Медицина» поднялась: 6 → 2 место";
  - removing IT: the new leader and the swapped activities step;
  - removing Азия: "Программ: 6 → 4";
  - the last interest cannot be removed.
- Tap suite 11/11; persistence suite passes with 0 console messages; horizontal overflow 0 px at 360 and 390 px on diagnosis, recommendations with the panel open, and roadmap.
- Screenshots reviewed for the diagnosis summary block and the expanded conditions panel.

LIMITATIONS:
- A programme can be reported as "поднялась" because programmes above it dropped out, not because its own score rose. That is positionally true, but it is not always the most informative line.
- The profile still asks only about English among exams; national exams (ЕНТ, ЕГЭ, SAT) are not modelled.

## TASK TASK-CLAUDE-20260918-readme-submission

AGENT: CLAUDE
STATUS: DONE
SCOPE: Rewrite README.md in Russian to cover every item the case PDF requires for submission.

### COMPLETE TASK-CLAUDE-20260918-readme-submission

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- README now covers every PDF item — task, solution (mapped to all seven case stages and to each mandatory UX requirement), stack, architecture (layer layout, the factor-scoring table, persistence), launch, a test scenario mirroring the jury scenario, team, sources, AI/API, ready-made components, limitations — plus the technical reference the PDF allows inside the README.
- States explicitly that the match score measures profile fit, not admission probability.
- States honestly that the product calls no language model and that the automated checks run during development are not committed.

FILES:
- `README.md`

VERIFICATION:
- Every factual claim was cross-checked against source: 10 comparison criteria; factor weights 6 / 34 / 6–18 / 14–12–9 / 0–14 / 8 / 6; button labels "Дальше: …", "Построить мой маршрут", "Начать заново", "Ничего не подошло"; the empty-state suggestion text; package versions read from `node_modules`.
- The empty-state recipe in the test scenario (IT preset + "$0 — только грант" + only USA) was run through the domain rules: 0 programmes, excluded budget 1 / GPA 1 / region 12.
- `git diff --check` → exit 0.

NOT VERIFIED:
- The rendered README on GitHub.

LIMITATIONS:
- Two placeholders are marked "⚠ ЗАПОЛНИТЬ" and must be filled by the team: the deployed demo URL and the team roster with roles.

## TASK TASK-CLAUDE-20260918-gemini-roadmap

AGENT: CLAUDE
STATUS: DONE
BASE_COMMIT: bb03b97a2b1e4ecbef2d2315175c3951c41eb4b6
BRANCH: feat/ai-roadmap (master stays a valid submission until this passes verification)
SCOPE: Personalise the roadmap with Gemini on top of the rule-based skeleton, with strict validation and a fallback to the rules.

FILES:
- `src/server/ai/**` (new)
- `src/app/api/roadmap/route.ts` (new)
- `src/features/roadmap/**`, `src/features/progress/**`, `src/features/journey/**`
- `package.json`, `package-lock.json` (zod)
- `.env.example`, `README.md`, `AGENTS_CHANGELOG.md`

ASSUMPTIONS:
- The rules keep producing the roadmap skeleton and the progress backbone; the model only adds per-step advice, a strategy summary and optional extra suggestions. Progress never depends on model availability.
- Model text must not introduce numbers, dates, prices, scores, real institutions or chances (the case PDF forbids unconfirmed deadlines and invented precision). This is enforced in code, not only in the prompt.
- Free-tier quotas can run out; every failure degrades to the rule-based plan.
- The API key lives only in server environment variables.

ACCEPTANCE:
- With a key, the roadmap shows Gemini's personal advice; without a key, or on an error or timeout, it shows the rule plan with a quiet notice.
- Malformed, oversized or number-containing model output is rejected field by field.
- `npm run typecheck`, `npm run lint`, `npm run build` exit 0.

### UPDATE TASK-CLAUDE-20260918-gemini-roadmap

AGENT: CLAUDE
STATUS: READY_FOR_REVIEW
BRANCH: feat/ai-roadmap (not merged; master is untouched)

SUMMARY:
- Gemini personalises the roadmap on top of the rule skeleton. It returns a strategy summary, advice for every rule step (the next step's advice appears in the "Следующий шаг" card), and up to three extra suggestions per season in a "План от ИИ" card. Progress and the skeleton never depend on the model.
- Built on `generateContent` over plain `fetch`, not the newer Interactions API, which stores requests by default. `gemini-3.8-flash` and every field name were confirmed in the current official docs, not from memory; the docs had changed since my training data.
- Guardrails in code:
  - the model sees the profile in words, never numbers;
  - allowed step ids are an `enum` in the response schema;
  - every text field is validated separately (length, no URLs, no digits at all), so invented dates, prices, scores and chances cannot reach the screen;
  - the server rebuilds the skeleton from the validated profile and trusts nothing the client says about it;
  - the key is read only from server env;
  - logs carry the failure reason, never the profile.
- Resilience: 20 s model timeout and `maxDuration = 30`; any failure (no key, HTTP error, 429, block, truncation, bad JSON, nothing valid) degrades to the rule plan with one quiet line. One profile means one call, cached per instance on the server and in `localStorage` on the client. Edits are debounced 700 ms. The model is called only on the roadmap step. At most 20 upstream calls per minute per instance.

FILES:
- `src/features/roadmap/{roadmapAdvice.ts,useRoadmapAdvice.ts,AiRoadmapCard.tsx,AiRoadmapCard.module.css}` (new)
- `src/server/ai/{gemini.ts,roadmapPrompt.ts}` (new)
- `src/app/api/roadmap/route.ts` (new)
- `src/features/progress/{ProgressPanel.tsx,Progress.module.css}`
- `src/features/journey/JourneyExperience.tsx`
- `.env.example` (new), `README.md`, `package.json`, `package-lock.json` (zod 4.6.5, no dependencies, 0 vulnerabilities)

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0; `/api/roadmap` builds as a dynamic route.
- `git diff --check` → exit 0.
- Sanitizer and prompt, 24/24:
  - a valid reply passes;
  - dates, scores, prices, non-ASCII digits and links are removed field by field;
  - unknown and duplicate step ids are dropped, and so are over-length texts;
  - extras are capped at three, and an unknown season drops only that one item;
  - markdown is stripped;
  - malformed shapes and non-objects return null;
  - for each preset, the model payload contains no digits, the schema's id enum equals the rule steps, and at most three programmes are sent.
- Adapter with a mocked `fetch`, 15/15: no key (no request made); success; key sent in the `x-goog-api-key` header and never in the URL; endpoint and body shape; thought parts ignored; 429; timeout; network error; prompt blocked; MAX_TOKENS; SAFETY; non-JSON text; broken body; `GEMINI_MODEL` override.
- Route against the dev server: broken JSON → 400, invalid profile → 400, empty interests → 400, GET → 405. A valid profile returns `unavailable`, because the placeholder key is rejected by Google (HTTP 400). The log says only `[roadmap-ai] unavailable: http 400`, with zero profile fields.
- Browser, 16/16, with `/api/roadmap` intercepted over CDP:
  - the loading skeleton shows while the rule plan is already visible;
  - the AI card, strategy and next-step advice render;
  - the planted date and planted price are removed client-side;
  - exactly one request is made;
  - a reload is served from cache with zero requests;
  - two quick budget edits produce one request;
  - the unavailable state is quiet, and the previous profile's advice is not shown;
  - returning to an earlier profile is served from cache;
  - the diagnosis step never calls the model;
  - zero console errors.
- Regressions: tap suite 11/11, persistence suite passes, change-banner suite passes, no horizontal overflow at 360/390 px.
- Mobile screenshots of the AI card reviewed; a duplicated disclaimer sentence was removed.

NOT VERIFIED:
- **No live Gemini call has run.** `.env.local` holds a three-character placeholder instead of a key, which Google rejects. Model availability on the free tier, real latency, the quality of real output, and how much of it survives the no-digits filter are all unmeasured.

NEXT:
- With a real key: run each preset through the route live and record latency and how many fields the filter kept. If too much advice is dropped for digits, tune the prompt rather than loosen the filter.
- Then merge into master and redeploy with `GEMINI_API_KEY` set on Vercel.

### COMPLETE TASK-CLAUDE-20260918-gemini-roadmap

AGENT: CLAUDE
STATUS: DONE (on branch `feat/ai-roadmap`; merging into master is the user's call)

SUMMARY:
- The live verification that was missing is done, and it changed the model choice.

DEBUG TRAIL:
- First live run on `gemini-3.8-flash` (the model the docs recommend): two presets timed out at 30 s and one returned 503. The fallback to rules behaved correctly.
- Probing separated the causes. A one-word prompt to `gemini-3.8-flash` still timed out at 45 s, so the problem was free-tier overload, not our prompt or thinking settings. `gemini-3.5-flash` answered 503 "high demand". `gemini-2.5-flash` rejected our schema: "too many states" from the step-id enum. `gemini-2.5-flash-lite` is listed by the models endpoint but returns 404 for new users. `gemini-2.5-flash`, `gemini-3.5-flash-lite` and `gemini-3.1-flash-lite` answered a one-word prompt in 0.8–6.4 s.
- Docs confirmed that thinking tokens count toward `maxOutputTokens`, so the limit was raised from 4096 to 8192 to avoid truncated answers. `thinkingConfig.thinkingLevel` is the accepted field; `minimal` is rejected by `gemini-3.8-flash`.

CHANGES:
- Default models are now `gemini-3.5-flash-lite` with fallback `gemini-3.1-flash-lite`. The adapter moves to the next model on timeout or HTTP errors (overload, quota, schema rejection), but not on blocked or malformed answers, because the same prompt is no safer on another model. `GEMINI_MODEL` accepts a comma-separated list.
- The per-attempt timeout is 12 s, so two attempts fit inside `maxDuration = 30`.
- README and `.env.example` updated with the models, the reasons for choosing them, and the live results.

VERIFICATION:
- Live `gemini-3.5-flash-lite`, called directly with the production prompt: 3.6–3.8 s per preset. The filter kept every strategy, 12/12, 12/12 and 11/11 step advice, and 3/3 extras; the model introduced zero digits.
- Live through `/api/roadmap` on the dev server: 3.3–4.0 s per preset, all `ready`; a repeated profile is served from the server cache in 9 ms; no failure lines in the log.
- Live in the browser at 390 px with no interception: "План от ИИ" and "Совет ИИ для вас" render, zero digits in AI text, zero console errors. The screenshot was reviewed: the advice refers to the preset's interests (business, international relations), its constraint (Foundation) and its budget.
- Adapter unit checks 19/19, including the chain: 503 on the primary returns the fallback's answer; a block does not call the fallback; both failing return the last reason after two attempts; list override.
- Mocked browser suite 16/16 still passes. `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` → exit 0.

LIMITATIONS:
- Live output quality is good but not perfect. Seen in samples: one misspelling ("стидиальных") and one case slip ("в Европе и Азию"). The filter checks form, not grammar or meaning, which is why the card says these are advice, not university requirements.
- Free-tier availability changes over time; the model chain and the rule fallback cover it, but a busy period may show the plan without AI.

NEXT:
- User: commit the branch, merge into master, set `GEMINI_API_KEY` in the Vercel project settings, deploy.

## TASK TASK-CLAUDE-20260918-ai-plan-page

AGENT: CLAUDE
STATUS: DONE
BRANCH: feat/ai-roadmap (on top of the uncommitted Gemini work)
SCOPE: Move the AI layer off the roadmap step onto its own page, reached by a button on step 4 once roadmap progress is 100%.

FILES:
- `src/app/journey/ai/page.tsx` (new)
- `src/features/roadmap/**`, `src/features/progress/**`, `src/features/journey/**`
- `src/lib/useIsClient.ts` (new)
- `README.md`, `AGENTS_CHANGELOG.md`

ASSUMPTIONS:
- "Отдельный эндпоинт" means a separate page the user navigates to; the `/api/roadmap` server endpoint is already separate and stays as is.
- The page is gated in the same way as the button: opening it directly with progress below 100% shows a locked state and makes no model call, otherwise the gate would be cosmetic.
- Concern raised with the user: behind a 100% gate the jury may never see the AI, and step advice arrives after the steps are done. The user asked for this explicitly, so it is built as asked and the advice is framed as a review of the finished plan.

ACCEPTANCE:
- The roadmap step makes no AI call and shows no AI card.
- The "Открыть ИИ-план" button appears on step 4 only at 100% progress.
- `/journey/ai` shows loading, ready (strategy, per-step advice by season, extras), unavailable, locked (below 100%) and empty (no saved journey) states.
- `npm run typecheck`, `npm run lint`, `npm run build` exit 0.

### COMPLETE TASK-CLAUDE-20260918-ai-plan-page

AGENT: CLAUDE
STATUS: DONE (branch `feat/ai-roadmap`, uncommitted together with the Gemini work)

SUMMARY:
- The AI no longer appears on the roadmap step: no card, no advice in "Следующий шаг", no model call.
- At 100% roadmap progress, the "Все шаги закрыты" card on step 4 shows "Открыть ИИ-план", which leads to `/journey/ai`.
- `/journey/ai` reads the saved journey on the client. It has five states:
  - empty: no saved journey → "Сначала постройте маршрут";
  - locked: below 100% → remaining steps with plural agreement, no model call;
  - loading;
  - ready: hero with the profile summary, a strategy card with extras, and "Разбор по шагам" grouped by season;
  - unavailable: "ИИ сейчас недоступен — попробуйте открыть страницу чуть позже".
- Supporting changes:
  - `useIsClient` extracted from `JourneyEntry` into `src/lib`, now shared by both entries;
  - `AiRoadmapCard` takes a `title` and an `unavailableText`, because "показан базовый план" would be false on a page that shows no plan;
  - `NextActionCard` lost its `aiAdvice` prop and its CSS, now dead code.
- Real bug found by the new test and fixed: the first client-side route transition (roadmap → AI page) triggered a Next 16 console warning about `scroll-behavior: smooth`. Per `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`, Next no longer overrides smooth scrolling during navigation, so transitions would animate. Added `data-scroll-behavior="smooth"` on `<html>`: instant route transitions, smooth in-page anchors.

FILES:
- `src/app/journey/ai/page.tsx` (new)
- `src/features/roadmap/{AiPlanPage.tsx,AiPlanPage.module.css}` (new), `src/features/roadmap/{AiRoadmapCard.tsx,useRoadmapAdvice.ts}`
- `src/lib/useIsClient.ts` (new), `src/features/journey/{JourneyEntry.tsx,JourneyExperience.tsx}`
- `src/features/progress/{ProgressPanel.tsx,Progress.module.css}`
- `src/app/layout.tsx`, `README.md`

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0; `/journey/ai` is static.
- `git diff --check` → exit 0.
- No orphaned CSS classes; 0 top-level :hover rules outside `@media (hover: hover)`.
- Mocked browser suite (`/api/roadmap` intercepted), 22/22:
  - the roadmap step shows no AI and makes zero requests;
  - there is no button at 0%;
  - a direct visit at 0% shows the lock with "осталось 12 шагов" and no request;
  - with no journey saved, the empty state shows;
  - 12 × "Выполнено" gives 100%, the button appears, still zero requests;
  - the button navigates to `/journey/ai` and shows loading, then strategy, per-step advice and extras;
  - the planted date is stripped;
  - exactly one request; a reload is served from cache;
  - "К плану" returns to step 4 with the button;
  - the unavailable copy is honest;
  - zero console messages after the scroll fix.
- Live Gemini through the real flow: 5.4 s from the button tap to rendered advice, including the navigation and the 0.7 s debounce. All 12 steps got advice. Measured directly: 0 digits in the AI strategy card (1090 characters) and 0 in the step advice (1414 characters). The 9 digits an earlier broad selector counted come from the rule-written profile summary "9–10 класс · балл 4.6 · До $8 000", not from AI.
- No horizontal overflow on `/journey/ai` at 360 or 390 px (empty and ready states). Screenshots reviewed.
- Regressions: tap suite 11/11, persistence suite passes, change-banner suite passes.
- The earlier mocked suite that asserted AI on the roadmap step is obsolete by design and replaced by the page suite.

LIMITATIONS:
- As raised with the user: behind the 100% gate, the jury only sees the AI after completing 11–12 steps. The step advice is shown after the steps are done, so it is framed as "Разбор по шагам". A visible locked button before 100% would improve discoverability and is a one-line change if wanted.

## TASK TASK-CLAUDE-20260918-groq-fallback

AGENT: CLAUDE
STATUS: DONE
BRANCH: feat/ai-roadmap
SCOPE: Add Groq as a fallback provider when Gemini is unavailable or its answer fails validation.

FILES:
- `src/server/ai/**`
- `src/app/api/roadmap/route.ts`
- `src/features/roadmap/**` (provider label, cache version)
- `.env.example`, `README.md`, `AGENTS_CHANGELOG.md`

ASSUMPTIONS:
- Groq is used only after the Gemini chain fails, including when Gemini's answer yields nothing usable after validation. The same prompt, the same no-digits filter and the same validation apply to both providers.
- Total model time must stay inside `maxDuration = 30`.
- The UI must name the provider that actually answered, not always "Gemini".

ACCEPTANCE:
- With Gemini failing (error, timeout, missing key or unusable answer), a Groq answer is shown and labelled as Groq.
- With both failing, the page shows the unavailable state.
- `npm run typecheck`, `npm run lint`, `npm run build` exit 0.

### COMPLETE TASK-CLAUDE-20260918-groq-fallback

AGENT: CLAUDE
STATUS: DONE (branch `feat/ai-roadmap`, uncommitted)

SUMMARY:
- Provider chain: Gemini (`gemini-3.5-flash-lite` → `gemini-3.1-flash-lite`), then Groq (`openai/gpt-oss-120b` → `openai/gpt-oss-20b`).
- The chain validates before accepting. A provider that errors, times out, has no key, is blocked, or answers with nothing that survives `sanitizeRoadmapAdvice` hands over to the next one.
- One shared deadline (26 s, inside `maxDuration = 30`); per-attempt ceilings are 8 s for Gemini and 6 s for Groq.
- The UI labels the answer with the provider that actually produced it ("Gemini" / "Groq", model id in the tooltip). The page eyebrow no longer hard-codes Gemini.

FILES:
- `src/server/ai/types.ts` (new): shared `AiResult` / `JsonRequest`, `modelList`, `tryModels`.
- `src/server/ai/groq.ts` (new): OpenAI-compatible adapter. The strict JSON schema is derived from the shared one with `additionalProperties: false` on every object, and the Gemini schema is left untouched. Reasoning settings per model family: gpt-oss `reasoning_effort: low` + `include_reasoning: false`; qwen `reasoning_effort: none` + `reasoning_format: hidden`.
- `src/server/ai/adviceChain.ts` (new): provider chain with validation and injectable providers.
- `src/server/ai/gemini.ts`: moved onto the shared types and the deadline.
- `src/app/api/roadmap/route.ts`: uses the chain and logs a fallback only with provider and model.
- `src/features/roadmap/{roadmapAdvice.ts,useRoadmapAdvice.ts,AiRoadmapCard.tsx,AiPlanPage.tsx}`: `AiProvider`, labels, the provider carried through client state and cache. `ROADMAP_ADVICE_VERSION` bumped to 2, so v1 cache entries without a provider are ignored.
- `.env.example`, `README.md`.

DECISIONS:
- Groq model chosen by live measurement on the production prompt with a strict schema. The docs list only gpt-oss-20b, gpt-oss-120b and qwen3.8-27b as strict-capable. Results: gpt-oss-120b 2.3 s, gpt-oss-20b 1.0 s, qwen3.8-27b 3.8 s; all three passed the validator at 100% with zero digits. 120b is primary because 20b's strategy text contradicted the profile (it said "compensate for" a GPA the prompt described as grant-competitive).
- At the provider level, a block also moves on to the next provider, because the input is benign student data and the output is validated anyway. At the model level within one provider, blocked or malformed still stops, as before.

BUG FOUND BY TESTS:
- The first version skipped every attempt whenever `attemptTimeoutMs` was below the 1.5 s floor, because the floor was compared to min(ceiling, remaining). The floor now applies only to the time left before the shared deadline.

VERIFICATION:
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0.
- `git diff --check` → exit 0.
- Mocked unit checks:
  - Groq adapter plus chain, 24/24: no key; success with the default model; endpoint and Bearer auth; messages; strict `json_schema` with `additionalProperties: false` on nested objects; reasoning options for gpt-oss and qwen; 429 moving to 20b; `length` → malformed; `content_filter` → blocked; null content; timeout; no attempt with under 1.5 s left; the source schema not mutated; Gemini success skips Groq; Gemini 503, missing key, invalid answer or block each go to Groq; both failing report only reasons; an exhausted deadline skips the provider; each provider gets its own ceiling and the same deadline.
  - Gemini adapter 19/19 and filter/prompt 24/24 still pass.
- Live runs:
  - normal: Gemini served in 4.0 s;
  - `GEMINI_MODEL` pointed at a nonexistent model: Groq gpt-oss-120b served in 3.2 s, logged as `served by fallback groq`;
  - both providers pointed at nonexistent models: `unavailable` in 0.9 s, log `gemini:http 404, groq:http 404`, zero profile fields logged;
  - browser with Gemini broken: the AI plan page rendered Groq's answer labelled "Groq" with the model id in the tooltip; a planted v1 cache entry was ignored and a v2 entry with `provider: "groq"` written; zero console errors. Screenshot reviewed.
- Observed in the wild: Groq's free tier allows 8000 tokens per minute per model (response headers). After a burst of test calls, gpt-oss-120b hit that limit and the chain moved to gpt-oss-20b on its own. That is documented in the README limitations.
- An intended "Groq broken too" run first went wrong because zsh does not word-split an unquoted `$1`, so `GROQ_MODEL` was never set. Re-run with the variables set explicitly: result as above.
- Regressions after restarting the dev server normally: AI page suite 22/22 (its mock now includes `provider`), tap suite 11/11, persistence suite passes, change-banner suite passes.

LIMITATIONS:
- Groq's free-tier limit is about two roadmap requests per minute per model. Caching and the server throttle absorb normal use; a burst can exhaust both providers and show the unavailable state.

## TASK TASK-CLAUDE-20260918-season-schema-hint

AGENT: CLAUDE
STATUS: DONE
BRANCH: feat/ai-roadmap
SCOPE: Stop Groq strict mode from rejecting replies over the extras `season` value.

### COMPLETE TASK-CLAUDE-20260918-season-schema-hint

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- Found while measuring token usage: one of four live Groq `gpt-oss-120b` calls failed with "Generated JSON does not match the expected schema … /extras/0/season … value must be one of 'autumn', 'winter', 'spring'". Groq did not report which value the model wrote. The likely cause is that the payload names step seasons in Russian ("осень") while the schema enum is English. The chain already recovered by moving to `gpt-oss-20b`, at the cost of an extra request and quota.
- Added `description: "autumn — осень, winter — зима, spring — весна."` to the `season` field of the shared response schema. No change to the payload, the validator or the UI. `ROADMAP_ADVICE_VERSION` is not bumped: the reply's meaning is unchanged, so cached advice stays valid and the quota is not spent again.
- Also corrected the README quota line from my earlier estimate of about 4000 tokens per plan to the measured values: about 2100 tokens on Gemini (1264–1278 in, 823–838 out, 0 thinking) and about 2354 on Groq gpt-oss-120b (1547 in, 807 out, 38 reasoning). Groq's free tier allows 200K tokens and 1000 requests per day per model, so tokens are the binding limit: about 85 plans per day per model, about 170 across both Groq models.

FILES:
- `src/server/ai/roadmapPrompt.ts`
- `README.md`

VERIFICATION:
- Filter and prompt unit checks 24/24.
- Live Groq `gpt-oss-120b` on the failing profile (foundation-path), three calls spaced 20 s to stay under the per-minute token limit: 3/3 HTTP 200 in 2.2–2.4 s, extras seasons were valid enum values, the filter kept 11/11 advice and 3/3 extras each time. Before the change, the same profile had failed in one of two calls.
- Live Gemini `gemini-3.5-flash-lite` accepts the schema with the new description, and its seasons are valid.
- `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` → exit 0.

LIMITATIONS:
- Three successful calls show the fix works but do not prove the failure can never recur; if it does, the chain still falls back to the next model.

## TASK TASK-CLAUDE-20260918-brand-logo

AGENT: CLAUDE
STATUS: DONE
BRANCH: feat/ai-roadmap
SCOPE: Use the team's logo as the site favicon and as the brand mark in the headers.

### COMPLETE TASK-CLAUDE-20260918-brand-logo

AGENT: CLAUDE
STATUS: DONE

SUMMARY:
- The mark (the "B" with the book and road) was cropped from the supplied 1254×1254 logo by detecting ink rows. The mark sits at x 317–964, y 245–760; the wordmark band (y 822–992) is excluded, because it is illegible at icon sizes.
- Generated per the Next 16 metadata file conventions (`node_modules/next/dist/docs/.../01-metadata/app-icons.md`):
  - `src/app/favicon.ico` (16/32/48, 5% padding so the mark stays large at 16 px);
  - `src/app/icon.png` (256×256, rounded tile, 42 KB after optimisation from 126 KB);
  - `src/app/apple-icon.png` (180×180, square, since iOS rounds it);
  - `public/brand/logo-mark.png` (256×256) for the UI.
  Next emits the `<link rel="icon">` / `apple-touch-icon` tags itself, with cache-busting query strings.
- The mark is dark green, which would vanish on the dark page, so it sits on a light rounded tile everywhere.
- The letter "B" tiles in all three headers (landing, journey, AI plan) are replaced with one shared `BrandMark` component instead of three copies of tile styles. The user asked for the main page; all three were changed because a new logo on the landing next to the old "B" inside would break the unified visual system the case requires. The hover tilt is kept under `@media (hover: hover)`.
- README "Источники" notes the logo is the team's own.

FILES:
- `src/app/{favicon.ico,icon.png,apple-icon.png}` (new), `public/brand/logo-mark.png` (new)
- `src/components/{BrandMark.tsx,BrandMark.module.css}` (new)
- `src/app/page.tsx`, `src/features/journey/JourneyExperience.tsx`, `src/features/roadmap/AiPlanPage.tsx`
- `src/app/globals.css`, `src/features/journey/JourneyExperience.module.css`, `src/features/roadmap/AiPlanPage.module.css` (old `.brand-mark` / `.brandMark` rules removed)
- `README.md`

VERIFICATION:
- `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` → exit 0; the build lists `/icon.png` and `/apple-icon.png`.
- `/favicon.ico`, `/icon.png`, `/apple-icon.png`, `/brand/logo-mark.png` → HTTP 200 with the right content types; three icon link tags are present in the rendered `<head>`.
- The edited stylesheets have balanced braces, no reference to the old mark classes remains, and there are 0 top-level :hover rules outside `@media (hover: hover)`.
- A preview sheet at 48, 32 and 16 px and a simulated browser tab confirm the mark stays legible. Header screenshots at 390 px (landing, journey) and 1280 px (landing) reviewed.
- Tap suite 11/11.

## TASK TASK-CLAUDE-20260918-wizard-title-spacing

AGENT: CLAUDE
STATUS: DONE
BRANCH: feat/ai-roadmap
SCOPE: User report: the wizard question title sits too high relative to its options.

### COMPLETE TASK-CLAUDE-20260918-wizard-title-spacing

AGENT: CLAUDE
STATUS: DONE

ROOT CAUSES (both measured in headless Chrome before fixing):
1. The title lives in a `<legend>`. A rendered legend sits on the fieldset border and is not a grid item, so the fieldset's `gap: 20px` never applied. Measured title-to-options distance: 0 px at 390 and 1280 px. Fix: `.legend { float: left; width: 100%; }`. A floated legend is not a "rendered legend" per the HTML spec, so it becomes an ordinary grid item and keeps its semantics. Title-to-options is now 20 px.
2. A bare `main { min-height: 100vh }` in `globals.css`, meant for the landing, also matched the journey's and the AI page's `<main>`. It stretched the wizard card, and the grid spread the surplus into its rows, including 8 px (390) and 30 px (1280) of empty space inside the wizard header below the progress bar. That is why the gap above the title differed by viewport (30 vs 52 px). Fix: the rule is now `.landing`, applied only on the landing's `<main>`. Progress-bar-to-title is now 22 px at both widths, with 0 px of surplus in the header.

FILES:
- `src/features/profile/ProfileWizard.module.css`
- `src/app/globals.css`, `src/app/page.tsx`

VERIFICATION:
- Measurements after the fix at 390 and 1280 px: progress→title 22 px, title→options 20 px, header surplus 0 px.
- Desktop wizard screenshot reviewed.
- No horizontal overflow on diagnosis, recommendations with the panel open, or roadmap at 360/390 px. Tap suite 11/11. The landing renders `<main class="landing">`.
- `npm run lint`, `npm run build`, `git diff --check` → exit 0.

## TASK TASK-CLAUDE-20260919-real-universities

AGENT: CLAUDE
STATUS: DONE (uncommitted on the branch)
BASE_COMMIT: 5c482ee7ef93e8f7bb5ce17d84ed4957f7beb169
BRANCH: feat/real-universities (master stays the deployable submission)
SCOPE: Replace the fictional demo catalogue with real bachelor programmes whose facts come from official sources.

FILES:
- `src/data/programs.ts`
- `src/domain/{matching,comparison,roadmap,diagnosis,profile}.ts`
- `src/features/{recommendations,comparison,journey,diagnosis}/**`, `src/app/page.tsx`
- `src/server/ai/roadmapPrompt.ts`
- `README.md`, `AGENTS_CHANGELOG.md`

ASSUMPTIONS:
- Every displayed fact about a real institution carries an official source URL and a checked date (AGENTS.md section 4, case PDF). A fact that cannot be confirmed is shown as "уточняйте на сайте", never filled with a plausible value.
- Universities do not publish thresholds on the CIS five-point scale, so `minGpa` stops being a per-programme hard constraint. GPA keeps influencing the result through an explicitly general rule (grant competitions favour a high average), not through invented thresholds.
- Grant eligibility often depends on citizenship; it is stated in the grant note rather than modelled.

ACCEPTANCE:
- No fictional institution remains; every programme links to its official source.
- The presets still yield at least three recommendations, or a preset is adjusted with the reason recorded.
- `npm run typecheck`, `npm run lint`, `npm run build` exit 0; existing suites pass or are updated with reasons.

CHANGES:
- `src/data/programs.ts` holds 15 real programmes: NU, AITU, Inha Tashkent, BME, ELTE, Semmelweis, CTU FIT, WUT, Charles PPE, Jagiellonian IRAS, METU ×2, KAIST, ASU, MIT. Each has:
  - `sources[]` with official URLs;
  - tuition in the published currency and period, plus a note on who it applies to and for which year;
  - `fullFunding` with coverage and eligibility (`awardedToAllAdmitted` for KAIST);
  - the English certificates each university accepts;
  - its own English exam, a foundation route, and entrance tests;
  - the application window with its intake year.
- Facts missing from the official pages are null ("Уточняйте на сайте", "Нет данных"). Conflicts between pages are kept in the text: Jagiellonian 5 000 € vs 4 500 €, ELTE B2 vs B1.
- Conversion to USD is used only for the budget filter, at official rates (ECB 18.09.2026, National Bank of Kazakhstan, Central Bank of Uzbekistan), with those sources in the file.
- Matching:
  - `minGpa` is removed, so the `gpa` exclusion is gone;
  - language eligibility now works per certificate: `certificate | not-required | own-test | foundation`;
  - a programme above the budget passes only through its full scholarship and is flagged in the blocker;
  - GPA ranks scholarship programmes only (the 4.5 heuristic, documented).
- Other changes:
  - comparison rows now read "Требование к английскому", "Вступительные испытания" and "Полное покрытие";
  - each card shows the English requirement and visible source links;
  - the "Демо-данные" labels became "Проверено 19.09.2026";
  - `ROADMAP_ADVICE_VERSION` is bumped to 3, so cached advice about the demo programmes is ignored.
- `DEFAULT_PROFILE.regions` now include "asia". With Europe and CIS only, the real catalogue gives 2 programmes for the default profile; with Asia it gives 4.
- README updated: the logic, the sources, the limitations.

VERIFICATION:
- Research: four parallel research agents plus manual fetches, official domains only. Notes are in the session scratchpad `research/*.md`.
- Domain harness (`domaincheck/check.js`, `extra.js`, all pass). The hard-constraint check was rewritten for the new model. Recommendations per preset:

  | Preset | Programmes |
  | --- | --- |
  | grant-ace | 7 |
  | it-mid-budget | 6 |
  | foundation-path | 3 |
  | default | 4 |

  15 programmes, all with https sources and unique ids.
- Browser suites against `next dev`:
  - tap 11/11 (run with a clean profile dir, because stored state from earlier runs pre-selected the grade);
  - persist: all scenarios pass;
  - ai-page: all pass;
  - impact: all pass after updating data-dependent expectations — "6 → 4" programmes; the no-op edit is now "+Гуманитарные", because Duolingo → TOEFL legitimately changes the real catalogue; the medicine programme name;
  - overflow at 360/390/1280 px: 0 px.
- Screenshots reviewed: desktop recommendations; mobile card with sources; mobile comparison dialog.
- `npm run typecheck`, `npx eslint .`, `npm run build` → exit 0.

RISKS:
- Prices and dates change. Several windows are for the 2026 intake because 2027 dates are not published.
- The CTU per-semester wording rests on a search snippet of FIT's fee page.
- The AITU English rule and the Inha Pre-University entry conditions are not stated on the pages that were fetched.

## TASK TASK-CLAUDE-20260919-ai-roadmap-tree

AGENT: CLAUDE
STATUS: DONE (uncommitted, on top of feat/real-universities)
SCOPE: Show the AI plan page (`/journey/ai`) as a clickable roadmap tree. Each node opens a detail menu. Zero extra model tokens.

CHANGES:
- New `src/features/roadmap/RoadmapTree.tsx` and its `.module.css`.
  - Tree: applicant → three season branches → rule steps, plus the AI's extra suggestions (dashed nodes marked «ИИ»), ending at the top-3 programmes as «Цель» nodes.
  - Connectors use plain CSS: three columns under a crossbar from 760 px, a left rail on phones.
  - Nodes appear one after another; the animation is off under reduced motion.
- New `TreeNodeDialog.tsx` and its `.module.css`: a `<dialog>`, shown as a bottom sheet on phones and a centred panel from 720 px.
  - Step node: the rule text, the AI advice (labelled), and matching facts from the catalogue — application windows, scholarships, English requirements or tuition of the goal programmes.
  - AI extra node: its text, labelled as a suggestion outside the base plan.
  - Programme node: catalogue facts, the blocker and source links.
  - Dates and requirements always come from `programs.ts`, never from the model.
- `AiPlanPage.tsx` uses the tree in place of the old step list.
- `AiRoadmapCard` no longer shows the extras; they are tree nodes now, so the page does not repeat them.
- The tree structure is rule-based. It renders the same when AI is unavailable, so progress ids and the journey never depend on the model.

VERIFICATION:
- `ai-page.mjs` extended to cover:
  - the tree's root, seasons and goal nodes;
  - AI advice marks on nodes;
  - the dialog from a step (advice plus catalogue facts);
  - the close button;
  - the applications step showing application windows;
  - an AI extra node;
  - a programme node with its sources;
  - no horizontal overflow at 390 px;
  - exactly one model request, with the result cached;
  - the tree rendering while AI is unavailable;
  - a clean console.
  
  All checks pass.
- Screenshots reviewed: desktop tree at 1280 px, the mobile page and the mobile node sheet.
- `npm run typecheck`, `npx eslint .`, `npm run build` → exit 0.

### Follow-up: node-graph redesign (user feedback "динамичнее, меньше текста, в виде нодов")
- `RoadmapTree` now draws round icon nodes with 1–2 word captions (`STEP_NODES` map by step id; an unknown id falls back to its full title). The full title stays in the button's aria-label and in the node menu.
- Captions alternate sides of each season's spine (zigzag).
- Motion (all off under reduced motion):
  - dashed connectors flow downwards (sideways on the crossbar);
  - the applicant node pulses with rings;
  - nodes pop in one after another with a spring.
- The AI-advice marker is a small sparkle badge on the node. AI extras are dashed nodes. Goal programmes are amber nodes labelled with the short university name (METU, ELTE, BME).
- `BrandMark` loads eagerly: on the shorter AI page Next.js reported the logo as the LCP element (console warning).
- `ai-page.mjs` selectors updated to the new captions and to `[data-ai-advice]`. Everything passes, console clean.
- `tsc`, `eslint`, `build` → exit 0.
- Desktop and mobile screenshots reviewed. On phones the seasons are joined by one continuous spine.

## TASK TASK-CLAUDE-20260919-checklist-pdf

AGENT: CLAUDE
STATUS: DONE (uncommitted)
SCOPE: Export the finished plan as a PDF checklist from `/journey/ai`, to save, print or open in any PDF viewer.

DECISION: The export uses the browser's own print pipeline (`window.print()` → «Сохранить как PDF» or a printer). A PDF library such as jsPDF or pdfkit would add a dependency plus an embedded Cyrillic font of several hundred KB. Browser printing already supports Cyrillic and works on desktop, Android and iOS (share → save to Files). Trade-off: the user picks «Сохранить как PDF» in the dialog, instead of getting a one-click file download.

CHANGES:
- `PrintableChecklist.tsx` and its CSS module: a black-on-white sheet, hidden on screen, that is the only thing printed. It contains:
  - the profile and date;
  - the AI strategy, labelled as such;
  - the target programmes with the catalogue facts and the first source URL;
  - the steps per season with ✓ boxes for completed steps, the rule text and the AI advice (labelled);
  - the AI extras;
  - the source and AI disclaimers.
- `AiPlanPage`:
  - a «Чек-лист в PDF» button in the hero;
  - `printChecklist` sets the document title so the saved file is named «BilsenBol — чек-лист поступления»;
  - on-screen content is wrapped in `.screenOnly`, which keeps the grid gap and is hidden in print.
- `globals.css`: `@page { margin: 14mm }` and a white body for print.

VERIFICATION:
- `ai-page.mjs`:
  - the button is present;
  - the sheet is `display: none` on screen;
  - `Page.printToPDF` produced a 2-page PDF;
  - `pdftotext` shows every section;
  - page 1 was rendered and reviewed;
  - the rest of the suite passes.
- The user's dev server on :3000 was not running. The suite ran against a temporary `next dev -p 3100`, which was stopped afterwards.
- `tsc`, `eslint`, `build` → exit 0.
