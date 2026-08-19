# QuantForge

A browser-based quant trading terminal, built for people who are curious
about markets and quantitative trading but don't have a finance
background. No installation, no backend (yet) — open `index.html` and go.

## What's inside

- **Dashboard** — overview of the workspace.
- **Markets** — real, live prices and price history, pulled from the
  [Alpha Vantage](https://www.alphavantage.co) API using your own free
  API key.
- **Quant Lab** — a set of self-contained models: Kelly Criterion,
  Black-Scholes options pricing, Monte Carlo simulation, statistical
  arbitrage / pairs trading, Engle-Granger cointegration, Markov regime
  detection, factor scoring, correlation matrix, and more.
- **Strategy Lab / Backtester** — test a simple moving-average
  crossover strategy against either pasted price data or real
  historical prices loaded from Markets.
- **Risk Engine** — position and portfolio risk helpers.

All of the math lives in `quant-tools.js`, a dependency-free JavaScript
module (`window.QuantTools`). All of the market data access lives in
`market-data.js` (`window.MarketData`). The UI in `app.js` just wires
buttons to those two engines.

## Getting real market data

1. Create a free API key at
   [alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
   (takes under a minute, no credit card).
2. Open the app, go to **Markets**, paste the key into "Your API key"
   and click **Save key**.
3. The key is stored only in your browser's `localStorage`. It is sent
   directly from your browser to Alpha Vantage — this project has no
   server of its own, so nobody else ever sees it.

The free Alpha Vantage tier has a request-rate limit, so if you see a
"rate limit reached" message, just wait a minute and try again.

## Running locally

This is a static site — no build step required.

```bash
# any static file server works, for example:
npx serve .
```

Then open the printed URL in your browser.

## Status / roadmap

This project is under active development. Planned next steps include:

- A backend with user accounts, so people can save watchlists,
  portfolios and strategy settings across devices.
- A paper-trading simulator (virtual cash, buy/sell, open positions)
  so beginners can practice without financial risk.
- More beginner-friendly explanations throughout the app (what a
  "quote" is, what "Sharpe ratio" means, etc.), not just the raw
  numbers.

## Disclaimer

QuantForge is an educational tool. Nothing in this app is financial
advice, and no real trades are ever placed — the Strategy Lab and
Backtester only simulate outcomes on historical data.
