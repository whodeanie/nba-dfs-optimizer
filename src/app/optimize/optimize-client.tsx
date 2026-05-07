"use client";

import { useMemo, useState } from "react";
import type { Lineup, LineupReasoning, ProjectedPlayer, SiteId, ContestType } from "@/lib/types";
import { LineupCard } from "@/components/lineup-card";
import { fmtMoney, fmtPct, fmtPts } from "@/lib/format";

type ApiResponse = {
  lineups: Lineup[];
  reasoning: (LineupReasoning | null)[];
  contest: { salaryCap: number; rosterSize: number };
  elapsedMs: number;
  relaxations: string[];
};

export function OptimizeClient({ pool }: { pool: ProjectedPlayer[] }) {
  const [site, setSite] = useState<SiteId>("draftkings");
  const [contest, setContest] = useState<ContestType>("classic");
  const [numLineups, setNumLineups] = useState(3);
  const [maxExposure, setMaxExposure] = useState(60);
  const [uniqueness, setUniqueness] = useState(2);
  const [minStack, setMinStack] = useState(0);
  const [locks, setLocks] = useState<string[]>([]);
  const [excludes, setExcludes] = useState<string[]>([]);
  const [generateAi, setGenerateAi] = useState(true);

  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const sortedPool = useMemo(() => [...pool].sort((a, b) => b.value - a.value), [pool]);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          site,
          contest,
          numLineups,
          maxExposure,
          uniqueness,
          minStack: minStack > 0 ? minStack : undefined,
          locks,
          excludes,
          generateAi
        })
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `optimizer returned ${res.status}`);
      }
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function toggleLock(id: string) {
    setLocks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setExcludes((prev) => prev.filter((x) => x !== id));
  }
  function toggleExclude(id: string) {
    setExcludes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setLocks((prev) => prev.filter((x) => x !== id));
  }

  return (
    <div className="space-y-6">
      <div className="card grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="label">Site</span>
          <div className="flex gap-2">
            <Toggle on={site === "draftkings"} onClick={() => setSite("draftkings")}>DraftKings</Toggle>
            <Toggle on={site === "fanduel"} onClick={() => setSite("fanduel")}>FanDuel</Toggle>
          </div>
        </div>
        <div>
          <span className="label">Contest</span>
          <div className="flex gap-2">
            <Toggle on={contest === "classic"} onClick={() => setContest("classic")}>Classic</Toggle>
            <Toggle on={contest === "showdown"} onClick={() => setContest("showdown")}>Showdown</Toggle>
          </div>
        </div>
        <div>
          <label className="label">Number of lineups (1 to 20)</label>
          <input
            className="input"
            type="number"
            min={1}
            max={20}
            value={numLineups}
            onChange={(e) => setNumLineups(parseInt(e.target.value || "1", 10))}
          />
        </div>
        <div>
          <label className="label">Max exposure per player ({maxExposure}%)</label>
          <input
            className="input"
            type="range"
            min={5}
            max={100}
            value={maxExposure}
            onChange={(e) => setMaxExposure(parseInt(e.target.value, 10))}
          />
        </div>
        <div>
          <label className="label">Lineup uniqueness (swap budget)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={6}
            value={uniqueness}
            onChange={(e) => setUniqueness(parseInt(e.target.value || "0", 10))}
          />
        </div>
        <div>
          <label className="label">Minimum same team stack (0 disables)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={5}
            value={minStack}
            onChange={(e) => setMinStack(parseInt(e.target.value || "0", 10))}
          />
        </div>
        <label className="flex items-center gap-2 col-span-full text-sm">
          <input
            type="checkbox"
            checked={generateAi}
            onChange={(e) => setGenerateAi(e.target.checked)}
          />
          Generate AI lineup analysis (Llama 3.3 70B via Groq, free)
        </label>
      </div>

      <div className="card">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-base font-semibold">Player pool</h3>
          <span className="text-xs muted">{sortedPool.length} active players</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[420px] overflow-y-auto pr-1">
          {sortedPool.map((p) => {
            const locked = locks.includes(p.id);
            const excluded = excludes.includes(p.id);
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-2 rounded px-2 py-1 text-sm ${
                  locked
                    ? "bg-court-gold/15 border border-court-gold/40"
                    : excluded
                      ? "bg-ink-700/60 line-through muted"
                      : "hover:bg-ink-700/40"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate">{p.name}</div>
                  <div className="text-[10px] font-mono muted">
                    {p.team} {p.positions.join("/")} · {fmtMoney(p.salary)} · {fmtPts(p.projection)} pts · v {p.value} · {fmtPct(p.ownership)} own
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => toggleLock(p.id)}
                    className={`text-[10px] font-mono px-1.5 py-[2px] rounded border ${
                      locked
                        ? "bg-court-gold text-ink-900 border-court-gold"
                        : "border-ink-600 hover:border-court-gold"
                    }`}
                  >
                    LOCK
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleExclude(p.id)}
                    className={`text-[10px] font-mono px-1.5 py-[2px] rounded border ${
                      excluded
                        ? "bg-court-red text-ink-900 border-court-red"
                        : "border-ink-600 hover:border-court-red"
                    }`}
                  >
                    BAN
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={run} disabled={busy} className="btn-primary">
          {busy ? "Solving..." : "Generate lineups"}
        </button>
        {data ? (
          <span className="text-xs muted">
            Solved in {data.elapsedMs} ms · {data.lineups.length} lineups
          </span>
        ) : null}
      </div>

      {err ? (
        <div className="card text-sm border-court-red/50 bg-court-red/10">Error: {err}</div>
      ) : null}

      {data && data.relaxations.length > 0 ? (
        <div className="card text-xs muted">
          Constraint relaxations applied: {data.relaxations.join("; ")}
        </div>
      ) : null}

      {data ? (
        <div className="space-y-4">
          {data.lineups.map((l, i) => (
            <LineupCard key={l.signature} lineup={l} index={i} reasoning={data.reasoning[i] ?? null} />
          ))}
          {data.lineups.length === 0 ? (
            <div className="card text-sm">
              The solver could not find a feasible lineup with these constraints. Try lowering the stack minimum, removing some locks, or raising the max exposure.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Toggle({
  on,
  onClick,
  children
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest rounded-md border transition ${
        on
          ? "bg-court-gold text-ink-900 border-court-gold"
          : "border-ink-600 hover:border-court-gold"
      }`}
    >
      {children}
    </button>
  );
}
