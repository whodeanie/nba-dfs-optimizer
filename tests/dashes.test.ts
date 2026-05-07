import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";

/**
 * Hard rule: no em dashes, en dashes, or sentence break hyphens anywhere
 * in code, README, commits, or copy.
 *
 * This test scans the repository for U+2014 (em dash), U+2013 (en dash),
 * and " - " when used as a sentence break in prose. Math expressions and
 * code subtractions are not sentence breaks and are intentionally allowed.
 *
 * The test file itself is exempt from the em/en dash scan because it must
 * reference the characters via codepoints to detect them.
 */

const ROOT = new URL("..", import.meta.url).pathname;
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".vercel", "out", "coverage"]);
const SKIP_FILES = new Set(["package-lock.json", "tsconfig.tsbuildinfo", "build.log"]);
const SELF = "dashes.test.ts";

const EM = String.fromCharCode(0x2014);
const EN = String.fromCharCode(0x2013);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (st.isFile()) {
      if (SKIP_FILES.has(entry)) continue;
      // Only scan text source files we author.
      if (
        entry.endsWith(".ts") ||
        entry.endsWith(".tsx") ||
        entry.endsWith(".js") ||
        entry.endsWith(".mjs") ||
        entry.endsWith(".md") ||
        entry.endsWith(".json") ||
        entry.endsWith(".css") ||
        entry.endsWith(".sh")
      ) {
        out.push(full);
      }
    }
  }
  return out;
}

describe("no banned dashes anywhere in the repo", () => {
  const files = walk(ROOT);

  it("has no em dashes (U+2014)", () => {
    const offenders: string[] = [];
    for (const f of files) {
      if (basename(f) === SELF) continue;
      const t = readFileSync(f, "utf8");
      if (t.includes(EM)) offenders.push(f);
    }
    expect(offenders, `em dash found in: ${offenders.join(", ")}`).toEqual([]);
  });

  it("has no en dashes (U+2013)", () => {
    const offenders: string[] = [];
    for (const f of files) {
      if (basename(f) === SELF) continue;
      const t = readFileSync(f, "utf8");
      if (t.includes(EN)) offenders.push(f);
    }
    expect(offenders, `en dash found in: ${offenders.join(", ")}`).toEqual([]);
  });

  it("has no sentence break hyphens in prose lines", () => {
    const offenders: { file: string; line: number; text: string }[] = [];
    for (const f of files) {
      // Only enforce in markdown prose. Code files use minus signs in arithmetic.
      if (!f.endsWith(".md")) continue;
      const lines = readFileSync(f, "utf8").split("\n");
      let inFence = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        if (line.trim().startsWith("```")) {
          inFence = !inFence;
          continue;
        }
        if (inFence) continue;
        // Skip indented code blocks.
        if (line.startsWith("    ") || line.startsWith("\t")) continue;
        // Strip inline code spans before checking.
        const stripped = line.replace(/`[^`]*`/g, "");
        // A " - " in prose, not preceded by an operator context.
        if (/ - /.test(stripped)) {
          offenders.push({ file: f, line: i + 1, text: line });
        }
      }
    }
    expect(
      offenders,
      `sentence break hyphen found at:\n${offenders.map((o) => `  ${o.file}:${o.line}: ${o.text}`).join("\n")}`
    ).toEqual([]);
  });
});
