import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-ink-700 bg-ink-900/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-mono text-sm uppercase tracking-widest no-underline hover:text-court-gold">
          NBA DFS Optimizer
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/optimize" className="no-underline hover:text-court-gold">
            Optimize
          </Link>
          <Link href="/contests" className="no-underline hover:text-court-gold hidden sm:inline">
            Contests
          </Link>
          <a
            href="https://github.com/whodeanie/nba-dfs-optimizer"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hover:text-court-gold hidden sm:inline"
          >
            Source
          </a>
        </nav>
      </div>
    </header>
  );
}
