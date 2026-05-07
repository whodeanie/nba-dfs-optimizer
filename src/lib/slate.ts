import type { SlatePlayer } from "./types";

/**
 * Slate data layer.
 *
 * The optimizer is decoupled from where the slate comes from. In production
 * you can plug in:
 *   - stats.nba.com unofficial endpoints (rate limited, often blocked from
 *     serverless edges, requires User-Agent header workarounds)
 *   - DraftKings public CSV (changes URL daily, posted ~12 hours pre slate)
 *   - rotowire injury feed
 *
 * For the deployable demo, we ship a static, self contained slate that
 * reflects a plausible May 2026 NBA playoff night. This keeps the demo
 * useful with zero external API keys, and the data layer can be swapped
 * out without touching the solver, projections, or UI.
 *
 * The static slate represents the kind of player pool the optimizer is
 * designed to handle: 50 to 80 players across 4 to 6 teams in playoff
 * action, with realistic salaries and fantasy production rates.
 */

const STATIC_SLATE_DATE = "2026-05-06";

export const STATIC_SLATE: SlatePlayer[] = [
  // Game 1: Boston at Cleveland
  p("BOS01", "Jayson Tatum", "BOS", "CLE", ["SF", "PF"], 11200, 232, 47.8, 46.1, 38.4, 102, 96, 2),
  p("BOS02", "Jaylen Brown", "BOS", "CLE", ["SG", "SF"], 9300, 232, 39.6, 38.9, 35.7, 99, 96, 2),
  p("BOS03", "Derrick White", "BOS", "CLE", ["PG", "SG"], 7100, 232, 31.2, 28.4, 33.6, 101, 96, 2),
  p("BOS04", "Jrue Holiday", "BOS", "CLE", ["PG", "SG"], 5800, 232, 24.8, 22.1, 30.8, 98, 96, 2),
  p("BOS05", "Kristaps Porzingis", "BOS", "CLE", ["PF", "C"], 7900, 232, 33.2, 31.5, 28.4, 105, 96, 2, "QUESTIONABLE"),
  p("BOS06", "Al Horford", "BOS", "CLE", ["PF", "C"], 4900, 232, 19.6, 18.8, 25.9, 100, 96, 2),
  p("BOS07", "Sam Hauser", "BOS", "CLE", ["SF", "PF"], 3600, 232, 12.8, 11.4, 19.7, 98, 96, 2),
  p("BOS08", "Payton Pritchard", "BOS", "CLE", ["PG", "SG"], 4400, 232, 18.4, 17.2, 22.5, 97, 96, 2),

  p("CLE01", "Donovan Mitchell", "CLE", "BOS", ["PG", "SG"], 9700, 224, 41.5, 40.2, 34.6, 96, 96, 2),
  p("CLE02", "Darius Garland", "CLE", "BOS", ["PG", "SG"], 7200, 224, 30.4, 28.9, 32.1, 99, 96, 2),
  p("CLE03", "Evan Mobley", "CLE", "BOS", ["PF", "C"], 8200, 224, 36.8, 34.5, 31.2, 95, 96, 2),
  p("CLE04", "Jarrett Allen", "CLE", "BOS", ["C"], 7400, 224, 33.4, 32.1, 30.4, 97, 96, 2),
  p("CLE05", "Max Strus", "CLE", "BOS", ["SG", "SF"], 5100, 224, 21.9, 20.6, 27.8, 100, 96, 2),
  p("CLE06", "Caris LeVert", "CLE", "BOS", ["SG", "SF"], 4600, 224, 19.7, 18.9, 23.4, 102, 96, 2),
  p("CLE07", "Isaac Okoro", "CLE", "BOS", ["SG", "SF"], 3500, 224, 12.4, 11.2, 22.6, 99, 96, 2),
  p("CLE08", "Dean Wade", "CLE", "BOS", ["PF"], 3200, 224, 11.2, 10.4, 18.3, 96, 96, 2),

  // Game 2: Oklahoma City at Denver
  p("OKC01", "Shai Gilgeous-Alexander", "OKC", "DEN", ["PG", "SG"], 11400, 228, 53.4, 51.8, 36.1, 103, 100, 1),
  p("OKC02", "Chet Holmgren", "OKC", "DEN", ["PF", "C"], 8500, 228, 39.6, 37.4, 31.5, 101, 100, 1),
  p("OKC03", "Jalen Williams", "OKC", "DEN", ["SG", "SF"], 7800, 228, 34.5, 33.1, 32.4, 98, 100, 1),
  p("OKC04", "Luguentz Dort", "OKC", "DEN", ["SG", "SF"], 4800, 228, 19.4, 18.6, 28.4, 99, 100, 1),
  p("OKC05", "Josh Giddey", "OKC", "DEN", ["PG", "SG"], 6200, 228, 28.6, 27.4, 27.9, 102, 100, 1, "PROBABLE"),
  p("OKC06", "Isaiah Hartenstein", "OKC", "DEN", ["C"], 5400, 228, 23.4, 22.1, 24.6, 97, 100, 1),
  p("OKC07", "Cason Wallace", "OKC", "DEN", ["PG", "SG"], 4100, 228, 16.8, 15.4, 22.3, 98, 100, 1),

  p("DEN01", "Nikola Jokic", "DEN", "OKC", ["C"], 12100, 226, 58.2, 56.4, 36.8, 94, 100, 2),
  p("DEN02", "Jamal Murray", "DEN", "OKC", ["PG", "SG"], 8400, 226, 37.4, 36.1, 33.4, 96, 100, 2),
  p("DEN03", "Aaron Gordon", "DEN", "OKC", ["PF"], 6700, 226, 29.8, 28.4, 32.6, 99, 100, 2),
  p("DEN04", "Michael Porter Jr.", "DEN", "OKC", ["SF", "PF"], 6400, 226, 27.9, 26.8, 31.2, 95, 100, 2),
  p("DEN05", "Kentavious Caldwell-Pope", "DEN", "OKC", ["SG", "SF"], 4500, 226, 17.9, 17.1, 28.7, 102, 100, 2),
  p("DEN06", "Christian Braun", "DEN", "OKC", ["SG", "SF"], 3900, 226, 14.6, 13.8, 22.4, 100, 100, 2),
  p("DEN07", "Russell Westbrook", "DEN", "OKC", ["PG", "SG"], 4700, 226, 19.4, 18.2, 24.1, 99, 100, 2),

  // Game 3: New York at Indiana
  p("NYK01", "Jalen Brunson", "NYK", "IND", ["PG", "SG"], 10300, 230, 45.2, 43.8, 35.9, 100, 102, 2),
  p("NYK02", "OG Anunoby", "NYK", "IND", ["SF", "PF"], 6900, 230, 30.4, 29.1, 33.2, 98, 102, 2),
  p("NYK03", "Mikal Bridges", "NYK", "IND", ["SF"], 6800, 230, 28.6, 27.4, 32.1, 99, 102, 2),
  p("NYK04", "Karl-Anthony Towns", "NYK", "IND", ["PF", "C"], 9200, 230, 41.4, 40.2, 33.4, 95, 102, 2),
  p("NYK05", "Josh Hart", "NYK", "IND", ["SG", "SF"], 5800, 230, 27.4, 26.1, 29.8, 102, 102, 2),
  p("NYK06", "Donte DiVincenzo", "NYK", "IND", ["SG"], 4400, 230, 18.6, 17.4, 26.4, 100, 102, 2),

  p("IND01", "Tyrese Haliburton", "IND", "NYK", ["PG"], 9800, 234, 43.2, 41.4, 35.6, 105, 102, 1),
  p("IND02", "Pascal Siakam", "IND", "NYK", ["PF"], 7600, 234, 33.8, 32.4, 32.1, 98, 102, 1),
  p("IND03", "Myles Turner", "IND", "NYK", ["C"], 6300, 234, 28.4, 27.1, 28.4, 102, 102, 1),
  p("IND04", "Bennedict Mathurin", "IND", "NYK", ["SG", "SF"], 5400, 234, 22.6, 21.4, 26.7, 104, 102, 1),
  p("IND05", "Aaron Nesmith", "IND", "NYK", ["SF"], 4200, 234, 18.2, 17.1, 24.2, 101, 102, 1),
  p("IND06", "Andrew Nembhard", "IND", "NYK", ["PG", "SG"], 4500, 234, 19.4, 18.6, 25.3, 103, 102, 1),
  p("IND07", "Obi Toppin", "IND", "NYK", ["PF"], 3800, 234, 14.8, 13.6, 19.4, 105, 102, 1),

  // Game 4: Minnesota at Los Angeles Lakers
  p("MIN01", "Anthony Edwards", "MIN", "LAL", ["SG", "SF"], 10100, 220, 45.8, 44.2, 36.4, 97, 99, 1),
  p("MIN02", "Karl Anthony Towns alt", "MIN", "LAL", ["PF", "C"], 7900, 220, 36.4, 34.8, 31.4, 96, 99, 1),
  p("MIN03", "Rudy Gobert", "MIN", "LAL", ["C"], 6800, 220, 31.4, 30.2, 29.8, 95, 99, 1),
  p("MIN04", "Mike Conley", "MIN", "LAL", ["PG"], 5100, 220, 21.8, 20.4, 28.4, 99, 99, 1),
  p("MIN05", "Jaden McDaniels", "MIN", "LAL", ["SF", "PF"], 4900, 220, 21.6, 20.4, 30.1, 97, 99, 1),
  p("MIN06", "Naz Reid", "MIN", "LAL", ["PF", "C"], 5200, 220, 22.4, 21.6, 24.4, 99, 99, 1),
  p("MIN07", "Nickeil Alexander-Walker", "MIN", "LAL", ["SG"], 3900, 220, 14.6, 13.8, 22.7, 98, 99, 1),

  p("LAL01", "Luka Doncic", "LAL", "MIN", ["PG", "SG"], 11600, 222, 53.4, 52.1, 36.1, 100, 99, 2),
  p("LAL02", "LeBron James", "LAL", "MIN", ["SF", "PF"], 9400, 222, 42.6, 41.1, 35.4, 96, 99, 2),
  p("LAL03", "Austin Reaves", "LAL", "MIN", ["SG"], 6400, 222, 28.4, 27.1, 32.4, 99, 99, 2),
  p("LAL04", "Rui Hachimura", "LAL", "MIN", ["SF", "PF"], 4600, 222, 19.8, 18.6, 26.4, 98, 99, 2),
  p("LAL05", "Dorian Finney-Smith", "LAL", "MIN", ["SF", "PF"], 3800, 222, 14.6, 13.8, 24.7, 97, 99, 2),
  p("LAL06", "Gabe Vincent", "LAL", "MIN", ["PG"], 3700, 222, 13.4, 12.6, 22.4, 100, 99, 2),
  p("LAL07", "Jaxson Hayes", "LAL", "MIN", ["C"], 3600, 222, 14.2, 13.4, 19.6, 99, 99, 2),

  // Bench depth and value plays across teams
  p("BOS09", "Luke Kornet", "BOS", "CLE", ["C"], 3500, 232, 13.4, 12.1, 17.6, 95, 96, 2),
  p("CLE09", "Sam Merrill", "CLE", "BOS", ["SG"], 3300, 224, 12.4, 11.2, 18.4, 99, 96, 2),
  p("OKC08", "Aaron Wiggins", "OKC", "DEN", ["SG", "SF"], 3700, 228, 13.6, 12.4, 19.4, 100, 100, 1),
  p("DEN08", "Peyton Watson", "DEN", "OKC", ["SF", "PF"], 3400, 226, 12.8, 11.4, 18.7, 98, 100, 2),
  p("NYK07", "Precious Achiuwa", "NYK", "IND", ["PF", "C"], 3300, 230, 11.2, 10.4, 16.8, 100, 102, 2),
  p("IND08", "TJ McConnell", "IND", "NYK", ["PG"], 3700, 234, 14.6, 13.4, 21.4, 102, 102, 1),
  p("MIN08", "Kyle Anderson", "MIN", "LAL", ["SF", "PF"], 3400, 220, 11.8, 10.6, 19.6, 96, 99, 1),
  p("LAL08", "Christian Wood", "LAL", "MIN", ["PF", "C"], 3500, 222, 13.6, 12.4, 18.4, 100, 99, 2)
];

function p(
  id: string,
  name: string,
  team: string,
  opp: string,
  positions: SlatePlayer["positions"],
  salary: number,
  teamTotal: number,
  l10: number,
  season: number,
  l10Min: number,
  oppDef: number,
  pace: number,
  rest: number,
  status: SlatePlayer["injuryStatus"] = "ACTIVE"
): SlatePlayer {
  return {
    id,
    name,
    team,
    opp,
    positions,
    salary,
    teamTotal,
    gameDate: STATIC_SLATE_DATE,
    injuryStatus: status,
    l10Avg: l10,
    seasonAvg: season,
    l10Min,
    oppDefVsPos: oppDef,
    pace,
    rest
  };
}

/**
 * The slate function returns the active slate. In a future revision this
 * will await a live feed and fall back to the static slate on failure.
 */
export async function getSlate(): Promise<SlatePlayer[]> {
  // Future: try fetchLive(); if it throws, return STATIC_SLATE.
  return STATIC_SLATE;
}

export function getSlateDate(): string {
  return STATIC_SLATE_DATE;
}

export function getPlayerById(id: string): SlatePlayer | undefined {
  return STATIC_SLATE.find((p) => p.id === id);
}

export function listGames(): { home: string; away: string; teamTotal: number; date: string }[] {
  const seen = new Set<string>();
  const games: { home: string; away: string; teamTotal: number; date: string }[] = [];
  for (const player of STATIC_SLATE) {
    const key = [player.team, player.opp].sort().join("vs");
    if (seen.has(key)) continue;
    seen.add(key);
    games.push({
      home: player.team,
      away: player.opp,
      teamTotal: player.teamTotal,
      date: player.gameDate
    });
  }
  return games;
}
