# Devajāla — project instructions

Nuxt 4 (Vue 3, TypeScript, SSR disabled) single-page app that renders an interactive
force-directed graph of Hindu mythology relations (Trimurti, Devi, Devas, Vishnu's
avatars, sages, epic figures) using `vis-network`, in the style of the Neo4j Browser.

## Structure
- `app/data/mythology.ts` — the dataset: `DeityNode[]` + `DeityEdge[]` (source of truth for all graph content).
- `app/data/categoryStyles.ts` — visual styling per `DeityCategory`.
- `app/types/graph.ts` — shared types (`DeityNode`, `DeityEdge`, `DeityCategory`, `RelationType`).
- `app/composables/useMythologyNetwork.ts` — wraps `vis-network`/`vis-data`, exposes selection, filtering, search, focus.
- `app/components/GraphCanvas.vue` — mounts the vis-network canvas.
- `app/components/NodeDetailPanel.vue` — right-hand detail panel showing a selected node's facts + relations (click to traverse).
- `app/components/SearchBar.vue`, `LegendFilter.vue` — top search and left legend/category filter.
- `app/app.vue` — layout shell wiring everything together.

## Adding mythology content
Add nodes/edges directly to `app/data/mythology.ts`. Keep `id`s kebab/lowercase, cite a
`source` (text/Purana) per node, and prefer reusing existing `RelationType`s over inventing new ones.

## Conventions
- Deploy target is GitHub Pages via `docs/` (see root `Makefile` / `CLAUDE.md`) — `nuxt generate`, static SSR-disabled build.
- `nuxt.config.ts` sets `app.baseURL: '/relation/'` to match the GitHub Pages project-site path; update if the repo name changes.
