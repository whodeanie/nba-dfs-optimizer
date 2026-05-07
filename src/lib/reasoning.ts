import OpenAI from "openai";
import type { Lineup, LineupReasoning } from "./types";

/**
 * AI reasoning layer.
 *
 * Sends the lineup plus slate context to Llama 3.3 70B via Groq's free
 * OpenAI compatible endpoint and gets back a 80 to 120 word analysis
 * covering leverage, risk, and outcome. Falls back to a deterministic
 * rules based generator when no API key is configured (or when the daily
 * free tier limit is hit), so the app stays useful for free.
 *
 * Caching is done by lineup signature in an in process Map. For the typical
 * Vercel hobby tier deployment, this means a freshly cold instance pays
 * the cost once and serves repeated views from cache for the lifetime of
 * the function instance.
 */

const cache = new Map<string, LineupReasoning>();

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export async function generateReasoning(lineup: Lineup): Promise<LineupReasoning> {
  const cached = cache.get(lineup.signature);
  if (cached) return cached;

  const apiKey = process.env.GROQ_API_KEY;
  let result: LineupReasoning;

  if (!apiKey) {
    result = fallback(lineup);
  } else {
    try {
      result = await callGroq(lineup, apiKey);
    } catch (err) {
      console.error("groq call failed, using fallback", err);
      result = fallback(lineup);
    }
  }

  cache.set(lineup.signature, result);
  return result;
}

async function callGroq(lineup: Lineup, apiKey: string): Promise<LineupReasoning> {
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const lineupText = lineup.spots
    .map(
      (s, i) =>
        `${i + 1}. ${s.slot.padEnd(4)} ${s.player.name.padEnd(22)} ${s.player.team} vs ${s.player.opp} salary $${s.slotSalary} proj ${s.slotPoints.toFixed(1)} own ${s.player.ownership.toFixed(0)}% lev ${s.player.leverage.toFixed(0)}`
    )
    .join("\n");

  const teamCounts: Record<string, number> = {};
  for (const s of lineup.spots) teamCounts[s.player.team] = (teamCounts[s.player.team] ?? 0) + 1;
  const stacks = Object.entries(teamCounts)
    .filter(([, c]) => c >= 2)
    .map(([t, c]) => `${t}x${c}`)
    .join(", ") || "no multi player stacks";

  const prompt = `You are an NBA daily fantasy expert writing for a sharp player.

Generated lineup for ${lineup.contest.site} ${lineup.contest.contest}:
${lineupText}

Salary used: $${lineup.totalSalary} of $${lineup.contest.salaryCap}.
Projected points: ${lineup.totalProjection.toFixed(1)}.
Projected ceiling: ${lineup.totalCeiling.toFixed(1)}.
Projected floor: ${lineup.totalFloor.toFixed(1)}.
Sum of projected ownership: ${lineup.totalOwnership.toFixed(0)}%.
Stacks: ${stacks}.

Write a 90 to 110 word analysis covering, in order:
1. Why this lineup beats the field. Cite the specific contrarian leverage angle, naming one or two players whose ownership is materially below their projection percentile.
2. The biggest risk to this lineup. Be specific. Examples: over reliance on one team's pace, low floor on a key piece, blowout risk neutralizing minutes.
3. Expected GPP outcome in plain English: floor / ceiling read, win probability sense without quoting any specific number.

Style rules:
. No em dashes, no en dashes, no sentence break hyphens. Use commas, periods, or short sentences instead.
. No guarantees. No 'lock' or 'sure thing' language.
. No predictions of specific dollar payouts.

Return three short paragraphs separated by blank lines, then on a final line write 'OUTCOME: <one sentence outcome read>'.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.choices[0]?.message?.content ?? "").trim();
  return parseReasoning(text);
}

function parseReasoning(text: string): LineupReasoning {
  // Strip any em or en dashes that may slip through, replace with comma space.
  const EM = String.fromCharCode(0x2014);
  const EN = String.fromCharCode(0x2013);
  const safe = text
    .split(EM).join(", ")
    .split(EN).join(", ")
    .split(" " + String.fromCharCode(0x2D) + " ").join(", ")
    .trim();

  const lines = safe.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  let outcome = "";
  let outcomeIdx = lines.findIndex((l) => /^OUTCOME:/i.test(l));
  if (outcomeIdx === -1) {
    // Fallback: last line might have OUTCOME inline.
    const inline = safe.split("\n").find((l) => /^OUTCOME:/i.test(l));
    if (inline) outcome = inline.replace(/^OUTCOME:\s*/i, "").trim();
  } else {
    outcome = lines[outcomeIdx]!.replace(/^OUTCOME:\s*/i, "").trim();
    lines.splice(outcomeIdx, 1);
  }

  const leverage = lines[0] ?? "";
  const risk = lines[1] ?? "";
  if (!outcome) outcome = lines[2] ?? "Mid pack equity with a real top heavy ceiling.";

  return {
    summary: lines.join("\n\n"),
    leverage,
    risk,
    outcome,
    source: "groq"
  };
}

/**
 * Deterministic fallback. Reads the lineup numbers and writes a coherent
 * paragraph. Not as nuanced as the model, but useful when no API key is set.
 */
function fallback(lineup: Lineup): LineupReasoning {
  const sorted = [...lineup.spots].sort((a, b) => b.player.leverage - a.player.leverage);
  const top = sorted[0]!.player;
  const second = sorted[1]?.player;
  const ceilingTop = [...lineup.spots].sort(
    (a, b) => b.player.ceiling - a.player.ceiling
  )[0]!.player;

  const teamCounts: Record<string, number> = {};
  for (const s of lineup.spots) teamCounts[s.player.team] = (teamCounts[s.player.team] ?? 0) + 1;
  const stackEntries = Object.entries(teamCounts).filter(([, c]) => c >= 2);
  const stackStr =
    stackEntries.length > 0
      ? stackEntries.map(([t, c]) => `${t} x${c}`).join(", ")
      : "no multi player stacks";

  const leverage = `Leverage centers on ${top.name} at ${top.ownership.toFixed(0)} percent ownership against a top decile projection${
    second ? `, plus ${second.name} as a secondary off field play` : ""
  }. Stacks: ${stackStr}.`;

  const risk = `The biggest risk is concentration on ${top.team} pace and the floor read on ${
    [...lineup.spots].sort((a, b) => a.player.floor - b.player.floor)[0]!.player.name
  }. Blowout risk and back to back rest hits could shave the ceiling.`;

  const outcome = `Floor near ${lineup.totalFloor.toFixed(0)}, ceiling around ${lineup.totalCeiling.toFixed(
    0
  )}, anchored by ${ceilingTop.name}. Plays as a balanced GPP build with cash viability.`;

  return {
    summary: `${leverage}\n\n${risk}\n\n${outcome}`,
    leverage,
    risk,
    outcome,
    source: "fallback"
  };
}
