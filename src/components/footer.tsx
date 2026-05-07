import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-ink-700">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm subtle space-y-2">
        <p>
          Educational analytics tool. Not financial or gambling advice. Past performance does not predict future results.
        </p>
        <p>
          If gambling is no longer fun, get help. Visit{" "}
          <a href="https://www.responsiblegambling.org" target="_blank" rel="noopener noreferrer">
            responsiblegambling.org
          </a>{" "}
          or call <a href="tel:18004262537">1 800 GAMBLER</a>.
        </p>
        <p>
          <Link href="/optimize" className="no-underline hover:underline">
            Build a lineup
          </Link>
          {" · "}
          <Link href="/contests" className="no-underline hover:underline">
            Contest types
          </Link>
          {" · "}
          <a
            href="https://github.com/whodeanie/nba-dfs-optimizer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source on GitHub
          </a>
          {" · "}
          <a
            href="https://nba-playoff-props.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            NBA Playoff Props
          </a>
        </p>
      </div>
    </footer>
  );
}
