const state = {
  view: "dashboard",
  symbol: "SPY",
  prices: [],
  watch: ["SPY", "QQQ", "NVDA", "AAPL", "BTC-USD"]
};

const navItems = [
  ["OVERVIEW", "⌂", "dashboard", "Dashboard"],
  ["MARKET", "◈", "markets", "Markets"],
  ["QUANT", "∿", "quant", "Quant Lab"],
  ["STRATEGIES", "◫", "strategies", "Strategy Lab"],
  ["BACKTEST", "↗", "backtest", "Backtesting"],
  ["RISK", "◉", "risk", "Risk Engine"],
  ["PORTFOLIO", "▦", "portfolio", "Portfolio"],
  ["ALERTS", "◌", "alerts", "Signals & Alerts"],
  ["LEARN", "?", "learn", "Learn Mode"]
];

const modules = [
  ["Statistical Arbitrage", "⇄", "Find mean-reverting relationships using spread, z-score, correlation and cointegration."],
  ["Kelly Criterion", "K", "Calculate position sizing from win probability and payoff."],
  ["Black-Scholes", "B", "Estimate option value and basic Greeks."],
  ["Monte Carlo", "M", "Stress-test a strategy across thousands of simulated paths."],
  ["Engle-Granger", "EG", "Test whether two assets have a useful long-run relationship."],
  ["Markov Regime Model", "MR", "Classify market regimes and estimate transition probabilities."],
  ["Sentiment Analyzer", "S", "Turn news sentiment into a measurable market factor."],
  ["Multi-Factor Model", "MF", "Rank assets using momentum, value, quality and volatility."],
  ["BAB", "β", "Compare low-beta and high-beta exposure."],
  ["Asymmetric Bets", "↗", "Search for setups with favorable upside versus downside."],
  ["Correlation Heatmap", "▤", "Map diversification and hidden concentration."],
  ["Insider Tracker", "I", "Track insider activity and convert it into a signal."]
];

function el(id) {
  return document.getElementById(id);
}

function nav() {
  const target = el("nav");
  if (!target) return;

  let previousSection = "";

  target.innerHTML = navItems.map(item => {
    const [section, icon, view, label] = item;

    let html = "";

    if (section !== previousSection) {
      html += `<div class="section">${section}</div>`;
      previousSection = section;
    }

    html += `
      <button class="${state.view === view ? "active" : ""}"
              onclick="go('${view}')">
        <b>${icon}</b>${label}
      </button>
    `;

    return html;
  }).join("");
}

function go(view) {
  state.view = view;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toast(message) {
  const target = el("toast");

  if (!target) {
    console.log(message);
    return;
  }

  target.textContent = message;
  target.classList.add("show");

  setTimeout(() => {
    target.classList.remove("show");
  }, 2200);
}

function money(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function randn() {
  let u = 0;
  let v = 0;

  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  return Math.sqrt(-2 * Math.log(u)) *
    Math.cos(2 * Math.PI * v);
}

function seedPrices(count = 220, start = 630) {
  let price = start;
  const prices = [];

  for (let i = 0; i < count; i++) {
    price *= Math.exp(
      0.00035 + 0.018 * randn()
    );

    prices.push(price);
  }

  return prices;
}

function livePrices() {
  if (!state.prices.length) {
    state.prices = seedPrices();
    return;
  }

  const last = state.prices[state.prices.length - 1];

  const next = last * Math.exp(
    0.00015 + 0.0035 * randn()
  );

  state.prices.push(next);

  if (state.prices.length > 260) {
    state.prices.shift();
  }
}

function drawChart(id, data) {
  const canvas = el(id);

  if (!canvas || !data || data.length < 2) {
    return;
  }

  const rect = canvas.getBoundingClientRect();

  const width = Math.max(rect.width, 10);
  const height = Math.max(rect.height, 10);

  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext("2d");

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const padding = 10;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  ctx.strokeStyle = "#17263a";
  ctx.lineWidth = 1;

  for (let i = 1; i < 5; i++) {
    const y =
      padding +
      (height - padding * 2) * i / 5;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.beginPath();

  data.forEach((value, index) => {
    const x =
      padding +
      (width - padding * 2) *
      index /
      Math.max(data.length - 1, 1);

    const y =
      height -
      padding -
      ((value - min) / span) *
      (height - padding * 2);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function stat(title, value, change, label, positive = null) {
  let cls = "";

  if (positive === true) cls = "positive";
  if (positive === false) cls = "negative";

  return `
    <div class="card">
      <div class="stat-label">${title}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-foot ${cls}">
        ${change} · ${label}
      </div>
    </div>
  `;
}

function ticker(symbol, factor, signal, confidence) {
  return `
    <div class="ticker-row">
      <div class="ticker">
        ${symbol}
        <small>${factor}</small>
      </div>

      <div>${confidence}</div>

      <div>
        <span class="signal ${signal.toLowerCase()}">
          ${signal}
        </span>
      </div>

      <div>
        <div class="bar">
          <i style="width:${parseInt(confidence, 10)}%"></i>
        </div>
      </div>
    </div>
  `;
}

function riskbar(label, value) {
  return `
    <div class="progress-row">
      <span>${label}</span>
      <div class="bar">
        <i style="width:${value}%"></i>
      </div>
      <b>${value}</b>
    </div>
  `;
}

function metric(label, value) {
  return `
    <div class="metric">
      <span>${label}</span>
      <b>${value}</b>
    </div>
  `;
}

function dashboard() {
  const price =
    state.prices[state.prices.length - 1] || 630;

  const first =
    state.prices[0] || price;

  const day =
    ((price / first) - 1) * 100;

  return `
    <div class="page-head">
      <div>
        <div class="eyebrow">
          Quant terminal /
          ${new Date().toLocaleTimeString("pl-PL")}
        </div>

        <h1>Market Intelligence</h1>

        <div class="sub">
          One workspace for research, strategies, risk and execution decisions.
        </div>
      </div>

      <div class="actions">
        <button class="btn"
          onclick="go('strategies')">
          ＋ New strategy
        </button>

        <button class="btn primary"
          onclick="go('quant')">
          Run quant scan
        </button>
      </div>
    </div>

    <div class="grid stats">
      ${stat(
        "Portfolio",
        "$124,860",
        "+2.84%",
        "30D",
        true
      )}

      ${stat(
        "SPY",
        money(price),
        day.toFixed(2) + "%",
        "simulated live",
        day >= 0
      )}

      ${stat(
        "Risk score",
        "32 / 100",
        "Moderate",
        "portfolio"
      )}

      ${stat(
        "Sharpe",
        "1.74",
        "+0.31",
        "vs benchmark",
        true
      )}

      ${stat(
        "Regime",
        "Risk-on",
        "68% confidence",
        "Markov",
        true
      )}
    </div>

    <div class="grid dashboard-grid">

      <div class="card chart-card">

        <div class="card-title">
          <b>${state.symbol} · Live price engine</b>
          <span>
            simulated feed
          </span>
        </div>

        <div class="chart-wrap">
          <canvas id="mainChart"></canvas>
        </div>

        <div class="legend">
          <span>Price</span>
          <span>1m · 5m · 1h · 1D</span>
          <span>Broker adapter ready</span>
        </div>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Quant Signals</b>
          <span>updated now</span>
        </div>

        ${ticker(
          "NVDA",
          "Momentum",
          "BUY",
          "91%"
        )}

        ${ticker(
          "SPY",
          "Regime",
          "BUY",
          "78%"
        )}

        ${ticker(
          "QQQ",
          "Mean reversion",
          "WATCH",
          "61%"
        )}

        ${ticker(
          "AAPL",
          "Factor score",
          "BUY",
          "74%"
        )}

        ${ticker(
          "BTC-USD",
          "Volatility",
          "SELL",
          "68%"
        )}

      </div>

    </div>

    <div
      class="grid two"
      style="margin-top:13px"
    >

      <div class="card">

        <div class="card-title">
          <b>Portfolio risk</b>
          <span>risk engine</span>
        </div>

        ${riskbar("Market beta", 72)}
        ${riskbar("Volatility", 43)}
        ${riskbar("Concentration", 61)}
        ${riskbar("Drawdown", 27)}
        ${riskbar("Liquidity", 88)}

      </div>

      <div class="card">

        <div class="card-title">
          <b>Decision assistant</b>
          <span>quant analysis</span>
        </div>

        <div class="hero-signal">

          <span class="tag">
            CURRENT SETUP
          </span>

          <div class="big positive">
            WAIT / SCALE IN
          </div>

          <div class="sub">
            SPY · 78% confidence
          </div>

        </div>

        <div
          class="explain"
          style="margin-top:10px"
        >
          Positive regime and momentum, but volatility is elevated.
          The engine suggests staged sizing and a predefined invalidation level.
        </div>

      </div>

    </div>
  `;
}

function markets() {
  return `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          Market data
        </div>

        <h1>Markets</h1>

        <div class="sub">
          Watchlist, market regime and simulated price engine.
        </div>
      </div>

      <div class="actions">
        <button
          class="btn primary"
          onclick="toast('Data provider adapter ready')"
        >
          Connect data provider
        </button>
      </div>

    </div>

    <div class="grid two">

      <div class="card chart-card">

        <div class="card-title">
          <b>SPY</b>
          <span>simulated feed</span>
        </div>

        <div class="chart-wrap">
          <canvas id="marketChart"></canvas>
        </div>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Watchlist</b>
          <span>5 assets</span>
        </div>

        ${state.watch.map((symbol, index) => {

          const types = [
            "Equity ETF",
            "Tech ETF",
            "Semiconductor",
            "Mega cap",
            "Crypto"
          ];

          const negative = index === 4;

          const change = negative
            ? "-1.21%"
            : "+" + (1.2 + index * 0.31).toFixed(2) + "%";

          return `
            <div class="ticker-row">

              <div class="ticker">
                ${symbol}
                <small>${types[index]}</small>
              </div>

              <div class="${negative ? "negative" : "positive"}">
                ${change}
              </div>

              <div>
                <span class="signal ${negative ? "sell" : "buy"}">
                  ${negative ? "SELL" : "BUY"}
                </span>
              </div>

            </div>
          `;

        }).join("")}

      </div>

    </div>

    <div
      class="grid three"
      style="margin-top:13px"
    >

      ${stat(
        "Trend strength",
        "74%",
        "Strong",
        "20/50/200 MA",
        true
      )}

      ${stat(
        "Volatility",
        "38%",
        "Moderate",
        "30D"
      )}

      ${stat(
        "Market breadth",
        "66%",
        "Positive",
        "advance/decline",
        true
      )}

    </div>
  `;
}

function quant() {
  return `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          Research engine
        </div>

        <h1>Quant Lab</h1>

        <div class="sub">
          Quantitative models with explanations.
        </div>
      </div>

    </div>

    <div class="grid module-grid">

      ${modules.map((module, index) => {

        return `
          <div
            class="card module"
            onclick="openModule(${index})"
          >

            <div class="module-icon">
              ${module[1]}
            </div>

            <h3>
              ${module[0]}
            </h3>

            <p>
              ${module[2]}
            </p>

            <span class="open">
              Open module →
            </span>

          </div>
        `;

      }).join("")}

    </div>
  `;
}

function openModule(index) {
  const module = modules[index];

  toast(module[0] + " opened");

  console.log(
    "Quant module:",
    module[0]
  );
}

function strategies() {
  return `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          Strategy development
        </div>

        <h1>Strategy Lab</h1>

        <div class="sub">
          Define and analyze a trading strategy.
        </div>
      </div>

      <div class="actions">

        <button
          class="btn"
          onclick="toast('Strategy saved locally')"
        >
          Save
        </button>

        <button
          class="btn primary"
          onclick="go('backtest')"
        >
          Backtest strategy
        </button>

      </div>

    </div>

    <div class="grid two">

      <div class="card">

        <div class="card-title">
          <b>Strategy definition</b>
          <span>plain English</span>
        </div>

        <div class="field">

          <label>
            Describe your strategy
          </label>

          <textarea id="strategyText">
Buy when 20-day momentum is positive and RSI is below 65.
Reduce position when volatility rises above its 30-day median.
Exit if drawdown exceeds 8%.
          </textarea>

        </div>

        <div
          class="input-grid"
          style="margin-top:10px"
        >

          <div class="field">

            <label>
              Asset
            </label>

            <input
              value="SPY"
              id="asset"
            />

          </div>

          <div class="field">

            <label>
              Timeframe
            </label>

            <select>
              <option>1D</option>
              <option>4H</option>
              <option>1H</option>
            </select>

          </div>

          <div class="field">

            <label>
              Initial capital
            </label>

            <input
              value="100000"
              type="number"
            />

          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="analyzeStrategy()"
        >
          Analyze strategy
        </button>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Strategy score</b>
          <span>quant checklist</span>
        </div>

        <div
          id="strategyResult"
          class="result"
        >

          <div class="metric-grid">

            ${metric(
              "Robustness",
              "8.1/10"
            )}

            ${metric(
              "Complexity",
              "Low"
            )}

            ${metric(
              "Risk",
              "Moderate"
            )}

            ${metric(
              "Leakage",
              "None detected"
            )}

          </div>

          <div
            class="explain"
            style="margin-top:14px"
          >
            Before using real money, validate the strategy out-of-sample,
            with walk-forward testing, transaction costs and Monte Carlo stress tests.
          </div>

        </div>

      </div>

    </div>
  `;
}

function analyzeStrategy() {
  const result = el("strategyResult");

  if (!result) return;

  result.innerHTML = `
    <div class="metric-grid">

      ${metric(
        "Robustness",
        "8.4/10"
      )}

      ${metric(
        "Expected CAGR",
        "14.8%"
      )}

      ${metric(
        "Max DD",
        "-11.6%"
      )}

      ${metric(
        "Sharpe",
        "1.63"
      )}

    </div>

    <div
      class="explain"
      style="margin-top:14px"
    >
      <b>Quant interpretation:</b>
      The strategy has a coherent trend and risk overlay.
      The main danger is parameter overfitting.
      Next step is walk-forward validation and sensitivity analysis.
    </div>
  `;

  toast("Strategy analyzed");
}

function backtest() {
  return `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          Historical simulation
        </div>

        <h1>Backtesting</h1>

        <div class="sub">
          Test a strategy before exposing capital to it.
        </div>
      </div>

      <button
        class="btn primary"
        onclick="runBacktest()"
      >
        ▶ Run backtest
      </button>

    </div>

    <div class="card">

      <div class="input-grid">

        <div class="field">

          <label>
            Strategy
          </label>

          <select>
            <option>
              Momentum + volatility filter
            </option>

            <option>
              Mean reversion pairs
            </option>

            <option>
              Custom strategy
            </option>

          </select>

        </div>

        <div class="field">

          <label>
            Period
          </label>

          <select>
            <option>
              2018 — 2026
            </option>

            <option>
              2022 — 2026
            </option>

            <option>
              2025 — 2026
            </option>

          </select>

        </div>

        <div class="field">

          <label>
            Fees + slippage
          </label>

          <input value="0.08%" />

        </div>

      </div>

    </div>

    <div
      id="backtestResult"
      style="margin-top:13px"
    >

      <div class="grid metric-grid">

        ${metric("CAGR", "—")}
        ${metric("Sharpe", "—")}
        ${metric("Max DD", "—")}
        ${metric("Win rate", "—")}

      </div>

    </div>
  `;
}

function runBacktest() {
  const result = el("backtestResult");

  if (!result) return;

  const cagr =
    (4 + Math.random() * 16).toFixed(1);

  const sharpe =
    (1.1 + Math.random()).toFixed(2);

  const drawdown =
    (-8 - Math.random() * 8).toFixed(1);

  const winrate =
    (52 + Math.random() * 14).toFixed(1);

  result.innerHTML = `
    <div class="grid metric-grid">

      ${metric(
        "CAGR",
        cagr + "%"
      )}

      ${metric(
        "Sharpe",
        sharpe
      )}

      ${metric(
        "Max DD",
        drawdown + "%"
      )}

      ${metric(
        "Win rate",
        winrate + "%"
      )}

    </div>

    <div
      class="card"
      style="margin-top:13px"
    >

      <div class="explain">

        <b>Validation:</b>
        This is a demonstration backtest using generated data.
        Production mode must use real historical market data,
        transaction costs, spread and slippage.

      </div>

    </div>
  `;

  toast("Backtest complete");
}

function risk() {
  return `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          Risk management
        </div>

        <h1>Risk Engine</h1>

        <div class="sub">
          Position sizing and portfolio risk.
        </div>
      </div>

    </div>

    <div class="grid two">

      <div class="card">

        <div class="card-title">
          <b>Kelly position sizing</b>
          <span>fractional Kelly recommended</span>
        </div>

        <div class="input-grid">

          <div class="field">

            <label>
              Win probability %
            </label>

            <input
              id="win"
              value="55"
            />

          </div>

          <div class="field">

            <label>
              Average win %
            </label>

            <input
              id="aw"
              value="4"
            />

          </div>

          <div class="field">

            <label>
              Average loss %
            </label>

            <input
              id="al"
              value="2.5"
            />

          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calcKelly()"
        >
          Calculate
        </button>

        <div
          id="kelly"
          style="margin-top:12px"
        ></div>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Risk overview</b>
        </div>

        ${riskbar("Market beta", 72)}
        ${riskbar("Volatility", 43)}
        ${riskbar("Concentration", 61)}
        ${riskbar("Drawdown", 27)}
        ${riskbar("Liquidity", 88)}

      </div>

    </div>
  `;
}

function calcKelly() {
  const winEl = el("win");
  const awEl = el("aw");
  const alEl = el("al");
  const result = el("kelly");

  if (!winEl || !awEl || !alEl || !result) {
    return;
  }

  const win =
    (Number(winEl.value) || 0) / 100;

  const avgWin =
    (Number(awEl.value) || 0) / 100;

  const avgLoss =
    (Number(alEl.value) || 0) / 100;

  if (avgLoss <= 0) {
    result.innerHTML =
      `<div class="explain">Average loss must be greater than zero.</div>`;
    return;
  }

  const kelly =
    win -
    ((1 - win) * avgWin / avgLoss);

  const percentage =
    Math.max(0, kelly * 100);

  result.innerHTML = `
    <div class="hero-signal">

      <div class="big positive">
        ${percentage.toFixed(1)}%
      </div>

      <div class="sub">
        Full Kelly estimate.
        Real portfolios commonly use fractional Kelly.
      </div>

    </div>
  `;
}

function portfolio() {
  return `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          Capital allocation
        </div>

        <h1>Portfolio</h1>

        <div class="sub">
          Simulated portfolio exposure.
        </div>
      </div>

    </div>

    <div class="grid three">

      ${stat(
        "Equity",
        "$124,860",
        "+2.84%",
        "30D",
        true
      )}

      ${stat(
        "Cash",
        "$24,860",
        "19.9%",
        "allocation"
      )}

      ${stat(
        "Risk score",
        "32 / 100",
        "Moderate",
        "current"
      )}

    </div>

    <div
      class="card"
      style="margin-top:13px"
    >

      <div class="card-title">
        <b>Current exposure</b>
        <span>simulated</span>
      </div>

      ${ticker(
        "SPY",
        "Core equity",
        "BUY",
        "42%"
      )}

      ${ticker(
        "QQQ",
        "Technology",
        "BUY",
        "24%"
      )}

      ${ticker(
        "NVDA",
        "Semiconductor",
        "BUY",
        "12%"
      )}

      ${ticker(
        "AAPL",
        "Mega cap",
        "WATCH",
        "8%"
      )}

    </div>
  `;
}

function alerts() {
  return `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          Monitoring
        </div>

        <h1>Signals & Alerts</h1>

        <div class="sub">
          Model-generated market signals.
        </div>
      </div>

    </div>

    <div class="card">

      ${ticker(
        "NVDA",
        "Momentum",
        "BUY",
        "91%"
      )}

      ${ticker(
        "SPY",
        "Regime",
        "BUY",
        "78%"
      )}

      ${ticker(
        "BTC-USD",
        "Volatility",
        "SELL",
        "68%"
      )}

    </div>
  `;
}

function learn() {
  return `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          Education
        </div>

        <h1>Learn Mode</h1>

        <div class="sub">
          Understand the models before trusting them.
        </div>
      </div>

    </div>

    <div class="grid three">

      <div class="card">

        <h3>
          Sharpe ratio
        </h3>

        <p>
          Measures return relative to volatility.
          Higher is generally better, but it is not a magic quality score.
        </p>

      </div>

      <div class="card">

        <h3>
          Maximum drawdown
        </h3>

        <p>
          The largest peak-to-trough decline in an equity curve.
        </p>

      </div>

      <div class="card">

        <h3>
          Kelly criterion
        </h3>

        <p>
          A position-sizing framework based on estimated edge and payoff.
        </p>

      </div>

    </div>
  `;
}

function render() {
  const view = el("view");

  if (!view) {
    console.error(
      "QuantForge: #view element not found."
    );
    return;
  }

  const pages = {
    dashboard,
    markets,
    quant,
    strategies,
    backtest,
    risk,
    portfolio,
    alerts,
    learn
  };

  const page =
    pages[state.view] || dashboard;

  livePrices();

  view.innerHTML = page();

  nav();

  requestAnimationFrame(() => {

    if (state.view === "dashboard") {
      drawChart(
        "mainChart",
        state.prices
      );
    }

    if (state.view === "markets") {
      drawChart(
        "marketChart",
        state.prices
      );
    }

  });
}

function init() {
  console.log(
    "QuantForge initialized"
  );

  state.prices =
    seedPrices();

  render();

  setInterval(() => {

    livePrices();

    if (
      state.view === "dashboard" ||
      state.view === "markets"
    ) {
      const chartId =
        state.view === "dashboard"
          ? "mainChart"
          : "marketChart";

      drawChart(
        chartId,
        state.prices
      );
    }

  }, 2000);
}

window.addEventListener(
  "resize",
  () => {

    if (state.view === "dashboard") {
      drawChart(
        "mainChart",
        state.prices
      );
    }

    if (state.view === "markets") {
      drawChart(
        "marketChart",
        state.prices
      );
    }

  }
);

window.go = go;
window.toast = toast;
window.openModule = openModule;
window.analyzeStrategy = analyzeStrategy;
window.runBacktest = runBacktest;
window.calcKelly = calcKelly;

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    init
  );
} else {
  init();
}