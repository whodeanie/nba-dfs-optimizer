import type { ContestConfig, ContestType, Position, RosterSlot, SiteId } from "./types";

/**
 * Roster rules per (site, contest).
 *
 * DraftKings classic: 8 players, $50,000 cap, slots PG SG SF PF C G F UTIL,
 * max 4 per team in cash, max 4 in GPP unless stacking, modeled as max 4.
 *
 * FanDuel classic: 9 players, $60,000 cap, slots PG PG SG SG SF SF PF PF C,
 * max 4 per team.
 *
 * DraftKings showdown captain mode: 6 players, $50,000 cap. CPT slot pays
 * 1.5x points and 1.5x salary, plus 5 FLEX. Max 5 from one team.
 *
 * FanDuel single game: 5 players, $60,000 cap. MVP at 1.5x, plus 4 FLEX.
 * Max 4 from one team.
 */
export const ROSTER_RULES: Record<SiteId, Record<ContestType, ContestConfig>> = {
  draftkings: {
    classic: {
      site: "draftkings",
      contest: "classic",
      salaryCap: 50000,
      rosterSize: 8,
      slots: ["PG", "SG", "SF", "PF", "C", "G", "F", "UTIL"],
      maxPerTeam: 4
    },
    showdown: {
      site: "draftkings",
      contest: "showdown",
      salaryCap: 50000,
      rosterSize: 6,
      slots: ["CPT", "FLEX", "FLEX", "FLEX", "FLEX", "FLEX"],
      maxPerTeam: 5,
      captainMultiplier: 1.5
    }
  },
  fanduel: {
    classic: {
      site: "fanduel",
      contest: "classic",
      salaryCap: 60000,
      rosterSize: 9,
      slots: ["PG", "PG", "SG", "SG", "SF", "SF", "PF", "PF", "C"],
      maxPerTeam: 4
    },
    showdown: {
      site: "fanduel",
      contest: "showdown",
      salaryCap: 60000,
      rosterSize: 5,
      slots: ["CPT", "FLEX", "FLEX", "FLEX", "FLEX"],
      maxPerTeam: 4,
      captainMultiplier: 1.5
    }
  }
};

/**
 * Returns true if the player can occupy this slot given their position eligibility.
 */
export function eligible(slot: RosterSlot, positions: Position[]): boolean {
  if (slot === "UTIL" || slot === "FLEX" || slot === "CPT") return true;
  if (slot === "G") return positions.includes("PG") || positions.includes("SG");
  if (slot === "F") return positions.includes("SF") || positions.includes("PF");
  return positions.includes(slot as Position);
}

/**
 * Resolves the contest config for a (site, contest) pair.
 */
export function resolveContest(site: SiteId, contest: ContestType): ContestConfig {
  return ROSTER_RULES[site][contest];
}
