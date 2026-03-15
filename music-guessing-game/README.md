# ChronoTunes SPA (Frontend-first demo)

A polished, deployable single-page React + TypeScript game app for team music guessing with timeline strategy.

## Architecture
- `src/App.tsx`: host setup, lobby, active turn, timeline, history, round modal, winner view, and companion view toggle.
- `src/types.ts`: strongly typed game domain models.
- `src/game/engine.ts`: reusable gameplay helpers (turn order, ordering, higher/lower validation, winner detection, reveals, weighted selection).
- `src/services/providers.ts`: adapter interfaces and mock provider implementations for Spotify / YouTube Music.
- `src/data/mockSongs.ts`: seeded catalog with family-safe demo songs and preview URLs.
- `src/components/ui/*`: lightweight shadcn-style primitives (`Button`, `Card`, `Badge`) plus Tailwind styling.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deployment
- The workflow `.github/workflows/deploy-music-game.yml` can build and deploy this app to Vercel.
- Configure repository secrets:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

## Next steps
1. Replace mock adapters with real OAuth and provider APIs.
2. Add backend room state, persistence, and websocket sync.
3. Add host permissions, player auth, and anti-cheat controls.
4. Add test coverage for engine helpers and UI state transitions.
