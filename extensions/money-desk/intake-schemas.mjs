// Structured intake schemas for high-value skills.
//
// DESIGN PRINCIPLE — minimize silent assumptions.
// We deliberately omit `default` for any field that represents a meaningful
// financial assumption (interest rates, vacancy %, tax rates, lease residuals,
// longevity, appreciation). Those MUST come from the user so the report can
// cite "[USER-PROVIDED]" instead of "[ASSUMPTION:]". Defaults are reserved
// for:
//   - "Do you have X?" → 0 / false (genuine zero, not an assumed value)
//   - True technical conventions with one obvious answer (loan term 30y)
// Most other fields are required so the form won't submit half-empty.
//
// When the Copilot CLI agent receives a gated intake response from a
// `md_<prefix>_skill_<id>` tool, it should call its built-in `ask_user` tool
// with the schema below verbatim. Shape matches Copilot CLI's
// `requestedSchema` (JSON Schema subset).
//
// Keyed by `<prefix>_skill_<id>`. Add entries here; the registry picks them
// up automatically. SKILL.md and the `## Inputs needed` prose remain the
// source of truth for the workflow; this file just makes the form pretty.

export const INTAKE_SCHEMAS = {

    // ── Retirement Planner ─────────────────────────────────────────────

    md_rp_skill_contribution_optimizer: {
        message: "Let's plan your 401(k) and tax-advantaged account waterfall. Please fill in what you know — anything you skip, I'll flag rather than guess.",
        schema: {
            properties: {
                age: { type: "integer", title: "Your age", minimum: 18, maximum: 75 },
                annual_salary: { type: "number", title: "Annual gross salary ($)", description: "W-2 box 1 plus 401(k) deferrals" },
                current_401k_balance: { type: "number", title: "Current 401(k) balance ($)" },
                current_contribution_pct: { type: "number", title: "Current 401(k) contribution (% of salary)", description: "What you're contributing today; 0 if not started", minimum: 0, maximum: 100 },
                employer_match: { type: "string", title: "Employer match formula", description: "e.g. '100% up to 4%' or '50% up to 6%' — copy from your benefits portal" },
                account_types: {
                    type: "array",
                    title: "Account types your plan offers",
                    items: { type: "string", enum: ["Traditional 401(k)", "Roth 401(k)", "After-tax contributions", "In-plan Roth conversion", "Mega Backdoor Roth path"] },
                },
                filing_status: { type: "string", title: "Tax filing status", enum: ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household"] },
                hdhp_enrolled: { type: "boolean", title: "Enrolled in an HSA-eligible HDHP?", default: false },
                spouse_working: { type: "boolean", title: "Spouse also earning W-2 income?", default: false },
            },
            required: ["age", "annual_salary", "current_contribution_pct", "employer_match", "filing_status"],
        },
    },

    md_rp_skill_retirement_projection: {
        message: "Let's project your retirement. Please fill in what you know — I'll flag anything missing rather than guess.",
        schema: {
            properties: {
                current_age: { type: "integer", title: "Current age", minimum: 18, maximum: 90 },
                target_retire_age: { type: "integer", title: "Target retirement age", minimum: 40, maximum: 80 },
                planning_age: { type: "integer", title: "Plan-to age (life expectancy)", description: "How long the plan needs to last" },
                trad_401k_balance: { type: "number", title: "Traditional 401(k) / 403(b) balance ($)" },
                roth_balance: { type: "number", title: "Roth 401(k) + Roth IRA balance ($)" },
                trad_ira_balance: { type: "number", title: "Traditional IRA balance ($)" },
                taxable_balance: { type: "number", title: "Taxable brokerage balance ($)" },
                hsa_balance: { type: "number", title: "HSA balance ($)" },
                annual_contribution: { type: "number", title: "Total annual contributions incl. employer match ($)", description: "All accounts combined" },
                target_annual_spend: { type: "number", title: "Target annual spend in retirement, today's dollars ($)", description: "Pre-tax equivalent — what you'd want to spend in year one" },
                ss_monthly_estimate: { type: "number", title: "Social Security monthly estimate at claiming age ($)", description: "From ssa.gov/myaccount; enter 0 if you'd rather I leave SS out" },
                expected_real_return_pct: { type: "number", title: "Expected real (after-inflation) portfolio return (%)", description: "Your assumption — common range 3–5%" },
            },
            required: ["current_age", "target_retire_age", "planning_age", "target_annual_spend", "expected_real_return_pct"],
        },
    },

    md_rp_skill_social_security_review: {
        message: "Let's review your Social Security claiming strategy. Grab your most recent SSA statement from ssa.gov/myaccount first.",
        schema: {
            properties: {
                current_age: { type: "integer", title: "Current age", minimum: 50, maximum: 75 },
                pia_estimate: { type: "number", title: "PIA monthly estimate at Full Retirement Age ($)", description: "From your ssa.gov statement" },
                fra: { type: "string", title: "Your Full Retirement Age", enum: ["66", "66 + 2 mo", "66 + 4 mo", "66 + 6 mo", "66 + 8 mo", "66 + 10 mo", "67"] },
                marital_status: { type: "string", title: "Marital status", enum: ["Single", "Married", "Divorced (10+ year marriage)", "Widowed"] },
                spouse_pia: { type: "number", title: "Spouse's PIA at FRA ($, if applicable)", default: 0 },
                still_working: { type: "boolean", title: "Still earning W-2 / self-employment income?", default: false },
                longevity_outlook: { type: "string", title: "Self-assessed longevity outlook", enum: ["Below average", "Average", "Above average", "Family history of long life"] },
            },
            required: ["current_age", "pia_estimate", "fra", "marital_status", "longevity_outlook"],
        },
    },

    // ── Life & Disability ──────────────────────────────────────────────

    md_lp_skill_life_insurance_needs: {
        message: "Let's size your life insurance need. Please fill in what you know.",
        schema: {
            properties: {
                age: { type: "integer", title: "Your age", minimum: 18, maximum: 85 },
                smoker: { type: "boolean", title: "Smoker or tobacco user?", default: false },
                health: { type: "string", title: "Overall health", enum: ["Excellent", "Good", "Average", "Below average"] },
                annual_income: { type: "number", title: "Annual gross income ($)" },
                spouse_income: { type: "number", title: "Spouse annual income ($)", default: 0 },
                dependents_ages: { type: "string", title: "Dependents' ages", description: "Comma-separated (e.g. '0, 3, 7') or 'none'" },
                income_replacement_years: { type: "number", title: "Years of income to replace", description: "Your view — common range 10–20" },
                mortgage_balance: { type: "number", title: "Mortgage balance ($)", default: 0 },
                other_debt: { type: "number", title: "Other debt total ($)", description: "Cars, student loans, credit cards", default: 0 },
                existing_coverage: { type: "number", title: "Existing life coverage on you ($)", description: "Group + private combined", default: 0 },
                education_goal_per_child: { type: "number", title: "Education funding goal per child ($)", description: "0 if not a goal", default: 0 },
            },
            required: ["age", "health", "annual_income", "dependents_ages", "income_replacement_years"],
        },
    },

    // ── Net Worth & Goals ──────────────────────────────────────────────

    md_nw_skill_emergency_fund_assessment: {
        message: "Let's right-size your emergency fund.",
        schema: {
            properties: {
                current_balance: { type: "number", title: "Current emergency fund balance ($)" },
                where_held: { type: "string", title: "Where it's held", description: "Account + APY if known (e.g. 'Ally HYSA 4.2%')" },
                monthly_essentials: { type: "number", title: "Monthly essential expenses ($)", description: "Housing + utilities + groceries + transport + insurance + minimum debt payments + childcare. EXCLUDE dining, entertainment, vacations." },
                income_type: { type: "string", title: "Income type", enum: ["Single W-2", "Dual W-2", "Single 1099 / self-employed", "Dual mixed", "Commission / variable", "Single income with stay-at-home spouse"] },
                tenure_years: { type: "number", title: "Years at current employer (primary earner)" },
                dependents: { type: "integer", title: "Number of dependents", default: 0 },
                health_insurance: { type: "string", title: "Health insurance source", enum: ["Employer (any plan)", "Employer HDHP+HSA", "ACA marketplace", "Self-paid private", "Medicaid / Medicare", "Spouse's employer"] },
                heloc_available: { type: "number", title: "HELOC available ($, if any)", default: 0 },
                roth_contributions_accessible: { type: "number", title: "Roth IRA contributions accessible ($)", description: "Original contributions can be withdrawn tax-free anytime", default: 0 },
            },
            required: ["current_balance", "monthly_essentials", "income_type", "tenure_years", "health_insurance"],
        },
    },

    md_nw_skill_net_worth_snapshot: {
        message: "Let's snapshot your net worth. Rough numbers are fine; enter 0 for categories that don't apply.",
        schema: {
            properties: {
                cash_checking: { type: "number", title: "Cash + checking ($)", default: 0 },
                hysa_money_market: { type: "number", title: "HYSA + money market ($)", default: 0 },
                trad_retirement: { type: "number", title: "Traditional 401(k) / IRA / 403(b) ($)", default: 0 },
                roth_retirement: { type: "number", title: "Roth 401(k) / IRA ($)", default: 0 },
                taxable_brokerage: { type: "number", title: "Taxable brokerage ($)", default: 0 },
                hsa: { type: "number", title: "HSA ($)", default: 0 },
                primary_home_value: { type: "number", title: "Primary home — market value ($)", default: 0 },
                rental_property_value: { type: "number", title: "Investment property — market value ($)", default: 0 },
                vehicle_value: { type: "number", title: "Vehicles — current value ($)", default: 0 },
                other_assets: { type: "number", title: "Other assets ($)", description: "Crypto, collectibles, business equity", default: 0 },
                mortgage_balance: { type: "number", title: "Primary mortgage balance ($)", default: 0 },
                rental_mortgage_balance: { type: "number", title: "Rental property mortgage ($)", default: 0 },
                auto_loans: { type: "number", title: "Auto loan balances ($)", default: 0 },
                student_loans: { type: "number", title: "Student loan balance ($)", default: 0 },
                credit_card_balance: { type: "number", title: "Credit card balance carried month-to-month ($)", default: 0 },
                other_debt: { type: "number", title: "Other debt ($)", default: 0 },
            },
            required: [],
        },
    },

    // ── Tax Planner ────────────────────────────────────────────────────

    md_tx_skill_withholding_check: {
        message: "Let's project your federal tax bill vs withholding. Pull a recent pay stub.",
        schema: {
            properties: {
                filing_status: { type: "string", title: "Filing status", enum: ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household"] },
                ytd_gross_wages: { type: "number", title: "YTD gross wages ($)", description: "Pay stub YTD gross" },
                ytd_federal_withheld: { type: "number", title: "YTD federal income tax withheld ($)" },
                ytd_state_withheld: { type: "number", title: "YTD state tax withheld ($, if applicable)", default: 0 },
                pay_periods_remaining: { type: "integer", title: "Pay periods remaining this year", minimum: 0, maximum: 53 },
                spouse_ytd_wages: { type: "number", title: "Spouse YTD wages ($)", default: 0 },
                spouse_ytd_withheld: { type: "number", title: "Spouse YTD federal withheld ($)", default: 0 },
                other_income: { type: "number", title: "Other income — 1099, interest, dividends, rental ($)", default: 0 },
                expected_deduction: { type: "string", title: "Deduction plan", enum: ["Standard", "Itemized (will exceed standard)"] },
                dependents_under_17: { type: "integer", title: "Dependents under 17 (Child Tax Credit)", default: 0 },
            },
            required: ["filing_status", "ytd_gross_wages", "ytd_federal_withheld", "pay_periods_remaining", "expected_deduction"],
        },
    },

    // ── Health & Medicare ──────────────────────────────────────────────

    md_ih_skill_health_plan_selector: {
        message: "Let's compare your open-enrollment options. Have your benefits-guide PDF handy.",
        schema: {
            properties: {
                plan_a_name: { type: "string", title: "Plan A name", description: "e.g. 'HDHP+HSA' or 'PPO'" },
                plan_a_monthly_premium: { type: "number", title: "Plan A — monthly premium ($)" },
                plan_a_deductible: { type: "number", title: "Plan A — deductible ($)" },
                plan_a_oop_max: { type: "number", title: "Plan A — out-of-pocket max ($)" },
                plan_a_hsa_match: { type: "number", title: "Plan A — employer HSA contribution ($/yr)", default: 0 },
                plan_b_name: { type: "string", title: "Plan B name" },
                plan_b_monthly_premium: { type: "number", title: "Plan B — monthly premium ($)" },
                plan_b_deductible: { type: "number", title: "Plan B — deductible ($)" },
                plan_b_oop_max: { type: "number", title: "Plan B — out-of-pocket max ($)" },
                expected_annual_medical: { type: "number", title: "Expected annual medical spend ($)", description: "Office visits, prescriptions, planned procedures. Honest estimates only — low-balling biases toward HDHP." },
                marginal_tax_rate: { type: "number", title: "Marginal federal + state tax rate (%)", description: "Drives HSA tax-savings math" },
                family_size: { type: "string", title: "Coverage tier", enum: ["Self only", "Self + spouse", "Self + child(ren)", "Family"] },
            },
            required: ["plan_a_name", "plan_a_monthly_premium", "plan_a_deductible", "plan_a_oop_max", "plan_b_name", "plan_b_monthly_premium", "plan_b_deductible", "plan_b_oop_max", "expected_annual_medical", "marginal_tax_rate", "family_size"],
        },
    },

    // ── Real Estate Investor ───────────────────────────────────────────

    md_re_skill_rental_property_analyzer: {
        message: "Let's underwrite this rental. All numbers monthly unless noted.",
        schema: {
            properties: {
                purchase_price: { type: "number", title: "Purchase price ($)" },
                rehab_budget: { type: "number", title: "Rehab budget ($)", default: 0 },
                down_payment_pct: { type: "number", title: "Down payment (%)" },
                interest_rate: { type: "number", title: "Interest rate (%)" },
                loan_term_years: { type: "integer", title: "Loan term (years)", default: 30 },
                gross_monthly_rent: { type: "number", title: "Gross monthly rent ($)" },
                property_tax_annual: { type: "number", title: "Annual property tax ($)" },
                insurance_annual: { type: "number", title: "Annual insurance ($)" },
                hoa_monthly: { type: "number", title: "HOA monthly ($)", default: 0 },
                vacancy_pct: { type: "number", title: "Vacancy assumption (%)", description: "Your view of local market" },
                capex_pct: { type: "number", title: "Capex reserve (% of rent)", description: "Roof / HVAC / appliances over time" },
                maintenance_pct: { type: "number", title: "Maintenance reserve (% of rent)" },
                management_pct: { type: "number", title: "Property management (% of rent — 0 if self-managed)" },
                appreciation_pct: { type: "number", title: "Long-term appreciation assumption (%)", description: "Your view of the local market" },
            },
            required: ["purchase_price", "down_payment_pct", "interest_rate", "gross_monthly_rent", "property_tax_annual", "insurance_annual", "vacancy_pct", "capex_pct", "maintenance_pct", "management_pct", "appreciation_pct"],
        },
    },

    // ── Purchase Advisor ───────────────────────────────────────────────

    md_pa_skill_buy_vs_lease: {
        message: "Let's compare buying vs leasing this vehicle. Pull both the lease worksheet and the financing offer.",
        schema: {
            properties: {
                vehicle: { type: "string", title: "Vehicle (year / make / model)" },
                msrp: { type: "number", title: "MSRP or negotiated cap cost ($)" },
                lease_residual_pct: { type: "number", title: "Lease residual value (%)", description: "From the dealer's lease worksheet" },
                lease_money_factor: { type: "number", title: "Lease money factor", description: "Multiply by 2400 for APR; e.g. 0.00125 ≈ 3% APR" },
                lease_term_months: { type: "integer", title: "Lease term (months)" },
                lease_due_at_signing: { type: "number", title: "Cap-cost reduction / due at signing ($)", default: 0 },
                purchase_apr: { type: "number", title: "Purchase loan APR (%)" },
                purchase_loan_term_months: { type: "integer", title: "Purchase loan term (months)" },
                annual_miles: { type: "integer", title: "Annual miles you drive" },
                ownership_horizon_years: { type: "integer", title: "How long you'd keep it if you bought (years)" },
                trade_in_value: { type: "number", title: "Trade-in / down payment ($)", default: 0 },
            },
            required: ["vehicle", "msrp", "lease_residual_pct", "lease_money_factor", "lease_term_months", "purchase_apr", "purchase_loan_term_months", "annual_miles", "ownership_horizon_years"],
        },
    },

    // ── FIRE Planner ───────────────────────────────────────────────────

    md_fi_skill_fire_number_calculator: {
        message: "Let's compute your FIRE number across the lean / coast / barista / chubby / fat flavors. I'll show three withdrawal rates side-by-side. Anything you skip, I'll flag rather than guess.",
        schema: {
            properties: {
                current_age: { type: "integer", title: "Current age", minimum: 18, maximum: 75 },
                target_fi_age: { type: "integer", title: "Target FI age", minimum: 25, maximum: 75 },
                planning_to_age: { type: "integer", title: "Plan-to age (life expectancy)", description: "How long the plan needs to last; common range 90–100" },
                target_annual_spend: { type: "number", title: "Target annual spend in retirement (today's $)", description: "Post-tax, what life costs you per year. EXCLUDE mortgage if paid off by FIRE; INCLUDE healthcare honestly." },
                taxable_balance: { type: "number", title: "Taxable brokerage balance ($)", default: 0 },
                trad_balance: { type: "number", title: "Traditional 401(k) + IRA balance ($)", default: 0 },
                roth_balance: { type: "number", title: "Roth 401(k) + IRA balance ($)", default: 0 },
                hsa_balance: { type: "number", title: "HSA balance ($)", default: 0 },
                cash_balance: { type: "number", title: "Cash + HYSA balance ($)", default: 0 },
                annual_healthcare_pre65: { type: "number", title: "Estimated annual healthcare cost pre-65 ($)", description: "Your estimate. If you don't know, run Pre-65 Healthcare Plan first." },
                annual_healthcare_post65: { type: "number", title: "Estimated annual healthcare cost post-65 ($)", description: "Medicare + Medigap + Part D typically $5–10k/person/yr in today's $" },
                expected_real_return_pct: { type: "number", title: "Expected real (after-inflation) portfolio return (%)", description: "Your view — common range 3–5%" },
                ss_monthly_estimate: { type: "number", title: "Social Security monthly estimate at claim age ($, optional)", description: "From ssa.gov; enter 0 to plan without SS", default: 0 },
                part_time_income_annual: { type: "number", title: "Expected post-FIRE part-time income ($/yr, optional)", description: "For barista FIRE; enter 0 if none planned", default: 0 },
            },
            required: ["current_age", "target_fi_age", "planning_to_age", "target_annual_spend", "annual_healthcare_pre65", "annual_healthcare_post65", "expected_real_return_pct"],
        },
    },

    md_fi_skill_swr_stress_test: {
        message: "Let's stress-test your withdrawal rate. The 4% rule was calibrated for 30-year horizons — longer needs lower. I'll show 3% / 3.5% / 4% / 4.5% side-by-side and name the four killers honestly.",
        schema: {
            properties: {
                horizon_years: { type: "integer", title: "Horizon (years)", description: "Years the portfolio must last; 30 = traditional retirement, 40+ = early FIRE", minimum: 10, maximum: 70 },
                target_annual_spend: { type: "number", title: "Target annual spend (today's $)" },
                portfolio_total: { type: "number", title: "Total portfolio ($)" },
                stock_pct: { type: "number", title: "Stock allocation (%)", minimum: 0, maximum: 100 },
                bond_pct: { type: "number", title: "Bond allocation (%)", minimum: 0, maximum: 100 },
                cash_pct: { type: "number", title: "Cash allocation (%)", minimum: 0, maximum: 100 },
                spend_pattern: { type: "string", title: "Spend pattern", enum: ["Flat real (constant inflation-adjusted)", "Rising real (lifestyle creep)", "Declining real (retirement smile)", "Variable / lumpy"] },
                income_floor_annual: { type: "number", title: "Income floor: SS + pension ($/yr)", description: "Starting at claim/payment age; enter 0 if planning without", default: 0 },
                income_floor_start_age: { type: "integer", title: "Income floor start age", description: "Age when SS / pension begins; ignore if income floor = 0", minimum: 0, maximum: 90, default: 67 },
                expected_real_return_pct: { type: "number", title: "Expected real return assumption (%)", description: "Your view — common range 4–5% real for 60-80% stock" },
                spend_flexibility: { type: "string", title: "Spend flexibility in a down year", enum: ["Could cut 0–5%", "Could cut 5–15%", "Could cut 15–25%", "Could cut 25%+"], description: "Honest answer — Kitces guardrails require real cuts" },
            },
            required: ["horizon_years", "target_annual_spend", "portfolio_total", "stock_pct", "bond_pct", "cash_pct", "spend_pattern", "expected_real_return_pct", "spend_flexibility"],
        },
    },

    md_fi_skill_bridge_account_strategy: {
        message: "Let's design your pre-59½ bridge. The four mechanisms — Roth conversion ladder, SEPP/72(t), brokerage bridge, HSA stacking — combine differently per household. SEPP especially is IRREVERSIBLE; we'll surface that.",
        schema: {
            properties: {
                current_age: { type: "integer", title: "Current age", minimum: 30, maximum: 60 },
                target_fire_age: { type: "integer", title: "Target FIRE age", minimum: 30, maximum: 59 },
                annual_spend_early_retirement: { type: "number", title: "Annual spend in early retirement (today's $)" },
                taxable_balance: { type: "number", title: "Taxable brokerage balance ($)", default: 0 },
                taxable_cost_basis: { type: "number", title: "Taxable account cost basis ($, approximate)", description: "Roughly how much you put in (vs current value)", default: 0 },
                trad_balance: { type: "number", title: "Traditional 401(k) + IRA balance ($)", default: 0 },
                roth_contributions_accessible: { type: "number", title: "Roth IRA contributions accessible ($)", description: "Original contributions only — always penalty-free", default: 0 },
                roth_earnings: { type: "number", title: "Roth earnings ($, gated by 5y + 59.5)", default: 0 },
                hsa_balance: { type: "number", title: "HSA balance ($)", default: 0 },
                cash_balance: { type: "number", title: "Cash + HYSA balance ($)", default: 0 },
                spouse_income_post_fire: { type: "number", title: "Spouse income post-FIRE ($/yr)", description: "For households where one spouse keeps working", default: 0 },
                other_income_post_fire: { type: "number", title: "Other income post-FIRE ($/yr)", description: "Real estate, consulting, pension", default: 0 },
                filing_status: { type: "string", title: "Filing status post-FIRE", enum: ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household"] },
                state: { type: "string", title: "State of residence post-FIRE", description: "State-tax treatment of conversions / withdrawals varies" },
                aca_magi_ceiling: { type: "number", title: "Target ACA-MAGI ceiling ($/yr, optional)", description: "From Pre-65 Healthcare Plan; cap on conversions + realized gains. Enter 0 if not using ACA.", default: 0 },
            },
            required: ["current_age", "target_fire_age", "annual_spend_early_retirement", "filing_status", "state"],
        },
    },

    md_fi_skill_withdrawal_order_optimizer: {
        message: "Let's sequence your withdrawal order to maximize after-tax sustainable spend. The naive 'brokerage → Trad → Roth' default is usually wrong for early FIRE — bracket-filling Roth conversions in the low-income early years can add ~0.5%/yr to your sustainable WR.",
        schema: {
            properties: {
                current_age: { type: "integer", title: "Current age", minimum: 30, maximum: 75 },
                fire_age: { type: "integer", title: "FIRE age", minimum: 30, maximum: 75 },
                planning_to_age: { type: "integer", title: "Plan-to age", minimum: 75, maximum: 105 },
                target_spend_post_tax: { type: "number", title: "Target annual spend (post-tax, today's $)" },
                taxable_balance: { type: "number", title: "Taxable brokerage balance ($)", default: 0 },
                taxable_cost_basis: { type: "number", title: "Taxable cost basis ($, approximate)", default: 0 },
                trad_balance: { type: "number", title: "Traditional 401(k) + IRA balance ($)", default: 0 },
                roth_contributions: { type: "number", title: "Roth contributions ($)", default: 0 },
                roth_earnings: { type: "number", title: "Roth earnings ($)", default: 0 },
                hsa_balance: { type: "number", title: "HSA balance ($)", default: 0 },
                cash_balance: { type: "number", title: "Cash balance ($)", default: 0 },
                aca_magi_ceiling: { type: "number", title: "ACA-MAGI ceiling ($/yr)", description: "From Pre-65 Healthcare Plan; binding constraint on conversions + LTCG. Enter 0 if not using ACA.", default: 0 },
                irmaa_ceiling: { type: "number", title: "Post-65 IRMAA ceiling target ($/yr, optional)", description: "Approx threshold to avoid Medicare premium surcharges; cite md_facts for current bracket. Enter 0 to skip.", default: 0 },
                spouse_income_post_fire: { type: "number", title: "Spouse income post-FIRE ($/yr)", default: 0 },
                other_income_post_fire: { type: "number", title: "Other income post-FIRE ($/yr)", default: 0 },
                ss_pia_monthly: { type: "number", title: "Social Security PIA monthly ($, at FRA)", description: "From ssa.gov; enter 0 to plan without", default: 0 },
                ss_claim_age: { type: "integer", title: "Planned SS claim age", minimum: 62, maximum: 70, default: 67 },
                filing_status: { type: "string", title: "Filing status post-FIRE", enum: ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household"] },
                state: { type: "string", title: "State of residence post-FIRE" },
            },
            required: ["current_age", "fire_age", "planning_to_age", "target_spend_post_tax", "filing_status", "state"],
        },
    },
};

export function getIntakeSchema(toolName) {
    return INTAKE_SCHEMAS[toolName] || null;
}
