# Peak Beam v2 — Wangan Racer Prototype

Starter scaffold for a 3D arcade highway racer, built from scratch with the modern React 3D stack.

## Stack

| Layer      | Tech                                                                 |
|------------|----------------------------------------------------------------------|
| Framework  | Vite + React 18 + TypeScript                                         |
| 3D         | React Three Fiber (v8) + Drei                                        |
| Look       | `@react-three/postprocessing` — UnrealBloom "peak speed" glow        |
| Physics    | `@react-three/rapier` — WASM rigid-body physics                      |
| State      | Zustand (HUD reads speed / nitro / damage)                           |
| UI         | Tailwind CSS + Lucide icons                                          |

## What's already working

- 🚗 Drivable car (WASD/arrows) with arcade throttle, brake/reverse and speed-scaled steering
- 🌀 Handbrake drift (Space) — loosens rear grip
- ⚡ Nitrous boost (Shift) with draining/refilling tank
- 🧱 Guardrail collisions via Rapier — damage meter + red impact flash, `R` resets
- 🛣️ Oval coastal expressway: asphalt ring, red/white guardrails, start strip
- 📷 Smooth chase camera, night sky + stars + fog, bloom post-processing
- 📊 HUD: speedometer, nitro & damage bars, controls cheat-sheet

## Run it

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # type-check + production bundle (dist/)
```

## Deploy to GitHub Pages

`vite.config.ts` already uses `base: './'`, so:

```bash
npm run build   # → dist/
```

then push `dist/` to Pages (or add the standard GitHub Actions workflow for Vite).

## Where to go next

- `src/game/Car.tsx` — tuning constants at the top (`ACCEL`, `NITRO_ACCEL`, `BRAKE`), drift feel
- `src/game/Track.tsx` — track radii, rail count, decorations
- `src/game/Experience.tsx` — lights, bloom strength, gravity
- Ideas: AI traffic, lap timer + checkpoints, engine sound (WebAudio), skid marks, mobile touch controls
