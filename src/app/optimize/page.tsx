import { OptimizeClient } from "./optimize-client";
import { getSlate } from "@/lib/slate";
import { projectSlate } from "@/lib/projections";
import { Disclaimer } from "@/components/disclaimer";

export const dynamic = "force-dynamic";

export default async function OptimizePage() {
  const slate = await getSlate();
  const pool = projectSlate(slate);

  return (
    <div className="space-y-6 pt-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-court-gold">Lineup builder</p>
        <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Generate your DFS lineups</h1>
        <p className="muted mt-2 text-sm max-w-2xl">
          Pick your site, contest type, and how many lineups you want. Add locks and excludes if you have a read. The MIP solver will deliver lineups inside the salary cap with full position legality, then Claude will tell you the angle.
        </p>
      </div>

      <OptimizeClient pool={pool} />

      <Disclaimer />
    </div>
  );
}
