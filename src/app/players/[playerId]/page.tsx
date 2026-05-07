import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayerById, getSlate } from "@/lib/slate";
import { projectPlayer } from "@/lib/projections";
import { fmtMoney, fmtPct, fmtPts } from "@/lib/format";
import { Disclaimer } from "@/components/disclaimer";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const slatePlayer = getPlayerById(playerId);
  if (!slatePlayer) {
    notFound();
    return null;
  }
  const player = slatePlayer;
  const projected = projectPlayer(player);
  const slate = await getSlate();
  const samePos = slate
    .filter((p) => p.id !== player.id && p.positions.some((x) => player.positions.includes(x)))
    .map((p) => projectPlayer(p))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="space-y-6 pt-8">
      <div>
        <Link href="/optimize" className="text-xs no-underline hover:underline muted">
          ← Back to optimizer
        </Link>
        <h1 className="text-3xl font-semibold mt-2">{player.name}</h1>
        <p className="muted">
          {player.team} {player.positions.join(" / ")} · vs {player.opp} ·{" "}
          <span className="font-mono">{player.gameDate}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Salary" value={fmtMoney(player.salary)} />
        <Stat label="Projection" value={fmtPts(projected.projection)} accent />
        <Stat label="Value" value={projected.value.toFixed(2)} />
        <Stat label="Ownership" value={fmtPct(projected.ownership)} />
        <Stat label="Floor" value={fmtPts(projected.floor)} />
        <Stat label="Ceiling" value={fmtPts(projected.ceiling)} />
        <Stat label="Last 10 avg" value={fmtPts(player.l10Avg)} />
        <Stat label="Season avg" value={fmtPts(player.seasonAvg)} />
      </div>

      <div className="card text-sm space-y-2">
        <h2 className="text-base font-semibold">Why the projection lands here</h2>
        <ul className="space-y-1 muted leading-relaxed list-disc list-inside">
          <li>Last 10 games average is {fmtPts(player.l10Avg)}, season average is {fmtPts(player.seasonAvg)}.</li>
          <li>
            Opponent defensive rating vs {player.positions[0]} is {player.oppDefVsPos} (league index 100). Above 100 means a softer matchup.
          </li>
          <li>
            Pace context: combined game pace index {player.pace}, implied team total {player.teamTotal / 2}.
          </li>
          <li>
            Rest: {player.rest} day{player.rest === 1 ? "" : "s"} since last game. Status: {player.injuryStatus}.
          </li>
          <li>
            Leverage score is {projected.leverage.toFixed(0)}. Positive numbers mean the field is sleeping on this projection.
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-semibold">Other plays at this position</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {samePos.map((p) => (
            <Link
              key={p.id}
              href={`/players/${p.id}`}
              className="card no-underline hover:border-court-gold flex items-center justify-between"
            >
              <div>
                <div className="text-sm">{p.name}</div>
                <div className="text-xs muted font-mono">
                  {p.team} · {fmtMoney(p.salary)} · v {p.value}
                </div>
              </div>
              <div className="text-sm text-court-gold font-mono">{fmtPts(p.projection)}</div>
            </Link>
          ))}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card">
      <div className="font-mono text-[10px] uppercase tracking-widest muted">{label}</div>
      <div className={`text-lg font-semibold ${accent ? "text-court-gold" : ""}`}>{value}</div>
    </div>
  );
}
