# The Optimizer Algorithm

Lineup construction in DFS is a constrained combinatorial optimization problem. The literature treats it as a mixed integer program, and this project implements a branch and bound solver tailored to NBA DFS pool sizes (roughly 100 to 200 viable players, 5 to 9 roster slots per lineup, multi lineup runs of up to 20).

## The mixed integer program

Decision variables. For each player i in the pool and each slot s in the roster:

```
x[i, s] in {0, 1}
x[i, s] = 1 if and only if player i fills slot s
```

Parameters.

```
projection[i]      projected fantasy points for player i
salary[i]          DFS salary for player i
slotPtMul[s]       points multiplier for slot s (1.5 for CPT in showdown, 1 elsewhere)
slotCapMul[s]      salary multiplier for slot s (matches slotPtMul on DK and FD)
team[i]            team abbreviation for player i
elig[i, s]         1 if player i is eligible for slot s, 0 otherwise
cap                contest salary cap
maxPerTeam         max players from any one team allowed
```

Objective.

```
maximize  sum over i, s of  projection[i] * slotPtMul[s] * x[i, s]
```

Constraints.

```
1.  Each slot is filled exactly once:
        for every s,  sum over i of x[i, s] = 1

2.  Each player appears at most once across all slots:
        for every i,  sum over s of x[i, s] <= 1

3.  Slot eligibility hard wired:
        x[i, s] = 0 whenever elig[i, s] = 0

4.  Salary cap:
        sum over i, s of  salary[i] * slotCapMul[s] * x[i, s]  <=  cap

5.  Max players per team:
        for every team t,  sum over i in t, s of x[i, s]  <=  maxPerTeam

6.  Locks (player ids the user requires):
        for every locked id l,  sum over s of x[l, s] = 1

7.  Excludes (player ids the user forbids):
        for every excluded id e,  sum over s of x[e, s] = 0

8.  Optional stacking minimum:
        there exists a team t with  sum over i in t, s of x[i, s] >= minStack
```

Constraint 8 is non convex when expressed with arithmetic, so the solver expresses it post hoc by validating any candidate optimum against the stacking rule and rejecting infeasible candidates inside the branch and bound recursion.

## Solver: branch and bound with greedy upper bound

The MIP above is small enough at NBA DFS pool sizes that we do not need a general purpose LP relaxation engine. Instead we use a custom branch and bound search that exploits the structure of the problem.

State. A search node holds the current partial lineup: which slot index we are filling next, which players are already used, current accumulated salary, current accumulated projection, and a per team count.

Branching. At each node we pick the next slot to fill (in a fixed order, see below) and try every eligible candidate that does not violate salary or team limits. Each child node descends one slot. Locks are tried first whenever still missing.

Slot ordering. We process slots from most restrictive to least restrictive: CPT first (because it sets the captain multiplier for the rest of the build), then strict positions, then G/F, then UTIL/FLEX. This makes the search prune fast at shallow depths.

Pruning.

1.  Greedy upper bound. From the current node, fill remaining slots greedily with the highest projection eligible player not yet used. If the bound is below the best known feasible objective, prune.

2.  Cheapest remaining salary. Pre-compute the minimum salary it takes to fill each remaining slot. If current salary plus this minimum exceeds the cap, prune.

3.  Team limit. If adding this player would put the team over the per team max, skip.

Captain handling. For showdown contests, slot multipliers are applied symmetrically to projection and salary, so a captain costs 1.5 times their base salary and contributes 1.5 times their base projection. Captain selection is just slot 0 in our slot order.

Time budget. Each single lineup solve is hard capped at 6.5 seconds. Multi lineup runs are capped at 8 seconds total. In practice, NBA pool sizes solve well under 500 ms per lineup with the upper bound and salary cuts active.

## Multi lineup runs and uniqueness

DFS players entering 20 lineups need 20 distinct lineups. We enforce uniqueness with cuts.

Each generated lineup adds a constraint to subsequent solves:

```
for every previously generated lineup L, the new lineup must differ from L
in at least uniqueness players
```

Equivalently, the overlap with any previous lineup is bounded above by `rosterSize - uniqueness`. The default uniqueness budget is 2 players.

Exposure caps work similarly. We track usage counts across the run and forbid any player from appearing in more than `floor(maxExposure% * numLineups)` lineups. If the solver hits infeasibility under the exposure cap on the very first lineup, we relax it once and report the relaxation.

## Why a custom solver rather than a library

* No native binary. Vercel hobby tier serverless functions do not bundle CBC, Gurobi, or PuLP in a sane way. Pure TypeScript keeps deployment trivial.
* Fast enough. NBA pool sizes mean the search tree is small. Branch and bound with a tight upper bound dominates LP relaxation overhead at this scale.
* Full control. Locks, excludes, stacking minimums, exposure caps, and uniqueness cuts all express naturally in the recursion. No translation to a generic MILP API.

## Edge cases the solver handles

* Player not eligible for any slot: filtered before search begins.
* All eligible players above cap for a slot: pruned by salary feasibility.
* User supplies more locks than the roster size: rejected before search.
* User supplies a stack minimum that no team can satisfy with remaining cap: search returns no feasible lineup, UI suggests relaxing.
* Locked player has OUT injury status: filtered, UI surfaces a warning in the lineup card.

## Future work

* LP relaxation as the upper bound function. Tighter than the greedy bound, would matter on very large pools.
* Column generation for showdown captain enumeration. Roughly cuts the search by a factor of `rosterSize`.
* Stochastic objective. Replace point projection with a sampled Monte Carlo objective for GPP optimization, where ceiling matters more than median.
* Live slate ingestion. The slate data layer is already abstracted. Plugging in stats.nba.com or a DraftKings public CSV is a 50 line change.
