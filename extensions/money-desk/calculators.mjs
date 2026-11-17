// Deterministic calculators served by the `md_calc` tool.
//
// Skills spell out their math in `### Calculation method`, but a model doing
// multi-year arithmetic in its head drifts. These functions run that same
// math in code so identical inputs always give identical numbers.
//
// Rules for this file:
//   - Pure: no I/O, no Date.now(), no randomness. `facts` (facts-2026.json)
//     is passed in by the caller.
//   - Money is computed in integer cents and reported in dollars.
//   - Each calculator mirrors the Calculation method of the skill named in
//     its `skill` field; change them together.
//   - Bad input throws CalcError (the tool turns it into a failure result).

export class CalcError extends Error {}

// ── helpers ────────────────────────────────────────────────────────────

const cents = (usd) => Math.round(usd * 100);
const usd = (c) => Math.round(c) / 100;

function num(obj, key, { required = true, min = -Infinity, max = Infinity, dflt } = {}) {
    const v = obj?.[key];
    if (v === undefined || v === null || v === "") {
        if (required) throw new CalcError(`Missing required number: \`${key}\``);
        return dflt;
    }
    const n = typeof v === "string" ? Number(v.replace(/[$,%\s]/g, "")) : v;
    if (typeof n !== "number" || !Number.isFinite(n)) throw new CalcError(`\`${key}\` must be a number (got ${JSON.stringify(v)})`);
    if (n < min || n > max) throw new CalcError(`\`${key}\` must be between ${min} and ${max} (got ${n})`);
    return n;
}

function int(obj, key, opts) {
    const n = num(obj, key, opts);
    if (n !== undefined && !Number.isInteger(n)) throw new CalcError(`\`${key}\` must be a whole number (got ${n})`);
    return n;
}

function parseYm(s, key) {
    const m = /^(\d{4})-(\d{2})$/.exec(String(s ?? ""));
    if (!m || +m[2] < 1 || +m[2] > 12) throw new CalcError(`\`${key}\` must be YYYY-MM (got ${JSON.stringify(s)})`);
    return +m[1] * 12 + (+m[2] - 1);
}
const fmtYm = (idx) => `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, "0")}`;

// Level payment for a fully amortizing loan, in cents.
function levelPayment(principalC, ratePct, n) {
    const r = ratePct / 100 / 12;
    if (r === 0) return Math.round(principalC / n);
    return Math.round((principalC * r) / (1 - Math.pow(1 + r, -n)));
}

// Month-by-month amortization over at most `n` months. Returns per-month rows
// (cents). The payment in month `n` absorbs any rounding residue, as a real
// schedule's final payment does.
function amortize(principalC, ratePct, paymentC, n) {
    const r = ratePct / 100 / 12;
    const rows = [];
    let bal = principalC;
    for (let m = 1; m <= n && bal > 0; m++) {
        const interest = Math.round(bal * r);
        const due = bal + interest;
        const paid = m === n ? due : Math.min(paymentC, due);
        if (m < n && paid <= interest && due > paymentC) throw new CalcError("Payment does not cover monthly interest — the loan never pays off.");
        bal = due - paid;
        rows.push({ m, interest, paid, bal });
    }
    return rows;
}

// ── debt_payoff (Debt Strategist → Payoff Plan) ────────────────────────

function simulateDebts(debts, order, budgetC, startIdx) {
    const bal = debts.map((d) => d.balanceC);
    const payoffMonth = debts.map((d) => (d.balanceC === 0 ? 0 : null));
    let totalInterest = 0;
    let first = null;
    let last = null;
    let m = 0;
    while (bal.some((b) => b > 0) && m < 600) {
        m++;
        const monthIdx = startIdx === null ? null : startIdx + m - 1;
        const interest = debts.map((d, i) => {
            if (bal[i] <= 0) return 0;
            const promo = d.promoAprPct !== undefined && (d.promoEndIdx === null || monthIdx === null || monthIdx <= d.promoEndIdx);
            const rate = promo ? d.promoAprPct : d.aprPct;
            return Math.round((bal[i] * rate) / 100 / 12);
        });
        interest.forEach((x, i) => (bal[i] += x));
        totalInterest += interest.reduce((a, b) => a + b, 0);
        const before = [...bal];
        let paid = 0;
        const payments = debts.map((d, i) => {
            const p = Math.min(d.minC, bal[i]);
            bal[i] -= p;
            paid += p;
            return p;
        });
        let extra = budgetC - paid;
        for (const i of order) {
            if (extra <= 0) break;
            if (bal[i] <= 0) continue;
            const p = Math.min(extra, bal[i]);
            bal[i] -= p;
            payments[i] += p;
            extra -= p;
        }
        bal.forEach((b, i) => {
            if (b === 0 && payoffMonth[i] === null) payoffMonth[i] = m;
        });
        const row = { m, interest, before, payments, after: [...bal] };
        if (m === 1) first = row;
        last = row;
    }
    return { months: m, paidOff: bal.every((b) => b === 0), totalInterest, payoffMonth, first, last };
}

function debtPayoff(p) {
    if (!Array.isArray(p.debts) || p.debts.length === 0) throw new CalcError("`debts` must be a non-empty list.");
    const startIdx = p.start_yyyy_mm ? parseYm(p.start_yyyy_mm, "start_yyyy_mm") : null;
    const debts = p.debts.map((d, i) => {
        const name = String(d.name ?? `Debt ${i + 1}`);
        const promoAprPct = num(d, "promo_apr_pct", { required: false, min: 0, max: 100 });
        const promoEndIdx = d.promo_end_yyyy_mm ? parseYm(d.promo_end_yyyy_mm, `debts[${i}].promo_end_yyyy_mm`) : null;
        if (promoEndIdx !== null && startIdx === null) {
            throw new CalcError("`start_yyyy_mm` is required when a debt has `promo_end_yyyy_mm`.");
        }
        return {
            name,
            balanceC: cents(num(d, "balance_usd", { min: 0 })),
            aprPct: num(d, "apr_pct", { min: 0, max: 100 }),
            minC: cents(num(d, "min_payment_usd", { min: 0 })),
            promoAprPct,
            promoEndIdx,
            deferred: d.deferred_interest === true,
            forgiveness: d.forgiveness_track === true,
        };
    });
    const budgetC = cents(num(p, "monthly_budget_usd", { min: 0 }));
    const pref = p.method_preference ?? "undecided";
    if (!["avalanche", "snowball", "undecided"].includes(pref)) throw new CalcError("`method_preference` must be avalanche, snowball or undecided.");

    const totalStart = debts.reduce((a, d) => a + d.balanceC, 0);
    const minimums = debts.reduce((a, d) => a + Math.min(d.minC, d.balanceC), 0);
    if (minimums > budgetC) {
        return {
            feasible: false,
            minimums_total_usd: usd(minimums),
            monthly_budget_usd: usd(budgetC),
            shortfall_usd: usd(minimums - budgetC),
            recommendation: { method: null, rule: 1, reason: "Minimum payments exceed the monthly budget — no plan; Budget Coach first." },
        };
    }

    const idx = debts.map((_, i) => i).filter((i) => !debts[i].forgiveness);
    const byName = (a, b) => debts[a].name.localeCompare(debts[b].name, "en");
    const baseOrder = {
        avalanche: [...idx].sort((a, b) => debts[b].aprPct - debts[a].aprPct || debts[a].balanceC - debts[b].balanceC || byName(a, b)),
        snowball: [...idx].sort((a, b) => debts[a].balanceC - debts[b].balanceC || debts[b].aprPct - debts[a].aprPct || byName(a, b)),
    };

    const run = (method) => {
        let order = baseOrder[method];
        let sim = simulateDebts(debts, order, budgetC, startIdx);
        // Deferred-interest override: a deferred-interest debt that would not be
        // cleared by its promo end moves to the front of the order.
        const late = order.filter((i) => {
            const d = debts[i];
            if (!d.deferred || d.promoEndIdx === null) return false;
            const pm = sim.payoffMonth[i];
            return pm === null || startIdx + pm - 1 > d.promoEndIdx;
        });
        const overrides = late.map((i) => debts[i].name);
        if (late.length) {
            late.sort((a, b) => debts[a].promoEndIdx - debts[b].promoEndIdx || byName(a, b));
            order = [...late, ...order.filter((i) => !late.includes(i))];
            sim = simulateDebts(debts, order, budgetC, startIdx);
        }
        const firstPayoff = Math.min(...sim.payoffMonth.filter((m) => m !== null && m > 0), Infinity);
        const line = (row) =>
            row &&
            debts
                .map(
                    (d, i) =>
                        `${d.name}: ${usd(row.before[i] - row.interest[i]).toFixed(2)} + interest ${usd(row.interest[i]).toFixed(2)} − payment ${usd(row.payments[i]).toFixed(2)} = ${usd(row.after[i]).toFixed(2)}`,
                )
                .join("; ");
        return {
            method,
            pays_off: sim.paidOff,
            months: sim.paidOff ? sim.months : null,
            debt_free_yyyy_mm: sim.paidOff && startIdx !== null ? fmtYm(startIdx + sim.months - 1) : null,
            total_interest_usd: Math.round(usd(sim.totalInterest)),
            first_payoff_month: Number.isFinite(firstPayoff) ? firstPayoff : null,
            order: order.map((i) => debts[i].name),
            deferred_interest_overrides: overrides,
            payoff: debts.map((d, i) => ({
                debt: d.name,
                month: sim.payoffMonth[i],
                yyyy_mm: sim.payoffMonth[i] && startIdx !== null ? fmtYm(startIdx + sim.payoffMonth[i] - 1) : null,
            })),
            verification: { month_1: line(sim.first), [`month_${sim.months}`]: line(sim.last) },
            _interestC: sim.totalInterest,
        };
    };

    const av = run("avalanche");
    const sn = run("snowball");
    const interestGapC = sn._interestC - av._interestC;
    const firstWinGap = (av.first_payoff_month ?? 0) - (sn.first_payoff_month ?? 0);
    const thresholdC = Math.max(25000, Math.round(totalStart * 0.01));
    let rec;
    if (pref !== "undecided") rec = { method: pref, rule: 2, reason: `User preference. Interest gap (snowball − avalanche) = $${Math.round(usd(interestGapC))}.` };
    else if (interestGapC <= thresholdC && firstWinGap >= 3)
        rec = { method: "snowball", rule: 3, reason: `Interest gap $${Math.round(usd(interestGapC))} ≤ $${Math.round(usd(thresholdC))} and first payoff comes ${firstWinGap} months sooner.` };
    else rec = { method: "avalanche", rule: 4, reason: `Otherwise: interest gap $${Math.round(usd(interestGapC))}, first-win gap ${firstWinGap} months.` };

    delete av._interestC;
    delete sn._interestC;
    return {
        feasible: true,
        total_starting_balance_usd: Math.round(usd(totalStart)),
        minimums_total_usd: usd(minimums),
        avalanche: av,
        snowball: sn,
        interest_gap_usd: Math.round(usd(interestGapC)),
        first_win_gap_months: firstWinGap,
        snowball_threshold_usd: Math.round(usd(thresholdC)),
        recommendation: rec,
        excluded_from_extra: debts.filter((d) => d.forgiveness).map((d) => d.name),
        notes: [
            "Monthly APR/12 convention; minimums held at today's value; no new charges.",
            "Retroactive deferred-interest charges are not modelled — the override exists to clear those debts before the promo ends.",
            ...(startIdx === null ? ["No `start_yyyy_mm` given: month numbers only, no calendar dates."] : []),
        ],
    };
}

// ── loan_amortization ──────────────────────────────────────────────────

function loanAmortization(p) {
    const principalC = cents(num(p, "principal_usd", { min: 0.01 }));
    const ratePct = num(p, "rate_pct", { min: 0, max: 100 });
    const n = int(p, "term_months", { min: 1, max: 600 });
    const extraC = cents(num(p, "extra_monthly_usd", { required: false, min: 0, dflt: 0 }));
    const at = Array.isArray(p.balance_at_months) ? p.balance_at_months.map((x) => int({ x }, "x", { min: 0, max: 600 })) : [];

    const pmt = levelPayment(principalC, ratePct, n);
    const summarize = (rows) => ({
        payoff_months: rows.length,
        total_interest_usd: Math.round(usd(rows.reduce((a, r) => a + r.interest, 0))),
        total_paid_usd: Math.round(usd(rows.reduce((a, r) => a + r.paid, 0))),
    });
    const base = amortize(principalC, ratePct, pmt, n);
    const out = {
        monthly_payment_usd: usd(pmt),
        scheduled: summarize(base),
        balance_at_months: Object.fromEntries(at.map((m) => [m, Math.round(usd(m === 0 ? principalC : (base[m - 1]?.bal ?? 0)))])),
        notes: ["Fixed rate, monthly compounding at rate/12, payment rounded to the cent; the final payment absorbs rounding."],
    };
    if (extraC > 0) {
        const fast = amortize(principalC, ratePct, pmt + extraC, n);
        out.with_extra = {
            extra_monthly_usd: usd(extraC),
            ...summarize(fast),
            months_saved: base.length - fast.length,
            interest_saved_usd: Math.round(usd(base.reduce((a, r) => a + r.interest, 0) - fast.reduce((a, r) => a + r.interest, 0))),
        };
    }
    return out;
}

// ── refinance (Debt Strategist → Refinance Analysis, steps 1–8, fixed-rate) ──

function refinance(p) {
    const cur = p.current ?? {};
    const pro = p.proposed ?? {};
    const balC = cents(num(cur, "balance_usd", { min: 0.01 }));
    const curRate = num(cur, "rate_pct", { min: 0, max: 100 });
    const remaining = int(cur, "months_remaining", { min: 1, max: 600 });
    const curPmiC = cents(num(cur, "pmi_monthly_usd", { required: false, min: 0, dflt: 0 }));
    const givenPi = num(cur, "monthly_pi_usd", { required: false, min: 0 });
    const curPiC = givenPi !== undefined ? cents(givenPi) : levelPayment(balC, curRate, remaining);

    const newRate = num(pro, "rate_pct", { min: 0, max: 100 });
    const n = int(pro, "term_months", { min: 1, max: 600 });
    const newPmiC = cents(num(pro, "pmi_monthly_usd", { required: false, min: 0, dflt: 0 }));

    // Cost fields live under `proposed` / `current` in the skill's Input keys;
    // top-level is accepted too.
    const from = (o, k) => (o[k] !== undefined ? o : p);
    const closingC = cents(num(from(pro, "closing_costs_usd"), "closing_costs_usd", { min: 0 }));
    const creditsC = cents(num(from(pro, "lender_credits_usd"), "lender_credits_usd", { required: false, min: 0, dflt: 0 }));
    const penaltyC = cents(num(from(cur, "prepayment_penalty_usd"), "prepayment_penalty_usd", { required: false, min: 0, dflt: 0 }));
    const cashOutC = cents(num(from(pro, "cash_out_usd"), "cash_out_usd", { required: false, min: 0, dflt: 0 }));
    const cashInC = cents(num(from(pro, "cash_in_usd"), "cash_in_usd", { required: false, min: 0, dflt: 0 }));
    const hold = int(p, "hold_months", { min: 1, max: 600 });
    const d = num(p, "discount_rate_pct", { required: false, min: 0, max: 100, dflt: curRate }) / 100;

    const newPrincipalC = balC + cashOutC - cashInC; // step 1
    if (newPrincipalC <= 0) throw new CalcError("New principal is not positive after cash-in.");
    const newPiC = levelPayment(newPrincipalC, newRate, n); // step 2
    const savingC = curPiC + curPmiC - (newPiC + newPmiC); // step 3
    const upfrontC = closingC - creditsC + penaltyC; // step 4
    const breakEven = savingC > 0 ? Math.ceil(upfrontC / savingC) : null; // step 5

    // ARM (step 6): the current loan re-amortizes at `reset_rate_pct` over its
    // remaining term once `arm_reset_in_months` payments have been made.
    const resetIn = int(cur, "arm_reset_in_months", { required: false, min: 0, max: 600 });
    const resetRate = num(cur, "reset_rate_pct", { required: resetIn !== undefined, min: 0, max: 100 });
    const isArm = resetIn !== undefined && resetIn < remaining;
    let oldRows = amortize(balC, curRate, curPiC, remaining);
    let resetPiC = null;
    if (isArm) {
        const head = oldRows.slice(0, resetIn);
        const balAtReset = resetIn === 0 ? balC : head[head.length - 1].bal;
        resetPiC = levelPayment(balAtReset, resetRate, remaining - resetIn);
        const tail = amortize(balAtReset, resetRate, resetPiC, remaining - resetIn).map((r) => ({ ...r, m: r.m + resetIn }));
        oldRows = [...head, ...tail];
    }
    const newRows = amortize(newPrincipalC, newRate, newPiC, n);
    const sumPaid = (rows, k) => rows.slice(0, k).reduce((a, r) => a + r.paid, 0);
    const balAt = (rows, k, start) => (k === 0 ? start : (rows[Math.min(k, rows.length) - 1]?.bal ?? 0));
    const ko = Math.min(hold, oldRows.length);
    const kn = Math.min(hold, newRows.length);
    const oldCost = sumPaid(oldRows, ko) + curPmiC * ko + balAt(oldRows, ko, balC); // step 6
    const newCost = upfrontC + sumPaid(newRows, kn) + newPmiC * kn + balAt(newRows, kn, newPrincipalC) - cashOutC + cashInC;
    const interest = (rows) => rows.reduce((a, r) => a + r.interest, 0); // step 7
    let npv = -upfrontC; // step 8
    let armBreakEven = null;
    if (isArm) {
        // Savings change at the reset, so use each month's actual payments.
        let cum = 0;
        for (let t = 1; t <= Math.min(hold, n); t++) {
            const oldPay = (oldRows[t - 1]?.paid ?? 0) + (t <= oldRows.length ? curPmiC : 0);
            const newPay = (newRows[t - 1]?.paid ?? 0) + (t <= newRows.length ? newPmiC : 0);
            npv += (oldPay - newPay) / Math.pow(1 + d / 12, t);
        }
        for (let t = 1; t <= Math.max(remaining, n) && armBreakEven === null; t++) {
            cum += (oldRows[t - 1]?.paid ?? 0) + (t <= oldRows.length ? curPmiC : 0) - (newRows[t - 1]?.paid ?? 0) - (t <= newRows.length ? newPmiC : 0);
            if (cum >= upfrontC) armBreakEven = t;
        }
    } else {
        for (let t = 1; t <= Math.min(hold, n); t++) npv += savingC / Math.pow(1 + d / 12, t);
    }

    return {
        new_principal_usd: Math.round(usd(newPrincipalC)),
        current_monthly_pi_usd: usd(curPiC),
        new_monthly_pi_usd: usd(newPiC),
        monthly_saving_usd: usd(savingC),
        ...(isArm
            ? {
                  arm: {
                      reset_in_months: resetIn,
                      reset_rate_pct: resetRate,
                      current_monthly_pi_after_reset_usd: usd(resetPiC),
                      monthly_saving_after_reset_usd: usd(resetPiC + curPmiC - (newPiC + newPmiC)),
                  },
              }
            : {}),
        net_upfront_cost_usd: Math.round(usd(upfrontC)),
        break_even_months: isArm ? armBreakEven : breakEven,
        hold_months: hold,
        hold_period: { old_cost_usd: Math.round(usd(oldCost)), new_cost_usd: Math.round(usd(newCost)), saving_usd: Math.round(usd(oldCost - newCost)) },
        lifetime_interest: {
            old_usd: Math.round(usd(interest(oldRows))),
            new_usd: Math.round(usd(interest(newRows))),
            delta_usd: Math.round(usd(interest(oldRows) - interest(newRows))),
        },
        npv_usd: Math.round(usd(npv)),
        discount_rate_pct: +(d * 100).toFixed(4),
        notes: [
            "ARM: pass `arm_reset_in_months` and `reset_rate_pct` under `current`; the current loan then re-amortizes at the reset rate over its remaining term, and break-even / NPV use each month's actual payments. One reset is modelled.",
            "PMI is treated as constant and included in hold-period payments.",
            "Steps 9–10 (term-match, sensitivity): call this calculator again with the changed inputs.",
        ],
    };
}

// ── rmd (Retirement Planner → RMD Planner, steps 1–2) ──────────────────

const IRA_TYPES = new Set(["traditional_ira", "rollover_ira", "sep_ira", "simple_ira"]);
const ROTH_TYPES = new Set(["roth_ira", "roth_401k"]);

function rmd(p, facts) {
    const table = facts?.rmd_and_qcd_2026?.uniform_lifetime_table_distribution_period;
    if (!table) throw new CalcError("RMD divisor table missing from md_facts (rmd_and_qcd_2026).");
    const age = int(p, "age_at_year_end", { min: 18, max: 130 });
    const birthYear = int(p, "birth_year", { min: 1900, max: 2100 });
    if (!Array.isArray(p.accounts) || p.accounts.length === 0) throw new CalcError("`accounts` must be a non-empty list.");
    const rmdAge = birthYear >= 1960 ? facts.rmd_and_qcd_2026.rmd_start_age_born_1960_or_later : facts.rmd_and_qcd_2026.rmd_start_age_born_1951_to_1959;
    const startAge = birthYear < 1951 ? null : rmdAge;
    const required = startAge === null || age >= startAge;
    const divisor = required ? table[String(Math.min(age, 120))] : null;
    if (required && !divisor) throw new CalcError(`No Uniform Lifetime divisor for age ${age}.`);

    const accounts = p.accounts.map((a, i) => {
        const type = String(a.type ?? "");
        const balC = cents(num(a, "prior_year_end_balance_usd", { min: 0 }));
        let reason = null;
        if (ROTH_TYPES.has(type)) reason = "Roth — no lifetime RMD for the original owner";
        else if (!required) reason = `Under RMD age (${startAge})`;
        else if (a.still_working_exception === true && !IRA_TYPES.has(type)) reason = "Still-working exception";
        const group = IRA_TYPES.has(type) ? "IRAs (aggregate — may be taken from any IRA)" : type === "403b" ? "403(b)s (aggregate among 403(b)s)" : `${a.name ?? type} (take from this plan)`;
        return { name: String(a.name ?? `Account ${i + 1}`), type, balance_usd: usd(balC), rmd_usd: reason ? 0 : usd(Math.round(balC / divisor)), excluded_reason: reason, group };
    });
    const groups = {};
    for (const a of accounts) if (!a.excluded_reason) groups[a.group] = usd(cents((groups[a.group] ?? 0) + a.rmd_usd));
    return {
        age_at_year_end: age,
        rmd_start_age: startAge ?? "already in RMD status (born before 1951)",
        rmd_required_this_year: required,
        divisor,
        accounts,
        withdrawal_groups: groups,
        total_rmd_usd: usd(cents(accounts.reduce((a, x) => a + x.rmd_usd, 0))),
        source: "[IRS Pub 590-B Table III via md_facts rmd_and_qcd_2026]",
        notes: [
            "Uniform Lifetime Table only. If the sole beneficiary is a spouse more than 10 years younger, use the Joint Life table (Pub 590-B Table II) instead.",
            "Inherited accounts follow different rules and are out of scope.",
        ],
    };
}

// ── retirement_projection (Retirement Planner → Retirement Projection, steps 1–9) ──

function retirementProjection(p) {
    const cur = int(p, "current_age", { min: 18, max: 100 });
    const ret = int(p, "target_retire_age", { min: cur, max: 100 });
    const plan = int(p, "planning_age", { min: ret + 1, max: 120 });
    const r = num(p, "expected_real_return_pct", { min: -20, max: 30 }) / 100;
    const contrib = num(p, "annual_contribution", { min: 0 });
    const spend = num(p, "target_annual_spend", { min: 0 });
    const ssMonthly = num(p, "ss_monthly_estimate", { required: false, min: 0, dflt: 0 });
    const ssAge = int(p, "ss_claim_age", { required: ssMonthly > 0, min: 62, max: 70, dflt: 67 });
    const other = num(p, "other_income_annual_usd", { required: false, min: 0, dflt: 0 });
    const otherStart = int(p, "other_income_start_age", { required: false, dflt: ret });
    const otherEnd = int(p, "other_income_end_age", { required: false, dflt: plan });
    const balanceKeys = ["trad_401k_balance", "roth_balance", "trad_ira_balance", "taxable_balance", "hsa_balance"];
    let b0 = num(p, "starting_balance", { required: false, min: 0 });
    if (b0 === undefined) {
        if (!balanceKeys.some((k) => p[k] !== undefined)) throw new CalcError(`Provide \`starting_balance\` or at least one of: ${balanceKeys.join(", ")}`);
        b0 = balanceKeys.reduce((a, k) => a + num(p, k, { required: false, min: 0, dflt: 0 }), 0);
    }

    const need = (a, s) => Math.max(0, s - (a >= ssAge ? ssMonthly * 12 : 0) - (a >= otherStart && a <= otherEnd ? other : 0));

    // Steps 1–3 with adjustable levers; firstYearShock applies to the first decumulation year only.
    const project = ({ rate = r, s = spend, c = contrib, retireAt = ret, shock = null } = {}) => {
        let B = b0;
        for (let a = cur; a < retireAt; a++) B = B * (1 + rate) + c;
        const atRet = B;
        let depletion = null;
        for (let a = retireAt; a < plan; a++) {
            const yr = shock !== null && a === retireAt ? shock : rate;
            B = B * (1 + yr) - need(a, s);
            if (B < 0) {
                depletion ??= a;
                B = 0;
            }
        }
        return { atRet, terminal: depletion === null ? B : 0, depletion };
    };
    const base = project();
    let req = 0; // step 4
    for (let a = ret; a < plan; a++) req += need(a, spend) / Math.pow(1 + r, a - ret + 1);

    // Step 6 — coast age.
    let coastAge = null;
    {
        let B = b0;
        for (let c = cur; c <= ret; c++) {
            if (B * Math.pow(1 + r, ret - c) >= req) {
                coastAge = c;
                break;
            }
            B = B * (1 + r) + contrib;
        }
    }

    const R = (x) => Math.round(x);
    const sensitivity = [-0.01, 0, 0.01].map((dr) => ({
        real_return_pct: +((r + dr) * 100).toFixed(4),
        terminal_balance_by_spend: Object.fromEntries([-0.1, 0, 0.1].map((ds) => [`${ds > 0 ? "+" : ""}${ds * 100}%`, R(project({ rate: r + dr, s: spend * (1 + ds) }).terminal)])),
    }));
    const stress = project({ shock: -0.3 });

    let levers = null; // step 9
    if (base.depletion !== null) {
        const ok = (o) => project(o).depletion === null;
        let extra = null;
        for (let x = 100; x <= 100000; x += 100) if (ok({ c: contrib + x })) { extra = x; break; }
        let years = null;
        for (let y = 1; y <= 15 && ret + y < plan; y++) if (ok({ retireAt: ret + y })) { years = y; break; }
        let cut = null;
        for (let pc = 1; pc <= 50; pc++) if (ok({ s: spend * (1 - pc / 100) })) { cut = pc; break; }
        const na = "not closable by this lever alone";
        levers = { extra_annual_contribution_usd: extra ?? na, extra_working_years: years ?? na, spend_cut_pct: cut ?? na };
    }

    return {
        starting_balance_usd: R(b0),
        balance_at_retirement_usd: R(base.atRet),
        required_at_retirement_usd: R(req),
        gap_usd: R(req - base.atRet),
        depletion_age: base.depletion,
        terminal_balance_usd: R(base.terminal),
        fire_number_25x_usd: R(25 * spend),
        fire_number_30x_usd: R(30 * spend),
        coast: { is_coast_now: coastAge === cur, coast_age: coastAge ?? "none before retirement" },
        sensitivity,
        stress_test: { first_decumulation_year_real_return_pct: -30, terminal_balance_usd: R(stress.terminal), depletion_age: stress.depletion },
        gap_closing_levers: levers ?? "Not applicable — base case does not deplete",
        notes: ["Real (today's) dollars, annual compounding, end-of-year contributions and withdrawals, one pooled balance.", "Deterministic projection — no success probability."],
    };
}

// ── savings_goal (Net Worth & Goals → Goal-Based Savings Plan, steps 4–5) ──

function savingsGoal(p) {
    const fvC = cents(num(p, "target_usd", { min: 0 }));
    const pvC = cents(num(p, "saved_usd", { required: false, min: 0, dflt: 0 }));
    const n = int(p, "months", { min: 1, max: 1200 });
    const R = num(p, "annual_real_return_pct", { min: -50, max: 50 }) / 100;
    const r = Math.pow(1 + R, 1 / 12) - 1;
    const growth = Math.pow(1 + r, n);
    const raw = r === 0 ? (fvC - pvC) / n : ((fvC - pvC * growth) * r) / (growth - 1);
    const pmt = raw <= 0 ? 0 : Math.ceil(raw / 100 - 1e-9);
    return {
        required_monthly_usd: pmt,
        already_funded: raw <= 0,
        months: n,
        monthly_rate: +r.toFixed(8),
        future_value_of_current_savings_usd: Math.round(usd(pvC * growth)),
        notes: ["End-of-month contributions; monthly rate = (1 + annual)^(1/12) − 1; payment rounded up to the next whole dollar.", "Pass the target in the same (real or nominal) terms as the return."],
    };
}

// ── federal_income_tax (ordinary brackets from md_facts) ───────────────

function federalIncomeTax(p, facts) {
    const t = facts?.income_tax_brackets_mfj_2026;
    const status = String(p.filing_status ?? "").toLowerCase();
    const brackets = { mfj: t?.brackets, single: t?.brackets_single, hoh: t?.brackets_hoh, mfs: t?.brackets_mfs }[status];
    if (!brackets) throw new CalcError("`filing_status` must be one of: mfj, single, hoh, mfs.");
    const incomeC = cents(num(p, "taxable_income_usd", { min: 0 }));
    let taxC = 0;
    let marginal = brackets[0];
    const detail = [];
    for (const b of brackets) {
        const lo = cents(b.min);
        const hi = b.max === null ? Infinity : cents(b.max);
        if (incomeC <= lo) break;
        const slice = Math.min(incomeC, hi) - lo;
        const tax = Math.round(slice * b.rate);
        taxC += tax;
        marginal = b;
        detail.push({ rate_pct: +(b.rate * 100).toFixed(2), taxed_usd: usd(slice), tax_usd: usd(tax) });
    }
    return {
        tax_year: facts._meta?.tax_year,
        filing_status: status,
        taxable_income_usd: usd(incomeC),
        tax_usd: Math.round(usd(taxC)),
        marginal_rate_pct: +(marginal.rate * 100).toFixed(2),
        effective_rate_on_taxable_income_pct: incomeC ? +((taxC / incomeC) * 100).toFixed(2) : 0,
        room_to_top_of_bracket_usd: marginal.max === null ? null : Math.round(usd(cents(marginal.max) - incomeC)),
        by_bracket: detail,
        source: "[IRS 2026 brackets via md_facts income_tax_brackets_mfj_2026]",
        notes: ["Ordinary income tax on taxable income only (after deductions). Excludes LTCG / qualified-dividend rates, NIIT, AMT, credits, and state tax."],
    };
}

// ── rental_property (Real Estate Investor → Rental Property Analyzer) ──

// Internal rate of return for annual cash flows, by bisection. null if the
// flows never change sign or no root lies in (-99%, +1000%).
function irr(flows) {
    if (!(flows.some((x) => x < 0) && flows.some((x) => x > 0))) return null;
    const npv = (rate) => flows.reduce((a, cf, t) => a + cf / Math.pow(1 + rate, t), 0);
    let lo = -0.99;
    let hi = 10;
    if (npv(lo) * npv(hi) > 0) return null;
    for (let i = 0; i < 200 && hi - lo > 1e-7; i++) {
        const mid = (lo + hi) / 2;
        if (npv(lo) * npv(mid) <= 0) hi = mid;
        else lo = mid;
    }
    return (lo + hi) / 2;
}

function rentalProperty(p, facts) {
    const base = {
        price: num(p, "purchase_price", { min: 1 }),
        rehab: num(p, "rehab_budget", { required: false, min: 0, dflt: 0 }),
        closing: num(p, "closing_costs_usd", { min: 0 }),
        downPct: num(p, "down_payment_pct", { min: 0, max: 100 }),
        rate: num(p, "interest_rate", { min: 0, max: 100 }),
        termYears: int(p, "loan_term_years", { required: false, min: 1, max: 50, dflt: 30 }),
        rent: num(p, "gross_monthly_rent", { min: 0 }),
        tax: num(p, "property_tax_annual", { min: 0 }),
        ins: num(p, "insurance_annual", { min: 0 }),
        hoa: num(p, "hoa_monthly", { required: false, min: 0, dflt: 0 }),
        other: num(p, "other_opex_annual_usd", { required: false, min: 0, dflt: 0 }),
        vacancy: num(p, "vacancy_pct", { min: 0, max: 100 }),
        capex: num(p, "capex_pct_of_price", { min: 0, max: 100 }),
        maint: num(p, "maintenance_pct_of_price", { min: 0, max: 100 }),
        mgmt: num(p, "mgmt_pct_of_rent", { min: 0, max: 100 }),
        appreciation: num(p, "appreciation_pct", { required: false, min: -50, max: 50 }),
    };
    const N = int(p, "holding_years", { required: false, min: 1, max: 50, dflt: 10 });
    const proj = {
        rentGrowth: num(p, "rent_growth_pct", { required: false, min: -50, max: 50 }),
        expGrowth: num(p, "expense_growth_pct", { required: false, min: -50, max: 50 }),
        selling: num(p, "selling_cost_pct", { required: false, min: 0, max: 100 }),
        land: num(p, "land_pct", { required: false, min: 0, max: 100 }),
        ltcg: num(p, "ltcg_rate_pct", { required: false, min: 0, max: 100 }),
        ordinary: num(p, "ordinary_marginal_rate_pct", { required: false, min: 0, max: 100 }),
        state: num(p, "state_tax_rate_pct", { required: false, min: 0, max: 100, dflt: 0 }),
        niit: p.niit_applies === true,
    };
    const missingProj = Object.entries({ appreciation_pct: base.appreciation, rent_growth_pct: proj.rentGrowth, expense_growth_pct: proj.expGrowth, selling_cost_pct: proj.selling, land_pct: proj.land, ltcg_rate_pct: proj.ltcg, ordinary_marginal_rate_pct: proj.ordinary })
        .filter(([, v]) => v === undefined)
        .map(([k]) => k);
    const life = facts?.mortgage_and_real_estate_2026?.residential_rental_depreciation_life_years_27_5 ?? 27.5;

    const evaluate = (b) => {
        const loanC = cents(b.price * (1 - b.downPct / 100));
        const n = b.termYears * 12;
        const piC = loanC > 0 ? levelPayment(loanC, b.rate, n) : 0;
        const debtService = usd(piC) * 12; // step 1
        const cashInvested = b.price * (b.downPct / 100) + b.closing + b.rehab; // step 2
        const year = (t) => {
            // Step 7: year 1 uses the inputs as given; later years grow.
            const rg = t === 1 ? 1 : Math.pow(1 + proj.rentGrowth / 100, t - 1);
            const eg = t === 1 ? 1 : Math.pow(1 + proj.expGrowth / 100, t - 1);
            const value = t === 1 ? b.price : b.price * Math.pow(1 + b.appreciation / 100, t - 1); // value at start of year t
            const gsr = 12 * b.rent * rg; // step 3
            const egi = gsr * (1 - b.vacancy / 100);
            const opex = (b.tax + b.ins + 12 * b.hoa + b.other) * eg + (gsr * b.mgmt) / 100 + (value * (b.maint + b.capex)) / 100; // step 4
            const noi = egi - opex; // step 5
            return { gsr, egi, opex, noi, cashFlow: noi - debtService };
        };
        const y1 = year(1);
        const out = {
            monthly_pi_usd: usd(piC),
            debt_service_usd: Math.round(debtService),
            cash_invested_usd: Math.round(cashInvested),
            noi_usd: Math.round(y1.noi),
            cash_flow_usd: Math.round(y1.cashFlow),
            cash_on_cash_pct: cashInvested > 0 ? +((y1.cashFlow / cashInvested) * 100).toFixed(2) : null,
            dscr: debtService > 0 ? +(y1.noi / debtService).toFixed(2) : null,
            _y1: y1,
            irr_pct: null,
        };
        if (missingProj.length === 0) {
            const flows = [-cashInvested];
            for (let t = 1; t <= N; t++) flows.push(year(t).cashFlow);
            const vN = b.price * Math.pow(1 + b.appreciation / 100, N); // step 8
            const saleNet = vN * (1 - proj.selling / 100);
            const rows = loanC > 0 ? amortize(loanC, b.rate, piC, n) : [];
            const k = Math.min(12 * N, rows.length);
            const loanBalance = k === 0 ? usd(loanC) : usd(rows[k - 1].bal);
            const depreciation = ((b.price * (1 - proj.land / 100) + b.rehab) / life) * N;
            const adjustedBasis = b.price + b.closing + b.rehab - depreciation;
            const gain = Math.max(0, saleNet - adjustedBasis);
            const recapture = Math.min(depreciation, gain);
            const tax = (recapture * Math.min(25, proj.ordinary)) / 100 + ((gain - recapture) * proj.ltcg) / 100 + (gain * (proj.niit ? 3.8 : 0)) / 100 + (gain * proj.state) / 100;
            const exitCash = saleNet - loanBalance - tax;
            flows[N] += exitCash;
            const r = irr(flows); // step 9
            out.irr_pct = r === null ? "IRR undefined" : +(r * 100).toFixed(2);
            out.exit = {
                year: N,
                value_usd: Math.round(vN),
                sale_net_usd: Math.round(saleNet),
                loan_balance_usd: Math.round(loanBalance),
                depreciation_total_usd: Math.round(depreciation),
                gain_usd: Math.round(gain),
                recapture_usd: Math.round(recapture),
                tax_usd: Math.round(tax),
                exit_cash_usd: Math.round(exitCash),
            };
            out.annual_cash_flow_usd = flows.slice(1, N + 1).map((x, i) => Math.round(i === N - 1 ? x - exitCash : x));
        }
        return out;
    };

    const b = evaluate(base);
    const y1 = b._y1;
    delete b._y1;
    const capRate = (y1.noi / base.price) * 100; // step 6
    const expenseRatio = y1.gsr > 0 ? (y1.opex / y1.gsr) * 100 : null;
    const slim = (label, o) => ({ case: label, cash_on_cash_pct: o.cash_on_cash_pct, dscr: o.dscr, cash_flow_usd: o.cash_flow_usd, irr_pct: o.irr_pct ?? "Not computed" });
    const sens = [
        ["rent −5%", { ...base, rent: base.rent * 0.95 }],
        ["vacancy 12%", { ...base, vacancy: 12 }],
        ["rate +1.00 pt", { ...base, rate: base.rate + 1 }],
    ].map(([label, x]) => {
        const o = evaluate(x);
        delete o._y1;
        return slim(label, o);
    });
    if (missingProj.length === 0) {
        const o = evaluate({ ...base, appreciation: base.appreciation - 1 });
        sens.push({ case: "appreciation −1.00 pt", irr_pct: o.irr_pct });
    }

    const comps = Array.isArray(p.rent_comps) ? p.rent_comps.length : 0;
    const band = (v, ok, tight) => (v >= ok ? "OK" : v >= tight ? "Tight" : "Fail");
    let verdict;
    if (comps < 2) verdict = { verdict: "No verdict — collect at least 2 rent comps", rule: 1 };
    else if (b.dscr !== null && (b.dscr < 1 || y1.cashFlow < 0)) verdict = { verdict: "Pass", rule: 2 };
    else if (capRate >= 6 && b.cash_on_cash_pct >= 8 && (b.dscr === null || b.dscr >= 1.25) && sens.every((s) => s.cash_flow_usd === undefined || s.cash_flow_usd >= 0)) verdict = { verdict: "Pursue", rule: 3 };
    else if (b.cash_on_cash_pct >= 5 && capRate >= 4 && (b.dscr === null || b.dscr >= 1)) {
        const breaker = sens.find((s) => s.cash_flow_usd !== undefined && s.cash_flow_usd < 0);
        verdict = { verdict: "Marginal", rule: 4, breaks_under: breaker ? breaker.case : "none of the cash-flow sensitivities" };
    } else verdict = { verdict: "Pass", rule: 5 };

    return {
        ...b,
        gross_scheduled_rent_usd: Math.round(y1.gsr),
        effective_gross_income_usd: Math.round(y1.egi),
        operating_expenses_usd: Math.round(y1.opex),
        cap_rate_pct: +capRate.toFixed(2),
        one_pct_rule: +((base.rent / base.price) * 100).toFixed(2),
        expense_ratio_pct: expenseRatio === null ? null : +expenseRatio.toFixed(1),
        flags: [...(expenseRatio !== null && expenseRatio < 35 ? ["Expense ratio under 35% — something is probably missing"] : [])],
        status: { cap_rate: band(capRate, 6, 4), cash_on_cash: band(b.cash_on_cash_pct, 8, 5), dscr: b.dscr === null ? "No debt" : band(b.dscr, 1.25, 1) },
        projection: missingProj.length ? `Not computed — missing: ${missingProj.join(", ")}` : `${N}-year hold`,
        sensitivities: sens,
        verdict,
        notes: [
            "Capex and maintenance reserves are inside operating expenses (workbook convention). Cash flows are before income tax; tax is modelled only at sale.",
            "Percentage-of-price expenses in year t use the value at the start of that year; depreciation is full-year straight-line.",
        ],
    };
}

// ── rent_vs_buy (Purchase Advisor → Rent vs Buy) ───────────────────────

function rentVsBuy(p, facts) {
    const d = facts?.behavioral_assumptions_safe_defaults ?? {};
    const re = facts?.mortgage_and_real_estate_2026 ?? {};
    const tb = facts?.income_tax_brackets_mfj_2026 ?? {};
    const price = num(p, "home_price_usd", { min: 1 });
    const downPct = num(p, "down_payment_pct", { min: 0, max: 100 });
    const rate = num(p, "mortgage_rate_pct", { min: 0, max: 100 });
    const term = int(p, "mortgage_term_years", { min: 1, max: 50 }) * 12;
    const closing = num(p, "purchase_closing_costs_usd", { min: 0 });
    const propTax = num(p, "property_tax_annual_usd", { min: 0 });
    const hoa = num(p, "hoa_monthly_usd", { required: false, min: 0, dflt: 0 });
    const homeIns = num(p, "homeowners_insurance_annual_usd", { min: 0 });
    const maintPct = num(p, "maintenance_pct", { min: 0, max: 100 });
    const pmiPct = num(p, "pmi_annual_pct", { required: downPct < 20, min: 0, max: 100, dflt: 0 });
    const sellPct = num(p, "selling_cost_pct", { min: 0, max: 100 });
    const rent0 = num(p, "monthly_rent_usd", { min: 0.01 });
    const rentIns = num(p, "renters_insurance_annual_usd", { required: false, min: 0, dflt: 0 });
    const horizon = int(p, "horizon_years", { min: 1, max: 60 });
    const status = String(p.filing_status ?? "").toLowerCase();
    const stdDed = { mfj: tb.standard_deduction_mfj, single: tb.standard_deduction_single, hoh: tb.standard_deduction_hoh, mfs: tb.standard_deduction_mfs }[status];
    if (stdDed === undefined) throw new CalcError("`filing_status` must be one of: mfj, single, hoh, mfs.");
    const fedRate = num(p, "marginal_federal_rate_pct", { min: 0, max: 100 });
    const otherItemized = num(p, "other_itemized_deductions_usd", { required: false, min: 0, dflt: 0 });
    const stateTaxPaid = num(p, "state_income_tax_paid_usd", { required: false, min: 0, dflt: 0 });
    const assumed = [];
    const withDefault = (key, factKey) => {
        const v = num(p, key, { required: false, min: -50, max: 50 });
        if (v !== undefined) return v / 100;
        if (typeof d[factKey] !== "number") throw new CalcError(`\`${key}\` is required (md_facts default ${factKey} is missing).`);
        assumed.push(`${key} = ${+(d[factKey] * 100).toFixed(4)}% [ASSUMPTION: md_facts ${factKey}]`);
        return d[factKey];
    };
    const apprReal = withDefault("appreciation_real_pct", "real_estate_appreciation_long_term_real_rate");
    const invReal = withDefault("investment_real_return_pct", "long_term_equity_real_return_rate");
    const infl = withDefault("inflation_pct", "long_term_inflation_rate");
    const rentInflIn = num(p, "rent_inflation_pct", { required: false, min: -50, max: 50 });
    const rentInfl = rentInflIn !== undefined ? rentInflIn / 100 : infl;
    if (rentInflIn === undefined) assumed.push("rent_inflation_pct = inflation [ASSUMPTION]");
    const cap = re.mortgage_interest_deduction_cap_post_tcja ?? 750000;
    const saltCap = status === "mfs" ? (re.salt_cap_married_filing_separately ?? re.salt_cap) : re.salt_cap;
    const exclusion = status === "mfj" ? re.section_121_exclusion_mfj : re.section_121_exclusion_single;

    const years = Math.max(horizon, 30);
    const loanC = cents(price * (1 - downPct / 100));
    const piC = loanC > 0 ? levelPayment(loanC, rate, term) : 0;
    const sched = loanC > 0 ? amortize(loanC, rate, piC, term) : [];

    const run = ({ dAppr = 0, dInv = 0, dRent = 0 } = {}) => {
        const g = (1 + apprReal + dAppr) * (1 + infl) - 1; // step 1
        const i = (1 + invReal + dInv) * (1 + infl) - 1;
        const ri = rentInfl + dRent;
        const gm = Math.pow(1 + g, 1 / 12) - 1;
        const im = Math.pow(1 + i, 1 / 12) - 1;
        let value = price;
        let buyerAcct = 0;
        let renterAcct = price * (downPct / 100) + closing; // step 6, month 0
        const rows = [];
        for (let y = 1; y <= years; y++) {
            const cost = Math.pow(1 + infl, y - 1);
            const rent = rent0 * Math.pow(1 + ri, y - 1);
            let interest = 0;
            let balSum = 0;
            for (let mth = 1; mth <= 12; mth++) {
                const m = (y - 1) * 12 + mth;
                const row = sched[m - 1];
                const balStart = m === 1 ? loanC : (sched[m - 2]?.bal ?? 0);
                const pi = row ? usd(row.paid) : 0;
                interest += row ? usd(row.interest) : 0;
                balSum += usd(balStart);
                const pmi = pmiPct > 0 && usd(balStart) > 0.8 * price ? ((pmiPct / 100) * usd(loanC)) / 12 : 0; // step 3
                const buyOut = pi + ((propTax + homeIns) * cost) / 12 + hoa * cost + (maintPct / 100) * value / 12 + pmi;
                const rentOut = rent + rentIns / 12; // step 5
                buyerAcct = buyerAcct * (1 + im) + Math.max(0, rentOut - buyOut);
                renterAcct = renterAcct * (1 + im) + Math.max(0, buyOut - rentOut);
                value *= 1 + gm;
            }
            // Step 4: year-end tax benefit, credited to the buyer's account.
            const avgBal = balSum / 12;
            const itemized = interest * (avgBal > 0 ? Math.min(1, cap / avgBal) : 0) + Math.min(propTax * cost + stateTaxPaid, saltCap) + otherItemized;
            const benefit = (Math.max(0, itemized - stdDed) * fedRate) / 100;
            buyerAcct += benefit;
            const bal = usd(sched[Math.min(y * 12, sched.length) - 1]?.bal ?? 0);
            const buyNW = value * (1 - sellPct / 100) - (y * 12 >= sched.length ? 0 : bal) + buyerAcct; // step 7
            rows.push({ year: y, buy: buyNW, rent: renterAcct, value, benefit, gainOverBasis: value * (1 - sellPct / 100) - price - closing });
        }
        let breakEven = null; // step 8
        for (let y = years; y >= 1; y--) {
            if (rows[y - 1].buy >= rows[y - 1].rent) breakEven = y;
            else break;
        }
        if (breakEven !== null && breakEven > 30) breakEven = null;
        return { rows, breakEven };
    };

    const base = run();
    const h = base.rows[horizon - 1];
    const diff = h.buy - h.rent;
    const sens = [
        ["appreciation +1 pp", { dAppr: 0.01 }],
        ["appreciation −1 pp", { dAppr: -0.01 }],
        ["investment return +1 pp", { dInv: 0.01 }],
        ["investment return −1 pp", { dInv: -0.01 }],
        ["rent inflation +1 pp", { dRent: 0.01 }],
        ["rent inflation −1 pp", { dRent: -0.01 }],
    ].map(([label, o]) => ({ case: label, break_even_year: run(o).breakEven ?? "No break-even within 30 years" })); // step 9
    const be = sens.map((s) => s.break_even_year).filter((x) => typeof x === "number");
    let verdict;
    if (Math.abs(diff) < 0.02 * price) verdict = { verdict: "Toss-up — decide on the non-financial factors", rule: 1 };
    else if (diff > 0 && be.length === sens.length && be.every((y) => y <= horizon)) verdict = { verdict: "Buy", rule: 2 };
    else if (diff > 0) verdict = { verdict: "Lean buy — result flips under at least one sensitivity case", rule: 3 };
    else verdict = { verdict: "Rent", rule: 4 };

    const p2r = price / (12 * rent0);
    const R = Math.round;
    return {
        price_to_rent: +p2r.toFixed(1),
        price_to_rent_read: p2r < 15 ? "buy-leaning" : p2r <= 20 ? "toss-up" : "rent-leaning",
        monthly_pi_usd: usd(piC),
        horizon_years: horizon,
        at_horizon: { buy_net_worth_usd: R(h.buy), rent_net_worth_usd: R(h.rent), difference_usd: R(h.buy) - R(h.rent), home_value_usd: R(h.value) },
        break_even_year: base.breakEven ?? "No break-even within 30 years",
        net_worth_by_year: base.rows.filter((r) => r.year <= horizon || r.year % 5 === 0).map((r) => ({ year: r.year, buy_usd: R(r.buy), rent_usd: R(r.rent) })),
        first_year_tax_benefit_usd: R(base.rows[0].benefit),
        sensitivities: sens,
        break_even_range: be.length ? `${Math.min(...be)}–${Math.max(...be)}${be.length < sens.length ? " (some cases never break even)" : ""}` : "No case breaks even within 30 years",
        section_121_flag: exclusion !== undefined && h.gainOverBasis > exclusion ? `Gain at horizon (~$${R(h.gainOverBasis)}) exceeds the §121 exclusion ($${exclusion}) — not taxed in this model` : null,
        verdict,
        assumptions_used: assumed,
        notes: [
            "Nominal dollars, monthly steps. Whoever has the lower monthly outflow invests the difference; both accounts compound at the same return.",
            "The standard deduction, SALT cap and mortgage-interest cap are held at their 2026 values for every year; SALT uses the full cap (no income phase-down).",
        ],
    };
}

// ── social_security (Retirement Planner → Social Security Review) ──────

function parseFraMonths(v, key) {
    if (typeof v === "number" && Number.isFinite(v)) return v > 100 ? Math.round(v) : Math.round(v * 12);
    const m = /(\d{2})(?:\D+(\d{1,2}))?/.exec(String(v ?? ""));
    if (!m) throw new CalcError(`\`${key}\` must look like "67" or "66 + 10 mo" (got ${JSON.stringify(v)})`);
    const months = +m[1] * 12 + (m[2] ? +m[2] : 0);
    if (months < 65 * 12 || months > 67 * 12) throw new CalcError(`\`${key}\` must be between 65 and 67 years.`);
    return months;
}

const LONGEVITY_AGE = { "below average": 80, average: 85, "above average": 90, "family history of long life": 95 };

function socialSecurity(p, facts) {
    const ss = facts?.social_security_2026 ?? {};
    const pia = num(p, "pia_estimate", { min: 0.01 });
    const fra = parseFraMonths(p.fra ?? p.fra_months, "fra");
    const outlook = String(p.longevity_outlook ?? "").toLowerCase();
    const L = LONGEVITY_AGE[outlook];
    if (!L) throw new CalcError("`longevity_outlook` must be one of: Below average, Average, Above average, Family history of long life.");
    const marital = String(p.marital_status ?? "single").toLowerCase();
    const spousePia = num(p, "spouse_pia", { required: false, min: 0, dflt: 0 });
    const spouseFra = p.spouse_fra !== undefined && p.spouse_fra !== null ? parseFraMonths(p.spouse_fra, "spouse_fra") : fra;
    const spouseL = p.spouse_longevity_outlook ? LONGEVITY_AGE[String(p.spouse_longevity_outlook).toLowerCase()] : undefined;
    const working = p.still_working === true;
    const earnings = num(p, "expected_earnings_annual_usd", { required: false, min: 0 });

    // Step 1 — own-benefit factor for a claim at age-in-months c.
    const factor = (c, fraM) => {
        const cc = Math.min(c, 70 * 12);
        const m = fraM - cc;
        if (m > 0) return 1 - (Math.min(m, 36) * (5 / 9) + Math.max(0, m - 36) * (5 / 12)) / 100;
        return 1 + (-m * (2 / 3)) / 100;
    };
    const monthly = (base, c, fraM) => Math.round(base * factor(c, fraM) * 100) / 100;
    const cumulative = (benefit, c, age) => benefit * Math.max(0, age * 12 - c); // step 3
    const fmtAge = (months) => `${Math.floor(months / 12)}y ${months % 12}m`;
    const claimAges = [62 * 12, fra, 70 * 12];
    const horizons = [...new Set([85, 90, 95, L])].sort((a, b) => a - b);
    const options = claimAges.map((c) => {
        const b = monthly(pia, c, fra);
        return {
            claim_age: c === fra ? `FRA (${fmtAge(fra)})` : `${c / 12}`,
            claim_months: c,
            factor_pct: +(factor(c, fra) * 100).toFixed(2),
            monthly_usd: Math.round(b),
            cumulative_usd: Object.fromEntries(horizons.map((h) => [`to_${h}`, Math.round(cumulative(b, c, h))])),
            _b: b,
        };
    });
    const breakeven = (i, j) => {
        const [a, b] = [options[i], options[j]];
        if (b._b <= a._b) return null;
        const t = Math.ceil((b._b * b.claim_months - a._b * a.claim_months) / (b._b - a._b)); // step 4
        return { earlier: a.claim_age, later: b.claim_age, breakeven_age: fmtAge(t) };
    };
    const best = (age, cands = options) => cands.reduce((w, o) => (cumulative(o._b, o.claim_months, age) >= cumulative(w._b, w.claim_months, age) ? o : w));

    // Step 7 — earnings test for a claim at 62.
    let earningsTest = "Not applicable — not working before FRA, or no earnings given";
    let withheldShare = 0;
    if (working && earnings !== undefined) {
        const annual = options[0]._b * 12;
        const withheld = Math.min(annual, Math.max(0, (earnings - ss.earnings_test_limit_under_fra) / 2));
        const fraYear = Math.min(annual, Math.max(0, (earnings - ss.earnings_test_limit_year_of_fra) / 3));
        withheldShare = annual > 0 ? withheld / annual : 0;
        earningsTest = {
            claim_at_62_annual_benefit_usd: Math.round(annual),
            withheld_per_year_before_fra_year_usd: Math.round(withheld),
            withheld_in_fra_year_usd: Math.round(fraYear),
            withheld_share_pct: +(withheldShare * 100).toFixed(1),
            source: "[SSA 2026 via md_facts social_security_2026]",
        };
    }

    // Steps 5–6 — spousal excess and survivor amounts.
    const hasSpouse = spousePia > 0 && /^(married|divorced|widowed)/.test(marital);
    const userIsHigher = pia >= spousePia;
    let spousal = "Not applicable — no spouse PIA";
    let survivor = "Not applicable — no spouse PIA";
    let excess = 0;
    if (hasSpouse) {
        const [hiPia, loPia, hiFra, loFra] = userIsHigher ? [pia, spousePia, fra, spouseFra] : [spousePia, pia, spouseFra, fra];
        excess = Math.max(0, 0.5 * hiPia - loPia);
        const early = loFra - 62 * 12;
        const reduction = (Math.min(early, 36) * (25 / 36) + Math.max(0, early - 36) * (5 / 12)) / 100;
        spousal = {
            lower_earner: userIsHigher ? "spouse" : "you",
            spousal_excess_at_fra_usd: Math.round(excess),
            spousal_excess_at_62_usd: Math.round(excess * (1 - reduction)),
            lower_earner_total_at_fra_usd: Math.round(loPia + excess),
            note: "Available only once the higher earner has filed; divorced: marriage of 10+ years and not remarried.",
        };
        survivor = [62 * 12, hiFra, 70 * 12].map((c) => {
            const hiBenefit = monthly(hiPia, c, hiFra);
            const floor = c < hiFra ? 0.825 * hiPia : 0;
            return { higher_earner_claims_at: c === hiFra ? "FRA" : `${c / 12}`, survivor_monthly_usd: Math.round(Math.max(loPia, hiBenefit, floor)) };
        });
    }

    // Decision rules — first match wins.
    const name = (o) => o.claim_age;
    let rec;
    if (working && withheldShare >= 0.5) rec = { rule: 1, claim_age: name(best(L, options.slice(1))), reason: `Earnings test would withhold ${(withheldShare * 100).toFixed(0)}% of a pre-FRA benefit; best of FRA / 70 through age ${L}.` };
    else if (hasSpouse && userIsHigher) {
        const horizon = Math.max(L, spouseL ?? L);
        rec = { rule: 2, claim_age: name(best(horizon)), reason: `Higher earner: best through the survivor horizon, age ${horizon}${spouseL === undefined ? " (spouse's longevity outlook not given — own outlook used)" : ""}.` };
    } else if (marital.startsWith("married") && hasSpouse && !userIsHigher && excess > 0) {
        const own = best(L);
        rec = { rule: 3, claim_age: own.claim_months === 70 * 12 ? "70" : name(options[1]), reason: "Lower earner with a spousal excess: FRA, unless own benefit alone is best at 70." };
    } else if (marital.startsWith("widowed")) rec = { rule: 4, claim_age: null, reason: "Widowed: compare claiming survivor first vs own first by hand (switch strategy) — not computed here." };
    else rec = { rule: 5, claim_age: name(best(L)), reason: `Best cumulative benefit through age ${L}.` };

    const breakevens = [breakeven(0, 1), breakeven(1, 2), breakeven(0, 2)].filter(Boolean);
    for (const o of options) {
        delete o._b;
        delete o.claim_months;
    }
    return {
        pia_monthly_usd: Math.round(pia),
        full_retirement_age: fmtAge(fra),
        longevity_age_used: L,
        claim_options: options,
        breakevens,
        earnings_test: earningsTest,
        spousal,
        survivor,
        recommendation: rec,
        notes: ["Real (today's) dollars, undiscounted; COLA affects every claim age equally and is left out.", "Reduction and delayed-credit formulas are statutory (20 CFR 404.410; born 1943 or later)."],
    };
}

// ── fire_number (FIRE Planner → FIRE Number Calculator) ────────────────

const annuityFactor = (r, n) => (n <= 0 ? 0 : r === 0 ? n : (1 - Math.pow(1 + r, -n)) / r);

function yearsToTarget(P, S, r, target) {
    for (let n = 0; n <= 60; n++) {
        const g = Math.pow(1 + r, n);
        if (P * g + (r === 0 ? S * n : (S * (g - 1)) / r) >= target) return n;
    }
    return "> 60 years";
}

function fireNumber(p) {
    const cur = int(p, "current_age", { min: 16, max: 100 });
    const fi = int(p, "target_fi_age", { min: cur, max: 100 });
    const plan = int(p, "planning_to_age", { min: fi + 1, max: 125 });
    const spend = num(p, "target_annual_spend", { min: 0.01 });
    const hcPre = num(p, "annual_healthcare_pre65", { min: 0 });
    const hcPost = num(p, "annual_healthcare_post65", { min: 0 });
    const r = num(p, "expected_real_return_pct", { min: -20, max: 30 }) / 100;
    if (typeof p.spend_includes_healthcare !== "boolean") throw new CalcError("`spend_includes_healthcare` (true / false) is required — it decides whether healthcare is added on top of the spend.");
    const includes = p.spend_includes_healthcare;
    const P = ["taxable_balance", "trad_balance", "roth_balance", "hsa_balance", "cash_balance"].reduce((a, k) => a + num(p, k, { required: false, min: 0, dflt: 0 }), 0);
    const ssMonthly = num(p, "ss_monthly_estimate", { required: false, min: 0, dflt: 0 });
    const ssAge = int(p, "ss_claim_age", { required: ssMonthly > 0, min: 62, max: 70 });
    const partTime = num(p, "part_time_income_annual", { required: false, min: 0, dflt: 0 });
    const partYears = int(p, "part_time_years", { required: partTime > 0, min: 1, max: 60 });
    const lean = num(p, "lean_annual_spend", { required: false, min: 0.01 });
    const savings = num(p, "annual_savings_usd", { required: false, min: 0 });
    const coastAge = int(p, "coast_retirement_age", { required: false, min: cur, max: 100, dflt: 65 });

    const H = plan - fi; // decision A
    const headline = H <= 30 ? 4.0 : H <= 49 ? 3.5 : 3.0;
    const preYears = Math.max(0, 65 - fi);
    const layers = (coreSpend, WR) => {
        const M = 100 / WR;
        const core = coreSpend * M;
        const post = hcPost * M;
        const pre = Math.max(0, (hcPre - hcPost) * annuityFactor(r, preYears));
        return { core, post, pre, total: core + post + pre };
    };
    const coreOf = (s) => (includes ? s - (fi < 65 ? hcPre : hcPost) : s); // step 2
    if (coreOf(spend) < 0) throw new CalcError("Healthcare exceeds `target_annual_spend` although the spend is said to include it.");
    const R = Math.round;
    const grid = [4.0, 3.5, 3.0].map((WR) => {
        const l = layers(coreOf(spend), WR);
        const M = 100 / WR;
        const leanTarget = lean === undefined ? null : layers(lean, WR).total;
        const row = {
            withdrawal_rate_pct: WR,
            multiplier: +M.toFixed(1),
            fire_number_usd: R(l.total),
            core_layer_usd: R(l.core),
            post65_healthcare_layer_usd: R(l.post),
            pre65_healthcare_layer_usd: R(l.pre),
            healthcare_share_pct: +(((l.post + l.pre) / l.total) * 100).toFixed(1),
            gap_usd: R(l.total - P),
            lean_usd: leanTarget === null ? "Not applicable — no lean spend provided" : R(leanTarget),
            chubby_usd: leanTarget === null ? "Not applicable — no lean spend provided" : R(1.5 * leanTarget),
            fat_usd: R(Math.max(spend, 200000) * M),
            barista_usd: partTime > 0 ? R(l.total - partTime * annuityFactor(r, partYears)) : "Not applicable — no part-time income",
            ss_adjusted_usd: ssMonthly > 0 ? R(l.total - (ssMonthly * 12 * M) / Math.pow(1 + r, Math.max(0, ssAge - fi))) : "Not applicable — planning without Social Security",
            years_to_close: savings === undefined ? "Not applicable — no annual savings given" : yearsToTarget(P, savings, r, l.total),
            _total: l.total,
        };
        return row;
    });
    const head = grid.find((g) => g.withdrawal_rate_pct === headline);
    const coastNeeded = head._total / Math.pow(1 + r, coastAge - cur);
    const isCoast = P >= coastNeeded;
    const closeYears = head.years_to_close;
    let status;
    if (head._total - P <= 0) status = { status: "FI reached at the headline withdrawal rate", rule: 1 };
    else if (isCoast) status = { status: `Coast FI — the portfolio compounds to the target by age ${coastAge} without new savings`, rule: 2 };
    else if (typeof closeYears === "number" && closeYears <= fi - cur) status = { status: "On pace for the target FI age", rule: 3 };
    else status = { status: "Behind pace — route to Savings-Rate Optimizer", rule: 4 };

    const sensitivity = {
        years_to_close_at_return_minus_1pp: savings === undefined ? "Not applicable — no annual savings given" : yearsToTarget(P, savings, r - 0.01, head._total),
        fire_number_with_spend_plus_20pct_usd: R(layers(coreOf(spend * 1.2), headline).total),
    };
    for (const g of grid) delete g._total;
    return {
        portfolio_today_usd: R(P),
        horizon_years: H,
        headline_withdrawal_rate_pct: headline,
        headline_fire_number_usd: head.fire_number_usd,
        headline_gap_usd: head.gap_usd,
        by_withdrawal_rate: grid,
        coast: { coast_retirement_age: coastAge, needed_today_usd: R(coastNeeded), is_coast: isCoast },
        sensitivity,
        status,
        notes: ["Real (today's) dollars, annual compounding, savings added at end of year.", "The headline number ignores Social Security; the SS-adjusted figure is shown separately."],
    };
}

// ── swr_stress_test (FIRE Planner → SWR Stress Test) ───────────────────

function swrStressTest(p, facts) {
    const d = facts?.behavioral_assumptions_safe_defaults ?? {};
    const horizon = int(p, "horizon_years", { min: 1, max: 80 });
    const spend = num(p, "target_annual_spend", { min: 0.01 });
    const P = num(p, "portfolio_total", { min: 0.01 });
    const r = num(p, "expected_real_return_pct", { min: -20, max: 30 }) / 100;
    const flex = String(p.spend_flexibility ?? "");
    if (!flex) throw new CalcError("`spend_flexibility` is required (e.g. \"Could cut 5–15%\").");
    const floor = num(p, "income_floor_annual", { required: false, min: 0, dflt: 0 });
    const curAge = int(p, "current_age", { required: floor > 0, min: 16, max: 110 });
    const floorAge = int(p, "income_floor_start_age", { required: floor > 0, min: 16, max: 110 });
    const g = num(p, "spend_real_change_pct_per_year", { required: false, min: -20, max: 20, dflt: 0 }) / 100;
    const lumpy = new Map();
    for (const [i, x] of (Array.isArray(p.lumpy_expenses) ? p.lumpy_expenses : []).entries()) {
        const y = int(x, "year", { min: 1, max: 80 });
        lumpy.set(y, (lumpy.get(y) ?? 0) + num(x, "amount_usd", { min: 0 }));
        void i;
    }
    const stressIn = num(p, "stress_real_return_pct", { required: false, min: -20, max: 30 });
    if (stressIn === undefined && typeof d.long_term_bond_real_return_rate !== "number") throw new CalcError("`stress_real_return_pct` is required (md_facts default is missing).");
    const stress = stressIn !== undefined ? stressIn / 100 : d.long_term_bond_real_return_rate;
    const BAD = -0.01;

    const paths = {
        base: () => r,
        stressed: () => stress,
        bad_first_decade: (t) => (t <= 10 ? BAD : r),
    };
    const floorStartYear = floor > 0 ? Math.max(1, floorAge - curAge + 1) : null;
    // Steps 2–3.
    const simulate = (W1, path, floorMult = 1) => {
        let B = P;
        let depletion = null;
        let balanceAtFloorStart = null;
        for (let t = 1; t <= horizon; t++) {
            if (floorStartYear !== null && t === floorStartYear) balanceAtFloorStart = B;
            const fl = floorStartYear !== null && t >= floorStartYear ? floor * floorMult : 0;
            const W = Math.max(0, W1 * Math.pow(1 + g, t - 1) + (lumpy.get(t) ?? 0) - fl);
            B = B * (1 + paths[path](t)) - W;
            if (B < 0 && depletion === null) depletion = t;
        }
        return { lasts: depletion === null, depletion_year: depletion, ending_balance: depletion === null ? B : 0, balanceAtFloorStart };
    };
    const R = Math.round;
    const describe = (W1) => {
        const out = {};
        for (const k of Object.keys(paths)) {
            const s = simulate(W1, k);
            out[k] = s.lasts ? { lasts: true, ending_balance_usd: R(s.ending_balance) } : { lasts: false, depletion_year: s.depletion_year };
        }
        return out;
    };
    const passes = (W1, mult = 1) => simulate(W1, "stressed", mult).lasts && simulate(W1, "bad_first_decade", mult).lasts;

    const GRID = [3.0, 3.5, 4.0, 4.5];
    const grid = GRID.map((WR) => {
        const W1 = (P * WR) / 100;
        return { withdrawal_rate_pct: WR, first_year_withdrawal_usd: R(W1), ...describe(W1), passes_stress_and_bad_decade: passes(W1), required_portfolio_usd: R(spend / (WR / 100)), gap_usd: R(spend / (WR / 100) - P) };
    });
    const wrUser = (spend / P) * 100;
    const user = { withdrawal_rate_pct: +wrUser.toFixed(2), ...describe(spend), passes_stress_and_bad_decade: passes(spend) };

    // Step 4 — template cross-check (flat spend, no floor).
    const nper = (rate, W) => (rate * P >= W ? "∞ (returns cover the withdrawal)" : rate === 0 ? +(P / W).toFixed(1) : +(Math.log(W / (W - rate * P)) / Math.log(1 + rate)).toFixed(1));
    const afterBad = P * Math.pow(1 + BAD, 10) - (spend * (Math.pow(1 + BAD, 10) - 1)) / BAD;
    const template = {
        coverage_years_base: nper(r, spend),
        coverage_years_stressed: nper(stress, spend),
        balance_after_bad_decade_usd: R(afterBad),
        implied_withdrawal_rate_after_bad_decade_pct: afterBad > 0 ? +((spend / afterBad) * 100).toFixed(2) : "Portfolio exhausted",
    };

    // Step 5 — income floor.
    let floorView = "Not applicable — no income floor";
    if (floor > 0) {
        const b = simulate(spend, "base");
        floorView = {
            pre_floor_withdrawal_rate_pct: +wrUser.toFixed(2),
            post_floor_withdrawal_rate_pct: b.balanceAtFloorStart > 0 ? +((Math.max(0, spend * Math.pow(1 + g, floorStartYear - 1) - floor) / b.balanceAtFloorStart) * 100).toFixed(2) : "Portfolio exhausted before the floor starts",
            floor_starts_in_year: floorStartYear,
            with_75pct_floor: { base_lasts: simulate(spend, "base", 0.75).lasts, bad_first_decade_lasts: simulate(spend, "bad_first_decade", 0.75).lasts },
        };
    }

    // Decision rules.
    const statusA = wrUser <= 3.5 ? { status: "OK", rule: 1 } : wrUser <= 4.0 ? { status: "WATCH (3.5–4%)", rule: 2 } : { status: "AGGRESSIVE", rule: 3 };
    const passing = grid.filter((x) => x.passes_stress_and_bad_decade).map((x) => x.withdrawal_rate_pct);
    const hi = passing.length ? Math.max(...passing) : null;
    const baseLasting = grid.filter((x) => x.base.lasts).map((x) => x.withdrawal_rate_pct);
    const flexible = /15\s*[–-]\s*25|25\s*%\s*\+/.test(flex);
    let range;
    if (hi === null) range = { rule: 1, range: "Below 3%", note: `Spend is too high for this portfolio; required portfolio at 3% = $${R(spend / 0.03)}` };
    else if (flexible) range = { rule: 2, range: `${hi.toFixed(1)}%–${Math.max(hi, ...baseLasting).toFixed(1)}%`, note: "Upper end requires spending guardrails (a stated cut rule)." };
    else if (floor > 0 && !passes((P * hi) / 100, 0.75)) range = { rule: 3, range: `${Math.max(3.0, hi - 0.5).toFixed(1)}%–${hi.toFixed(1)}%`, note: "The top rate passes only with the full income floor; it fails with a 75% floor." };
    else range = { rule: 4, range: `${Math.max(3.0, hi - 0.5).toFixed(1)}%–${hi.toFixed(1)}%` };

    return {
        user_withdrawal_rate: { ...user, ...statusA },
        grid,
        template_cross_check: template,
        income_floor: floorView,
        defensible_range: range,
        paths_used: { base_real_return_pct: +(r * 100).toFixed(2), stressed_real_return_pct: +(stress * 100).toFixed(2), bad_first_decade_real_return_pct: -1, stressed_source: stressIn !== undefined ? "[USER-PROVIDED]" : "[ASSUMPTION: md_facts long_term_bond_real_return_rate]" },
        notes: ["Real dollars, annual compounding, end-of-year withdrawals. Three fixed paths — no random sampling, so no survival probability.", "The template cross-check assumes flat spending and no income floor, as the workbook does."],
    };
}

// ── registry of calculators ────────────────────────────────────────────

export const CALCULATORS = {
    social_security: {
        title: "Social Security claiming — benefits by claim age, breakevens, spousal, survivor",
        skill: "md_rp_skill_social_security_review",
        params:
            "`pia_estimate`, `fra` (e.g. \"67\" or \"66 + 10 mo\"), `longevity_outlook`, `marital_status`?, `spouse_pia`?, `spouse_fra`?, `spouse_longevity_outlook`?, `still_working`?, `expected_earnings_annual_usd`?",
        run: socialSecurity,
    },
    fire_number: {
        title: "FIRE number — by withdrawal rate, with healthcare layers, flavors, gap, status",
        skill: "md_fi_skill_fire_number_calculator",
        params:
            "the skill's Input keys: `current_age`, `target_fi_age`, `planning_to_age`, `target_annual_spend`, `spend_includes_healthcare` (bool), `annual_healthcare_pre65`, `annual_healthcare_post65`, `expected_real_return_pct`, balances (`taxable_balance`, `trad_balance`, `roth_balance`, `hsa_balance`, `cash_balance`), `ss_monthly_estimate`? + `ss_claim_age`, `part_time_income_annual`? + `part_time_years`, `lean_annual_spend`?, `annual_savings_usd`?, `coast_retirement_age`?",
        run: fireNumber,
    },
    swr_stress_test: {
        title: "Withdrawal-rate stress test — three fixed return paths, defensible range",
        skill: "md_fi_skill_swr_stress_test",
        params:
            "`horizon_years`, `target_annual_spend`, `portfolio_total`, `expected_real_return_pct`, `spend_flexibility`, `income_floor_annual`? + `income_floor_start_age` + `current_age`, `spend_real_change_pct_per_year`?, `lumpy_expenses`? [{ year, amount_usd }], `stress_real_return_pct`? (md_facts bond real return otherwise)",
        run: swrStressTest,
    },
    debt_payoff: {
        title: "Debt payoff — avalanche vs snowball",
        skill: "md_ds_skill_payoff_plan",
        params:
            "`debts` [{ name, balance_usd, apr_pct, min_payment_usd, promo_apr_pct?, promo_end_yyyy_mm?, deferred_interest?, forgiveness_track? }], `monthly_budget_usd`, `method_preference`? (avalanche | snowball | undecided), `start_yyyy_mm`?",
        run: debtPayoff,
    },
    loan_amortization: {
        title: "Loan payment and amortization",
        skill: "any skill that needs a fixed-rate loan payment, balance, or payoff time",
        params: "`principal_usd`, `rate_pct`, `term_months`, `extra_monthly_usd`?, `balance_at_months`? [list of month numbers]",
        run: loanAmortization,
    },
    refinance: {
        title: "Refinance — break-even, hold-period cost, NPV (fixed-rate or ARM reset)",
        skill: "md_ds_skill_refinance_analysis",
        params:
            "`current` { balance_usd, rate_pct, months_remaining, monthly_pi_usd?, pmi_monthly_usd?, prepayment_penalty_usd?, arm_reset_in_months?, reset_rate_pct? }, `proposed` { rate_pct, term_months, closing_costs_usd, lender_credits_usd?, pmi_monthly_usd?, cash_out_usd?, cash_in_usd? }, `hold_months`, `discount_rate_pct`? (default: current rate)",
        run: refinance,
    },
    rmd: {
        title: "Required minimum distribution (this year)",
        skill: "md_rp_skill_rmd_planner",
        params: "`birth_year`, `age_at_year_end`, `accounts` [{ name, type, prior_year_end_balance_usd, still_working_exception? }] — type: traditional_ira | rollover_ira | sep_ira | simple_ira | 401k | 403b | 457b | roth_ira | roth_401k",
        run: rmd,
    },
    retirement_projection: {
        title: "Retirement projection (deterministic, real dollars)",
        skill: "md_rp_skill_retirement_projection",
        params:
            "`current_age`, `target_retire_age`, `planning_age`, `expected_real_return_pct`, `annual_contribution`, `target_annual_spend`, balances (`starting_balance` or any of trad_401k_balance, roth_balance, trad_ira_balance, taxable_balance, hsa_balance), `ss_monthly_estimate`?, `ss_claim_age` (required with SS), `other_income_annual_usd`?, `other_income_start_age`?, `other_income_end_age`? (inclusive)",
        run: retirementProjection,
    },
    savings_goal: {
        title: "Monthly saving needed for a goal",
        skill: "md_nw_skill_goal_based_savings_plan",
        params: "`target_usd`, `saved_usd`?, `months`, `annual_real_return_pct`",
        run: savingsGoal,
    },
    rental_property: {
        title: "Rental property — NOI, cap rate, cash-on-cash, DSCR, IRR, verdict",
        skill: "md_re_skill_rental_property_analyzer",
        params:
            "the skill's Input keys: `purchase_price`, `rehab_budget`?, `closing_costs_usd`, `down_payment_pct`, `interest_rate`, `loan_term_years`?, `gross_monthly_rent`, `rent_comps` [list], `property_tax_annual`, `insurance_annual`, `hoa_monthly`?, `other_opex_annual_usd`?, `vacancy_pct`, `capex_pct_of_price`, `maintenance_pct_of_price`, `mgmt_pct_of_rent`; for the projection / IRR also `appreciation_pct`, `holding_years`?, `rent_growth_pct`, `expense_growth_pct`, `selling_cost_pct`, `land_pct`, `ltcg_rate_pct`, `ordinary_marginal_rate_pct`, `state_tax_rate_pct`?, `niit_applies`?",
        run: rentalProperty,
    },
    rent_vs_buy: {
        title: "Rent vs buy — net worth by year, break-even, sensitivities, verdict",
        skill: "md_pa_skill_rent_vs_buy",
        params:
            "the skill's Input keys: `home_price_usd`, `down_payment_pct`, `mortgage_rate_pct`, `mortgage_term_years`, `purchase_closing_costs_usd`, `property_tax_annual_usd`, `hoa_monthly_usd`?, `homeowners_insurance_annual_usd`, `maintenance_pct`, `pmi_annual_pct` (required under 20% down), `selling_cost_pct`, `monthly_rent_usd`, `renters_insurance_annual_usd`?, `horizon_years`, `filing_status` (mfj | single | hoh | mfs), `marginal_federal_rate_pct`, `other_itemized_deductions_usd`?, `state_income_tax_paid_usd`?, and optional overrides `appreciation_real_pct`, `investment_real_return_pct`, `rent_inflation_pct`, `inflation_pct` (md_facts defaults otherwise)",
        run: rentVsBuy,
    },
    federal_income_tax: {
        title: "Federal ordinary income tax and marginal rate",
        skill: "any skill that derives a marginal rate or bracket headroom",
        params: "`taxable_income_usd`, `filing_status` (mfj | single | hoh | mfs)",
        run: federalIncomeTax,
    },
};

export function listCalculators() {
    return [
        "# Money Desk calculators (`md_calc`)",
        "",
        "Deterministic math for the skills. Call `md_calc` with `{ calculator, params }` and use the returned numbers verbatim — do not recompute them by hand. Tag them `[CALCULATED]`.",
        "",
        "| calculator | What it computes | Used by | params |",
        "|---|---|---|---|",
        ...Object.entries(CALCULATORS).map(([k, c]) => `| \`${k}\` | ${c.title} | ${c.skill.startsWith("md_") ? `\`${c.skill}\`` : c.skill} | ${c.params} |`),
        "",
        "Units: money in USD numbers, percentages as percents (`6.5` = 6.5%), months as integers, dates as `YYYY-MM`.",
    ].join("\n");
}

export function runCalculator(name, params, facts) {
    const calc = CALCULATORS[name];
    if (!calc) throw new CalcError(`Unknown calculator \`${name}\`. Available: ${Object.keys(CALCULATORS).join(", ")}.`);
    if (!params || typeof params !== "object" || Array.isArray(params)) throw new CalcError(`\`params\` must be an object. Expected: ${calc.params}`);
    const result = calc.run(params, facts);
    return [
        `# ${calc.title}`,
        "",
        "Computed by `md_calc` — use these numbers verbatim and tag them `[CALCULATED]`. Do not re-derive them by hand.",
        "",
        "```json",
        JSON.stringify({ calculator: name, inputs: params, result }, null, 2),
        "```",
    ].join("\n");
}
