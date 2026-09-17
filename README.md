# BilsenBol

BilsenBol is an AI-assisted university and admissions journey product. It is
being built to turn an applicant profile into explainable recommendations, a
comparison, and an actionable roadmap.

## Current state

The clickable admission journey is implemented end to end for CIS school
students: landing with one-click presets, profile capture, readiness diagnosis,
explainable programme recommendations, a face-to-face comparison of two
programmes, a seasonal roadmap, and progress tracking. Every screen recomputes
from the profile, so changing budget, English level, or GPA immediately updates
the recommendations, the diagnosis, and the plan.

Routes:

- `/` landing page with the three quick-start presets
- `/journey` the journey itself; `?preset=<id>` prefills a profile and
  `?step=<profile|diagnosis|recommendations|roadmap>` deep-links a step

### Data honesty

The programme catalogue in `src/data/programs.ts` is demo data describing
deliberately fictional institutions, and it is labelled `Демо-данные` wherever
it is rendered. No unsourced admission facts are attributed to real
universities, and the product does not produce admission probabilities.

### Not implemented yet

Journey state lives in memory only, so a page reload restarts the journey, and
there is no automated test suite in the repository yet.

## Run locally

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Architecture

```text
src/
  app/                 Next.js routes, layouts, and global presentation
  components/          Shared reusable UI
  features/            Product journey slices
    profile/
    diagnosis/
    recommendations/
    comparison/
    roadmap/
    progress/
  domain/              Pure recommendation and roadmap rules
  data/                Curated or clearly labelled demo data
  lib/                 Shared utilities and infrastructure
  server/              Server-only provider and API boundaries
  test/                Shared test helpers and end-to-end journey tests
```

The initial architecture is intentionally empty beyond the application shell.
New behavior should be added to the narrowest relevant feature and follow the
contracts in `AGENTS.md`.
