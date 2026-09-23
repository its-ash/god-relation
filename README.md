# Devajāla — देवजाल

An interactive, Neo4j-Browser-style force-directed graph of Hindu mythology: primordial
cosmogony (Brahman, Prakriti), the Trimurti, the Great Goddess (Devi), the Devas,
Vishnu's ten avatars, sages, and the heroes of the Ramayana and Mahabharata — all
connected by their relations (parentage, consortship, avatarhood, incarnation, and more).

Built with [Nuxt 4](https://nuxt.com) + [vis-network](https://visjs.github.io/vis-network/).

## Development

```bash
npm install
npm run dev
```

## Structure

- `app/data/mythology.ts` — the dataset (nodes + relations), the source of truth for all content.
- `app/data/categoryStyles.ts` — per-category node styling.
- `app/composables/useMythologyNetwork.ts` — vis-network wiring (selection, filter, search, focus).
- `app/components/` — `GraphCanvas`, `NodeDetailPanel`, `SearchBar`, `LegendFilter`.

## Build & deploy

```bash
make run     # dev server
make build   # static generate → docs/ (for GitHub Pages)
make deploy  # build, commit, push to main
```

`docs/` is served via GitHub Pages, configured manually in the repository settings
(Settings → Pages → Deploy from branch → `main` / `docs`).
