# QuantForge — Quant Trading Terminal

To jest działający, responsywny prototyp terminala quantowego przygotowany bez Lovable.

## Uruchomienie
Najprościej:
1. rozpakuj ZIP,
2. otwórz `index.html` w przeglądarce.

Albo uruchom lokalny serwer:
`python -m http.server 8080`
i wejdź na `http://localhost:8080`.

## Co działa już w prototypie
- responsywny HUD desktop/mobile,
- live-style price feed (symulowany),
- wykres cenowy,
- watchlista,
- quant dashboard,
- Strategy Lab,
- backtest demo,
- Kelly Criterion,
- Black-Scholes + Delta/Gamma,
- Monte Carlo 10 000 scenariuszy,
- Statistical Arbitrage / pair analysis,
- risk engine,
- portfolio,
- alerts,
- beginner/learn mode,
- modułowa architektura gotowa pod prawdziwe API.

## Ważne
Dane rynkowe w tej wersji są symulowane. Nie należy używać ich do realnego handlu.

## Następny etap produkcyjny
1. Backend API + PostgreSQL.
2. WebSocket real-time market data.
3. Prawdziwe dane historyczne i intraday.
4. Auth + encrypted broker credentials.
5. Adapter brokera (np. XTB / Interactive Brokers / inny broker z API).
6. TradingView charting/data integration zgodnie z licencją i API.
7. Backtest engine na prawdziwych danych.
8. Walk-forward / out-of-sample / Monte Carlo / parameter sensitivity.
9. Order management + paper trading.
10. Audit log, risk limits i kill switch.
