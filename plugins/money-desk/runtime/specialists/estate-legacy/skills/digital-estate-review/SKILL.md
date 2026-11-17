# Digital Estate Review

description: Plan for digital assets and accounts after incapacity or death — password manager handoff, platform legacy settings, crypto recovery, social media memorialization, important data exports. Outputs an actionable plan. NOT legal advice.

## When to use

- User stores significant data, accounts, or value online (most adults do).
- Crypto holdings, NFTs, or other digital assets exist.
- Aging parent's digital footprint needs documentation.
- Annual estate review.

## Inputs needed

- Password manager in use (or note that none is).
- Significant online accounts (email, financial, social, cloud storage, subscriptions, domains).
- Crypto holdings — wallets (hot/cold), exchange accounts, seed phrases (storage location).
- Photos / documents in cloud storage that family would want.
- Devices (phones, laptops) with FDE / passcodes — and where those are recoverable.

## Workflow

1. **Password manager.** Use one. Set up emergency-access feature (1Password Emergency Kit, Bitwarden Emergency Access, LastPass Emergency Access). Designated trusted contact gets read-access after a delay if user doesn't deny.
2. **Two-factor recovery.** Codes from authenticator app must be recoverable. Print backup codes + store with estate docs. Avoid SMS-only 2FA for critical accounts.
3. **Email is the master key.** Most password resets flow through email. Document email account recovery (recovery email, recovery phone, backup codes, security questions).
4. **Platform legacy settings.**
   - Google Inactive Account Manager — auto-notifies a trusted contact and optionally shares data after N months inactive.
   - Apple Legacy Contact — gives a contact access to data with the user's death certificate.
   - Facebook / Instagram Legacy Contact / memorialization.
   - X (Twitter) — submission process to deactivate after death.
   - LinkedIn — similar.
5. **Crypto and self-custodied assets:**
   - Seed phrases stored in metal backup (Cryptosteel etc.) or split via Shamir Secret Sharing.
   - Cold-wallet location documented.
   - Multisig setups with co-signers if value warrants.
   - Heir instructions — without the seed phrase or wallet access, crypto is functionally gone forever on death.
6. **Important data export plan.**
   - Photos: cloud-backup + a periodic local export. Family wants the photos more than the accounts.
   - Documents: tax returns, important PDFs — copies in a place the executor can access.
   - Email archive: for some people, the email itself is the family record.
7. **Subscriptions and recurring charges.** A list helps the executor cancel them post-death; otherwise charges continue.
8. **Devices.** Phone passcode + computer FDE recovery key documented securely so the executor can unlock and not face a wiped device.
9. **Document the existence of accounts, not the passwords**, in the estate documents. Passwords go in the password manager with emergency access; the will / letter of instruction points to the password manager.

## Required citations

- Each platform's legacy feature cites the official help page.
- Crypto-storage approach cites the user's actual setup.

## Deliverable shape

- Markdown plan `./money-desk/estate-legacy/digital-estate-review-<YYYYMMDD>.md`:
  - **Headline** — N action items.
  - **Password manager status** — set up / emergency contact designated / backup printed.
  - **2FA recovery status.**
  - **Per-platform legacy settings** — table of platform, feature, configured?
  - **Crypto plan** — heir-accessibility status.
  - **Important data export plan.**
  - **Subscription list** — for post-death cancellation.
  - **Device unlock plan.**
  - **Letter of instruction template** — pointing the executor at the password manager.

## Notes

- Digital assets are increasingly the bulk of the modern estate. Photos, content, crypto, domains, blogs/businesses — all need handoff plans.
- Sharing passwords in plain text in a will is a TERRIBLE idea — the will becomes public on probate.
- Crypto self-custody is unforgiving on death. Without keys, no recovery. Plan accordingly.
- "NOT legal advice. Some jurisdictions have specific digital-assets statutes (RUFADAA in many U.S. states) — attorney can advise."

## Determinism rules

### Input keys

- `password_manager` — `{ name | none, emergency_access_configured (bool), emergency_kit_stored_with_estate_docs (bool) }`
- `email_accounts` — list of `{ provider, recovery_email_set, recovery_phone_set, backup_codes_stored }` (bools)
- `two_factor` — `{ authenticator_backup_codes_stored (bool), sms_only_on_critical_accounts (bool) }`
- `platforms` — list of `{ platform (google | apple | facebook | instagram | x | linkedin | microsoft | other), legacy_feature_configured (yes | no | n/a) }`
- `crypto` — list of `{ wallet_or_exchange, type (hot | cold | exchange), value_usd, recovery_documented (bool), heir_instructions (bool), backup_method (none | paper | metal | shamir | multisig) }`
- `cloud_data` — `{ photos_exported_within_12mo (bool), important_docs_executor_accessible (bool) }`
- `subscriptions_list_exists` — bool
- `devices` — list of `{ device, unlock_method_documented (bool), fde_recovery_key_stored (bool) }`
- `letter_of_instruction_points_to_vault` — bool
- `review_date` — YYYY-MM-DD; default today

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Any unanswered yes/no item | Scored **not done** | `[ASSUMPTION]` |
| Crypto value | **Ask — no default**; drives severity only | `[USER-PROVIDED]` |
| Platform legacy-feature availability | Cite each platform's official help page | — |

None — no year-specific figures are used.

### Calculation method

1. **Score each item** in this fixed order with a fixed severity (each `done` / `not done` / `n/a`):
   - **D1** Password manager in use with emergency access configured — Critical
   - **D2** Primary email recovery (recovery email + phone + backup codes all set) — Critical
   - **D3** Each crypto holding with `value_usd > 0` has `recovery_documented` and `heir_instructions` — Critical
   - **D4** Authenticator backup codes stored with estate docs; no SMS-only 2FA on critical accounts — High
   - **D5** Every device has unlock method documented and FDE recovery key stored — High
   - **D6** Letter of instruction points to the password manager (no passwords in the will) — High
   - **D7** Each platform's legacy feature configured — Medium (one row per platform)
   - **D8** Crypto holdings with `value_usd ≥ $100,000` use metal, Shamir, or multisig backup — Medium
   - **D9** Photos exported within 12 months; important documents executor-accessible — Medium
   - **D10** Subscription list exists — Low
2. **Completion** `= done / (done + not done)` × 100, rounded to a whole percent (`n/a` excluded).
3. **Action items** = every `not done`, sorted by severity, then item number, then platform A–Z.

### Decision rules

Applied to the highest-severity `not done` item; evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | No inputs supplied | No review — ask |
| 2 | Any Critical not done | Fix Critical items this week (password-manager emergency access, email recovery, crypto heir path) |
| 3 | Any High not done | Fix within 30 days |
| 4 | Any Medium not done | Fix within 90 days |
| 5 | Any Low not done | Add to the next annual review |
| 6 | Otherwise | Complete — re-review in 12 months |

### Output template

```markdown
# Digital Estate Review — {review_date}

## Headline
**{action_count} action items** · completion {completion}% · Recommendation: **{rule # action}**.

## Password manager status
| Item | Status |
|---|---|
| Password manager | |
| Emergency access contact | |
| Emergency kit stored with estate docs | |

## 2FA recovery status
{D2 / D4 results}

## Per-platform legacy settings
| Platform | Feature | Configured? | Help-page source |
|---|---|---|---|

## Crypto plan
| Wallet / exchange | Type | Value | Recovery documented | Heir instructions | Backup method |
|---|---|---|---|---|---|
{or "Not applicable — no crypto holdings"}

## Important data export plan
{D9 results and steps}

## Subscription list
{exists / to create}

## Device unlock plan
| Device | Unlock documented | FDE key stored |
|---|---|---|

## Action items
| Priority | Item | Severity | Action |
|---|---|---|---|

## Letter of instruction template
{template pointing the executor to the password manager — never passwords}

NOT legal advice.
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).