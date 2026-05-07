import { describe, it, expect } from "vitest";
import { optimize } from "../src/lib/solver";
import { projectSlate } from "../src/lib/projections";
import { STATIC_SLATE } from "../src/lib/slate";
import { resolveContest } from "../src/lib/roster";

const pool = projectSlate(STATIC_SLATE);

describe("MIP solver: DraftKings classic", () => {
  const contest = resolveContest("draftkings", "classic");

  it("respects salary cap", () => {
    const result = optimize(pool, {
      site: "draftkings",
      contest: "classic",
      numLineups: 3,
      locks: [],
      excludes: [],
      maxExposure: 100,
      uniqueness: 1
    });
    expect(result.lineups.length).toBeGreaterThan(0);
    for (const l of result.lineups) {
      expect(l.totalSalary).toBeLessThanOrEqual(contest.salaryCap);
    }
  });

  it("fills exactly the right number of slots with no duplicate players", () => {
    const result = optimize(pool, {
      site: "draftkings",
      contest: "classic",
      numLineups: 1,
      locks: [],
      excludes: [],
      maxExposure: 100,
      uniqueness: 1
    });
    const lineup = result.lineups[0];
    expect(lineup).toBeDefined();
    if (!lineup) return;
    expect(lineup.spots.length).toBe(contest.rosterSize);
    const ids = lineup.spots.map((s) => s.player.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("respects max per team", () => {
    const result = optimize(pool, {
      site: "draftkings",
      contest: "classic",
      numLineups: 2,
      locks: [],
      excludes: [],
      maxExposure: 100,
      uniqueness: 1
    });
    for (const l of result.lineups) {
      const counts: Record<string, number> = {};
      for (const s of l.spots) counts[s.player.team] = (counts[s.player.team] ?? 0) + 1;
      for (const [, c] of Object.entries(counts)) {
        expect(c).toBeLessThanOrEqual(contest.maxPerTeam);
      }
    }
  });

  it("places locked players in every lineup", () => {
    const lockId = "BOS01"; // Tatum
    const result = optimize(pool, {
      site: "draftkings",
      contest: "classic",
      numLineups: 2,
      locks: [lockId],
      excludes: [],
      maxExposure: 100,
      uniqueness: 1
    });
    expect(result.lineups.length).toBeGreaterThan(0);
    for (const l of result.lineups) {
      expect(l.spots.some((s) => s.player.id === lockId)).toBe(true);
    }
  });

  it("never includes excluded players", () => {
    const banId = "OKC01"; // SGA, the obvious chalk
    const result = optimize(pool, {
      site: "draftkings",
      contest: "classic",
      numLineups: 3,
      locks: [],
      excludes: [banId],
      maxExposure: 100,
      uniqueness: 1
    });
    for (const l of result.lineups) {
      expect(l.spots.some((s) => s.player.id === banId)).toBe(false);
    }
  });

  it("respects stacking minimum when set", () => {
    const result = optimize(pool, {
      site: "draftkings",
      contest: "classic",
      numLineups: 1,
      locks: [],
      excludes: [],
      maxExposure: 100,
      uniqueness: 1,
      minStack: 3
    });
    for (const l of result.lineups) {
      const counts: Record<string, number> = {};
      for (const s of l.spots) counts[s.player.team] = (counts[s.player.team] ?? 0) + 1;
      const max = Math.max(...Object.values(counts));
      expect(max).toBeGreaterThanOrEqual(3);
    }
  });

  it("fills every slot with an eligible player", () => {
    const result = optimize(pool, {
      site: "draftkings",
      contest: "classic",
      numLineups: 1,
      locks: [],
      excludes: [],
      maxExposure: 100,
      uniqueness: 1
    });
    const l = result.lineups[0]!;
    for (const spot of l.spots) {
      const positions = spot.player.positions;
      switch (spot.slot) {
        case "PG":
        case "SG":
        case "SF":
        case "PF":
        case "C":
          expect(positions.includes(spot.slot)).toBe(true);
          break;
        case "G":
          expect(positions.includes("PG") || positions.includes("SG")).toBe(true);
          break;
        case "F":
          expect(positions.includes("SF") || positions.includes("PF")).toBe(true);
          break;
        case "UTIL":
          // any
          break;
      }
    }
  });
});

describe("MIP solver: DraftKings showdown captain", () => {
  it("applies 1.5x captain multiplier to projection and salary", () => {
    const result = optimize(pool, {
      site: "draftkings",
      contest: "showdown",
      numLineups: 1,
      locks: [],
      excludes: [],
      maxExposure: 100,
      uniqueness: 1
    });
    const l = result.lineups[0]!;
    expect(l.spots.length).toBe(6);
    const cpt = l.spots.find((s) => s.slot === "CPT");
    expect(cpt).toBeDefined();
    if (!cpt) return;
    const expectedSalary = Math.round(cpt.player.salary * 1.5);
    expect(cpt.slotSalary).toBe(expectedSalary);
    const expectedPts = Math.round(cpt.player.projection * 1.5 * 100) / 100;
    expect(cpt.slotPoints).toBeCloseTo(expectedPts, 1);
  });
});

describe("MIP solver: FanDuel classic", () => {
  it("produces a 9 player lineup under the 60k cap", () => {
    const contest = resolveContest("fanduel", "classic");
    const result = optimize(pool, {
      site: "fanduel",
      contest: "classic",
      numLineups: 1,
      locks: [],
      excludes: [],
      maxExposure: 100,
      uniqueness: 1
    });
    const l = result.lineups[0]!;
    expect(l.spots.length).toBe(contest.rosterSize);
    expect(l.totalSalary).toBeLessThanOrEqual(contest.salaryCap);
  });
});
