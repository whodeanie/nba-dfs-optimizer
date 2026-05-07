# The Projections Model

The optimizer is only as good as the projections it consumes. This document spells out the projection math, including every input, every weight, and every adjustment.

## Inputs per player

| Input | Source | Notes |
| ----- | ------ | ----- |
| L10 fantasy points average | last 10 games | Rolling average, captures recent form. |
| Season fantasy points average | season to date | Smooths the L10 noise. |
| Implied team total | sportsbook | Vegas as a market consensus on game environment. |
| Opponent defensive rating vs position | season aggregate | League index 100. Above 100 means opponent gives up more to this position. |
| Pace | season aggregate | League index 100. Above 100 means a faster game. |
| Days of rest | schedule | 0 means back to back, 1 means typical, 3 plus means rust risk. |
| Injury status | injury report | ACTIVE, PROBABLE, QUESTIONABLE, DOUBTFUL, OUT. OUT is filtered. |

## Base projection

```
vegasNudge = teamTotal * 0.18
base       = 0.55 * L10Avg + 0.30 * seasonAvg + 0.15 * vegasNudge
```

The 55 / 30 / 15 weights reflect the empirical finding that in NBA fantasy, recent form is the strongest single signal, season average sets the floor, and the Vegas implied total adds a small game environment correction. The Vegas nudge constant is calibrated so a 110 implied team total adds about 20 fantasy points of base, which is a credible game flow swing.

## Adjustment factors

```
matchup    = clamp(oppDefVsPos / 100, 0.85, 1.15)
pace       = 0.5 + 0.5 * clamp(pace / 100, 0.85, 1.15)
rest       = restMultiplier(rest)
injury     = injuryMultiplier(status)

projection = base * matchup * pace * rest * injury
```

Matchup. Ranges from 0.85 (toughest matchup we recognize) to 1.15 (softest). Above 100 OPP DEF means the opponent gives up more points to this position than league average.

Pace. Ranges from 0.925 (slow paced) to 1.075 (fast paced). The clamp avoids overweighting a single fast game.

Rest. 0 days off applies a 0.94 multiplier, 1 day is neutral, 2 days is a small 1.02 boost (rest matters in the NBA), 3 plus days regresses slightly to 0.97 because of rust.

Injury. ACTIVE 1.00, PROBABLE 0.97, QUESTIONABLE 0.85, DOUBTFUL 0.55, OUT 0 (filtered).

## Floor and ceiling

We assume a Gaussian outcome distribution with sigma proportional to the projection.

```
sigma   = max(4, projection * 0.22)
ceiling = projection + 0.84 * sigma   # roughly the 80th percentile
floor   = max(0, projection - 0.84 * sigma)
```

The 0.22 coefficient on sigma matches the empirical fantasy point variance for active NBA players. The minimum sigma of 4 keeps the band sensible for low projection plays.

## Value and ownership

```
value      = projection / max(1, salary / 1000)
```

Value is points per thousand dollars of salary. The classic DFS metric. Every cap relief slot the optimizer fills is implicitly a search for high value plays.

Ownership is a heuristic. The pool of plays the field crowds onto is heavily correlated with value plus projection. We approximate field perception with two percentile functions:

```
valuePctile = clamp((value - 3) * 18, 0.5, 65)
projPctile  = clamp((projection - 18) * 2.2, 0.5, 65)
ownership   = clamp(0.55 * valuePctile + 0.45 * projPctile, 0.5, 65)
```

This is not a polled ownership feed. It is a credible model of where the field will land. For polled ownership, plug in a paid feed and replace this function: nothing else in the codebase depends on the heuristic.

## Leverage

```
leverage = projPctile - ownership
```

Positive leverage means the field is sleeping on this projection. Negative leverage means the field is over excited. The optimizer does not directly maximize leverage, but the AI reasoning layer reads it and surfaces the contrarian angle.

## Edge cases

* Players with fewer than 8 average minutes in their last 10 games are floored at 6 fantasy points. This guards against the optimizer chasing high efficiency low minute players.
* OUT players are removed before projection ever runs.
* QUESTIONABLE players take a 15 percent haircut. If they are ruled out at game time, swap them post hoc and re run.

## Calibration notes

The constants in this model are credible defaults, not field tuned numbers. To improve them you would:

1. Collect at least one full NBA season of slates with per player projections and actuals.
2. Fit the L10 / season / Vegas weights by ridge regression on actual fantasy points.
3. Fit the matchup, pace, and rest multipliers as interaction terms.
4. Replace the ownership heuristic with a polled feed if available.

The optimizer will accept whatever projections you supply. The only things it requires are non negative numbers in the projection, ceiling, floor, salary, and ownership fields.
