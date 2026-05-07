/**
 * Core types for the NBA DFS lineup optimizer.
 *
 * Designed for two contest types and two sites. Add new ones by extending
 * the SiteId / ContestType unions and adding a matching entry to
 * ROSTER_RULES in roster.ts.
 */

export type SiteId = "draftkings" | "fanduel";
export type ContestType = "classic" | "showdown";

/**
 * Canonical NBA position. A player's eligibility can be one or more of these.
 * DraftKings classic uses PG, SG, SF, PF, C plus G (PG or SG), F (SF or PF),
 * and UTIL (any). FanDuel classic uses PG, SG, SF, PF, C without flex slots.
 */
export type Position = "PG" | "SG" | "SF" | "PF" | "C";

/**
 * A roster slot. May be a strict position, a multi position group,
 * or a wildcard. The lineup must place exactly one player in each slot.
 */
export type RosterSlot =
  | "PG"
  | "SG"
  | "SF"
  | "PF"
  | "C"
  | "G"
  | "F"
  | "UTIL"
  | "CPT"
  | "FLEX";

/**
 * Static contest configuration. Salary cap, slot list, max players per team.
 */
export type ContestConfig = {
  site: SiteId;
  contest: ContestType;
  salaryCap: number;
  rosterSize: number;
  slots: RosterSlot[];
  maxPerTeam: number;
  /**
   * Captain or MVP slot multiplier for showdown style contests.
   * 1.5 on DraftKings showdown, 1.5 on FanDuel single game (MVP).
   * Undefined for classic.
   */
  captainMultiplier?: number;
};

/**
 * A single player on the slate.
 */
export type SlatePlayer = {
  id: string;
  name: string;
  team: string;
  opp: string;
  positions: Position[];
  salary: number;
  /** Vegas implied team total, used as a pace and scoring proxy. */
  teamTotal: number;
  /** Game date in YYYY MM DD form, slate scoping. */
  gameDate: string;
  /** Injury status, OUT means filtered, QUESTIONABLE applies a haircut. */
  injuryStatus: "ACTIVE" | "QUESTIONABLE" | "PROBABLE" | "DOUBTFUL" | "OUT";
  /** Last 10 games fantasy point average. */
  l10Avg: number;
  /** Season fantasy point average. */
  seasonAvg: number;
  /** Average minutes played over last 10 games. */
  l10Min: number;
  /** Defensive rating allowed by the opponent vs this position, league index 100. */
  oppDefVsPos: number;
  /** Pace adjustment, league index 100. Higher means faster. */
  pace: number;
  /** Days of rest since last game. */
  rest: number;
  /** Optional headshot URL. */
  photoUrl?: string;
};

/**
 * A projected player after the projections model has run.
 * Adds projected points, ceiling, floor, leverage.
 */
export type ProjectedPlayer = SlatePlayer & {
  projection: number;
  /** 80th percentile outcome. */
  ceiling: number;
  /** 20th percentile outcome. */
  floor: number;
  /** Projected ownership percent on a typical large field GPP, 0 to 100. */
  ownership: number;
  /** Points per $1k salary, the classic value metric. */
  value: number;
  /** Leverage = projection percentile minus ownership percentile, 0 to 100. */
  leverage: number;
};

/**
 * One player in a generated lineup, with the slot they are filling and the
 * fantasy points expected from that slot (captain multiplier applied for showdown).
 */
export type LineupSpot = {
  slot: RosterSlot;
  player: ProjectedPlayer;
  /** Slot adjusted fantasy points (captain multiplier applied). */
  slotPoints: number;
  /** Slot adjusted salary (captain salary inflation applied for showdown). */
  slotSalary: number;
};

/**
 * A fully formed lineup the optimizer returns.
 */
export type Lineup = {
  spots: LineupSpot[];
  totalSalary: number;
  totalProjection: number;
  totalCeiling: number;
  totalFloor: number;
  totalOwnership: number;
  contest: ContestConfig;
  /** Stable signature for caching AI reasoning. */
  signature: string;
};

/**
 * AI generated commentary attached to a lineup.
 */
export type LineupReasoning = {
  /** 80 to 120 word analysis. */
  summary: string;
  /** The contrarian leverage angle. */
  leverage: string;
  /** The biggest risk. */
  risk: string;
  /** GPP outcome estimate, qualitative. */
  outcome: string;
  /** Source of the reasoning, groq or fallback. */
  source: "groq" | "fallback";
};

/**
 * User supplied optimizer constraints.
 */
export type OptimizerInput = {
  site: SiteId;
  contest: ContestType;
  numLineups: number;
  /** Player ids to lock into every lineup. */
  locks: string[];
  /** Player ids to exclude from every lineup. */
  excludes: string[];
  /** Maximum exposure per player across the lineup set, 0 to 100 percent. */
  maxExposure: number;
  /**
   * Minimum number of players from the same team to stack.
   * If undefined, no stacking constraint is applied.
   */
  minStack?: number;
  /** Random uniqueness budget, swaps rotational players to vary lineups. */
  uniqueness: number;
};

/**
 * The full optimizer output, including all generated lineups and the
 * pool the optimizer drew from.
 */
export type OptimizerResult = {
  lineups: Lineup[];
  pool: ProjectedPlayer[];
  contest: ContestConfig;
  /** Wall clock duration in milliseconds. */
  elapsedMs: number;
  /**
   * If the solver could not find a feasible lineup with the given constraints,
   * this lists what we relaxed to deliver a result.
   */
  relaxations: string[];
};
