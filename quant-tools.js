/* =========================================================
   QUANTFORGE QUANT TOOLS ENGINE
   Pure JavaScript, no external libraries
   ========================================================= */

(function (global) {
  "use strict";

  /* ---------- BASIC MATH ---------- */

  function mean(values) {
    if (!values || !values.length) return 0;
    return values.reduce((a, b) => a + Number(b), 0) / values.length;
  }

  function variance(values) {
    if (!values || values.length < 2) return 0;

    const m = mean(values);

    return values.reduce(
      (sum, x) => sum + Math.pow(Number(x) - m, 2),
      0
    ) / (values.length - 1);
  }

  function std(values) {
    return Math.sqrt(variance(values));
  }

  function covariance(a, b) {
    if (!a.length || a.length !== b.length) return 0;

    const ma = mean(a);
    const mb = mean(b);

    let total = 0;

    for (let i = 0; i < a.length; i++) {
      total += (a[i] - ma) * (b[i] - mb);
    }

    return total / (a.length - 1);
  }

  function correlation(a, b) {
    const denominator = std(a) * std(b);

    if (!denominator) return 0;

    return covariance(a, b) / denominator;
  }

  /* ---------- NORMAL DISTRIBUTION ---------- */

  function normalPDF(x) {
    return (
      Math.exp(-0.5 * x * x) /
      Math.sqrt(2 * Math.PI)
    );
  }

  function normalCDF(x) {
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);

    const t =
      1 /
      (1 + 0.2316419 * absX);

    const d =
      0.3989423 *
      Math.exp(-absX * absX / 2);

    let probability =
      1 -
      d *
      t *
      (
        0.3193815 +
        t *
        (
          -0.3565638 +
          t *
          (
            1.781478 +
            t *
            (
              -1.821256 +
              t * 1.330274
            )
          )
        )
      );

    return sign === 1
      ? probability
      : 1 - probability;
  }

  /* ---------- KELLY CRITERION ---------- */

  function kelly({
    winRate,
    averageWin,
    averageLoss,
    fraction = 1
  }) {
    const p = Number(winRate);
    const win = Number(averageWin);
    const loss = Number(averageLoss);

    if (
      p < 0 ||
      p > 1 ||
      win <= 0 ||
      loss <= 0
    ) {
      return {
        error: "Invalid Kelly parameters"
      };
    }

    const fullKelly =
      p -
      ((1 - p) * win / loss);

    return {
      fullKelly,
      halfKelly: fullKelly * 0.5,
      quarterKelly: fullKelly * 0.25,
      selectedKelly: fullKelly * fraction
    };
  }

  /* ---------- BLACK-SCHOLES ---------- */

  function blackScholes({
    spot,
    strike,
    rate,
    volatility,
    time,
    type = "call"
  }) {
    const S = Number(spot);
    const K = Number(strike);
    const r = Number(rate);
    const sigma = Number(volatility);
    const T = Number(time);

    if (
      S <= 0 ||
      K <= 0 ||
      sigma <= 0 ||
      T <= 0
    ) {
      return {
        error: "Invalid Black-Scholes parameters"
      };
    }

    const sqrtT = Math.sqrt(T);

    const d1 =
      (
        Math.log(S / K) +
        (r + sigma * sigma / 2) * T
      ) /
      (sigma * sqrtT);

    const d2 =
      d1 -
      sigma * sqrtT;

    const discount =
      Math.exp(-r * T);

    const call =
      S * normalCDF(d1) -
      K * discount * normalCDF(d2);

    const put =
      K * discount * normalCDF(-d2) -
      S * normalCDF(-d1);

    const gamma =
      normalPDF(d1) /
      (S * sigma * sqrtT);

    const vega =
      S *
      normalPDF(d1) *
      sqrtT;

    const callDelta =
      normalCDF(d1);

    const putDelta =
      normalCDF(d1) - 1;

    const callTheta =
      -(
        S *
        normalPDF(d1) *
        sigma
      ) /
      (2 * sqrtT) -
      r *
      K *
      discount *
      normalCDF(d2);

    const putTheta =
      -(
        S *
        normalPDF(d1) *
        sigma
      ) /
      (2 * sqrtT) +
      r *
      K *
      discount *
      normalCDF(-d2);

    return {
      price: type === "put" ? put : call,
      call,
      put,
      d1,
      d2,
      delta:
        type === "put"
          ? putDelta
          : callDelta,
      gamma,
      vega,
      theta:
        type === "put"
          ? putTheta
          : callTheta
    };
  }

  /* ---------- MONTE CARLO ---------- */

  function monteCarlo({
    initialPrice = 100,
    drift = 0.08,
    volatility = 0.2,
    years = 1,
    steps = 252,
    simulations = 10000
  } = {}) {

    const paths = [];
    let positive = 0;
    let finalSum = 0;

    const dt = years / steps;

    for (let s = 0; s < simulations; s++) {

      let price = initialPrice;

      for (let i = 0; i < steps; i++) {

        const shock = normalRandom();

        price *= Math.exp(
          (
            drift -
            0.5 * volatility * volatility
          ) * dt +
          volatility *
          Math.sqrt(dt) *
          shock
        );
      }

      finalSum += price;

      if (price > initialPrice) {
        positive++;
      }

      if (s < 250) {
        paths.push(price);
      }
    }

    return {
      simulations,
      expectedPrice:
        finalSum / simulations,
      probabilityOfProfit:
        positive / simulations,
      sampleFinalPrices: paths
    };
  }

  function normalRandom() {
    let u = 0;
    let v = 0;

    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    return Math.sqrt(
      -2 * Math.log(u)
    ) *
    Math.cos(
      2 * Math.PI * v
    );
  }

  /* ---------- Z-SCORE / STAT ARB ---------- */

  function zScore(value, values) {
    const m = mean(values);
    const s = std(values);

    if (!s) return 0;

    return (value - m) / s;
  }

  function statisticalArbitrage({
    seriesA,
    seriesB
  }) {
    if (
      !seriesA ||
      !seriesB ||
      seriesA.length !== seriesB.length ||
      seriesA.length < 3
    ) {
      return {
        error: "Series must have equal length"
      };
    }

    const hedgeRatio =
      covariance(seriesA, seriesB) /
      variance(seriesB);

    const spread = seriesA.map(
      (a, i) =>
        a -
        hedgeRatio *
        seriesB[i]
    );

    const current =
      spread[spread.length - 1];

    const spreadMean =
      mean(spread);

    const spreadStd =
      std(spread);

    const z =
      spreadStd === 0
        ? 0
        : (
          current -
          spreadMean
        ) / spreadStd;

    let signal = "NEUTRAL";

    if (z > 2) signal = "SHORT SPREAD";
    if (z < -2) signal = "LONG SPREAD";

    return {
      hedgeRatio,
      spread,
      mean: spreadMean,
      standardDeviation: spreadStd,
      zScore: z,
      signal
    };
  }

  /* ---------- REGRESSION / ENGLE-GRANGER ---------- */

  function linearRegression(x, y) {
    if (
      x.length !== y.length ||
      x.length < 2
    ) {
      return {
        error: "Invalid regression data"
      };
    }

    const xMean = mean(x);
    const yMean = mean(y);

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < x.length; i++) {
      numerator +=
        (x[i] - xMean) *
        (y[i] - yMean);

      denominator +=
        Math.pow(x[i] - xMean, 2);
    }

    const slope =
      denominator === 0
        ? 0
        : numerator / denominator;

    const intercept =
      yMean -
      slope * xMean;

    const predicted =
      x.map(v =>
        intercept +
        slope * v
      );

    const residuals =
      y.map(
        (v, i) =>
          v - predicted[i]
      );

    return {
      slope,
      intercept,
      predicted,
      residuals,
      rSquared:
        Math.pow(
          correlation(x, y),
          2
        )
    };
  }

  function engleGranger(seriesA, seriesB) {
    const regression =
      linearRegression(
        seriesB,
        seriesA
      );

    if (regression.error) {
      return regression;
    }

    const residuals =
      regression.residuals;

    const residualMean =
      mean(residuals);

    const residualStd =
      std(residuals);

    const stationaryScore =
      residualStd === 0
        ? 0
        : Math.abs(
            residualMean /
            residualStd
          );

    return {
      hedgeRatio: regression.slope,
      intercept: regression.intercept,
      rSquared: regression.rSquared,
      residualMean,
      residualStd,
      stationaryScore,
      interpretation:
        stationaryScore < 0.5
          ? "Potentially stationary spread"
          : "Weak evidence of stationarity"
    };
  }

  /* ---------- MARKOV REGIME ---------- */

  function markovRegime(returns) {
    if (
      !returns ||
      returns.length < 10
    ) {
      return {
        error: "At least 10 returns required"
      };
    }

    const avg = mean(returns);
    const volatility = std(returns);

    let regime;

    if (
      avg > volatility * 0.15
    ) {
      regime = "BULL";
    } else if (
      avg < -volatility * 0.15
    ) {
      regime = "BEAR";
    } else {
      regime = "NEUTRAL";
    }

    let bull = 0;
    let bear = 0;
    let neutral = 0;

    returns.forEach(r => {
      if (r > volatility * 0.15) bull++;
      else if (r < -volatility * 0.15) bear++;
      else neutral++;
    });

    return {
      regime,
      averageReturn: avg,
      volatility,
      probabilities: {
        bull: bull / returns.length,
        neutral: neutral / returns.length,
        bear: bear / returns.length
      }
    };
  }

  /* ---------- MULTI FACTOR ---------- */

  function factorScore({
    momentum = 0,
    value = 0,
    quality = 0,
    volatility = 0,
    size = 0
  } = {}) {

    const score =
      momentum * 0.30 +
      value * 0.20 +
      quality * 0.20 +
      volatility * 0.20 +
      size * 0.10;

    return {
      score,
      normalized:
        Math.max(
          0,
          Math.min(
            100,
            50 + score * 50
          )
        )
    };
  }

  /* ---------- CORRELATION MATRIX ---------- */

  function correlationMatrix(series) {
    const symbols =
      Object.keys(series);

    const matrix = {};

    symbols.forEach(a => {

      matrix[a] = {};

      symbols.forEach(b => {

        matrix[a][b] =
          correlation(
            series[a],
            series[b]
          );

      });

    });

    return matrix;
  }

  /* ---------- ASYMMETRIC BET ---------- */

  function asymmetricBet({
    winProbability,
    upside,
    downside
  }) {

    const p =
      Number(winProbability);

    const up =
      Number(upside);

    const down =
      Number(downside);

    const expectedValue =
      p * up -
      (1 - p) * down;

    const riskReward =
      down === 0
        ? Infinity
        : up / down;

    return {
      expectedValue,
      riskReward,
      edge:
        expectedValue > 0
          ? "POSITIVE"
          : "NEGATIVE"
    };
  }

  /* ---------- RISK ---------- */

  function volatilitySizing({
    portfolioValue,
    targetVolatility,
    assetVolatility
  }) {

    if (
      portfolioValue <= 0 ||
      targetVolatility <= 0 ||
      assetVolatility <= 0
    ) {
      return {
        error: "Invalid volatility parameters"
      };
    }

    const allocation =
      targetVolatility /
      assetVolatility;

    return {
      allocation,
      positionValue:
        portfolioValue *
        allocation
    };
  }

  /* ---------- RETURNS ---------- */

  function returnsFromPrices(prices) {
    const returns = [];

    for (let i = 1; i < prices.length; i++) {
      returns.push(
        prices[i] /
        prices[i - 1] -
        1
      );
    }

    return returns;
  }

  /* ---------- BACKTEST ---------- */

  function backtest({
    prices,
    initialCapital = 100000,
    fastPeriod = 20,
    slowPeriod = 50
  }) {

    if (
      !prices ||
      prices.length <= slowPeriod
    ) {
      return {
        error: "Not enough price data"
      };
    }

    let cash = initialCapital;
    let shares = 0;

    const equity = [];

    for (
      let i = slowPeriod;
      i < prices.length;
      i++
    ) {

      const fast =
        mean(
          prices.slice(
            i - fastPeriod,
            i
          )
        );

      const slow =
        mean(
          prices.slice(
            i - slowPeriod,
            i
          )
        );

      const price =
        prices[i];

      if (
        fast > slow &&
        shares === 0
      ) {
        shares =
          cash / price;

        cash = 0;
      }

      if (
        fast < slow &&
        shares > 0
      ) {
        cash =
          shares * price;

        shares = 0;
      }

      equity.push(
        cash +
        shares * price
      );
    }

    const finalEquity =
      equity[equity.length - 1];

    const totalReturn =
      finalEquity /
      initialCapital -
      1;

    let peak = equity[0];
    let maxDrawdown = 0;

    equity.forEach(value => {

      if (value > peak) {
        peak = value;
      }

      const drawdown =
        value / peak - 1;

      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
      }

    });

    const returns =
      returnsFromPrices(equity);

    const avgReturn =
      mean(returns);

    const volatility =
      std(returns);

    const sharpe =
      volatility === 0
        ? 0
        : avgReturn /
          volatility *
          Math.sqrt(252);

    return {
      initialCapital,
      finalEquity,
      totalReturn,
      maxDrawdown,
      sharpe,
      equityCurve: equity
    };
  }

  /* ---------- PUBLIC API ---------- */

  global.QuantTools = {

    mean,
    variance,
    std,
    covariance,
    correlation,

    normalPDF,
    normalCDF,

    kelly,
    blackScholes,
    monteCarlo,

    zScore,
    statisticalArbitrage,

    linearRegression,
    engleGranger,

    markovRegime,
    factorScore,
    correlationMatrix,

    asymmetricBet,
    volatilitySizing,

    returnsFromPrices,
    backtest

  };

})(window);
