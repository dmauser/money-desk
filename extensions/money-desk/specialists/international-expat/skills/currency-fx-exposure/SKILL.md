## Currency / FX Exposure

description: Analyze FX exposure when household income, assets, and liabilities sit in multiple currencies. Recommend a sensible currency allocation for the emergency fund and short-term goals, surface the actual FX cost of cross-border transfers (it's usually larger than the user thinks), and explain when personal currency hedging is and isn't worthwhile.

## When to use

- Income in one currency, mortgage / rent / school fees in another.
- Planning to retire in a country different from current earning country.
- Considering whether to hold cash / bonds in USD vs local currency.
- Recurring cross-border transfers (paying US student loan from UK income, sending money to family abroad, etc.).
- Frustrated with bank FX rates and wondering "is there a better way?"

## Inputs needed

- Currency of income (and stability — is it a single currency or split?).
- Currency of liabilities (mortgage, rent, school fees, debt service, recurring local expenses).
- Currency of major assets (home, brokerage, retirement).
- Planned retirement country (or "unknown" — that itself drives the answer).
- Monthly cross-border transfer volume + current method (bank wire / Wise / Revolut / Interactive Brokers / etc.).
- Risk tolerance — particularly tolerance for short-term FX moves of 10-20%.

## Workflow

### 1. Map the exposure
- Income (next 12 months) by currency.
- Liabilities (next 12 months) by currency.
- **Currency mismatch** = the gap between where income comes in and where it must go out. Mismatch is the only thing that creates personal FX risk.
- Long-term assets follow a different rule — see step 3.

### 2. Emergency fund + short-term-goals currency
- **Rule**: hold the emergency fund in the currency you'd spend it in (i.e., currency of residence) — even if base income is different. A USD-denominated emergency fund is useless during a medical issue in Germany if EUR/USD moves 15% the week you need it.
- For couples with split income, fund the emergency reserve in the currency of the larger expense base (usually rent / mortgage).
- Short-term goals (< 3 years): match currency of the goal.

### 3. Long-term investment portfolio currency
- For US persons (and most US-tax-treaty residents): hold equity exposure via USD-denominated US-domiciled ETFs covering global markets — the equities' underlying-economy exposure already gives currency diversification (a US large-cap fund holds dollar-reporting companies that earn ~40% of revenue overseas; an MSCI World fund holds developed-market currencies in proportion).
- Don't try to outsmart FX timing on a long-horizon portfolio. Empirical evidence: currency hedging benefits portfolios on a risk-adjusted basis at certain horizons for certain currencies, but the cost of doing this manually for an individual is rarely justified.
- **Bond exposure** is different: hold bonds in the currency you'll spend them in (i.e., currency of retirement / liability). Currency volatility dwarfs bond return volatility — an unhedged foreign-currency bond is mostly an FX bet.

### 4. The actual FX cost of transfers (it's larger than you think)
- **Big banks**: 2.5-4% spread baked into the exchange rate + flat wire fee ($25-50 outbound + $15-25 inbound + intermediary-bank fee $10-25).
- **Wise**: ~0.4-0.7% spread + small fixed fee. Often 60-80% cheaper than banks for retail amounts.
- **Revolut / Wise multi-currency** accounts: keep balances in multiple currencies; convert when rates are favorable; pay locally with no FX markup using a multi-currency debit card.
- **Interactive Brokers** (if user already has IBKR for brokerage): IDEALPRO interbank rates at ~0.002% spread; $2 fixed FX-conversion fee. Hard to beat for amounts > $5k.
- **Annual cost example**: USD-EUR transfer of $5k/month: $60k/year × 3% bank spread = $1,800/year. Same via IBKR or Wise: ~$50-200/year. **The savings compound** — over a decade, > $15k savings.

### 5. Personal currency hedging — when (rarely) it's worth it
- If a known large liability sits 3-12 months out in a non-income currency (e.g., school fees due in EUR in 9 months, income in USD), a simple forward contract via a retail FX provider can lock in the rate. Wise has Forwards for some currency pairs. This is **liability matching**, not speculation.
- Hedging the investment portfolio (e.g., short EUR/USD as a personal trade because you think the dollar will rally) is speculation — usually a losing game and not what this skill is for.

## Output

- Currency-by-currency income / liability / asset map.
- Currency mismatch summary with the magnitude and sign.
- Recommended emergency fund + short-term goal currency allocation.
- Long-term portfolio currency-exposure check (and reassurance if appropriate).
- Transfer-method recommendation with annual-cost estimate.
- One-time forward-contract recommendation IF a defined non-income-currency liability is identified.

## Citations / sources

- Vanguard research on currency hedging: "Global equity investing — The benefits of currency hedging" (Vanguard).
- BIS Triennial FX Survey for spread benchmarks.
- Wise / IBKR / bank disclosed FX margins (cite the published rate, not promotional).

## Disclaimer

Educational. Forward contracts and FX spot trades carry counterparty and execution risk; don't take a hedge larger than the underlying liability. For volumes > $250k or hedging horizons > 12 months, route to a corporate-FX desk or a CFA-licensed advisor with FX experience.
