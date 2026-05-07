export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <p className="subtle text-xs">Educational analytics. Not gambling advice.</p>;
  }
  return (
    <div className="card text-sm">
      <p className="font-medium">Educational analytics. Not gambling advice.</p>
      <p className="muted mt-1">
        DFS contests carry real financial risk. Past projections do not predict future results. Salaries, injury reports, and slates change frequently. Verify everything at the operator before entering. If gambling is no longer fun, call 1 800 GAMBLER.
      </p>
    </div>
  );
}
