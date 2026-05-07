import type { MetadataRoute } from "next";
import { STATIC_SLATE } from "@/lib/slate";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://nba-dfs-optimizer.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/optimize`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/contests`, changeFrequency: "weekly", priority: 0.5 }
  ];
  for (const p of STATIC_SLATE) {
    base.push({
      url: `${SITE}/players/${p.id}`,
      changeFrequency: "daily",
      priority: 0.4
    });
  }
  return base;
}
