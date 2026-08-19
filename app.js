/* =========================================================
   QUANTFORGE APP
   UI + QUANT TOOLS
   Requires:
   <script src="quant-tools.js"></script>
   <script src="app.js"></script>
   ========================================================= */

"use strict";

/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}

function el(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(Number(value))) {
    return "—";
  }

  return Number(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }
  );
}

function formatPercent(value, decimals = 2) {
  return (
    formatNumber(Number(value) * 100, decimals) +
    "%"
  );
}

function metric(label, value) {
  return `
    <div class="metric">
      <div class="metric-label">
        ${escapeHTML(label)}
      </div>

      <div class="metric-value">
        ${escapeHTML(value)}
      </div>
    </div>
  `;
}

function toast(message) {
  let node = document.querySelector(
    ".qf-toast"
  );

  if (!node) {
    node = document.createElement("div");

    node.className = "qf-toast";

    node.style.cssText = `
      position:fixed;
      left:50%;
      bottom:24px;
      transform:translateX(-50%);
      z-index:9999;
      padding:12px 16px;
      border-radius:12px;
      background:#111827;
      color:#fff;
      font-size:13px;
      box-shadow:0 10px 30px rgba(0,0,0,.25);
      max-width:calc(100vw - 30px);
      text-align:center;
    `;

    document.body.appendChild(node);
  }

  node.textContent = message;
  node.style.display = "block";

  clearTimeout(
    node._timer
  );

  node._timer = setTimeout(
    () => {
      node.style.display = "none";
    },
    2200
  );
}

function parseSeries(value) {
  return String(value)
    .split(/[,\s;]+/)
    .map(Number)
    .filter(Number.isFinite);
}

/* =========================================================
   MODULES
   ========================================================= */

const modules = [
  [
    "Statistical Arbitrage",
    "Pairs, spreads and Z-score analysis"
  ],

  [
    "Kelly Criterion",
    "Optimal position sizing"
  ],

  [
    "Black-Scholes",
    "Options pricing and Greeks"
  ],

  [
    "Monte Carlo",
    "Probabilistic market simulation"
  ],

  [
    "Engle-Granger",
    "Cointegration analysis"
  ],

  [
    "Markov Regime",
    "Market regime detection"
  ],

  [
    "Sentiment",
    "Market sentiment analysis"
  ],

  [
    "Multi-Factor",
    "Factor-based asset scoring"
  ],

  [
    "BAB",
    "Betting Against Beta"
  ],

  [
    "Asymmetric Bets",
    "Expected value and reward/risk"
  ],

  [
    "Correlation",
    "Asset correlation analysis"
  ],

  [
    "Insider Tracker",
    "Insider activity analysis"
  ]
];

/* =========================================================
   NAVIGATION
   ========================================================= */

function go(page) {

  setActiveNav(page || "dashboard");

  if (page === "quant") {
    renderQuantLab();
    return;
  }

  if (page === "markets") {
    renderMarkets();
    return;
  }

  if (page === "dashboard") {
    renderDashboard();
    return;
  }

  if (page === "risk") {
    renderRiskEngine();
    return;
  }

  if (page === "backtest") {
    renderBacktest();
    return;
  }

  if (page === "strategy") {
    renderStrategyLab();
    return;
  }

  renderDashboard();
}

/* =========================================================
   SIDEBAR NAVIGATION
   ========================================================= */

const navLinks = [
  ["dashboard", "◆", "Dashboard"],
  ["markets", "◎", "Markets"],
  ["quant", "∑", "Quant Lab"],
  ["strategy", "▤", "Strategy Lab"],
  ["backtest", "▦", "Backtest"],
  ["risk", "△", "Risk"]
];

function renderNav() {

  const nav =
    $("nav");

  if (!nav) return;

  nav.innerHTML = `
    <div class="nav-section">
      Navigate
    </div>

    ${navLinks.map(
      ([page, icon, label]) => `
        <button
          class="nav-item"
          data-page="${page}"
          onclick="go('${page}')"
        >
          <span class="nav-icon">${icon}</span>
          <span>${escapeHTML(label)}</span>
        </button>
      `
    ).join("")}
  `;
}

function setActiveNav(page) {

  const nav =
    $("nav");

  if (!nav) return;

  nav.querySelectorAll(".nav-item").forEach(
    (item) => {
      item.classList.toggle(
        "active",
        item.dataset.page === page
      );
    }
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  const view =
    $("view");

  if (!view) return;

  view.innerHTML = `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          QUANTFORGE
        </div>

        <h1>
          Quant Dashboard
        </h1>

        <div class="sub">
          Research, risk and systematic strategy engine.
        </div>
      </div>

      <div class="actions">
        <button
          class="btn primary"
          onclick="renderQuantLab()"
        >
          Quant Lab
        </button>

        <button
          class="btn"
          onclick="renderRiskEngine()"
        >
          Risk
        </button>
      </div>

    </div>

    <div class="grid stats">

      <div class="card">
        ${metric(
          "Market regime",
          "NEUTRAL"
        )}
      </div>

      <div class="card">
        ${metric(
          "Portfolio volatility",
          "12.4%"
        )}
      </div>

      <div class="card">
        ${metric(
          "Sharpe ratio",
          "1.42"
        )}
      </div>

      <div class="card">
        ${metric(
          "Drawdown",
          "-6.8%"
        )}
      </div>

    </div>

    <div class="grid two">

      <div class="card">

        <div class="card-title">
          <b>System status</b>
          <span>LIVE ENGINE</span>
        </div>

        <div class="explain">
          QuantTools engine loaded:
          ${
            window.QuantTools
              ? "YES"
              : "NO"
          }
          <br>
          Live market data:
          ${
            window.MarketData && MarketData.hasApiKey()
              ? "CONNECTED"
              : "NO API KEY — set one in Markets"
          }
        </div>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Quick actions</b>
        </div>

        <div class="actions">

          <button
            class="btn primary"
            onclick="go('markets')"
          >
            Markets
          </button>

          <button
            class="btn"
            onclick="kellyTool()"
          >
            Kelly
          </button>

          <button
            class="btn"
            onclick="blackScholesTool()"
          >
            Options
          </button>

          <button
            class="btn"
            onclick="monteCarloTool()"
          >
            Monte Carlo
          </button>

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   QUANT LAB
   ========================================================= */

function renderQuantLab() {

  const view =
    $("view");

  if (!view) return;

  view.innerHTML = `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          RESEARCH
        </div>

        <h1>
          Quant Lab
        </h1>

        <div class="sub">
          Quantitative models and research tools.
        </div>
      </div>

      <div class="actions">
        <button
          class="btn"
          onclick="renderDashboard()"
        >
          Dashboard
        </button>
      </div>

    </div>

    <div class="grid two">

      ${modules.map(
        (module, index) => `
          <div
            class="card module"
            onclick="openModule(${index})"
            style="cursor:pointer"
          >

            <div class="card-title">
              <b>
                ${escapeHTML(module[0])}
              </b>

              <span>
                TOOL
              </span>
            </div>

            <div class="explain">
              ${escapeHTML(module[1])}
            </div>

            <div
              style="
                margin-top:14px;
                opacity:.65;
                font-size:12px;
              "
            >
              Open analysis →
            </div>

          </div>
        `
      ).join("")}

    </div>
  `;
}

/* =========================================================
   OPEN MODULE
   ========================================================= */

function openModule(index) {

  const toolMap = {

    0: statisticalArbitrageTool,

    1: kellyTool,

    2: blackScholesTool,

    3: monteCarloTool,

    4: engleGrangerTool,

    5: markovTool,

    6: sentimentTool,

    7: factorTool,

    8: babTool,

    9: asymmetricTool,

    10: correlationTool,

    11: insiderTool
  };

  if (
    toolMap[index]
  ) {
    toolMap[index]();
    return;
  }

  toast(
    "Tool unavailable."
  );
}

/* =========================================================
   TOOL SHELL
   ========================================================= */

function toolShell(
  title,
  description,
  content
) {

  const view =
    $("view");

  if (!view) return;

  view.innerHTML = `
    <div class="page-head">

      <div>
        <div class="eyebrow">
          QUANT LAB
        </div>

        <h1>
          ${escapeHTML(title)}
        </h1>

        <div class="sub">
          ${escapeHTML(description)}
        </div>
      </div>

      <div class="actions">

        <button
          class="btn"
          onclick="renderQuantLab()"
        >
          ← Quant Lab
        </button>

      </div>

    </div>

    <div class="grid two">
      ${content}
    </div>
  `;
}

/* =========================================================
   KELLY
   ========================================================= */

function kellyTool() {

  toolShell(
    "Kelly Criterion",
    "Position sizing based on probability and payoff.",
    `
      <div class="card">

        <div class="card-title">
          <b>Strategy inputs</b>
          <span>Kelly sizing</span>
        </div>

        <div class="input-grid">

          <div class="field">
            <label>
              Win probability %
            </label>

            <input
              id="kt-win"
              type="number"
              value="55"
              step="0.1"
            >
          </div>

          <div class="field">
            <label>
              Average win %
            </label>

            <input
              id="kt-win-size"
              type="number"
              value="4"
              step="0.1"
            >
          </div>

          <div class="field">
            <label>
              Average loss %
            </label>

            <input
              id="kt-loss-size"
              type="number"
              value="2.5"
              step="0.1"
            >
          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateKellyTool()"
        >
          Calculate
        </button>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Result</b>
        </div>

        <div id="kt-result">
          Enter your strategy statistics.
        </div>

      </div>
    `
  );
}

function calculateKellyTool() {

  const result =
    QuantTools.kelly({

      winRate:
        Number(
          $("kt-win").value
        ) / 100,

      averageWin:
        Number(
          $("kt-win-size").value
        ) / 100,

      averageLoss:
        Number(
          $("kt-loss-size").value
        ) / 100

    });

  if (result.error) {

    $("kt-result").innerHTML =
      `<div class="explain">
        ${escapeHTML(result.error)}
      </div>`;

    return;
  }

  $("kt-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Full Kelly",
        formatPercent(
          result.fullKelly
        )
      )}

      ${metric(
        "Half Kelly",
        formatPercent(
          result.halfKelly
        )
      )}

      ${metric(
        "Quarter Kelly",
        formatPercent(
          result.quarterKelly
        )
      )}

      ${metric(
        "Payoff ratio",
        formatNumber(
          result.payoffRatio,
          2
        ) + "x"
      )}

    </div>

    <div
      class="explain"
      style="margin-top:14px"
    >
      Fractional Kelly reduces sensitivity to estimation error.
      Full Kelly can produce very aggressive allocations.
    </div>
  `;
}

/* =========================================================
   BLACK-SCHOLES
   ========================================================= */

function blackScholesTool() {

  toolShell(
    "Black-Scholes",
    "Options pricing and Greeks.",
    `
      <div class="card">

        <div class="card-title">
          <b>Option parameters</b>
        </div>

        <div class="input-grid">

          <div class="field">
            <label>
              Underlying price
            </label>

            <input
              id="bs-spot"
              type="number"
              value="100"
            >
          </div>

          <div class="field">
            <label>
              Strike
            </label>

            <input
              id="bs-strike"
              type="number"
              value="100"
            >
          </div>

          <div class="field">
            <label>
              Risk-free rate %
            </label>

            <input
              id="bs-rate"
              type="number"
              value="4"
            >
          </div>

          <div class="field">
            <label>
              Volatility %
            </label>

            <input
              id="bs-vol"
              type="number"
              value="25"
            >
          </div>

          <div class="field">
            <label>
              Time to expiry
            </label>

            <input
              id="bs-time"
              type="number"
              value="1"
            >
          </div>

          <div class="field">

            <label>
              Type
            </label>

            <select id="bs-type">

              <option value="call">
                Call
              </option>

              <option value="put">
                Put
              </option>

            </select>

          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateBlackScholes()"
        >
          Calculate
        </button>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Greeks</b>
        </div>

        <div id="bs-result">
          Enter parameters.
        </div>

      </div>
    `
  );
}

function calculateBlackScholes() {

  const result =
    QuantTools.blackScholes({

      spot:
        Number(
          $("bs-spot").value
        ),

      strike:
        Number(
          $("bs-strike").value
        ),

      rate:
        Number(
          $("bs-rate").value
        ) / 100,

      volatility:
        Number(
          $("bs-vol").value
        ) / 100,

      time:
        Number(
          $("bs-time").value
        ),

      type:
        $("bs-type").value
    });

  if (result.error) {

    $("bs-result").innerHTML =
      `<div class="explain">
        ${escapeHTML(result.error)}
      </div>`;

    return;
  }

  $("bs-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Option price",
        formatNumber(
          result.price,
          4
        )
      )}

      ${metric(
        "Delta",
        formatNumber(
          result.delta,
          4
        )
      )}

      ${metric(
        "Gamma",
        formatNumber(
          result.gamma,
          6
        )
      )}

      ${metric(
        "Vega",
        formatNumber(
          result.vega,
          4
        )
      )}

      ${metric(
        "Theta",
        formatNumber(
          result.theta,
          4
        )
      )}

    </div>
  `;
}

/* =========================================================
   MONTE CARLO
   ========================================================= */

function monteCarloTool() {

  toolShell(
    "Monte Carlo",
    "Simulate possible future price paths.",
    `
      <div class="card">

        <div class="card-title">
          <b>Simulation parameters</b>
        </div>

        <div class="input-grid">

          <div class="field">
            <label>
              Initial price
            </label>

            <input
              id="mc-price"
              type="number"
              value="100"
            >
          </div>

          <div class="field">
            <label>
              Expected return %
            </label>

            <input
              id="mc-drift"
              type="number"
              value="8"
            >
          </div>

          <div class="field">
            <label>
              Volatility %
            </label>

            <input
              id="mc-vol"
              type="number"
              value="20"
            >
          </div>

          <div class="field">
            <label>
              Years
            </label>

            <input
              id="mc-years"
              type="number"
              value="1"
            >
          </div>

          <div class="field">
            <label>
              Simulations
            </label>

            <input
              id="mc-sim"
              type="number"
              value="5000"
              min="100"
              max="50000"
            >
          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateMonteCarlo()"
        >
          Run simulation
        </button>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Simulation result</b>
        </div>

        <div id="mc-result">
          No simulation executed.
        </div>

      </div>
    `
  );
}

function calculateMonteCarlo() {

  const result =
    QuantTools.monteCarlo({

      initialPrice:
        Number(
          $("mc-price").value
        ),

      drift:
        Number(
          $("mc-drift").value
        ) / 100,

      volatility:
        Number(
          $("mc-vol").value
        ) / 100,

      years:
        Number(
          $("mc-years").value
        ),

      simulations:
        Number(
          $("mc-sim").value
        )

    });

  $("mc-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Expected price",
        formatNumber(
          result.expectedPrice
        )
      )}

      ${metric(
        "Probability of profit",
        formatPercent(
          result.probabilityOfProfit
        )
      )}

      ${metric(
        "Simulations",
        result.simulations.toLocaleString()
      )}

    </div>

    <div
      class="explain"
      style="margin-top:14px"
    >
      Monte Carlo estimates a distribution under the
      selected assumptions. It is not a prediction engine.
    </div>
  `;
}

/* =========================================================
   STATISTICAL ARBITRAGE
   ========================================================= */

function statisticalArbitrageTool() {

  toolShell(
    "Statistical Arbitrage",
    "Pairs trading and spread analysis.",
    `
      <div class="card">

        <div class="field">

          <label>
            Series A
          </label>

          <textarea id="sa-a">100,101,102,101,103,105,104,106,107,108</textarea>

        </div>

        <div
          class="field"
          style="margin-top:10px"
        >

          <label>
            Series B
          </label>

          <textarea id="sa-b">50,50.5,51,50.8,51.5,52,52.1,52.5,53,53.2</textarea>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateStatArb()"
        >
          Analyze
        </button>

      </div>

      <div class="card">

        <div
          class="card-title"
        >
          <b>Spread analysis</b>
        </div>

        <div id="sa-result">
          No analysis.
        </div>

      </div>
    `
  );
}

function calculateStatArb() {

  const result =
    QuantTools.statisticalArbitrage({

      seriesA:
        parseSeries(
          $("sa-a").value
        ),

      seriesB:
        parseSeries(
          $("sa-b").value
        )

    });

  if (result.error) {

    $("sa-result").innerHTML =
      `<div class="explain">
        ${escapeHTML(result.error)}
      </div>`;

    return;
  }

  $("sa-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Hedge ratio",
        formatNumber(
          result.hedgeRatio,
          4
        )
      )}

      ${metric(
        "Spread mean",
        formatNumber(
          result.mean,
          4
        )
      )}

      ${metric(
        "Spread σ",
        formatNumber(
          result.standardDeviation,
          4
        )
      )}

      ${metric(
        "Z-score",
        formatNumber(
          result.zScore,
          3
        )
      )}

      ${metric(
        "Signal",
        result.signal
      )}

    </div>
  `;
}

/* =========================================================
   ENGLE-GRANGER
   ========================================================= */

function engleGrangerTool() {

  toolShell(
    "Engle-Granger",
    "Regression-based relationship analysis.",
    `
      <div class="card">

        <div class="field">

          <label>
            Series A
          </label>

          <textarea id="eg-a">100,101,102,103,104,106,107,108,110,111</textarea>

        </div>

        <div
          class="field"
          style="margin-top:10px"
        >

          <label>
            Series B
          </label>

          <textarea id="eg-b">50,50.5,51,51.5,52,53,53.5,54,55,55.5</textarea>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateEG()"
        >
          Run analysis
        </button>

      </div>

      <div class="card">

        <div id="eg-result">
          No result.
        </div>

      </div>
    `
  );
}

function calculateEG() {

  const result =
    QuantTools.engleGranger(

      parseSeries(
        $("eg-a").value
      ),

      parseSeries(
        $("eg-b").value
      )

    );

  if (result.error) {

    $("eg-result").innerHTML =
      `<div class="explain">
        ${escapeHTML(result.error)}
      </div>`;

    return;
  }

  $("eg-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Hedge ratio",
        formatNumber(
          result.hedgeRatio,
          4
        )
      )}

      ${metric(
        "R²",
        formatNumber(
          result.rSquared,
          4
        )
      )}

      ${metric(
        "Residual σ",
        formatNumber(
          result.residualStd,
          4
        )
      )}

    </div>

    <div
      class="explain"
      style="margin-top:14px"
    >
      ${escapeHTML(
        result.interpretation
      )}
    </div>
  `;
}

/* =========================================================
   MARKOV REGIME
   ========================================================= */

function markovTool() {

  toolShell(
    "Markov Regime",
    "Classify the current market regime.",
    `
      <div class="card">

        <div class="field">

          <label>
            Returns %
          </label>

          <textarea id="mk-data">1.2,0.8,-0.3,1.4,0.9,1.1,-0.2,-1.1,-0.8,0.3,1.5,0.7</textarea>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateMarkov()"
        >
          Detect regime
        </button>

      </div>

      <div class="card">

        <div id="mk-result">
          No regime detected.
        </div>

      </div>
    `
  );
}

function calculateMarkov() {

  const returns =
    parseSeries(
      $("mk-data").value
    ).map(
      value =>
        value / 100
    );

  const result =
    QuantTools.markovRegime(
      returns
    );

  if (result.error) {

    $("mk-result").innerHTML =
      `<div class="explain">
        ${escapeHTML(result.error)}
      </div>`;

    return;
  }

  $("mk-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Regime",
        result.regime
      )}

      ${metric(
        "Bull probability",
        formatPercent(
          result.probabilities.bull
        )
      )}

      ${metric(
        "Neutral probability",
        formatPercent(
          result.probabilities.neutral
        )
      )}

      ${metric(
        "Bear probability",
        formatPercent(
          result.probabilities.bear
        )
      )}

    </div>
  `;
}

/* =========================================================
   SENTIMENT
   ========================================================= */

function sentimentTool() {

  toolShell(
    "Sentiment",
    "Simple sentiment scoring interface.",
    `
      <div class="card">

        <div class="field">

          <label>
            Sentiment score
            (-1 to +1)
          </label>

          <input
            id="sentiment-score"
            type="number"
            value="0.65"
            min="-1"
            max="1"
            step="0.05"
          >

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateSentiment()"
        >
          Analyze
        </button>

      </div>

      <div class="card">

        <div id="sentiment-result">
          Enter sentiment.
        </div>

      </div>
    `
  );
}

function calculateSentiment() {

  const score =
    Number(
      $("sentiment-score").value
    );

  let signal =
    "NEUTRAL";

  if (score > 0.3) {
    signal =
      "BULLISH";
  }

  if (score < -0.3) {
    signal =
      "BEARISH";
  }

  $("sentiment-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Score",
        formatNumber(
          score,
          2
        )
      )}

      ${metric(
        "Signal",
        signal
      )}

    </div>
  `;
}

/* =========================================================
   MULTI FACTOR
   ========================================================= */

function factorTool() {

  toolShell(
    "Multi-Factor Model",
    "Combine factor scores into a ranking score.",
    `
      <div class="card">

        <div class="input-grid">

          <div class="field">
            <label>Momentum</label>
            <input
              id="factor-momentum"
              type="number"
              value="0.5"
              min="-1"
              max="1"
              step="0.1"
            >
          </div>

          <div class="field">
            <label>Value</label>
            <input
              id="factor-value"
              type="number"
              value="0.4"
              min="-1"
              max="1"
              step="0.1"
            >
          </div>

          <div class="field">
            <label>Quality</label>
            <input
              id="factor-quality"
              type="number"
              value="0.6"
              min="-1"
              max="1"
              step="0.1"
            >
          </div>

          <div class="field">
            <label>Volatility</label>
            <input
              id="factor-volatility"
              type="number"
              value="0.2"
              min="-1"
              max="1"
              step="0.1"
            >
          </div>

          <div class="field">
            <label>Size</label>
            <input
              id="factor-size"
              type="number"
              value="0.1"
              min="-1"
              max="1"
              step="0.1"
            >
          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateFactors()"
        >
          Calculate
        </button>

      </div>

      <div class="card">

        <div id="factor-result">
          No score.
        </div>

      </div>
    `
  );
}

function calculateFactors() {

  const result =
    QuantTools.factorScore({

      momentum:
        Number(
          $("factor-momentum").value
        ),

      value:
        Number(
          $("factor-value").value
        ),

      quality:
        Number(
          $("factor-quality").value
        ),

      volatility:
        Number(
          $("factor-volatility").value
        ),

      size:
        Number(
          $("factor-size").value
        )
    });

  $("factor-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Raw score",
        formatNumber(
          result.score,
          3
        )
      )}

      ${metric(
        "Normalized",
        formatNumber(
          result.normalized,
          1
        ) + "/100"
      )}

    </div>
  `;
}

/* =========================================================
   BAB
   ========================================================= */

function babTool() {

  toolShell(
    "BAB",
    "Betting Against Beta framework.",
    `
      <div class="card">

        <div class="input-grid">

          <div class="field">

            <label>
              Low-beta return %
            </label>

            <input
              id="bab-low"
              type="number"
              value="9"
            >

          </div>

          <div class="field">

            <label>
              High-beta return %
            </label>

            <input
              id="bab-high"
              type="number"
              value="7"
            >

          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateBAB()"
        >
          Compare
        </button>

      </div>

      <div class="card">

        <div id="bab-result">
          No result.
        </div>

      </div>
    `
  );
}

function calculateBAB() {

  const low =
    Number(
      $("bab-low").value
    );

  const high =
    Number(
      $("bab-high").value
    );

  const spread =
    low - high;

  $("bab-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "BAB spread",
        formatNumber(
          spread,
          2
        ) + "%"
      )}

      ${metric(
        "Signal",
        spread > 0
          ? "LOW BETA FAVORED"
          : "HIGH BETA FAVORED"
      )}

    </div>
  `;
}

/* =========================================================
   ASYMMETRIC BETS
   ========================================================= */

function asymmetricTool() {

  toolShell(
    "Asymmetric Bets",
    "Expected value and reward/risk analysis.",
    `
      <div class="card">

        <div class="input-grid">

          <div class="field">

            <label>
              Win probability %
            </label>

            <input
              id="ab-p"
              type="number"
              value="55"
            >

          </div>

          <div class="field">

            <label>
              Upside %
            </label>

            <input
              id="ab-up"
              type="number"
              value="10"
            >

          </div>

          <div class="field">

            <label>
              Downside %
            </label>

            <input
              id="ab-down"
              type="number"
              value="5"
            >

          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateAsymmetric()"
        >
          Calculate
        </button>

      </div>

      <div class="card">

        <div id="ab-result">
          No result.
        </div>

      </div>
    `
  );
}

function calculateAsymmetric() {

  const result =
    QuantTools.asymmetricBet({

      winProbability:
        Number(
          $("ab-p").value
        ) / 100,

      upside:
        Number(
          $("ab-up").value
        ),

      downside:
        Number(
          $("ab-down").value
        )
    });

  $("ab-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Expected value",
        formatNumber(
          result.expectedValue,
          2
        ) + "%"
      )}

      ${metric(
        "Risk / reward",
        formatNumber(
          result.riskReward,
          2
        ) + "x"
      )}

      ${metric(
        "Edge",
        result.edge
      )}

    </div>
  `;
}

/* =========================================================
   CORRELATION
   ========================================================= */

function correlationTool() {

  toolShell(
    "Correlation",
    "Measure the relationship between two assets.",
    `
      <div class="card">

        <div class="field">

          <label>
            Asset A
          </label>

          <textarea id="cor-a">1,2,3,4,5,6,7,8,9,10</textarea>

        </div>

        <div class="field">

          <label>
            Asset B
          </label>

          <textarea id="cor-b">2,4,5,7,8,11,12,15,16,19</textarea>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateCorrelation()"
        >
          Calculate
        </button>

      </div>

      <div class="card">

        <div id="cor-result">
          No result.
        </div>

      </div>
    `
  );
}

function calculateCorrelation() {

  const a =
    parseSeries(
      $("cor-a").value
    );

  const b =
    parseSeries(
      $("cor-b").value
    );

  const result =
    QuantTools.correlation(
      a,
      b
    );

  $("cor-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Correlation",
        formatNumber(
          result,
          4
        )
      )}

      ${metric(
        "Relationship",
        result > 0.7
          ? "STRONG POSITIVE"
          : result < -0.7
            ? "STRONG NEGATIVE"
            : "WEAK / MODERATE"
      )}

    </div>
  `;
}

/* =========================================================
   INSIDER
   ========================================================= */

function insiderTool() {

  toolShell(
    "Insider Tracker",
    "Convert insider activity into a simple signal.",
    `
      <div class="card">

        <div class="input-grid">

          <div class="field">

            <label>
              Insider buys
            </label>

            <input
              id="ins-buy"
              type="number"
              value="8"
            >

          </div>

          <div class="field">

            <label>
              Insider sells
            </label>

            <input
              id="ins-sell"
              type="number"
              value="2"
            >

          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateInsider()"
        >
          Analyze
        </button>

      </div>

      <div class="card">

        <div id="ins-result">
          No result.
        </div>

      </div>
    `
  );
}

function calculateInsider() {

  const buys =
    Number(
      $("ins-buy").value
    );

  const sells =
    Number(
      $("ins-sell").value
    );

  const total =
    buys + sells;

  const score =
    total === 0
      ? 0
      : (buys - sells) /
        total;

  let signal =
    "NEUTRAL";

  if (score > 0.25) {
    signal =
      "BULLISH";
  }

  if (score < -0.25) {
    signal =
      "BEARISH";
  }

  $("ins-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Insider score",
        formatNumber(
          score,
          2
        )
      )}

      ${metric(
        "Signal",
        signal
      )}

    </div>
  `;
}

/* =========================================================
   RISK ENGINE
   ========================================================= */

function renderRiskEngine() {

  const view =
    $("view");

  if (!view) return;

  view.innerHTML = `

    <div class="page-head">

      <div>

        <div class="eyebrow">
          PORTFOLIO
        </div>

        <h1>
          Risk Engine
        </h1>

        <div class="sub">
          Volatility-based position sizing.
        </div>

      </div>

      <div class="actions">

        <button
          class="btn"
          onclick="renderDashboard()"
        >
          Dashboard
        </button>

      </div>

    </div>

    <div class="grid two">

      <div class="card">

        <div class="input-grid">

          <div class="field">

            <label>
              Portfolio value
            </label>

            <input
              id="risk-portfolio"
              type="number"
              value="100000"
            >

          </div>

          <div class="field">

            <label>
              Target volatility %
            </label>

            <input
              id="risk-target"
              type="number"
              value="10"
            >

          </div>

          <div class="field">

            <label>
              Asset volatility %
            </label>

            <input
              id="risk-asset"
              type="number"
              value="20"
            >

          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="calculateRisk()"
        >
          Calculate sizing
        </button>

      </div>

      <div class="card">

        <div id="risk-result">
          Enter portfolio parameters.
        </div>

      </div>

    </div>
  `;
}

function calculateRisk() {

  const result =
    QuantTools.volatilitySizing({

      portfolioValue:
        Number(
          $("risk-portfolio").value
        ),

      targetVolatility:
        Number(
          $("risk-target").value
        ) / 100,

      assetVolatility:
        Number(
          $("risk-asset").value
        ) / 100
    });

  if (result.error) {

    $("risk-result").innerHTML =
      `<div class="explain">
        ${escapeHTML(result.error)}
      </div>`;

    return;
  }

  $("risk-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Allocation",
        formatPercent(
          result.allocation
        )
      )}

      ${metric(
        "Position value",
        formatNumber(
          result.positionValue,
          2
        )
      )}

    </div>
  `;
}

/* =========================================================
   STRATEGY LAB
   ========================================================= */

function renderStrategyLab() {

  const view =
    $("view");

  if (!view) return;

  view.innerHTML = `

    <div class="page-head">

      <div>

        <div class="eyebrow">
          STRATEGY
        </div>

        <h1>
          Strategy Lab
        </h1>

        <div class="sub">
          Build and evaluate quantitative ideas.
        </div>

      </div>

      <div class="actions">

        <button
          class="btn"
          onclick="renderQuantLab()"
        >
          Quant Lab
        </button>

      </div>

    </div>

    <div class="grid two">

      <div class="card">

        <div class="card-title">
          <b>Quick strategy</b>
        </div>

        <div class="explain">
          Use the backtesting engine to evaluate
          a moving-average strategy on a price series.
        </div>

        <button
          class="btn primary"
          style="margin-top:14px"
          onclick="renderBacktest()"
        >
          Open Backtester
        </button>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Research tools</b>
        </div>

        <div class="explain">
          Statistical arbitrage, Kelly sizing,
          options pricing and regime analysis
          are available in Quant Lab.
        </div>

        <button
          class="btn"
          style="margin-top:14px"
          onclick="renderQuantLab()"
        >
          Open Quant Lab
        </button>

      </div>

    </div>
  `;
}

/* =========================================================
   MARKETS (LIVE DATA)
   ========================================================= */

let lastLoadedSeries = null;
let lastLoadedSymbol = null;

function sparklineSVG(closes) {

  if (
    !closes ||
    closes.length < 2
  ) {
    return "";
  }

  const width = 560;
  const height = 120;
  const padding = 6;

  const min =
    Math.min(...closes);

  const max =
    Math.max(...closes);

  const range =
    max - min || 1;

  const stepX =
    (width - padding * 2) /
    (closes.length - 1);

  const points =
    closes.map(
      (value, i) => {

        const x =
          padding +
          i * stepX;

        const y =
          height -
          padding -
          (
            (value - min) /
            range
          ) *
            (height - padding * 2);

        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }
    ).join(" ");

  const rising =
    closes[closes.length - 1] >=
    closes[0];

  const color =
    rising ? "#3ddc97" : "#ff6b6b";

  return `
    <svg
      viewBox="0 0 ${width} ${height}"
      width="100%"
      height="${height}"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke="${color}"
        stroke-width="2"
        points="${points}"
      />
    </svg>
  `;
}

function renderMarkets() {

  const view =
    $("view");

  if (!view) return;

  const savedKey =
    window.MarketData
      ? MarketData.getApiKey()
      : "";

  view.innerHTML = `

    <div class="page-head">

      <div>
        <div class="eyebrow">
          LIVE DATA
        </div>

        <h1>
          Markets
        </h1>

        <div class="sub">
          Real quotes and price history, pulled straight from
          the market. New here? A "quote" is just the current
          price of something you could buy or sell right now.
        </div>
      </div>

    </div>

    <div class="grid two">

      <div class="card">

        <div class="card-title">
          <b>API key</b>
          <span>Alpha Vantage</span>
        </div>

        <div class="explain">
          QuantForge has no server of its own, so live prices
          come directly from
          <a
            href="https://www.alphavantage.co/support/#api-key"
            target="_blank"
            rel="noopener"
            style="color:#9cb0cc"
          >Alpha Vantage</a>, using a free API key you create
          yourself. The key is saved only in this browser
          (localStorage) — it is never sent anywhere except
          directly to Alpha Vantage.
        </div>

        <div
          class="field"
          style="margin-top:12px"
        >
          <label>
            Your API key
          </label>

          <input
            id="mk-apikey"
            type="text"
            placeholder="e.g. ABCD1234EFGH5678"
            value="${escapeHTML(savedKey)}"
          >
        </div>

        <div class="actions" style="margin-top:10px">

          <button
            class="btn primary"
            onclick="saveMarketApiKey()"
          >
            Save key
          </button>

          <button
            class="btn"
            onclick="clearMarketApiKey()"
          >
            Clear
          </button>

        </div>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Find a symbol</b>
          <span>Search</span>
        </div>

        <div class="explain">
          Not sure of the ticker? Type a company name
          (e.g. "Apple" or "Bitcoin") and pick a match.
        </div>

        <div
          class="field"
          style="margin-top:12px"
        >
          <label>
            Company or ticker
          </label>

          <input
            id="mk-search"
            type="text"
            placeholder="e.g. Apple, Tesla, MSFT, BTC"
          >
        </div>

        <button
          class="btn primary"
          style="margin-top:10px"
          onclick="searchMarketSymbol()"
        >
          Search
        </button>

        <div
          id="mk-search-results"
          style="margin-top:12px"
        ></div>

      </div>

    </div>

    <div
      class="grid two"
      style="margin-top:16px"
    >

      <div class="card" style="grid-column: 1 / -1">

        <div class="card-title">
          <b>Quote</b>
          <span id="mk-quote-symbol">—</span>
        </div>

        <div id="mk-quote-result">
          Search for a symbol above, or type one directly
          and press "Load" below.
        </div>

        <div class="input-grid" style="margin-top:12px">

          <div class="field">
            <label>
              Ticker symbol
            </label>

            <input
              id="mk-symbol"
              type="text"
              placeholder="e.g. AAPL"
            >
          </div>

        </div>

        <div class="actions" style="margin-top:10px">

          <button
            class="btn primary"
            onclick="loadMarketQuote()"
          >
            Load quote + history
          </button>

          <button
            class="btn"
            id="mk-use-backtest"
            onclick="sendSeriesToBacktest()"
            disabled
          >
            Use in Backtester →
          </button>

        </div>

        <div
          id="mk-chart"
          style="margin-top:16px"
        ></div>

      </div>

    </div>
  `;
}

function saveMarketApiKey() {

  const key =
    $("mk-apikey").value;

  if (!key.trim()) {
    toast("Enter a key first.");
    return;
  }

  MarketData.setApiKey(key);

  toast("API key saved in this browser.");
}

function clearMarketApiKey() {

  MarketData.clearApiKey();

  $("mk-apikey").value = "";

  toast("API key cleared.");
}

async function searchMarketSymbol() {

  const query =
    $("mk-search").value;

  const results =
    $("mk-search-results");

  if (!query.trim()) {
    toast("Type something to search.");
    return;
  }

  results.innerHTML =
    `<div class="explain">Searching…</div>`;

  try {

    const matches =
      await MarketData.searchSymbol(
        query
      );

    if (matches.length === 0) {
      results.innerHTML =
        `<div class="explain">No matches found.</div>`;
      return;
    }

    results.innerHTML =
      matches.slice(0, 8).map(
        (m) => `
          <div
            class="module"
            style="padding:10px;margin-bottom:8px;cursor:pointer"
            onclick="loadMarketQuote('${m.symbol.replace(/'/g, "")}')"
          >
            <b>${escapeHTML(m.symbol)}</b>
            — ${escapeHTML(m.name)}
            <div style="opacity:.6;font-size:12px;margin-top:4px">
              ${escapeHTML(m.region)} · ${escapeHTML(m.currency)}
            </div>
          </div>
        `
      ).join("");

  } catch (err) {

    results.innerHTML =
      `<div class="explain">${escapeHTML(err.message)}</div>`;
  }
}

async function loadMarketQuote(symbolArg) {

  const symbolInput =
    $("mk-symbol");

  const symbol =
    (symbolArg || symbolInput.value || "")
      .trim()
      .toUpperCase();

  if (!symbol) {
    toast("Enter a ticker symbol.");
    return;
  }

  symbolInput.value = symbol;

  $("mk-quote-symbol").textContent =
    symbol;

  $("mk-quote-result").innerHTML =
    `<div class="explain">Loading live quote…</div>`;

  $("mk-chart").innerHTML = "";

  $("mk-use-backtest").disabled = true;

  try {

    const quote =
      await MarketData.getQuote(
        symbol
      );

    const changeColor =
      quote.change >= 0
        ? "#3ddc97"
        : "#ff6b6b";

    $("mk-quote-result").innerHTML = `

      <div class="metric-grid">

        ${metric(
          "Price",
          formatNumber(quote.price, 2)
        )}

        ${metric(
          "Change",
          (
            quote.change >= 0
              ? "+"
              : ""
          ) +
            formatNumber(quote.change, 2) +
            " (" +
            formatNumber(quote.changePercent, 2) +
            "%)"
        )}

        ${metric(
          "Previous close",
          formatNumber(quote.previousClose, 2)
        )}

        ${metric(
          "Day range",
          formatNumber(quote.low, 2) +
            " – " +
            formatNumber(quote.high, 2)
        )}

        ${metric(
          "Volume",
          formatNumber(quote.volume, 0)
        )}

        ${metric(
          "As of",
          quote.latestTradingDay || "—"
        )}

      </div>

      <div
        class="explain"
        style="margin-top:10px;color:${changeColor}"
      >
        ${
          quote.change >= 0
            ? "Trading above yesterday's close."
            : "Trading below yesterday's close."
        }
      </div>
    `;

    $("mk-chart").innerHTML =
      `<div class="explain" style="margin-bottom:8px">Loading price history…</div>`;

    const history =
      await MarketData.getDailySeries(
        symbol,
        "compact"
      );

    const closes =
      history.map(
        (day) => day.close
      );

    lastLoadedSeries = closes;
    lastLoadedSymbol = symbol;

    $("mk-chart").innerHTML = `
      <div class="explain" style="margin-bottom:6px">
        Last ${closes.length} trading days (closing price)
      </div>
      ${sparklineSVG(closes)}
    `;

    $("mk-use-backtest").disabled = false;

  } catch (err) {

    $("mk-quote-result").innerHTML =
      `<div class="explain">${escapeHTML(err.message)}</div>`;

    $("mk-chart").innerHTML = "";
  }
}

function sendSeriesToBacktest() {

  if (
    !lastLoadedSeries ||
    lastLoadedSeries.length < 10
  ) {
    toast("Load a symbol with enough history first.");
    return;
  }

  go("backtest");

  const textarea =
    $("bt-prices");

  if (textarea) {
    textarea.value =
      lastLoadedSeries
        .map((v) => v.toFixed(2))
        .join(",");
  }

  toast(
    "Loaded " +
      lastLoadedSymbol +
      " price history into the Backtester."
  );
}

/* =========================================================
   BACKTEST
   ========================================================= */

function renderBacktest() {

  const view =
    $("view");

  if (!view) return;

  view.innerHTML = `

    <div class="page-head">

      <div>

        <div class="eyebrow">
          RESEARCH
        </div>

        <h1>
          Backtesting
        </h1>

        <div class="sub">
          Moving-average strategy engine.
        </div>

      </div>

      <div class="actions">

        <button
          class="btn"
          onclick="renderStrategyLab()"
        >
          Strategy Lab
        </button>

        <button
          class="btn"
          onclick="go('markets')"
        >
          Load real prices →
        </button>

      </div>

    </div>

    <div class="grid two">

      <div class="card">

        <div class="field">

          <label>
            Historical prices
          </label>

          <div
            class="explain"
            style="margin-bottom:8px"
          >
            Paste your own numbers, or go to
            <a
              href="#"
              onclick="go('markets');return false;"
              style="color:#9cb0cc"
            >Markets</a>
            to pull a real ticker's price history automatically.
          </div>

          <textarea
            id="bt-prices"
            style="min-height:220px"
          >100,101,102,103,102,105,107,106,108,110,109,112,115,114,118,120,119,123,125,124,128,130,129,132,135,137,136,140,143,145,144,148,150,149,153,155,158,157,160,162,165,164,168,170,169,172,175,177,176,180,183,185,184,188,190,193,195,194,198,200</textarea>

        </div>

        <div class="input-grid">

          <div class="field">

            <label>
              Fast MA
            </label>

            <input
              id="bt-fast"
              type="number"
              value="5"
              min="2"
            >

          </div>

          <div class="field">

            <label>
              Slow MA
            </label>

            <input
              id="bt-slow"
              type="number"
              value="15"
              min="3"
            >

          </div>

          <div class="field">

            <label>
              Initial capital
            </label>

            <input
              id="bt-capital"
              type="number"
              value="100000"
            >

          </div>

        </div>

        <button
          class="btn primary"
          style="margin-top:12px"
          onclick="runBacktest()"
        >
          Run backtest
        </button>

      </div>

      <div class="card">

        <div class="card-title">
          <b>Results</b>
        </div>

        <div id="bt-result">
          No backtest executed.
        </div>

      </div>

    </div>
  `;
}

function runBacktest() {

  const prices =
    parseSeries(
      $("bt-prices").value
    );

  const fast =
    Number(
      $("bt-fast").value
    );

  const slow =
    Number(
      $("bt-slow").value
    );

  const capital =
    Number(
      $("bt-capital").value
    );

  if (
    fast >= slow
  ) {

    $("bt-result").innerHTML =
      `<div class="explain">
        Fast MA must be smaller than Slow MA.
      </div>`;

    return;
  }

  const result =
    QuantTools.backtest({

      prices,

      initialCapital:
        capital,

      fastPeriod:
        fast,

      slowPeriod:
        slow

    });

  if (result.error) {

    $("bt-result").innerHTML =
      `<div class="explain">
        ${escapeHTML(result.error)}
      </div>`;

    return;
  }

  $("bt-result").innerHTML = `

    <div class="metric-grid">

      ${metric(
        "Initial capital",
        formatNumber(
          result.initialCapital,
          2
        )
      )}

      ${metric(
        "Final equity",
        formatNumber(
          result.finalEquity,
          2
        )
      )}

      ${metric(
        "Total return",
        formatPercent(
          result.totalReturn
        )
      )}

      ${metric(
        "Max drawdown",
        formatPercent(
          result.maxDrawdown
        )
      )}

      ${metric(
        "Sharpe",
        formatNumber(
          result.sharpe,
          2
        )
      )}

    </div>

    <div
      class="explain"
      style="margin-top:14px"
    >
      Strategy: long when the fast moving average
      is above the slow moving average, otherwise cash.
    </div>
  `;
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function init() {

  if (
    !window.QuantTools
  ) {
    console.error(
      "QuantTools was not loaded."
    );

    toast(
      "QuantTools engine not loaded."
    );
  }

  if (
    !window.MarketData
  ) {
    console.error(
      "MarketData was not loaded."
    );
  }

  renderNav();

  /*
   * If the existing HTML already contains
   * a dashboard, we do not destroy it.
   *
   * Otherwise render our dashboard.
   */

  const view =
    $("view");

  if (
    view &&
    view.innerHTML.trim() === ""
  ) {
    renderDashboard();
  }

  setActiveNav("dashboard");
}

/* =========================================================
   GLOBAL EXPORTS
   ========================================================= */

window.go =
  go;

window.openModule =
  openModule;

window.renderDashboard =
  renderDashboard;

window.renderNav =
  renderNav;

window.setActiveNav =
  setActiveNav;

window.renderMarkets =
  renderMarkets;

window.saveMarketApiKey =
  saveMarketApiKey;

window.clearMarketApiKey =
  clearMarketApiKey;

window.searchMarketSymbol =
  searchMarketSymbol;

window.loadMarketQuote =
  loadMarketQuote;

window.sendSeriesToBacktest =
  sendSeriesToBacktest;

window.renderQuantLab =
  renderQuantLab;

window.renderRiskEngine =
  renderRiskEngine;

window.renderStrategyLab =
  renderStrategyLab;

window.renderBacktest =
  renderBacktest;

window.kellyTool =
  kellyTool;

window.calculateKellyTool =
  calculateKellyTool;

window.blackScholesTool =
  blackScholesTool;

window.calculateBlackScholes =
  calculateBlackScholes;

window.monteCarloTool =
  monteCarloTool;

window.calculateMonteCarlo =
  calculateMonteCarlo;

window.statisticalArbitrageTool =
  statisticalArbitrageTool;

window.calculateStatArb =
  calculateStatArb;

window.engleGrangerTool =
  engleGrangerTool;

window.calculateEG =
  calculateEG;

window.markovTool =
  markovTool;

window.calculateMarkov =
  calculateMarkov;

window.sentimentTool =
  sentimentTool;

window.calculateSentiment =
  calculateSentiment;

window.factorTool =
  factorTool;

window.calculateFactors =
  calculateFactors;

window.babTool =
  babTool;

window.calculateBAB =
  calculateBAB;

window.asymmetricTool =
  asymmetricTool;

window.calculateAsymmetric =
  calculateAsymmetric;

window.correlationTool =
  correlationTool;

window.calculateCorrelation =
  calculateCorrelation;

window.insiderTool =
  insiderTool;

window.calculateInsider =
  calculateInsider;

window.calculateRisk =
  calculateRisk;

window.runBacktest =
  runBacktest;

/* =========================================================
   START
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    init
  );
} else {
  init();
}