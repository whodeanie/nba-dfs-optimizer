import type { ProjectedPlayer, SlatePlayer } from "./types";

/**
 * Build a fantasy points projection for tonight's slate.
 *
 * Blend:
 *   base       = 0.55 * l10Avg + 0.30 * seasonAvg + 0.15 * vegasNudge
 *   matchup    = (oppDefVsPos / 100), values above 1.0 are favorable
 *   pace       = 0.5 + 0.5 * (pace / 100), keeps it in [0.5, 1.5]
 *   rest       = restMultiplier(rest)
 *   injury     = injuryMultiplier(status)
 *
 * projection = base * matchup * pace * rest * injury
 *
 * Ceiling and floor are derived from a Gaussian assumption with sigma
 * proportional to base, capped to plausible NBA ranges. Ownership is a
 * value driven heuristic, since true ownership requires a polled feed.
 */
export function projectPlayer(p: SlatePlayer): ProjectedPlayer {
  const vegasNudge = p.teamTotal * 0.18; // a 110 point team total nudges base by ~20

  const base = 0.55 * p.l10Avg + 0.30 * p.seasonAvg + 0.15 * vegasNudge;

  const matchup = clamp(p.oppDefVsPos / 100, 0.85, 1.15);
  const pace = 0.5 + 0.5 * clamp(p.pace / 100, 0.85, 1.15);
  const rest = restMultiplier(p.rest);
  const injury = injuryMultiplier(p.injuryStatus);

  let projection = base * matchup * pace * rest * injury;

  // Filter zero minute players cleanly.
  if (p.l10Min < 8) projection = Math.min(projection, 6);

  projection = round1(projection);

  const sigma = Math.max(4, projection * 0.22);
  const ceiling = round1(projection + sigma * 0.84); // ~80th percentile
  const floor = round1(Math.max(0, projection - sigma * 0.84));

  const value = round2(projection / Math.max(1, p.salary / 1000));

  // Heuristic ownership. High value plus high projection draws crowds.
  const valuePctile = clampPct((value - 3) * 18);
  const projPctile = clampPct((projection - 18) * 2.2);
  const ownership = round1(clamp(0.55 * valuePctile + 0.45 * projPctile, 0.5, 65));

  // Leverage: the projection percentile minus the ownership percentile.
  // Positive means the field is sleeping on this player relative to projection.
  const leverage = round1(clamp(projPctile - ownership, -50, 50));

  return {
    ...p,
    projection,
    ceiling,
    floor,
    ownership,
    value,
    leverage
  };
}

export function projectSlate(players: SlatePlayer[]): ProjectedPlayer[] {
  return players
    .filter((p) => p.injuryStatus !== "OUT")
    .map(projectPlayer)
    .sort((a, b) => b.projection - a.projection);
}

/**
 * Rest multiplier. Back to backs lose a little, three or more days off
 * regress slightly because of rust, two days is the sweet spot.
 */
function restMultiplier(rest: number): number {
  if (rest <= 0) return 0.94;
  if (rest === 1) return 1.0;
  if (rest === 2) return 1.02;
  if (rest === 3) return 1.0;
  return 0.97;
}

function injuryMultiplier(status: SlatePlayer["injuryStatus"]): number {
  switch (status) {
    case "ACTIVE":
      return 1.0;
    case "PROBABLE":
      return 0.97;
    case "QUESTIONABLE":
      return 0.85;
    case "DOUBTFUL":
      return 0.55;
    case "OUT":
      return 0;
  }
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

function clampPct(x: number): number {
  return clamp(x, 0.5, 65);
}

function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
