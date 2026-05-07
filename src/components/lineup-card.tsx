import type { Lineup, LineupReasoning } from "@/lib/types";
import { fmtMoney, fmtPct, fmtPts, teamColor } from "@/lib/format";

export function LineupCard({
  lineup,
  index,
  reasoning
}: {
  lineup: Lineup;
  index: number;
  reasoning: LineupReasoning | null;
}) {
  return (
    <div className="card space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold">
          Lineup {index + 1}
          <span className="ml-3 text-xs muted font-mono uppercase tracking-widest">
            {lineup.contest.site} {lineup.contest.contest}
          </span>
        </h3>
        <div className="text-right text-sm">
          <div>
            <span className="muted">Proj </span>
            <span className="font-medium text-court-gold">{fmtPts(lineup.totalProjection)}</span>
          </div>
          <div className="text-xs muted">
            {fmtMoney(lineup.totalSalary)} of {fmtMoney(lineup.contest.salaryCap)}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="lineup-row text-xs uppercase tracking-widest muted font-mono pb-1 border-b border-ink-700">
          <div>Slot</div>
          <div>Player</div>
          <div className="desktop-only">Team</div>
          <div>Salary</div>
          <div>Proj</div>
          <div className="desktop-only">Own</div>
        </div>
        {lineup.spots.map((s, i) => (
          <div key={i} className="lineup-row text-sm">
            <div className="font-mono text-xs uppercase tracking-widest text-court-gold">{s.slot}</div>
            <div className="truncate">
              <a
                href={`/players/${s.player.id}`}
                className="no-underline hover:underline hover:text-court-gold"
              >
                {s.player.name}
              </a>
            </div>
            <div className="desktop-only">
              <span
                className="inline-block rounded px-1.5 py-[1px] text-[10px] font-mono"
                style={{ background: `${teamColor(s.player.team)}33`, color: teamColor(s.player.team) }}
              >
                {s.player.team} vs {s.player.opp}
              </span>
            </div>
            <div className="font-mono">{fmtMoney(s.slotSalary)}</div>
            <div className="font-mono text-court-gold">{fmtPts(s.slotPoints)}</div>
            <div className="desktop-only font-mono">
              {fmtPct(s.player.ownership)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-ink-700">
        <div>
          <div className="muted uppercase tracking-widest font-mono text-[10px]">Floor</div>
          <div className="text-sm">{fmtPts(lineup.totalFloor)}</div>
        </div>
        <div>
          <div className="muted uppercase tracking-widest font-mono text-[10px]">Ceiling</div>
          <div className="text-sm">{fmtPts(lineup.totalCeiling)}</div>
        </div>
        <div>
          <div className="muted uppercase tracking-widest font-mono text-[10px]">Sum Own</div>
          <div className="text-sm">{fmtPct(lineup.totalOwnership)}</div>
        </div>
      </div>

      {reasoning ? (
        <div className="rounded-md border border-court-gold/40 bg-court-gold/5 p-3 text-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-court-gold">
              AI lineup analysis
            </span>
            <span className="font-mono text-[10px] muted">
              {reasoning.source}
            </span>
          </div>
          <div className="whitespace-pre-line leading-relaxed">{reasoning.summary}</div>
          {reasoning.outcome ? (
            <div className="text-xs muted italic">Outcome read: {reasoning.outcome}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
