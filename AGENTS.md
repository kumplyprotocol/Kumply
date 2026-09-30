# KUMPLY — Agent Rules

This file carries the hard rules that apply to any AI agent working in this
repo, regardless of tool (Claude Code, Antigravity, Cursor, etc.). It is
public and safe to read by anyone — internal strategy, team, and grant
context live in `CLAUDE.md` / `claude_estrategico.md` / `Memory.md`, which
are gitignored on purpose (see "Public/private boundary" below) and never
duplicated here.

For architecture, contracts, and full technical detail, start with
[README.md](README.md) and [LITEPAPER.md](LITEPAPER.md), not this file —
this is rules, not documentation.

## Public/private boundary

`CLAUDE.md`, `claude_estrategico.md`, `Memory.md`, `.agents/`,
`.cursorrules`/`.windsurfrules`/`.clinerules`, and `docs/submissions/` are
intentionally excluded from this public repo (see `.gitignore`). They hold
internal strategy, team contacts, and grant-negotiation context; copies sync
manually to a private repo. Never move content from those files into this
one or into any other public file — if something in them needs to be public,
it gets rewritten for a public audience first (see `docs/AI-USAGE.md` and
the README's "Security & Engineering Rigor" section for the pattern already
used).

## Solidity

- Natspec on every public function.
- Custom errors, not `require` strings.
- Events on every state-changing mutation.
- OpenZeppelin `AccessControl` + `Pausable` for access control and
  emergency stops; do not roll a custom equivalent.

## TypeScript / Node

- Strict mode everywhere.
- Zod for input validation on the API.
- Structured JSON logging: `{ ts, level, event, ...data }`. Levels: `INFO`,
  `WARN`, `ERROR`, `AUDIT`.
- HMAC-SHA256 on every webhook, no environment-based bypass, ever.

## Frontend (Next.js)

- Import `Link` from `@/i18n/routing`, never `next/link` directly, inside
  `[locale]` pages.
- Every new page under `[locale]` uses `useTranslations()` from
  `next-intl`; add both `en` and `es` entries in `messages/`, not just one.
- This app uses `localePrefix: 'never'` (see `src/i18n/routing.ts`) — public
  URLs never carry `/en/` or `/es/`. Next's automatic metadata for
  file-convention routes (`opengraph-image.tsx` and similar) still resolves
  its absolute URL from the internal `[locale]` route segment, producing a
  `/en/...`/`/es/...` URL that 307-redirects and breaks link previews on
  Telegram/WhatsApp/Discord/X (none of which follow redirects on `og:image`).
  Any new dynamic route with a file-convention image/metadata export needs
  its `openGraph.images`/`twitter.images` set explicitly in
  `generateMetadata` to the prefix-less URL, not left to Next's inference.

## Public-facing legal & compliance copy

- Don't state a legal/regulatory classification, license-exemption, or
  "no risk" claim as settled fact until a real legal opinion confirms
  it. Hedge with what's actually true today (e.g. "designed to operate
  as X. A formal legal opinion is planned before any fee is activated on
  mainnet.") instead of declaring the conclusion. Don't say an opinion is
  "in process" unless counsel is actually engaged.
- No "first", "only", "unique", "no other" or "to our knowledge, the
  first" claims. Adjacent work exists (for example Kite AI's Agent
  Passport on Avalanche, DIF's KYA-OS, Avalanche's Evergreen Subnets for
  validator permissioning). Say what KUMPLY actually does differently
  instead.
- On-chain attestations are public (address, tier, timestamp, expiry,
  verifier). Never describe them as encrypted, private, or a token.
- Describe planned features as planned, not in the present tense. That
  covers AgentRegistry fields, ICM propagation, the L1 (registered on Fuji,
  not activated) and automatic validator removal (it isn't automatic:
  someone must call `disableExpiredValidator()`).
- Don't name a partner or pilot in public copy without their written
  permission.
- Spanish copy uses Mexican Spanish (tú), never voseo ("describes", not
  "describís").

## Tier semantics

- Tiers 1-3 are a ladder for people. Tier 4 (business, KYB) and Tier 5
  (agent, KYA) are separate categories, not higher levels.
- Never gate with a bare `tier >= X`. Check "a person at level N or
  higher" (`tier >= N && tier <= 3`), "a business" (`tier == 4`) or
  "an agent" (`tier == 5`). In the SDK, use `isPersonAtLeast` /
  `isBusiness` / `isAgent`; `hasTier()` is deprecated.
- The deployed `ComplianceGate` contracts (Fuji and Mainnet C-Chain,
  `requiredTier = 2`) still use the old ladder and are immutable. Keep
  that documented wherever they are mentioned.
- A certification (SOC 2, ISO 27001, PCI DSS) or a KYB check is not a
  financial/regulatory license — don't call a certified or
  KYB-verified party "licensed."

## Testing

- New code needs tests. `pnpm test` runs the full monorepo suite; keep it
  green before committing.
- Contracts: Hardhat + Chai. SDK/API: Vitest, with Supertest for the API's
  HTTP assertions.

## Releases and merges

- Merging to `main` deploys the site (Vercel), so a human approves every
  merge. Merge only after CI is green on the exact head commit, then
  verify the change live.
- `npm publish` for `@kumply/sdk` runs only from `packages/sdk` (the root
  package is private), and only after a human has reviewed the diff and
  the `npm pack --dry-run` output. A human runs the publish. After
  publishing, confirm the registry tarball's shasum matches the dry-run.
- Never `git add -A`. Stage files by name.

## Commits

- Every AI-assisted commit carries a `Co-Authored-By: Claude Sonnet 5
  <noreply@anthropic.com>` trailer (or the equivalent for whichever model
  did the work), no exceptions. This is the running, code-level version of
  the disclosure in `docs/AI-USAGE.md`.
- Findings or fixes that touch identity-verification logic, custody, or an
  already-deployed and verified contract get reported and confirmed by a
  human before being applied — not applied automatically.

## Session resumption and hallucination discipline

**When resuming with `claude --continue`, don't re-read what's already
in context or re-verify what's already verified this session.** Answer
directly on what's already established. Detail and why in
`playbooks/continue.md`.

**Zero hallucination. Anything date-dependent gets verified live before
being stated, never from training memory — versions, prices, platform
rules, legal deadlines.** It's fine to say "I don't know, that needs
verifying." Every claim should trace back to something verifiable; if
not, mark it as inference. Full guidance in `playbooks/continue.md`.

## Images and screenshots

**Image token cost is area-based, not file-weight-based — crop to the
relevant region before pasting.** Compressing the file (JPEG/WebP)
doesn't reduce tokens and can hurt text legibility; cropping dimensions
does. Detail and verified figures in `playbooks/images.md`.

**Batch multiple images into the same turn instead of pasting them one
at a time across separate turns.** Each new image invalidates the
prompt cache from that point forward — pasting one at a time forces
repeated cache rewrites instead of cheap reads. Detail in
`playbooks/images.md`.

## Writing PRs, issues, and comments on GitHub

**Every PR, issue, and comment published to GitHub is written humanized
and tight - no padding, no AI-writing tells (em dashes, curly quotes,
unicode ellipsis), and the Co-Authored-By disclosure stays visible,
never stripped out to look more human.** Detail in `playbooks/git.md`.

**When the root cause is already confirmed, propose the actual fix, not
just the report.** A diff, corrected line, or exact reproduction beats
"this seems broken." Detail in `playbooks/git.md`.

**When citing or paraphrasing another thread, re-read the actual source
today before writing the citation - the disclosure's re-verification
sentence is only added if that re-read really happened.** A short, true
disclosure beats a longer one nothing backs up. Detail in
`playbooks/git.md`.
