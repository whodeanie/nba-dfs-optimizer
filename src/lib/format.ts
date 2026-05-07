/**
 * Formatting helpers shared across pages and components.
 */

export function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function fmtPts(n: number): string {
  return `${n.toFixed(1)}`;
}

export function fmtPct(n: number): string {
  return `${n.toFixed(0)}%`;
}

export function teamColor(team: string): string {
  // Simple stable hash to a curated palette.
  const palette = [
    "#7AA2D4",
    "#D4A574",
    "#A6D49A",
    "#D49A7A",
    "#C9A6D4",
    "#D4D49A",
    "#7ED4C9",
    "#D47A9A"
  ];
  let h = 0;
  for (let i = 0; i < team.length; i++) h = (h * 31 + team.charCodeAt(i)) >>> 0;
  return palette[h % palette.length]!;
}
