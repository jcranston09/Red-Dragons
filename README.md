# Red Dragons Playbook

Interactive **X's and O's** flag football play designer for Carroll / Southlake DYF **Kindergarten (5–6 year olds)**.

Built from the **2026 DYF Flag Rule Book** in this repo:

- **6v6** on a **30 × 53** yard field with **5-yard end zones**
- **Coach Quarterback** counts as the 6th offensive player and stays in a **1×1 pocket**
- **Unlimited runs** (no No-Run Zone)
- One center, adult QB, remaining players WR / RB / TE
- No blocking, no picks, no rushing the QB unless a handoff / fake / lateral / backward pass

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production build
npm run preview  # serve the production build
```

## What's in the app

1. **Play designer** — top-down DYF field, draggable O (offense) / X (defense) tokens, route drawing (solid arrow), run/pitch (dashed), pre-snap motion, save/load plays in `localStorage`, formation presets, ball-spot presets, and live Kinder legality checks (3 on the LOS, Coach pocket, one motion, no center handoff).
2. **Coach rules** — the parts of the 2026 rule book that change how you call a game with 5- and 6-year-olds.
3. **Suggested plays** — analysis of that rule book plus loadable plays (Dive, Jet, Spot, Slants, etc.) written for an adult QB and Kindergarten skill.

## Stack

Vite • React 18 • Tailwind CSS • Lucide React
