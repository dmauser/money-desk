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
- **Illustrative annual cost example** (the report uses the user's measured spread — Determinism rules step 5): USD-EUR transfer of $5k/month: $60k/year × 3% bank spread = $1,800/year. Same via IBKR or Wise: ~$50-200/year. **The savings compound** — over a decade, > $15k savings.

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

## Determinism rules

### Input keys

- `review_date` — YYYY-MM-DD
- `residence_currency` — ISO code (e.g. EUR)
- `retirement_currency` — ISO code or `unknown`
- `income_12m` — list of `{ currency, amount_local }`
- `liabilities_12m` — list of `{ currency, amount_local, description }` (rent / mortgage / school fees / debt service / recurring local spending)
- `assets` — list of `{ currency, asset_class (cash | bonds | equities | real_estate | retirement), amount_local }`
- `emergency_fund` — list of `{ currency, amount_local }`
- `transfers` — `{ monthly_volume_usd, method, applied_rate, mid_market_rate_on_date, fixed_fees_per_transfer_usd, transfers_per_month }`
- `alternative_quote` — `{ provider, spread_pct, fixed_fee_usd, source }`; optional
- `future_liabilities` — list of `{ currency, amount_local, due_date (YYYY-MM-DD) }` (defined, non-recurring)
- `fx_rates_to_usd` — map currency → rate on `review_date`; optional

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Income, liabilities, currencies | **Ask — no default** | — |
| FX rates to USD | Mid-market rate on `review_date` via `md_sources` (FRED H.10 / central bank), else user-provided rate | `[UNSOURCED]` if neither |
| Current transfer spread | Measured from a recent receipt: `(mid − applied) / mid × 100`; if no receipt, **Ask — no default** | `[USER-PROVIDED]` |
| Alternative provider cost | Provider's published fee schedule (cite); without a quote no switching saving is computed | `[UNSOURCED]` |
| Hedge-size materiality | Liability ≥ 10% of annual income (in USD) | `[ASSUMPTION]` |

### Calculation method

Compute in cents of USD after conversion; report whole dollars and percents to one decimal.

1. **Convert** every amount to USD at `fx_rates_to_usd` (same rate for every line of a currency).
2. **Mismatch by currency** `gap_c = liabilities_c − income_c`. `uncovered = Σ max(0, gap_c)`; `mismatch_pct = uncovered / Σ liabilities × 100`.
3. **Emergency-fund currency.** Target currency = `residence_currency`. `misallocated_pct = (EF not in target) / total EF × 100`.
4. **Bond currency check.** Bonds held in a currency other than `retirement_currency` (or `residence_currency` if retirement is `unknown`) → listed as FX exposure.
5. **Transfer cost.** `annual_current = 12 × (monthly_volume_usd × spread_pct / 100 + transfers_per_month × fixed_fees_per_transfer_usd)`. If `alternative_quote`: `annual_alt` with the same formula; `saving = annual_current − annual_alt`.
6. **Forward-hedge candidates:** each `future_liability` where currency ∉ income currencies, `due_date` is 90–365 days after `review_date`, and USD value ≥ 10% of annual income. If USD value > $250,000 or due > 365 days, mark "route to FX desk".

### Decision rules

Every matching row becomes an action; the first matching row is the headline. Evaluate top to bottom.

| # | Condition | Action |
|---|---|---|
| 1 | Income or liability data missing | No analysis — ask |
| 2 | A future liability > $250,000 or due > 365 days in a non-income currency | Route to a corporate-FX desk or FX-experienced advisor |
| 3 | A forward-hedge candidate exists (step 6) | Lock a forward for up to 100% of that liability — never more |
| 4 | `misallocated_pct > 0` | Move the emergency fund into `residence_currency` |
| 5 | `saving ≥ max($100, 0.25% × 12 × monthly_volume_usd)` | Switch transfers to `alternative_quote.provider` |
| 6 | No alternative quote and `spread_pct ≥ 1.0` | Get a quote from a low-spread provider (spread measured above 1%) |
| 7 | `mismatch_pct ≥ 25` | Hold 12 months of each uncovered currency gap in that currency |
| 8 | Otherwise | No change — exposure is matched |

### Output template

```markdown
# Currency / FX Exposure — {review_date}

## Headline
Mismatch **{mismatch_pct}%** of 12-month outflows; transfer cost **${annual_current}/yr**. Headline action: **{rule # action}**.

## Currency map (USD at {rate source})
| Currency | Income 12m | Liabilities 12m | Gap | Assets |
|---|---|---|---|---|

## Emergency fund and short-term goals
| Currency | Current | Target | Change |
|---|---|---|---|

## Long-term portfolio currency check
{equity reassurance + bond-currency flags — or "No bond FX exposure"}

## Transfer cost
| Method | Spread % | Fixed fees/yr | Annual cost |
|---|---|---|---|
| Current ({method}) | | | |
| Alternative ({provider}) | | | |
{or "Alternative: Not applicable — no quote supplied"}

## Hedge recommendation
{forward details per candidate — or "Not applicable — no defined non-income-currency liability in the 3–12 month window"}

## Action list
| # | Action | Rule |
|---|---|---|

Educational. Do not hedge more than the underlying liability.
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).