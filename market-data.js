/* =========================================================
   QUANTFORGE - MARKET DATA ENGINE
   Wrapper around the Alpha Vantage public API.

   Users provide their OWN free API key
   (https://www.alphavantage.co/support/#api-key).
   The key is stored only in the browser's localStorage
   and is sent directly from the browser to Alpha Vantage —
   it never passes through any QuantForge server, because
   there is no server: this is a static, client-side app.
   ========================================================= */

(function (window) {
  "use strict";

  const AV_BASE = "https://www.alphavantage.co/query";
  const STORAGE_KEY = "qf_alphavantage_key";

  /* =========================
     API KEY MANAGEMENT
     ========================= */

  function getApiKey() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (err) {
      return "";
    }
  }

  function setApiKey(key) {
    try {
      localStorage.setItem(STORAGE_KEY, String(key).trim());
    } catch (err) {
      /* localStorage unavailable (e.g. private mode) — ignore */
    }
  }

  function clearApiKey() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      /* ignore */
    }
  }

  function hasApiKey() {
    return getApiKey().length > 0;
  }

  /* =========================
     LOW-LEVEL FETCH
     ========================= */

  async function fetchJSON(params) {
    const key = getApiKey();

    if (!key) {
      throw new Error(
        "No API key set. Add your free Alpha Vantage key in the Markets tab."
      );
    }

    const url = new URL(AV_BASE);

    Object.keys(params).forEach((name) => {
      url.searchParams.set(name, params[name]);
    });

    url.searchParams.set("apikey", key);

    let response;

    try {
      response = await fetch(url.toString());
    } catch (err) {
      throw new Error(
        "Network error while contacting Alpha Vantage. Check your connection."
      );
    }

    if (!response.ok) {
      throw new Error("Market data request failed (HTTP " + response.status + ").");
    }

    const data = await response.json();

    if (data["Note"]) {
      throw new Error(
        "API rate limit reached. The free tier is limited — wait a bit and try again."
      );
    }

    if (data["Information"]) {
      throw new Error(String(data["Information"]));
    }

    if (data["Error Message"]) {
      throw new Error("No data found for that symbol.");
    }

    return data;
  }

  /* =========================
     SYMBOL SEARCH
     ========================= */

  async function searchSymbol(keywords) {
    if (!keywords || !keywords.trim()) {
      return [];
    }

    const data = await fetchJSON({
      function: "SYMBOL_SEARCH",
      keywords: keywords.trim()
    });

    const matches = data["bestMatches"] || [];

    return matches.map((m) => ({
      symbol: m["1. symbol"],
      name: m["2. name"],
      type: m["3. type"],
      region: m["4. region"],
      currency: m["8. currency"]
    }));
  }

  /* =========================
     LIVE QUOTE
     ========================= */

  async function getQuote(symbol) {
    const data = await fetchJSON({
      function: "GLOBAL_QUOTE",
      symbol: symbol
    });

    const q = data["Global Quote"];

    if (!q || !q["05. price"]) {
      throw new Error("No quote available for " + symbol + ".");
    }

    return {
      symbol: q["01. symbol"],
      open: Number(q["02. open"]),
      high: Number(q["03. high"]),
      low: Number(q["04. low"]),
      price: Number(q["05. price"]),
      volume: Number(q["06. volume"]),
      latestTradingDay: q["07. latest trading day"],
      previousClose: Number(q["08. previous close"]),
      change: Number(q["09. change"]),
      changePercent: parseFloat(q["10. change percent"])
    };
  }

  /* =========================
     DAILY HISTORY
     ========================= */

  async function getDailySeries(symbol, outputsize) {
    const data = await fetchJSON({
      function: "TIME_SERIES_DAILY",
      symbol: symbol,
      outputsize: outputsize || "compact"
    });

    const series = data["Time Series (Daily)"];

    if (!series) {
      throw new Error("No historical data available for " + symbol + ".");
    }

    const dates = Object.keys(series).sort();

    return dates.map((date) => {
      const day = series[date];

      return {
        date: date,
        open: Number(day["1. open"]),
        high: Number(day["2. high"]),
        low: Number(day["3. low"]),
        close: Number(day["4. close"]),
        volume: Number(day["5. volume"])
      };
    });
  }

  /* =========================
     PUBLIC API
     ========================= */

  window.MarketData = {
    getApiKey,
    setApiKey,
    clearApiKey,
    hasApiKey,
    searchSymbol,
    getQuote,
    getDailySeries
  };
})(window);
