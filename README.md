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

### Third-party assets

- **Icons:** [Lucide](https://lucide.dev) via `lucide-react` (ISC License).
- **Photos:** four photographs from [Unsplash](https://unsplash.com), used under
  the [Unsplash License](https://unsplash.com/license), stored in
  `public/images/` so the demo does not depend on a CDN at presentation time.
  They show generic student life only: the catalogue institutions are
  fictional, so no photo depicts a real, identifiable campus.

  | File | Source |
  | --- | --- |
  | `hero-students.jpg` | https://images.unsplash.com/photo-1522202176988-66273c2fd55f |
  | `step-profile.jpg` | https://images.unsplash.com/photo-1434030216411-0b793f4b4173 |
  | `step-match.jpg` | https://images.unsplash.com/photo-1427504494785-3a9ca7044f45 |
  | `step-plan.jpg` | https://images.unsplash.com/photo-1531482615713-2afd69097998 |

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
