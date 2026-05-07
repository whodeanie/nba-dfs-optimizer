import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";

export const dynamic = "force-static";

export default function ContestsPage() {
  return (
    <div className="space-y-6 pt-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-court-gold">
          Contest types
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold mt-1">
          What you are actually playing
        </h1>
        <p className="muted mt-2 text-sm max-w-2xl">
          Every DFS contest has its own optimal lineup construction philosophy. Here is how the optimizer thinks about each format. None of this is a guarantee, all of it is downstream of how the field constructs.
        </p>
      </div>

      <Card
        title="Cash games (50/50, double up, head to head)"
        subtitle="Floor matters more than ceiling"
      >
        <p className="muted">
          You only need to beat half the field. The optimizer build for cash games skews to high projection plus high floor players. Stack discipline is light. Avoid contrarian punts. Roughly the top 50 percent of lineups by projected median win.
        </p>
        <p className="muted">
          Recommended optimizer settings: 1 to 3 lineups, max exposure 100 percent, no stacking minimum, low uniqueness budget.
        </p>
      </Card>

      <Card
        title="Single entry GPP (guaranteed prize pool)"
        subtitle="Ceiling matters more than floor"
      >
        <p className="muted">
          Top heavy payout structures reward the absolute optimal lineup, not the median. The optimizer leans into leverage: high ceiling players whose ownership is materially below their projection percentile. Stacking the highest pace game becomes important. Punt plays unlock ceiling at the top.
        </p>
        <p className="muted">
          Recommended optimizer settings: 1 to 5 lineups, max exposure 100 percent, minimum stack of 3 from one team, uniqueness budget of 2.
        </p>
      </Card>

      <Card
        title="Mass multi entry GPP"
        subtitle="Diversify exposure across correlated outcomes"
      >
        <p className="muted">
          When you enter 20 lineups in the same large field GPP, you are betting on outcome distributions. The optimizer caps individual player exposure and forces the lineup pool to express different game outcomes: high pace games, blowouts, contrarian stacks. Playing the same chalk in 20 lineups is just one bet, not 20.
        </p>
        <p className="muted">
          Recommended optimizer settings: 10 to 20 lineups, max exposure 30 to 50 percent, varied stack rules, uniqueness budget of 3 or more.
        </p>
      </Card>

      <Card
        title="Showdown / single game"
        subtitle="The captain pick is the lineup"
      >
        <p className="muted">
          Showdown contests use a captain at 1.5x salary and 1.5x points, plus 5 flex. The captain choice swings the whole lineup. The optimizer evaluates captain candidates on a points per dollar basis at the inflated salary, then fills the rest of the build to satisfy the cap.
        </p>
        <p className="muted">
          Recommended optimizer settings: 3 to 6 lineups varying captain, max exposure 100 percent at flex, low uniqueness budget.
        </p>
      </Card>

      <div className="card text-sm">
        <p className="font-medium">Bankroll management</p>
        <p className="muted mt-1">
          As a rule of thumb, sharp DFS players keep individual contest entries under 2 to 5 percent of their bankroll. The optimizer cannot enforce this for you. Set your entry sizing before you build, then keep it.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/optimize" className="btn-primary">
          Build a lineup
        </Link>
        <Link href="/" className="btn">
          Back to home
        </Link>
      </div>

      <Disclaimer />
    </div>
  );
}

function Card({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card space-y-2">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-xs font-mono uppercase tracking-widest text-court-gold mt-1">
          {subtitle}
        </p>
      </div>
      <div className="text-sm space-y-2">{children}</div>
    </div>
  );
}
