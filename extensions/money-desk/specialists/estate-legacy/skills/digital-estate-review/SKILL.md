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

- Markdown plan `./reports/estate-legacy/digital-estate-review-<YYYYMMDD>.md`:
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
