# BilsenBol

BilsenBol is an AI-assisted university and admissions journey product. It is
being built to turn an applicant profile into explainable recommendations, a
comparison, and an actionable roadmap.

## Current state

The repository contains the initial application shell and the feature
boundaries for the product journey. The landing page is runnable; the profile,
diagnosis, recommendation, comparison, roadmap, and progress features are
placeholders for future implementation.

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
