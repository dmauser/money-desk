// md_calc calculators: checked against closed-form results, published
// figures, and the Calculation method of the skill each one mirrors.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { tools, DATA_DIR } from "../extensions/money-desk/registry.mjs";
import { CALCULATORS } from "../extensions/money-desk/calculators.mjs";

const facts = JSON.parse(readFileSync(join(DATA_DIR, "facts-2026.json"), "utf8"));
const mdCalc = tools.find((t) => t.name === "md_calc");

async function calc(calculator, params) {
    const out = await mdCalc.handler({ calculator, params });
    assert.equal(typeof out, "string", `md_calc failed: ${out?.textResultForLlm}`);
    return JSON.parse(out.match(/```json\n([\s\S]*)\n```/)[1]).result;
}

test("md_calc with no arguments lists every calculator", async () => {
    const out = await mdCalc.handler({});
    for (const name of Object.keys(CALCULATORS)) assert.match(out, new RegExp(`\`${name}\``));
});

test("md_calc returns a failure (never throws) on bad input", async () => {
    for (const args of [{ calculator: "nope", params: {} }, { calculator: "rmd", params: {} }, { calculator: "loan_amortization", params: { principal_usd: "abc", rate_pct: 5, term_months: 12 } }, { calculator: "rmd" }]) {
        const out = await mdCalc.handler(args);
        assert.equal(out.resultType, "failure");
        assert.match(out.textResultForLlm, /^md_calc: /);
    }
});

test("results are deterministic", async () => {
    const p = { monthly_budget_usd: 600, debts: [{ name: "A", balance_usd: 5000, apr_pct: 24, min_payment_usd: 150 }, { name: "B", balance_usd: 800, apr_pct: 18, min_payment_usd: 40 }] };
    assert.deepEqual(await calc("debt_payoff", p), await calc("debt_payoff", p));
});

test("loan_amortization: $300k, 6%, 30 years", async () => {
    const r = await calc("loan_amortization", { principal_usd: 300000, rate_pct: 6, term_months: 360, extra_monthly_usd: 200, balance_at_months: [0, 360] });
    assert.equal(r.monthly_payment_usd, 1798.65);
    assert.equal(r.scheduled.payoff_months, 360);
    assert.ok(Math.abs(r.scheduled.total_interest_usd - 347515) <= 2);
    assert.equal(r.scheduled.total_paid_usd, 300000 + r.scheduled.total_interest_usd);
    assert.deepEqual(r.balance_at_months, { 0: 300000, 360: 0 });
    assert.ok(r.with_extra.payoff_months < 360 && r.with_extra.interest_saved_usd > 0);
    const zero = await calc("loan_amortization", { principal_usd: 1000, rate_pct: 0, term_months: 3 });
    assert.equal(zero.scheduled.payoff_months, 3);
    assert.equal(zero.scheduled.total_interest_usd, 0);
});

test("debt_payoff: feasibility, ordering, cascade, decision rules", async () => {
    const infeasible = await calc("debt_payoff", { monthly_budget_usd: 100, debts: [{ name: "A", balance_usd: 5000, apr_pct: 20, min_payment_usd: 150 }] });
    assert.equal(infeasible.feasible, false);
    assert.equal(infeasible.shortfall_usd, 50);
    assert.equal(infeasible.recommendation.rule, 1);

    // 0% debts: pure cash-flow arithmetic. $1,200 + $600 at $300/mo = 6 months.
    const flat = await calc("debt_payoff", {
        monthly_budget_usd: 300,
        start_yyyy_mm: "2027-01",
        debts: [{ name: "Big", balance_usd: 1200, apr_pct: 0, min_payment_usd: 50 }, { name: "Small", balance_usd: 600, apr_pct: 0, min_payment_usd: 50 }],
    });
    for (const m of [flat.avalanche, flat.snowball]) {
        assert.equal(m.months, 6);
        assert.equal(m.total_interest_usd, 0);
        assert.equal(m.debt_free_yyyy_mm, "2027-06");
    }
    assert.deepEqual(flat.snowball.order, ["Small", "Big"]);
    assert.deepEqual(flat.avalanche.order, ["Small", "Big"], "APR tie → smaller balance first");

    const mixed = {
        monthly_budget_usd: 600,
        debts: [{ name: "Card A", balance_usd: 5000, apr_pct: 24, min_payment_usd: 150 }, { name: "Card B", balance_usd: 800, apr_pct: 18, min_payment_usd: 40 }, { name: "Car", balance_usd: 9000, apr_pct: 7, min_payment_usd: 250 }],
    };
    const r = await calc("debt_payoff", mixed);
    assert.deepEqual(r.avalanche.order, ["Card A", "Card B", "Car"]);
    assert.deepEqual(r.snowball.order, ["Card B", "Card A", "Car"]);
    assert.ok(r.avalanche.total_interest_usd <= r.snowball.total_interest_usd, "avalanche never costs more interest");
    assert.equal(r.interest_gap_usd, r.snowball.total_interest_usd - r.avalanche.total_interest_usd);
    assert.match(r.avalanche.verification.month_1, /Card A: 5000\.00 \+ interest 100\.00 − payment 310\.00 = 4790\.00/);
    assert.equal(r.recommendation.rule, 3, "small gap + ≥3-month earlier first win → snowball");
    assert.equal((await calc("debt_payoff", { ...mixed, method_preference: "avalanche" })).recommendation.rule, 2);

    const excluded = await calc("debt_payoff", {
        monthly_budget_usd: 500,
        debts: [{ name: "Card", balance_usd: 1000, apr_pct: 20, min_payment_usd: 50 }, { name: "Fed loan", balance_usd: 20000, apr_pct: 5, min_payment_usd: 200, forgiveness_track: true }],
    });
    assert.deepEqual(excluded.excluded_from_extra, ["Fed loan"]);
    assert.deepEqual(excluded.avalanche.order, ["Card"]);
});

test("rmd: IRS Uniform Lifetime divisor, aggregation, exclusions", async () => {
    const r = await calc("rmd", {
        birth_year: 1953,
        age_at_year_end: 73,
        accounts: [
            { name: "IRA 1", type: "traditional_ira", prior_year_end_balance_usd: 200000 },
            { name: "IRA 2", type: "rollover_ira", prior_year_end_balance_usd: 65000 },
            { name: "Roth", type: "roth_ira", prior_year_end_balance_usd: 50000 },
            { name: "Old 401k", type: "401k", prior_year_end_balance_usd: 100000 },
        ],
    });
    assert.equal(r.divisor, 26.5);
    assert.equal(r.withdrawal_groups["IRAs (aggregate — may be taken from any IRA)"], 10000);
    assert.equal(r.total_rmd_usd, 13773.58);
    assert.equal(r.accounts.find((a) => a.name === "Roth").rmd_usd, 0);
    const young = await calc("rmd", { birth_year: 1962, age_at_year_end: 73, accounts: [{ type: "traditional_ira", prior_year_end_balance_usd: 100000 }] });
    assert.equal(young.rmd_start_age, 75);
    assert.equal(young.total_rmd_usd, 0);
});

test("federal_income_tax matches the IRS rate-table checkpoints", async () => {
    // Rev. Proc. 2025-32 Table 1 (MFJ) cumulative figures.
    for (const [income, tax] of [[24800, 2480], [100800, 11600], [211400, 35932], [403550, 82048], [512450, 116896]]) {
        assert.equal((await calc("federal_income_tax", { taxable_income_usd: income, filing_status: "mfj" })).tax_usd, tax);
    }
    // Tables 2–4: cumulative tax at the top of the 24% bracket (HoH, single) and 35% bracket (MFS).
    assert.equal((await calc("federal_income_tax", { taxable_income_usd: 201750, filing_status: "hoh" })).tax_usd, 39207);
    assert.equal((await calc("federal_income_tax", { taxable_income_usd: 201775, filing_status: "single" })).tax_usd, 41024);
    assert.equal((await calc("federal_income_tax", { taxable_income_usd: 640600, filing_status: "single" })).tax_usd, 192979);
    assert.equal((await calc("federal_income_tax", { taxable_income_usd: 384350, filing_status: "mfs" })).tax_usd, 103292);
    const r = await calc("federal_income_tax", { taxable_income_usd: 150000, filing_status: "mfj" });
    assert.equal(r.marginal_rate_pct, 22);
    assert.equal(r.room_to_top_of_bracket_usd, facts.income_tax_brackets_mfj_2026.brackets[2].max - 150000);
    assert.equal((await mdCalc.handler({ calculator: "federal_income_tax", params: { taxable_income_usd: 1, filing_status: "widow" } })).resultType, "failure");
});

test("savings_goal: zero-return and closed-form cases", async () => {
    assert.equal((await calc("savings_goal", { target_usd: 12000, months: 12, annual_real_return_pct: 0 })).required_monthly_usd, 1000);
    assert.equal((await calc("savings_goal", { target_usd: 5000, saved_usd: 6000, months: 12, annual_real_return_pct: 0 })).required_monthly_usd, 0);
    const R = 0.05, n = 120, r = Math.pow(1 + R, 1 / 12) - 1, g = Math.pow(1 + r, n);
    const expected = Math.ceil(((50000 - 10000 * g) * r) / (g - 1));
    assert.equal((await calc("savings_goal", { target_usd: 50000, saved_usd: 10000, months: n, annual_real_return_pct: 5 })).required_monthly_usd, expected);
});

test("retirement_projection: closed-form accumulation and zero-return decumulation", async () => {
    const r = await calc("retirement_projection", { current_age: 40, target_retire_age: 65, planning_age: 95, expected_real_return_pct: 5, annual_contribution: 20000, target_annual_spend: 70000, starting_balance: 300000, ss_monthly_estimate: 2500, ss_claim_age: 67 });
    const g = Math.pow(1.05, 25);
    assert.equal(r.balance_at_retirement_usd, Math.round(300000 * g + (20000 * (g - 1)) / 0.05));
    assert.equal(r.depletion_age, null);
    assert.equal(r.fire_number_25x_usd, 1750000);

    // 0% return: $500k saved, $50k/yr spend from 65 → runs dry in the 11th year (age 75).
    const flat = await calc("retirement_projection", { current_age: 65, target_retire_age: 65, planning_age: 95, expected_real_return_pct: 0, annual_contribution: 0, target_annual_spend: 50000, taxable_balance: 500000 });
    assert.equal(flat.balance_at_retirement_usd, 500000);
    assert.equal(flat.required_at_retirement_usd, 1500000);
    assert.equal(flat.gap_usd, 1000000);
    assert.equal(flat.depletion_age, 75);
    assert.equal(flat.gap_closing_levers.spend_cut_pct, "not closable by this lever alone");
});

test("refinance: break-even and payments are consistent with loan_amortization", async () => {
    const r = await calc("refinance", { current: { balance_usd: 350000, rate_pct: 7.25, months_remaining: 330 }, proposed: { rate_pct: 6.25, term_months: 360, closing_costs_usd: 6000 }, hold_months: 84 });
    const cur = await calc("loan_amortization", { principal_usd: 350000, rate_pct: 7.25, term_months: 330 });
    const next = await calc("loan_amortization", { principal_usd: 350000, rate_pct: 6.25, term_months: 360 });
    assert.equal(r.current_monthly_pi_usd, cur.monthly_payment_usd);
    assert.equal(r.new_monthly_pi_usd, next.monthly_payment_usd);
    assert.equal(r.break_even_months, Math.ceil(6000 / r.monthly_saving_usd));
    assert.equal(r.lifetime_interest.new_usd, next.scheduled.total_interest_usd);
    const worse = await calc("refinance", { current: { balance_usd: 350000, rate_pct: 5, months_remaining: 330 }, proposed: { rate_pct: 6.25, term_months: 330 }, closing_costs_usd: 6000, hold_months: 84 });
    assert.equal(worse.break_even_months, null);
    assert.ok(worse.hold_period.saving_usd < 0);
});

test("every calculator names a real skill or a general use", () => {
    const names = new Set(tools.map((t) => t.name));
    for (const [k, c] of Object.entries(CALCULATORS)) if (c.skill.startsWith("md_")) assert.ok(names.has(c.skill), `${k} → ${c.skill}`);
});
