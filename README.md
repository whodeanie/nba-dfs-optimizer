# NBA DFS Optimizer

Build the optimal NBA DraftKings or FanDuel lineup in 30 seconds. Free.

A production grade DFS lineup optimizer that combines mixed integer programming for lineup construction with Groq powered per lineup analysis (Llama 3.3 70B, free tier). Companion product to [nba-playoff-props](https://nba-playoff-props.vercel.app), which handles the player prop side. This one handles lineup construction.

Live demo: https://nba-dfs-optimizer.vercel.app

## What it does

1. Pulls a slate of NBA players with salaries, projections, opponent context, pace, rest, and injury status.
2. Runs a custom branch and bound MIP solver that respects salary cap, position eligibility, team limits, locks, excludes, stacking, and exposure constraints.
3. Generates one to twenty lineups for a given site and contest type.
4. Sends each lineup to Llama 3.3 70B (via Groq) for a 100 word analysis covering the contrarian angle, the biggest risk, and the GPP outcome read.
5. Falls back to a deterministic explainer when no API key is configured, so the app stays useful for free.

## Why this exists

DFS lineup optimizers cost 20 to 50 dollars a month at the major sites. The math is not the moat. The moat was UX, plus speed, plus an analyst voice on each lineup. This project delivers all three at zero marginal cost on Vercel hobby tier.

It is also a portfolio piece that demonstrates three things at once:

1. Classical optimization done right in TypeScript: a working MIP solver for a real combinatorial problem with mixed constraints.
2. A blended projections model that is not a black box: every input is documented in [MODEL.md](./MODEL.md).
3. Hybrid AI engineering: combining a deterministic optimizer output with an LLM reasoning layer, with cost controls, caching, and a graceful fallback.

## Stack

* Next.js 15 App Router, TypeScript strict mode
* Tailwind CSS 3
* OpenAI SDK pointed at Groq's free OpenAI compatible endpoint (Llama 3.3 70B default)
* Recharts for visualizations
* Vitest for the solver and projections tests
* Vercel hobby tier for hosting

No database, no external paid API. Slate data layer is pluggable so a live feed can be wired in without touching the solver, projections, or UI.

## Algorithm overview

See [ALGORITHM.md](./ALGORITHM.md) for the full mixed integer program, the branch and bound search strategy, the upper bound function, and the cuts used to enforce uniqueness across multi lineup runs.

See [MODEL.md](./MODEL.md) for the projections math, including the L10 / season / Vegas blend, the matchup adjustment, the pace and rest factors, the ownership heuristic, and the leverage calculation.

See [MONETIZATION.md](./MONETIZATION.md) for the path from free demo to revenue without breaking the educational disclaimer.

## Local development

```
npm install
cp .env.example .env.local   # optional, for the AI reasoning layer
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Name | Required | Notes |
| ---- | -------- | ----- |
| GROQ_API_KEY | optional | Enables the AI reasoning layer. Get one free at https://console.groq.com. Without it (or when the daily free limit is hit) the app uses a deterministic fallback explainer. |
| GROQ_MODEL | optional | Defaults to llama-3.3-70b-versatile. |
| ODDS_API_KEY | optional | OddsAPI free tier for live salary and slate context. Falls back to a static slate when missing. |
| NEXT_PUBLIC_SITE_URL | optional | Used for canonical links and Open Graph. Set this in Vercel after deploy. |

## Cost

Groq's free tier covers Llama 3.3 70B with generous daily token limits, more than enough for the typical hobby tier lineup volume. The API route caps generated analyses at five per request to keep usage bounded under heavy load. When the daily limit is hit the app silently switches to the deterministic fallback explainer. Vercel hobby tier hosting is free.

## Tests

```
npm run typecheck
npm test
```

The solver suite verifies:

* Salary cap is never violated.
* Roster size and slot eligibility are always exactly right.
* Max players per team constraint holds.
* Locks always appear, excludes never appear.
* Stacking minimum is enforced when set.
* Captain multiplier is applied correctly in showdown contests.

## Disclaimer

Educational analytics tool. Not financial or gambling advice. DFS contests carry real financial risk. Past projections do not predict future results. Salaries, injury reports, and slates change frequently. Verify everything at the operator before entering. If gambling is no longer fun, call 1 800 GAMBLER.

## License

MIT, see [LICENSE](./LICENSE).
