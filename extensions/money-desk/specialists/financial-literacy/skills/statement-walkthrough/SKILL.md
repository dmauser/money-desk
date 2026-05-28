## Statement Walkthrough

description: Generic decode of a personal-finance statement — brokerage / 401(k) / mortgage / Explanation of Benefits (EOB) — what every line means, what to ignore, what to verify, and the 3-5 questions to ask if something looks off. Document-literacy, not portfolio analysis.

## When to use

- "I got my first brokerage / 401(k) / EOB statement and don't understand what I'm looking at."
- User encounters a line they don't recognize and wants the decoder.
- Before running **Portfolio Review** (Investing Advisor) or **Withholding Check** (Tax Planner) on the underlying account — set the document literacy first.

## Inputs needed

- The statement type (brokerage / 401(k) / mortgage / EOB / other) — required.
- The lines the user is confused about — optional but helpful.
- The actual statement (with SSN / full account numbers masked) — preferred.

## Workflow

1. **Identify statement type** and the four-or-five universal sections it has.
2. **Walk the headers / summary box** first (the user's eye usually skips it).
3. **Walk the body** section by section.
4. **Flag the verify-this lines** — fees, balances, beneficiaries, allocations.
5. **One question to ask the custodian if anything looks off.**

## Brokerage statement (Schwab / Fidelity / Vanguard / IBKR / etc.)

Universal sections:
- **Account summary / header** — beginning value, deposits, withdrawals, dividends/interest, market change, ending value. The "Time-Weighted Return" or "Money-Weighted Return" if shown; default is usually MWR (your personal return, including the effect of timing of deposits) — TWR is the "fund-equivalent" return.
- **Holdings** — each position: ticker, shares, price, market value, % of portfolio, cost basis, unrealized gain/loss. **Cost basis matters at tax time** — flag if any position shows "noncovered" (broker doesn't have to report it to IRS; you do).
- **Activity / transactions** — every trade, deposit, withdrawal, dividend, capital gain distribution, reinvestment, fee.
- **Realized gains/losses (YTD)** — what you'll owe tax on (short-term taxed as ordinary income; long-term at preferential rate). If this number is unexpectedly high, you may have triggered cap-gains from a fund's internal distribution (not a sale you initiated).
- **Fees / expenses (often a footer)** — account maintenance, advisor fees, ADR fees, transfer fees. Mutual-fund expense ratios are NOT on the statement — they're deducted inside the fund.

Verify:
- Cost basis on every position (especially after a transfer-in from another broker — often arrives blank or wrong).
- Beneficiary on the account (annual check — most-common single mistake in estate planning).
- Reinvestment setting per position matches your intent.

Common gotcha:
- The "return" headline often understates by ignoring the dollar value of unreinvested dividends sitting in your sweep account, or overstates by reinvesting EVERYTHING into the position price at year-end. Pull the time-weighted return for an apples-to-apples comparison.

## 401(k) statement

Universal sections:
- **Account summary** — your contributions YTD (by source: pre-tax / Roth / after-tax), employer contributions YTD (by source: match / profit-sharing / true-up), beginning balance, ending balance, change.
- **Allocation by source.** Pre-tax / Roth / after-tax / employer match — each tracked separately because tax treatment differs at withdrawal.
- **Allocation by fund.** Each fund: ticker if available, expense ratio (this one IS often on the 401(k) statement, sometimes only in the annual fee disclosure), % of balance.
- **Loans (if applicable)** — outstanding loan balance, repayment schedule, interest paid to yourself.
- **Vesting** — your vested % of employer contributions. Match is usually 100% immediately or graded over 2-6 years; profit-sharing is often 3-year cliff or 6-year graded. Leaving before vested = leaving money on the table.

Verify:
- Employer match captured fully — call payroll if your contribution % is below the match threshold.
- Vesting schedule matches the SPD (Summary Plan Description).
- True-up: if you front-load contributions and hit the $23,500 limit mid-year, your match should "true up" at year-end if your plan has that feature — most do but not all.
- Beneficiary (annual check — federal ERISA preempts state; spouse is default beneficiary regardless of will).

Common gotcha:
- "Vested balance" vs "total balance" — only the vested portion is yours if you leave today.
- 401(k) loans are repaid with AFTER-tax money but the original loaned amount was pre-tax — so retirement withdrawals of the repaid amount get taxed AGAIN. (Worth understanding before taking a loan.)

## Mortgage statement

Universal sections:
- **Payment summary** — principal, interest, escrow (taxes + insurance), total payment, due date. Watch for any "principal-only" extras applied differently than you intended.
- **Loan balance** — beginning, principal paid YTD, ending. In the first ~5-7 years of a 30-year, most of each payment is interest — don't be surprised.
- **Escrow account** — current balance, year's projected disbursements (property tax due dates, hazard insurance renewal date), any shortage / surplus. Servicer must do an annual escrow analysis; shortages roll into a higher payment for 12 months.
- **PMI** (if LTV > 80%) — monthly amount. **Removable at 80% LTV by request, automatic at 78%** — you have to ASK at 80%. Watch this.
- **Year-end summary (sent in January)** — Form 1098 amounts: interest paid, points (if applicable), property taxes paid through escrow. These go on Schedule A if itemizing.

Verify:
- Property tax assessment ($X assessed value × millage) — if assessed value is wrong (often after a market downturn), file an appeal.
- Hazard insurance premium — re-shop every 2-3 years; carriers price-walk.
- LTV calc — if home value has risen and you're now at 80%, request PMI removal in writing.

Common gotcha:
- An "extra principal" payment applied as "next month's payment" instead of principal-only — read the form carefully or use the servicer's "principal-only" option specifically.
- Escrow surplus check — when refunded, this can be a flag that your insurance / tax payment dropped; nice surprise.

## Explanation of Benefits (EOB) — health insurance

Universal sections (this is NOT a bill):
- **Provider** — who saw you / what facility.
- **Date of service** — when.
- **Billed amount** — what the provider charged (high; mostly fiction).
- **Plan / network discount** — the contracted reduction the insurer negotiated. This is the value of being in-network.
- **Allowed amount** — what the insurer agrees is the fair price for the service. **This is the number your deductible / coinsurance applies to** — NOT the billed amount.
- **Deductible applied** — how much of the allowed amount you owe because you haven't hit your deductible yet.
- **Coinsurance / copay** — your share after deductible.
- **Plan paid** — what the insurer paid the provider.
- **Patient responsibility / "what you may owe"** — the bottom line. Compare to what the provider ACTUALLY bills you on the separate paper bill.

Verify:
- In-network vs out-of-network classification — wrong classification = much higher cost; appeal.
- Service codes (CPT / HCPCS) match what you actually received — coding errors are extremely common.
- Pre-authorization status if the procedure required one — denials for "no pre-auth" are appealable if the provider failed to obtain it.
- The provider bill matches your patient responsibility on the EOB — if the bill is higher, ask the provider's billing office why.

Common gotcha:
- The EOB **looks like** a bill but isn't — it says "this is not a bill" somewhere. Don't pay it; pay the provider's actual bill, and only AFTER reconciling against the EOB.
- "Balance billing" / "surprise billing" — for emergencies and most non-emergency care from out-of-network providers AT in-network facilities, the No Surprises Act (2022) protects you. If a bill exceeds what your EOB says you owe, the No Surprises Act dispute process is your friend.

## Output template

```
# {Statement type} walkthrough — {provider} statement dated {date}

## Top-line read
{1-paragraph summary of what this statement says happened}

## Section-by-section

### {Section 1 name}
{plain-language decode of what each line means}
**Verify:** {specific things to check}

### {Section 2}
...

## Red flags I'd push back on
- {issue 1, with the specific ask}
- {issue 2}

## What to do next
{ONE specific next step — usually either: (a) action with custodian/provider, (b) hand off to a diagnostic specialist}
```

## Citations

- Brokerage: FINRA's Investor Education on reading a brokerage statement; SEC Investor.gov.
- 401(k): ERISA disclosure requirements (DOL Pub on 404a-5 fee disclosures); your plan's Summary Plan Description (SPD).
- Mortgage: CFPB "Your Mortgage Statement" guide; RESPA escrow rules.
- EOB: CMS / No Surprises Act regulations; your plan's Summary of Benefits and Coverage (SBC).
- `[UNSOURCED]` for any claim you can't trace; flag "verify".

## Disclaimer

Document literacy only. Whether your portfolio allocation is right, your withholding is correct, your mortgage rate should be refinanced, or your insurance plan is the right one — those are the diagnostic specialists' calls. Hand off after the document makes sense.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).