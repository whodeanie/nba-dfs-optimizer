# Monetization

This is an educational analytics tool. It is also a portfolio piece. The path from free demo to revenue exists, but every step along it has to keep the educational disclaimer honest. Here is the plan.

## Phase 0: free, ad free, demo

Where the project starts. Vercel hobby tier. Optional Groq key (free). No paid feeds, no paywall, no ads. Goal is portfolio impact and word of mouth.

Cost at 100 daily users averaging three lineups each: 0 USD. Groq's free tier covers Llama 3.3 70B token usage well within daily limits, and the app falls back to a deterministic explainer if the limit is hit. Vercel hobby tier hosting is free.

## Phase 1: DraftKings affiliate link

DraftKings runs a referral program with a CPA payout near 250 USD per qualified depositor. The contests page already discusses the formats. Adding a footer line of the form "Play this on DraftKings" with an affiliate link is consistent with the educational positioning if and only if:

* the link is clearly disclosed as an affiliate link
* the responsible gambling resources stay prominent
* the optimizer does not condition its output on the affiliate
* the affiliate link goes to a generic landing page, not a specific contest

Expected revenue. With even a 1 percent conversion rate from users to depositors at 250 USD per, 100 daily users converts to roughly 1 deposit per day, or 7,500 USD per month at the high end. Realistic conversion rates are well below this. A conservative model lands at 200 to 800 USD per month at scale.

## Phase 2: premium tier

What goes behind the paywall:

* polled ownership data instead of the heuristic
* live slate ingestion (DraftKings public CSV plus stats.nba.com)
* salary trend per player across the season
* lineup export to DraftKings and FanDuel CSV formats
* multi entry lineup pool optimization with stacking matrix
* ceiling optimized lineups (Monte Carlo objective in place of point projection)
* historical accuracy tracking analogous to the nba-playoff-props historical page

What stays free:

* the MIP solver
* the projections math
* the AI reasoning layer (capped at 5 lineups per request)
* one to three lineup runs

Pricing. The market sits at 20 to 50 USD per month for full feature optimizers (Stokastic, Awesemo). A premium tier at 9.99 USD per month for the polled ownership and live slate features is pricing pressure on the established players and a differentiated product (the AI reasoning layer is unique).

## Phase 3: cross sell with nba-playoff-props

Both products serve the same user. A combined account at 14.99 USD per month covers:

* the lineup optimizer (this project)
* the live player props with line shopping (nba-playoff-props)

The cross promo lives in the footer of both products, no aggressive popups.

## What we will never do

* No "guaranteed picks" language anywhere in the product or marketing.
* No predictions of specific dollar payouts.
* No targeting users who have self excluded from a sportsbook.
* No copy that minimizes financial risk.
* No removing the responsible gambling hotline.
* No upsell flow that hides the educational disclaimer.

## Compliance posture

This is a US facing product. DFS is legal in 45 states with various restrictions. The product does not facilitate any wager directly. It is an analytics tool that produces lineup recommendations. The responsible gambling hotline is in the footer of every page. The disclaimer is on every page that displays projections.

If a state explicitly bans DFS analytics, we will block by IP. We will not litigate the boundary.
