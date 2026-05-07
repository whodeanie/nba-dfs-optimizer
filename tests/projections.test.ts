import { describe, it, expect } from "vitest";
import { projectPlayer, projectSlate } from "../src/lib/projections";
import { STATIC_SLATE } from "../src/lib/slate";
import type { SlatePlayer } from "../src/lib/types";

describe("projections model", () => {
  it("filters OUT players from the slate", () => {
    const out: SlatePlayer = {
      ...STATIC_SLATE[0]!,
      id: "TEST_OUT",
      injuryStatus: "OUT"
    };
    const projected = projectSlate([...STATIC_SLATE, out]);
    expect(projected.find((p) => p.id === "TEST_OUT")).toBeUndefined();
  });

  it("applies a haircut to QUESTIONABLE players", () => {
    const base = STATIC_SLATE.find((p) => p.id === "BOS01")!;
    const active = projectPlayer({ ...base, injuryStatus: "ACTIVE" });
    const questionable = projectPlayer({ ...base, injuryStatus: "QUESTIONABLE" });
    expect(questionable.projection).toBeLessThan(active.projection);
  });

  it("ceiling is greater than projection, floor is less than projection", () => {
    const projected = projectPlayer(STATIC_SLATE[0]!);
    expect(projected.ceiling).toBeGreaterThan(projected.projection);
    expect(projected.floor).toBeLessThanOrEqual(projected.projection);
    expect(projected.floor).toBeGreaterThanOrEqual(0);
  });

  it("sorts the slate by projection descending", () => {
    const projected = projectSlate(STATIC_SLATE);
    for (let i = 1; i < projected.length; i++) {
      expect(projected[i - 1]!.projection).toBeGreaterThanOrEqual(projected[i]!.projection);
    }
  });

  it("computes positive value for active high projection players", () => {
    const projected = projectSlate(STATIC_SLATE);
    expect(projected[0]!.value).toBeGreaterThan(0);
  });

  it("ownership is bounded in (0, 65]", () => {
    const projected = projectSlate(STATIC_SLATE);
    for (const p of projected) {
      expect(p.ownership).toBeGreaterThan(0);
      expect(p.ownership).toBeLessThanOrEqual(65);
    }
  });
});
