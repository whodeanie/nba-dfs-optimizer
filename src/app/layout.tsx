import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nba-dfs-optimizer.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NBA DFS Optimizer",
    template: "%s | NBA DFS Optimizer"
  },
  description:
    "Build the optimal NBA DraftKings or FanDuel lineup in 30 seconds. Mixed integer programming solver, projected points model, AI generated lineup analysis. Free.",
  openGraph: {
    title: "NBA DFS Optimizer",
    description:
      "Mixed integer programming for DFS lineup construction. Anthropic powered per lineup analysis. Free.",
    url: SITE_URL,
    siteName: "NBA DFS Optimizer",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "NBA DFS Optimizer",
    description: "Optimal NBA DFS lineups with AI commentary."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto max-w-5xl px-4 pb-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
