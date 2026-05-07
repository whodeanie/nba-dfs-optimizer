// Performance smoke test for the solver.
import { describe, it, expect } from "vitest";
import { optimize } from "../src/lib/solver";
import { projectSlate } from "../src/lib/projections";
import { STATIC_SLATE } from "../src/lib/slate";

const pool = projectSlate(STATIC_SLATE);

describe("solver performance", () => {
  it("solves a single DK classic lineup in under 500 ms", () => {
    const start = Date.now();
    const result = optimize(pool, {
      site: "draftkings",
      contest: "classic",
      numLineups: 1,
      locks: [],
      excludes: [],
      maxExposure: 100,
      uniqueness: 1
    }, 5000);
    const ms = Date.now() - start;
    expect(result.lineups.length).toBe(1);
    expect(ms).toBeLessThan(500);
  });

  it("solves 5 unique DK classic lineups in under 2 seconds", () => {
    const start = Date.now();
    const result = optimize(pool, {
      site: "draftkings",
      contest: "classic",
      numLineups: 5,
      locks: [],
      excludes: [],
      maxExposure: 100,
      uniqueness: 2
    }, 8000);
    const ms = Date.now() - start;
    expect(result.lineups.length).toBeGreaterThanOrEqual(3);
    expect(ms).toBeLessThan(2000);
  });
});
