import { NextResponse } from "next/server";
import { generateReasoning } from "@/lib/reasoning";
import { projectSlate } from "@/lib/projections";
import { optimize } from "@/lib/solver";
import { getSlate } from "@/lib/slate";
import type { OptimizerInput, SiteId, ContestType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = Partial<OptimizerInput> & { generateAi?: boolean };

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  const site: SiteId = body.site === "fanduel" ? "fanduel" : "draftkings";
  const contest: ContestType = body.contest === "showdown" ? "showdown" : "classic";
  const numLineups = clamp(Number(body.numLineups ?? 1), 1, 20);
  const maxExposure = clamp(Number(body.maxExposure ?? 100), 5, 100);
  const uniqueness = clamp(Number(body.uniqueness ?? 1), 0, 6);
  const minStack = body.minStack ? clamp(Number(body.minStack), 0, 6) : undefined;
  const locks = Array.isArray(body.locks) ? body.locks.slice(0, 8) : [];
  const excludes = Array.isArray(body.excludes) ? body.excludes.slice(0, 50) : [];
  const generateAi = body.generateAi !== false;

  const input: OptimizerInput = {
    site,
    contest,
    numLineups,
    locks,
    excludes,
    maxExposure,
    minStack,
    uniqueness
  };

  const slate = await getSlate();
  const projected = projectSlate(slate);
  const result = optimize(projected, input);

  let reasoning = result.lineups.map(() => null) as (
    | Awaited<ReturnType<typeof generateReasoning>>
    | null
  )[];

  if (generateAi && result.lineups.length > 0) {
    // Cap AI calls to 5 lineups to stay well within free tier costs.
    const cap = Math.min(result.lineups.length, 5);
    const responses = await Promise.all(
      result.lineups.slice(0, cap).map((l) => generateReasoning(l).catch(() => null))
    );
    reasoning = result.lineups.map((_, i) => (i < cap ? responses[i] ?? null : null));
  }

  return NextResponse.json({
    contest: result.contest,
    elapsedMs: result.elapsedMs,
    relaxations: result.relaxations,
    lineups: result.lineups,
    reasoning
  });
}

function clamp(x: number, lo: number, hi: number): number {
  if (Number.isNaN(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}
