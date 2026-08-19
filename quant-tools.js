/* =========================================================
   QUANTFORGE - QUANT TOOLS ENGINE
   ========================================================= */

(function (window) {
  "use strict";

  /* =========================
     BASIC STATISTICS
     ========================= */

  function mean(values) {
    if (!values || values.length === 0) return 0;

    return values.reduce(
      (sum, value) => sum + Number(value),
      0
    ) / values.length;
  }

  function variance(values) {
    if (!values || values.length < 2) return 0;

    const avg = mean(values);

    return values.reduce(
      (sum, value) =>
        sum + Math.pow(Number(value) - avg, 2),
      0
    ) / (values.length - 1);
  }

  function std(values) {
    return Math.sqrt(variance(values));
  }

  function covariance(a, b) {
    if (
      !a ||
      !b ||
      a.length !== b.length ||
      a.length < 2
    ) {
      return 0;
    }

    const meanA = mean(a);
    const meanB = mean(b);

    let total = 0;

    for (let i = 0; i < a.length; i++) {
      total +=
        (a[i] - meanA) *
        (b[i] - meanB);
    }

    return total / (a.length - 1);
  }

  function correlation(a, b) {
    const denominator =
      std(a) * std(b);

    if (denominator === 0) return 0;

    return covariance(a, b) / denominator;
  }

  /* =========================
     NORMAL DISTRIBUTION
     ========================= */

  function normalPDF(x) {
    return (
      Math.exp(-0.5 * x * x) /
      Math.sqrt(2 * Math.PI)
    );
  }

  function normalCDF(x) {
    const sign = x < 0 ? -1 : 1;
    const value = Math.abs(x);

    const t =
      1 /
      (1 + 0.2316419 * value);

    const d =
      0.3989423 *
      Math.exp(
        -value * value / 2
      );

    const probability =
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

  /* =========================
     KELLY CRITERION
     ========================= */

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
        error:
          "Invalid Kelly parameters"
      };
    }

    const b = win / loss;

    const fullKelly =
      (p * b - (1 - p)) / b;

    return {
      fullKelly,
      halfKelly:
        fullKelly * 0.5,
      quarterKelly:
        fullKelly * 0.25,
      selectedKelly:
        fullKelly * fraction,
      winRate: p,
      payoffRatio: b
    };
  }

  /* =========================
     BLACK-SCHOLES
     ========================= */

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
        error:
          "Spot, strike, volatility and time must be positive."
      };
    }

    const sqrtT = Math.sqrt(T);

    const d1 =
      (
        Math.log(S / K) +
        (r +
          sigma * sigma / 2) *
          T
      ) /
      (sigma * sqrtT);

    const d2 =
      d1 -
      sigma * sqrtT;

    const discount =
      Math.exp(-r * T);

    const call =
      S * normalCDF(d1) -
      K *
        discount *
        normalCDF(d2);

    const put =
      K *
        discount *
        normalCDF(-d2) -
      S *
        normalCDF(-d1);

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
      price:
        type === "put"
          ? put
          : call,

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

  /* =========================
     MONTE CARLO
     ========================= */

  function randomNormal() {
    let u = 0;
    let v = 0;

    while (u === 0) {
      u = Math.random();
    }

    while (v === 0) {
      v = Math.random();
    }

    return (
      Math.sqrt(
        -2 * Math.log(u)
      ) *
      Math.cos(
        2 * Math.PI * v
      )
    );
  }

  function monteCarlo({
    initialPrice = 100,
    drift = 0.08,
    volatility = 0.2,
    years = 1,
    steps = 252,
    simulations = 5000
  } = {}) {

    const dt =
      years / steps;

    let totalFinalValue = 0;
    let profitable = 0;

    const samplePaths = [];

    for (
      let simulation = 0;
      simulation < simulations;
      simulation++
    ) {
      let price =
        initialPrice;

      const path = [
        price
      ];

      for (
        let step = 0;
        step < steps;
        step++
      ) {
        const z =
          randomNormal();

        price *= Math.exp(
          (
            drift -
            0.5 *
              volatility *
              volatility
          ) *
            dt +
          volatility *
            Math.sqrt(dt) *
            z
        );

        if (
          simulation < 100
        ) {
          path.push(price);
        }
      }

      totalFinalValue +=
        price;

      if (
        price > initialPrice
      ) {
        profitable++;
      }

      if (
        simulation < 100
      ) {
        samplePaths.push(
          path
        );
      }
    }

    const expectedPrice =
      totalFinalValue /
      simulations;

    return {
      simulations,
      expectedPrice,

      probabilityOfProfit:
        profitable /
        simulations,

      samplePaths
    };
  }

  /* =========================
     Z-SCORE
     ========================= */

  function zScore(
    value,
    values
  ) {
    const average =
      mean(values);

    const deviation =
      std(values);

    if (deviation === 0) {
      return 0;
    }

    return (
      value - average
    ) / deviation;
  }

  /* =========================
     STATISTICAL ARBITRAGE
     ========================= */

  function statisticalArbitrage({
    seriesA,
    seriesB
  }) {
    if (
      !seriesA ||
      !seriesB ||
      seriesA.length !==
        seriesB.length ||
      seriesA.length < 3
    ) {
      return {
        error:
          "Both series must contain the same number of observations."
      };
    }

    const hedgeRatio =
      covariance(
        seriesA,
        seriesB
      ) /
      variance(seriesB);

    const spread =
      seriesA.map(
        (value, i) =>
          value -
          hedgeRatio *
            seriesB[i]
      );

    const current =
      spread[
        spread.length - 1
      ];

    const spreadMean =
      mean(spread);

    const spreadStd =
      std(spread);

    const currentZScore =
      spreadStd === 0
        ? 0
        : (
            current -
            spreadMean
          ) /
          spreadStd;

    let signal =
      "NEUTRAL";

    if (
      currentZScore > 2
    ) {
      signal =
        "SHORT SPREAD";
    }

    if (
      currentZScore < -2
    ) {
      signal =
        "LONG SPREAD";
    }

    return {
      hedgeRatio,
      spread,
      mean: spreadMean,
      standardDeviation:
        spreadStd,
      zScore:
        currentZScore,
      signal
    };
  }

  /* =========================
     LINEAR REGRESSION
     ========================= */

  function linearRegression(
    x,
    y
  ) {
    if (
      !x ||
      !y ||
      x.length !== y.length ||
      x.length < 2
    ) {
      return {
        error:
          "Invalid regression data."
      };
    }

    const xMean =
      mean(x);

    const yMean =
      mean(y);

    let numerator = 0;
    let denominator = 0;

    for (
      let i = 0;
      i < x.length;
      i++
    ) {
      numerator +=
        (x[i] - xMean) *
        (y[i] - yMean);

      denominator +=
        Math.pow(
          x[i] - xMean,
          2
        );
    }

    const slope =
      denominator === 0
        ? 0
        : numerator /
          denominator;

    const intercept =
      yMean -
      slope * xMean;

    const predicted =
      x.map(
        value =>
          intercept +
          slope * value
      );

    const residuals =
      y.map(
        (value, i) =>
          value -
          predicted[i]
      );

    const r =
      correlation(x, y);

    return {
      slope,
      intercept,
      predicted,
      residuals,
      rSquared:
        r * r
    };
  }

  /* =========================
     ENGLE-GRANGER
     ========================= */

  function engleGranger(
    seriesA,
    seriesB
  ) {
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

    return {
      hedgeRatio:
        regression.slope,

      intercept:
        regression.intercept,

      rSquared:
        regression.rSquared,

      residualMean,
      residualStd,

      interpretation:
        residualStd <
        Math.abs(
          residualMean
        ) * 2
          ? "Potentially stable spread"
          : "Spread requires further validation"
    };
  }

  /* =========================
     MARKOV REGIME
     ========================= */

  function markovRegime(
    returns
  ) {
    if (
      !returns ||
      returns.length < 10
    ) {
      return {
        error:
          "At least 10 returns are required."
      };
    }

    const average =
      mean(returns);

    const volatility =
      std(returns);

    const threshold =
      volatility * 0.15;

    let bull = 0;
    let bear = 0;
    let neutral = 0;

    returns.forEach(
      value => {
        if (
          value > threshold
        ) {
          bull++;
        } else if (
          value < -threshold
        ) {
          bear++;
        } else {
          neutral++;
        }
      }
    );

    let regime =
      "NEUTRAL";

    if (
      average > threshold
    ) {
      regime =
        "BULL";
    }

    if (
      average < -threshold
    ) {
      regime =
        "BEAR";
    }

    return {
      regime,
      averageReturn:
        average,
      volatility,

      probabilities: {
        bull:
          bull /
          returns.length,

        neutral:
          neutral /
          returns.length,

        bear:
          bear /
          returns.length
      }
    };
  }

  /* =========================
     MULTI-FACTOR MODEL
     ========================= */

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

    const normalized =
      Math.max(
        0,
        Math.min(
          100,
          50 +
            score * 50
        )
      );

    return {
      score,
      normalized
    };
  }

  /* =========================
     CORRELATION MATRIX
     ========================= */

  function correlationMatrix(
    series
  ) {
    const symbols =
      Object.keys(series);

    const matrix = {};

    symbols.forEach(
      symbolA => {

        matrix[symbolA] = {};

        symbols.forEach(
          symbolB => {

            matrix[symbolA][
              symbolB
            ] =
              correlation(
                series[symbolA],
                series[symbolB]
              );

          }
        );
      }
    );

    return matrix;
  }

  /* =========================
     ASYMMETRIC BET
     ========================= */

  function asymmetricBet({
    winProbability,
    upside,
    downside
  }) {

    const p =
      Number(
        winProbability
      );

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
          : expectedValue < 0
            ? "NEGATIVE"
            : "NEUTRAL"
    };
  }

  /* =========================
     VOLATILITY POSITION SIZING
     ========================= */

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
        error:
          "Volatility values must be positive."
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

  /* =========================
     PRICE RETURNS
     ========================= */

  function returnsFromPrices(
    prices
  ) {
    if (
      !prices ||
      prices.length < 2
    ) {
      return [];
    }

    const returns = [];

    for (
      let i = 1;
      i < prices.length;
      i++
    ) {
      returns.push(
        prices[i] /
          prices[i - 1] -
          1
      );
    }

    return returns;
  }

  /* =========================
     MAX DRAWDOWN
     ========================= */

  function maxDrawdown(
    equity
  ) {
    if (
      !equity ||
      equity.length === 0
    ) {
      return 0;
    }

    let peak =
      equity[0];

    let worst =
      0;

    equity.forEach(
      value => {

        if (
          value > peak
        ) {
          peak = value;
        }

        const drawdown =
          value / peak - 1;

        if (
          drawdown < worst
        ) {
          worst =
            drawdown;
        }
      }
    );

    return worst;
  }

  /* =========================
     BACKTEST ENGINE
     ========================= */

  function backtest({
    prices,
    initialCapital = 100000,
    fastPeriod = 20,
    slowPeriod = 50
  }) {

    if (
      !prices ||
      prices.length <=
        slowPeriod
    ) {
      return {
        error:
          "Not enough price data."
      };
    }

    let cash =
      initialCapital;

    let shares = 0;

    const equityCurve = [];

    for (
      let i = slowPeriod;
      i < prices.length;
      i++
    ) {

      const fastMA =
        mean(
          prices.slice(
            i - fastPeriod,
            i
          )
        );

      const slowMA =
        mean(
          prices.slice(
            i - slowPeriod,
            i
          )
        );

      const price =
        prices[i];

      if (
        fastMA > slowMA &&
        shares === 0
      ) {
        shares =
          cash / price;

        cash = 0;
      }

      if (
        fastMA < slowMA &&
        shares > 0
      ) {
        cash =
          shares * price;

        shares = 0;
      }

      equityCurve.push(
        cash +
          shares * price
      );
    }

    const finalEquity =
      equityCurve[
        equityCurve.length - 1
      ];

    const totalReturn =
      finalEquity /
        initialCapital -
      1;

    const drawdown =
      maxDrawdown(
        equityCurve
      );

    const returns =
      returnsFromPrices(
        equityCurve
      );

    const volatility =
      std(returns);

    const averageReturn =
      mean(returns);

    const sharpe =
      volatility === 0
        ? 0
        : (
            averageReturn /
            volatility
          ) *
          Math.sqrt(252);

    return {
      initialCapital,
      finalEquity,
      totalReturn,
      maxDrawdown:
        drawdown,
      sharpe,
      equityCurve
    };
  }

  /* =========================
     PORTFOLIO METRICS
     ========================= */

  function portfolioReturn(
    weights,
    returns
  ) {
    let total = 0;

    Object.keys(
      weights
    ).forEach(
      symbol => {

        total +=
          weights[symbol] *
          (returns[symbol] || 0);

      }
    );

    return total;
  }

  function portfolioVolatility(
    weights,
    covarianceMatrix
  ) {
    const symbols =
      Object.keys(weights);

    let varianceValue = 0;

    symbols.forEach(
      a => {

        symbols.forEach(
          b => {

            const cov =
              covarianceMatrix[a] &&
              covarianceMatrix[a][b]
                ? covarianceMatrix[a][b]
                : 0;

            varianceValue +=
              weights[a] *
              weights[b] *
              cov;

          }
        );
      }
    );

    return Math.sqrt(
      Math.max(
        0,
        varianceValue
      )
    );
  }

  /* =========================
     SHARPE RATIO
     ========================= */

  function sharpeRatio(
    returns,
    riskFreeRate = 0
  ) {
    if (
      !returns ||
      returns.length < 2
    ) {
      return 0;
    }

    const excess =
      returns.map(
        r =>
          r -
          riskFreeRate
      );

    const deviation =
      std(excess);

    if (deviation === 0) {
      return 0;
    }

    return (
      mean(excess) /
      deviation
    ) *
      Math.sqrt(252);
  }

  /* =========================
     SORTINO RATIO
     ========================= */

  function sortinoRatio(
    returns,
    target = 0
  ) {
    if (
      !returns ||
      returns.length < 2
    ) {
      return 0;
    }

    const downside =
      returns
        .filter(
          r => r < target
        )
        .map(
          r =>
            Math.pow(
              r - target,
              2
            )
        );

    if (
      downside.length === 0
    ) {
      return Infinity;
    }

    const downsideDeviation =
      Math.sqrt(
        mean(downside)
      );

    if (
      downsideDeviation === 0
    ) {
      return 0;
    }

    return (
      (mean(returns) -
        target) /
      downsideDeviation
    ) *
      Math.sqrt(252);
  }

  /* =========================
     CAGR
     ========================= */

  function CAGR(
    initialValue,
    finalValue,
    years
  ) {
    if (
      initialValue <= 0 ||
      finalValue <= 0 ||
      years <= 0
    ) {
      return 0;
    }

    return (
      Math.pow(
        finalValue /
          initialValue,
        1 / years
      ) - 1
    );
  }

  /* =========================
     PUBLIC API
     ========================= */

  window.QuantTools = {

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

    maxDrawdown,

    backtest,

    portfolioReturn,

    portfolioVolatility,

    sharpeRatio,

    sortinoRatio,

    CAGR
  };

})(window);