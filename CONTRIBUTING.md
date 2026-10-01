# Contributing to KUMPLY

Thanks for helping. KUMPLY is a pnpm monorepo: Solidity contracts, a TypeScript SDK (`@kumply/sdk`), an Express API and a Next.js site.

## Setup

Requirements: Node.js 20, pnpm 10.

```bash
git clone https://github.com/kumplyprotocol/Kumply.git
cd Kumply
pnpm install
cp .env.example .env              # never commit .env
pnpm --filter @kumply/sdk build   # the API and web packages import the SDK
```

## Tests

Keep everything green before opening a PR. New code needs tests.

```bash
pnpm test                               # everything
pnpm --filter @kumply/contracts test    # Hardhat + Chai
pnpm --filter @kumply/sdk test          # Vitest
pnpm --filter @kumply/api test          # Vitest + Supertest
pnpm --filter web build                 # Next.js build
```

## Project rules

The full list lives in [AGENTS.md](AGENTS.md). The ones contributors hit most:

- **Tiers.** Tiers 1-3 are a ladder for people; Tier 4 (business, KYB) and Tier 5 (agent, KYA) are separate categories. Never gate with a bare `tier >= X`. In the SDK use `isPersonAtLeast`, `isBusiness` or `isAgent`.
- **Site copy.** Every page under `apps/web/src/app/[locale]` uses `next-intl`; add both `en` and `es` strings. Spanish copy uses Mexican Spanish (tú).
- **Solidity.** NatSpec on public functions, custom errors instead of `require` strings, an event on every state change.
- **Public claims.** Don't call planned features live, and don't state legal conclusions as settled.

## Commits

Use short conventional-style subjects, as in the existing history: `fix(sdk): ...`, `docs(web): ...`, `feat(contracts): ...`.

If an AI tool helped write a commit, say so with a trailer naming the model:

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

This is the code-level version of the disclosure in [docs/AI-USAGE.md](docs/AI-USAGE.md). Don't strip it to make a commit look hand-written.

## Pull requests

1. Fork the repo, or create a branch if you have access, from `main`.
2. Keep one change per PR, with tests and both locales where they apply.
3. Fill in the PR template. CI must pass.
4. A maintainer reviews and merges. Merging to `main` deploys kumply.xyz, so every merge is reviewed by a human.

Found a security issue? Don't open an issue. See [SECURITY.md](SECURITY.md).
