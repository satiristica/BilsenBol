# AGENTS.md — LoCuS Hackathon Engineering Contract

> This file is the single source of truth for AI coding agents working in this repository.
> Applies to ChatGPT/Codex, Claude Code, Gemini CLI, and any compatible coding agent.
> If a deeper directory contains its own `AGENTS.md`, the more specific file may add or override rules for that subtree.

## 0. Prime Directive

Build the smallest reliable product that maximizes the hackathon outcome.

Priority order:

1. Correct end-to-end user journey.
2. Clear, high-quality UX/UI.
3. Explainable personalization that visibly reacts to profile changes.
4. Stability and honest handling of uncertainty.
5. Clean, maintainable implementation.
6. Extra features only after the core path is demonstrably complete.

Never trade a working user journey for architectural sophistication.

---

## 1. Product Mission

We are building an AI-assisted university/admission journey product.

The product must transform an applicant profile and goal into a clear admission route:
- understand the user's profile;
- identify constraints and goals;
- recommend at least 3 relevant universities/programs;
- explain why each recommendation fits;
- compare at least 2 options on user-relevant criteria;
- produce a personalized roadmap;
- show one explicit next action;
- allow progress to be marked;
- visibly react when important profile inputs change.

The product is NOT:
- a generic AI chat;
- a static university directory;
- a list of links;
- a course platform;
- a teacher dashboard;
- a fake “admission probability” generator.

When uncertain, optimize for the full journey rather than adding breadth.

---

## 2. Hackathon Optimization Order

Treat the judging weights as product priorities:

- User journey & architecture: 30%
- UX/UI & graphic design: 25%
- Personalization & usefulness: 20%
- Functionality & stability: 15%
- Technical implementation: 10%

Therefore:
- do not spend hours polishing invisible infrastructure while the core journey is incomplete;
- do not introduce microservices, queues, distributed caches, or complex auth without a proven need;
- do not prioritize “AI cleverness” over explainable recommendations;
- do not add optional features while required screens/states are broken.

Before implementing an optional feature, ask:
> Does this improve a scored criterion enough to justify its implementation and regression risk?

If not, do not build it yet.

---

## 3. Agent Operating Protocol

For every non-trivial task, follow this sequence:

### 3.1 Inspect before editing
Before changing code:
1. Read this file.
2. Inspect the relevant directory tree.
3. Read the files directly involved.
4. Search for call sites/usages before modifying public behavior.
5. Check package/config files before assuming libraries, scripts, or versions.
6. Check existing tests before changing behavior.
7. Check `git diff` / `git status` when available.

Never claim a file, module, test, API, or dependency works a certain way without inspecting it.

### 3.2 Establish the task contract
Internally determine:
- requested outcome;
- acceptance criteria;
- files likely affected;
- invariants that must remain true;
- failure modes;
- cheapest correct implementation.

If a requirement is ambiguous but a safe, reversible default exists, use it and state the assumption.
Ask the user only when ambiguity materially changes product behavior, data, security, or architecture.

### 3.3 Implement the minimum coherent change
Prefer:
- local changes over rewrites;
- existing patterns over new abstractions;
- existing dependencies over new ones;
- deletion/simplification over additive complexity;
- explicit code over clever code.

### 3.4 Verify
After implementation, run the smallest relevant validation first, then broader checks.

At minimum for changed code:
- formatting/lint where configured;
- type-check;
- relevant unit/component tests;
- relevant integration/E2E test when behavior crosses boundaries;
- build for changes that can affect production compilation.

Do not report “done”, “fixed”, or “working” without verification.
If a check cannot run, state exactly which check was not run and why.

### 3.5 Review your own diff
Before finishing:
- inspect the final diff;
- remove debug code;
- remove dead code;
- remove accidental unrelated edits;
- ensure no secrets were added;
- ensure errors and loading states still work;
- ensure mobile behavior was not broken.

---

## 4. Evidence and Truthfulness Protocol

Never fabricate:
- university requirements;
- deadlines;
- tuition;
- scholarships;
- rankings;
- admission probabilities;
- API behavior;
- test results;
- benchmark results;
- source citations.

Admission facts must have:
1. an actual source URL/reference, OR
2. a visible `Demo data` / `Unverified` label.

Never express false precision such as “87% chance of admission” unless a validated model and methodology genuinely support it.

For recommendation logic, prefer explainable evidence:
`profile signal -> matching rule/data -> recommendation reason`.

If data conflicts:
- preserve the conflict;
- prefer official/primary sources;
- communicate uncertainty instead of silently choosing a convenient value.

---

## 5. Architecture Rule

Default architecture: modular monolith.

Do NOT introduce microservices during the hackathon unless an external hard constraint requires them.

Keep boundaries clear:

```text
UI / presentation
    ↓
application/use-case logic
    ↓
domain/recommendation logic
    ↓
data providers / persistence / external AI
```

Business rules must not depend directly on UI components.

External providers must be behind narrow adapters so they can be replaced without rewriting domain logic.

Recommended source layout:

```text
src/
  app/                 # routes/pages/layouts
  components/          # reusable UI
  features/
    profile/
    diagnosis/
    recommendations/
    comparison/
    roadmap/
    progress/
  domain/              # pure types/rules/scoring/explanations
  lib/                 # shared infrastructure/utilities
  data/                # curated/demo university/program data
  server/              # server-only integrations/API boundaries
  test/
```

If the existing repository already has a coherent structure, preserve it instead of forcing this exact tree.

---

## 6. Technical Stack

The repository itself is the final authority. Existing `package.json`, lockfile, configs, and deployed environment override assumptions below.

If bootstrapping or filling an unspecified layer, use this default stack:

### Application
- TypeScript with `strict` mode.
- React + Next.js App Router.
- Server Components by default where they reduce client JavaScript.
- Client Components only for actual client interactivity.
- Route handlers/server actions only when a server boundary is needed.

### UI
- Tailwind CSS.
- shadcn/ui or another lightweight component kit is allowed, but disclose ready-made components in README.
- Accessible semantic HTML first.
- Lucide icons or the already-installed icon set; do not add duplicate icon libraries.

### Validation and schemas
- Zod for external/user-input validation and shared boundary schemas.
- Domain code receives validated typed data; do not repeatedly re-validate trusted internal objects.

### State
Use the narrowest tool that works:
1. local component state;
2. URL/search params for shareable/navigation state;
3. server state through framework primitives;
4. localStorage for demo persistence where appropriate;
5. global state library only when state is genuinely cross-cutting.

Do not add Redux/Zustand merely by habit.

### Data
For hackathon/demo scope:
- curated local JSON/TypeScript data is acceptable;
- localStorage is acceptable for user progress/profile when sufficient;
- use PostgreSQL/Supabase only when persistent multi-user/server data provides clear value.

Do not add a database just to make the architecture look serious.

### AI
- Keep model/provider access server-side.
- Provider key must only come from environment variables.
- AI output is untrusted input: parse/validate before use.
- Prefer structured JSON output matching a Zod schema.
- Recommendation ranking should not depend solely on free-form LLM judgment.
- Use deterministic/rule-based filtering for hard constraints; use the LLM mainly for explanation, synthesis, or enrichment.

### Testing
- Vitest for unit tests.
- React Testing Library for components where useful.
- Playwright for the critical end-to-end journey.

### Quality tooling
Use the repository-configured:
- ESLint;
- Prettier or framework formatter;
- TypeScript compiler;
- package manager indicated by the lockfile.

Do not introduce a second formatter, package manager, or overlapping lint system.

### Deployment
Prefer Vercel for Next.js unless the repository already targets another platform.

Never hard-code environment-specific URLs.

---

## 7. Code Style

### 7.1 TypeScript
- `strict: true`.
- Avoid `any`. If unavoidable at an external boundary, isolate it and narrow immediately.
- Prefer `unknown` over `any`.
- Use meaningful domain types.
- Prefer discriminated unions for state machines and variant data.
- Avoid unsafe non-null assertions (`!`) unless the invariant is obvious and documented.
- Do not suppress TypeScript errors with `@ts-ignore` unless explicitly justified.

### 7.2 Functions
- One clear responsibility.
- Prefer pure functions for recommendation/scoring/domain logic.
- Keep side effects at boundaries.
- Prefer early returns over deeply nested conditionals.
- Avoid boolean-parameter soup; use an options object or domain type when flags multiply.
- Do not extract one-line helpers unless the abstraction improves meaning or reuse.

### 7.3 Naming
Names describe domain intent, not implementation trivia.

Good:
- `buildAdmissionRoadmap`
- `filterProgramsByBudget`
- `explainRecommendation`
- `ApplicantProfile`

Bad:
- `processData`
- `handleThing`
- `helper2`
- `temp`
- `doStuff`

Boolean names use predicates:
- `isEligible`
- `hasLanguageCertificate`
- `canAffordProgram`

### 7.4 Components
- Components should be small enough to understand without scrolling through unrelated responsibilities.
- Put domain/business logic outside React components.
- Do not create wrapper components with no semantic or styling value.
- Reuse primitives, not giant “universal” components with dozens of props.
- Model loading, empty, error, and success states explicitly.

### 7.5 Comments
Comments explain:
- why;
- non-obvious invariants;
- external quirks;
- deliberate trade-offs.

Comments do not narrate obvious syntax.

### 7.6 Duplication
Do not apply DRY mechanically.

Duplicate twice if abstraction would be premature.
Extract when the duplicated behavior is genuinely the same domain concept and likely to evolve together.

---

## 8. Recommendation Engine Protocol

Hard constraints and soft preferences must be separated.

### Hard constraints
Examples:
- education level;
- country restrictions;
- budget ceiling;
- required language/exam eligibility;
- application deadline viability.

A program violating a hard constraint must not receive a high recommendation merely because an LLM “likes” it.

### Soft-fit signals
Examples:
- interests;
- academic strengths;
- desired field;
- city preference;
- scholarship preference;
- teaching language;
- career goals.

### Explanation contract
Every recommendation must be explainable from stored inputs.

A recommendation explanation should answer:
- why this matches the user's profile;
- what trade-off exists;
- what requirement may still block the user;
- what action would improve fit/readiness.

Prefer transparent factor-based scoring over opaque fake precision.

When a key profile input changes, recompute from source state; do not patch old recommendation text.

---

## 9. UX Protocol

The user must always understand:
- where they are;
- what they completed;
- what comes next;
- why a recommendation exists.

Critical journey:

```text
Landing
→ Profile
→ Diagnosis
→ Recommendations
→ Comparison
→ Roadmap
→ Next action / Progress
```

Every step must have:
- obvious primary action;
- clear back/continue behavior;
- loading state if asynchronous;
- error state if failure is possible;
- sensible empty state;
- mobile layout.

Mobile is not an afterthought.
Implement responsive behavior while building each screen.

Do not hide critical information behind hover-only interactions.

Accessibility baseline:
- semantic landmarks;
- keyboard-operable controls;
- visible focus states;
- labels for inputs;
- meaningful button text;
- sufficient contrast;
- no color-only status communication.

---

## 10. Security Protocol

Never:
- commit secrets, tokens, passwords, service-role keys, or private credentials;
- expose server API keys to client bundles;
- log secrets or full sensitive profile payloads;
- trust model output as executable/HTML content;
- use `dangerouslySetInnerHTML` with untrusted content;
- disable TLS/certificate checks;
- silently weaken auth/security to make a demo work.

Use:
- `.env.local` for local secrets;
- `.env.example` with placeholder names only;
- server-only modules for privileged credentials;
- input validation at external boundaries;
- safe rendering/escaping by default.

Before committing, inspect staged changes for secret leakage.

---

## 11. Dependency Protocol

A new dependency must satisfy at least one:
- replaces substantial custom code;
- materially reduces bug risk;
- is required for an external integration;
- materially accelerates delivery without unacceptable lock-in.

Before adding a dependency:
1. check whether the repo already contains equivalent functionality;
2. verify the package is maintained and appropriate;
3. consider bundle/runtime cost;
4. use the package manager already chosen by the repository.

Never add a library for a trivial helper.

Never silently upgrade major framework/library versions during an unrelated task.

---

## 12. Git Protocol

Unless the user explicitly instructs otherwise:
- do not rewrite history;
- do not force-push;
- do not delete branches;
- do not amend someone else's commit;
- do not mix unrelated refactors into a feature/fix;
- preserve user changes you did not create.

Before editing, inspect `git status`.
After editing, inspect `git diff`.

Commit messages, when asked to commit, should be concise and conventional:

```text
feat: add explainable program comparison
fix: recompute roadmap after budget change
refactor: isolate recommendation scoring
test: cover hard budget constraint
docs: document demo data sources
```

Do not commit generated secrets, local env files, build output, or debug artifacts.

---

## 13. Testing Strategy

Test behavior, not implementation trivia.

### Unit tests
Prioritize:
- recommendation filtering;
- scoring/factor calculation;
- roadmap generation;
- profile validation;
- transformations and edge cases.

### E2E critical path
At least one E2E test should cover:

```text
create profile
→ receive diagnosis
→ see >= 3 recommendations
→ compare >= 2
→ receive roadmap
→ see next action
→ mark progress
→ change a key profile field
→ observe recommendation/roadmap change
```

Important edge cases:
- insufficient profile data;
- no programs satisfy hard constraints;
- malformed AI response;
- API/network failure;
- missing source data;
- very small budget;
- mobile viewport.

Do not write snapshots as a substitute for behavioral tests.

---

## 14. Performance Protocol

Do not optimize from intuition.

For this project, prioritize:
- fast first meaningful screen;
- low client JavaScript;
- no unnecessary sequential network waterfalls;
- no repeated LLM calls for unchanged inputs;
- no expensive recomputation on every render;
- responsive interactions on mobile.

Memoize only when measurement or clear computational cost justifies it.

Prefer deterministic local computation for filtering/scoring when possible.

---

## 15. AI/LLM Integration Rules

LLM usage must be justified by product value.

Good uses:
- translating structured fit factors into human-readable explanations;
- generating a concise diagnostic summary from structured profile data;
- rewriting roadmap steps for clarity;
- synthesizing sourced facts.

Weak uses:
- asking the model to invent universities;
- asking it to guess deadlines;
- asking it to produce an unexplained ranking from scratch;
- sending the entire application state on every keystroke.

For model calls:
1. minimize context;
2. use structured input;
3. request structured output;
4. validate output;
5. set timeouts;
6. handle failure gracefully;
7. avoid blocking the entire journey on non-essential AI;
8. cache/reuse results for identical normalized inputs when appropriate.

If AI fails, the product should degrade honestly rather than fabricate a result.

---

## 16. Debugging Protocol

Never “shotgun debug”.

Use:

```text
symptom
→ reproduce
→ collect evidence
→ form competing hypotheses
→ run discriminating test
→ identify root cause
→ apply smallest fix
→ add regression test
→ verify
```

Read the actual stack trace.
Trace the actual call path.
Do not change unrelated code hoping the issue disappears.

---

## 17. Refactoring Protocol

Refactor only when it:
- enables the requested feature;
- fixes a demonstrated maintainability problem;
- removes duplication that is already costly;
- reduces a real reliability/security risk.

For large refactors:
1. characterize current behavior with tests;
2. refactor in small steps;
3. keep behavior stable;
4. run tests between steps.

Do not combine a broad architectural rewrite with a deadline-critical feature unless unavoidable.

---

## 18. Agent Collaboration Rules

All agents operate on the same repository contract.

Do not assume another agent's uncommitted work exists.
Before editing shared files, inspect current state.

When multiple agents work in parallel:
- assign non-overlapping ownership where possible;
- avoid simultaneous edits to central config/layout files;
- integrate through stable interfaces;
- rebase/refresh context before final integration;
- run the full validation suite after merging parallel work.

Suggested specialization, not authority hierarchy:
- Claude: architecture, system design, difficult cross-cutting reasoning.
- ChatGPT/Codex: implementation, refactors, tests, repository changes.
- Gemini: debugging, log analysis, research-heavy verification, documentation.

Any agent may challenge another agent's proposal using evidence.
The repository and tests are the source of truth, not model seniority.

---

## 19. Research Protocol

Use web research when a fact is time-sensitive or external:
- framework/library behavior;
- API changes;
- university requirements/deadlines;
- security advisories;
- deployment limits;
- current pricing;
- current model capabilities.

Source priority:
1. official documentation / primary source;
2. official repository/specification;
3. trusted vendor documentation;
4. reputable technical source;
5. community reports only for practical edge cases.

Do not browse the web merely to decorate an answer with citations.

When using external admission facts, persist the source URL or source metadata alongside the fact when practical.

---

## 20. Definition of Done

A task is done only when all applicable items are true:

- requested behavior exists;
- acceptance criteria are met;
- changed code follows repository conventions;
- types pass;
- relevant tests pass;
- build passes when relevant;
- loading/error/empty states are handled;
- mobile behavior is preserved;
- no secret is exposed;
- no unrelated changes are included;
- source-backed facts remain source-backed;
- final diff was reviewed.

For user-facing flow changes, manually verify the path from the preceding step through the changed step to the next step.

---

## 21. Response / Handoff Format

Keep agent responses concise and operational.

For implementation work, report:
1. what changed;
2. important technical decisions;
3. verification performed;
4. remaining risks or blockers.

Do not dump hidden reasoning.
Do not produce long tutorials unless asked.

If blocked, state:
- exact blocker;
- evidence;
- smallest user action needed.

---

## 22. Anti-Patterns — Reject by Default

Reject unless a concrete constraint proves necessity:
- premature microservices;
- event buses for local UI state;
- multiple databases;
- custom auth during a 72-hour demo when unnecessary;
- generic repository/service layers with no actual abstraction pressure;
- wrapper components that add no behavior;
- global state for local state;
- AI calls for deterministic logic;
- unsourced deadlines;
- fake admission probabilities;
- huge “god” components;
- broad rewrites near submission;
- adding dependencies to solve 5 lines of code;
- hard-coded test-specific hacks;
- silencing type/lint errors instead of fixing them.

---

## 23. Conflict Resolution

Instruction priority:

1. explicit current user request;
2. repository-local instructions nearest the edited file;
3. this root `AGENTS.md`;
4. repository docs / established conventions;
5. agent preference.

Existing code is evidence, not automatically correct.
When existing code conflicts with this contract, preserve behavior unless the task requires the change, then improve it deliberately.

If two requirements conflict, prefer:
- hackathon rules;
- correctness;
- user-visible journey;
- security;
- simplicity;
in that order unless the user explicitly sets another priority.

---

## 24. Final Self-Check

Before finishing any substantial task, ask internally:

- Did I inspect before changing?
- Is the requested behavior actually implemented?
- Is there a simpler solution?
- Did I accidentally invent data or behavior?
- Did I preserve hard admission constraints?
- Does a key profile change recompute results?
- Did I validate external/AI output?
- Did I introduce unnecessary architecture/dependency/state?
- Did I test the changed behavior?
- Did I review the diff?
- Would this improve the scored user journey, UX, personalization, stability, or maintainability?

If an important answer is “no”, fix it before reporting completion.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
