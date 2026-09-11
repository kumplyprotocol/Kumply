# AI Usage Disclosure

KUMPLY's codebase, documentation, and this repository's engineering process use AI assistance
(Claude Code, Anthropic). This file discloses that use plainly, for grant reviewers and anyone
else evaluating the project. Every AI-assisted commit carries a `Co-Authored-By: Claude Sonnet 5
<noreply@anthropic.com>` trailer, which is the ongoing, code-level record of this disclosure.
Findings and fixes that touch identity-verification logic, custody, or an already-deployed and
verified contract are reported first and confirmed by a human before being applied, not applied
automatically.

## 17 Aug 2026 - Avalanche ecosystem tooling audit

An AI-assisted audit compared KUMPLY's contracts and Sumsub integration against AVAXSKILLS
(Ayomisco/avaxskills, Apache-2.0) and three Ava Labs reference repositories (`avalanche-cli`,
`avalanche-starter-kit`, `icm-contracts`), installed project-scoped and gitignored per
`SETUP.md`. Full findings: `docs/audits/avalanche-ecosystem-audit-2026-08-17.md`.

The audit found a critical bug in `KumplyValidatorSetManager.sol`: `ValidatorMessages
.computeConversionID` was missing a 4-byte length prefix that the real P-Chain wire format
requires before the validator manager address. The locally computed hash could never match a
genuine P-Chain-issued `SubnetToL1ConversionMessage`, so `initializeValidatorSet` would have
reverted against any real conversion message, permanently blocking the KUMPLY Compliance L1 from
activating. The existing 27 tests did not catch this because the test suite's mock had the
identical gap, so contract and mock agreed with each other without ever being checked against
the real Ava Labs wire format.

This was reported first, confirmed by the project owner, then fixed and redeployed to Fuji at
`0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64`, re-verified on Snowtrace, with the test suite fixed
to exercise the real P-Chain byte format rather than a self-consistent reimplementation of the
same bug. Two related gaps were also reported, confirmed, and fixed the same day: missing sanity
checks in `initializeValidatorSet` present in the reference implementation, and a non-constant-time
HMAC signature comparison in both Sumsub webhook handlers.

The same audit found and reported a real, reproducible bug in AVAXSKILLS itself, not in KUMPLY's
code: its `subnet-deployment` skill documents CLI commands (`platform subnet create`, and others)
that do not exist in the actual `ava-labs/avalanche-cli` source. Filed upstream, open as of
17 Aug 2026: https://github.com/Ayomisco/avaxskills/issues/2.

## 17 Aug 2026 - second pass, skills KUMPLY actually uses

A second AI-assisted pass, same day, targeted the AVAXSKILLS skills matching KUMPLY's own
patterns and cloned `ava-labs/subnet-evm` fresh to check against KUMPLY's real `genesis.json`.
This found two more real AVAXSKILLS inaccuracies: a wrong genesis key in `skills/precompiles`
(`transactionAllowListConfig` instead of the real `txAllowListConfig`, confirmed against
`subnet-evm` source, filed as
https://github.com/Ayomisco/avaxskills/issues/3), and more of the same stale CLI command naming
found in `skills/validator-management` (filed as a comment on issue #2, since it's the same class
of problem). As a byproduct rather than the stated goal, it also found a real bug in KUMPLY's own
`contracts/scripts/deploy-l1.sh`: two flags that do not exist on `avalanche blockchain create` in
the current CLI, and a `jq`/JSON extraction step that cannot work since `avalanche blockchain
describe` has no machine-readable output mode. The flag names were fixed; the JSON extraction
problem was flagged in the script with a comment rather than silently worked around, since it
needs a real design decision, not a typo fix. The same script also named two real companies
("Expected initial validators: Bankaool, Arkangeles...") as if they were confirmed validators,
inconsistent with how both are correctly caveated everywhere else in the repo. Nothing establishes
either agreed to run a KUMPLY validator, so the line was scrubbed rather than left as a flagged
comment, since an unverified name sitting in a public script keeps reading as true until someone
happens to question it closely. Full detail in
`docs/audits/avalanche-ecosystem-audit-2026-08-17.md`, "Round 2" section.

## 17 Aug 2026 - third pass, ava-labs/precompile-evm and frontend/SDK skills

A third pass, same day, cloned `ava-labs/precompile-evm` (LGPL-3.0) as directed and checked the
AVAXSKILLS skills matching KUMPLY's actual frontend/SDK stack (viem, wagmi). No comparison surface
was found for precompile-evm specifically (it covers custom Go precompile registration, an
architecturally different path from KUMPLY's genesis-config approach, already checked in the
second pass) -- reported honestly as checked with nothing to find, rather than forcing a result.
Two more real findings: `skills/custom-vm` repeats the same non-existent `avalanche subnet
create/deploy` commands as two earlier findings (filed as a third comment on
https://github.com/Ayomisco/avaxskills/issues/2), and `skills/wagmi` claims "wagmi v2 (latest)"
when v3 has since shipped and its own example code uses `useAccount`, an API wagmi's own type
declarations mark `@deprecated` in favor of `useConnection` (filed:
https://github.com/Ayomisco/avaxskills/issues/4). `skills/viem` was checked against KUMPLY's
actually-installed viem version and found accurate, no finding.

## 17 Aug 2026 - rounds 4 to 6, remaining real surface

Rounds 4 and 5 checked `skills/evm-hardhat`, `skills/testing`, `skills/avalanche-sdk`, and
`skills/avalanche-js` against KUMPLY's actual `hardhat.config.ts`, test harness, and dependency
tree (`package.json` plus `pnpm-lock.yaml` in every workspace). No finding in the first two
(differences noted were reasonable alternatives, not errors); the SDK skills were genuinely not
applicable, since KUMPLY has zero Avalanche-specific JS SDK dependencies anywhere in the tree.

Round 6 found something real by listing every dependency across all 5 `package.json` files:
`skills/evm-wallet-integration` documents importing `avalanche`/`avalancheFuji` from
`@reown/appkit/networks`; KUMPLY's `Web3Provider.tsx` imported them from `wagmi/chains` instead
and papered over the resulting type error with `as any`. The skill was right, not KUMPLY's
original code. Fixed: switched the import and typed the network list as the tuple
`createAppKit`/`WagmiAdapter` actually require, removing the `as any` entirely. Verified with a
clean `tsc --noEmit` and a successful production build. Also went deeper on OpenZeppelin than the
earlier "looks fine" pass: pulled OpenZeppelin's own published GitHub Security Advisories (19
total) and confirmed none affect `AccessControl`, `Pausable`, or `ReentrancyGuard`, the only
modules KUMPLY imports, unmodified. Full detail in
`docs/audits/avalanche-ecosystem-audit-2026-08-17.md`, "Round 6" section.

## 11 Sep 2026 - reopened, bounded: Reown/AppKit docs, and four remaining checks

The campaign above was declared closed on 17 Aug 2026 after Round 6/7 confirmed the dependency
tree was exhausted, with an explicit rule not to reopen it without genuinely new surface. Two
bounded reopenings happened the same day, 11 Sep 2026, each against surface not covered before:

**Round 8** checked Reown/AppKit (`@reown/appkit`/`@reown/appkit-adapter-wagmi`, KUMPLY's actual
wallet connector, confirmed installed at `1.8.19`) against its own live documentation -- the one
piece of that SDK never audited proactively, only reactively fixed in Round 6. `createAppKit()`,
`useAppKit()`, `useAppKitNetwork()`, `useAppKitAccount()`, and `WagmiAdapter`'s constructor all
matched the real installed `.d.ts` source exactly. No finding.

**Round 9** covered four more checks: AVAXSKILLS has shipped no new releases since 17 Aug (repo
dormant since 23 May); the `CONTRIBUTING.md` typo found in archived `icm-contracts` (finding #15)
turns out to already be fixed in its live successor `icm-services`, so no action is needed there;
`ava-labs/teleporter-token-bridge` is archived and points to `icm-contracts`, itself now also
archived -- a stale redirect chain, not actionable; and `avalanchego`'s README build instructions
checked clean against its actual `go.mod`/scripts. The Avalanche Bug Bounty program (Immunefi) was
verified live -- its 28-asset scope covers only bridged C-Chain tokens, not `avalanchego`,
`subnet-evm`, `icm-contracts`/`icm-services`, `platform-cli`, `avalanche-cli`, or any
ValidatorManager contract, confirming none of this campaign's findings (nor KUMPLY's own
contracts) were ever eligible for it.

One real, new finding: `build.avax.network`'s own `avalanche-cli` page now carries a deprecation
notice pointing to a separate tool, Platform CLI, for the exact operations AVAXSKILLS'
`subnet-deployment` skill described back in the original issue #2 -- meaning the tool AVAXSKILLS
predicted turned out to be real. Checked the actual `ava-labs/platform-cli` source: the skill's
subcommand names are half right (`subnet create`, `chain create`, `l1 register-validator`, `l1
disable-validator` all exist as named) but the root binary is `platform-cli`, not `platform`, and
two subcommands don't match (`convert-l1` should be `convert-to-l1`; `add-balance` doesn't exist,
the real command is `increase-validator-balance`). Posted as a correcting follow-up on the
existing issue: https://github.com/Ayomisco/avaxskills/issues/2#issuecomment-5639265335. Full
detail in `docs/audits/avalanche-ecosystem-audit-2026-08-17.md`, "Round 8" and "Round 9" sections.

## 11 Sep 2026 - escalated from issues to real PRs against AVAXSKILLS

All three upstream issues (#2, #3, #4) had gone unanswered for weeks despite follow-up nudges
earlier the same day. Forked [Ayomisco/avaxskills](https://github.com/Ayomisco/avaxskills) to
`Eras256/avaxskills` and opened three real pull requests, each fixing exactly the commands its
issue thread had flagged - re-verified line-by-line against the real, live source of
`ava-labs/platform-cli` and `ava-labs/avalanche-cli` before writing any diff, not against memory
of the original findings:

- [PR #5](https://github.com/Ayomisco/avaxskills/pull/5) (closes #2) - `subnet-deployment.md`,
  `validator-management.md`, `custom-vm.md`. Beyond the two specific fixes named in the issue
  (`convert-l1` -> `convert-to-l1`, `add-balance` -> `increase-validator-balance`), re-reading the
  real `platform-cli`/`avalanche-cli` source surfaced more of the same class of bug that hadn't
  been named yet: the binary is `platform-cli`, not bare `platform`, everywhere it's invoked; the
  root command `primaryNetwork` doesn't exist, the real one is `primary` (with several flag names
  also wrong - `--weight` not `--stakeAmount`, etc.); `validator add` doesn't exist, the real
  subcommand is `add-permissionless`; and two leftover `avalanche subnet configure`/`describe`
  references pointed at a command group that no longer exists at all. Fixed all of it, not just the
  two originally-named items - each one confirmed against the real cobra command definitions before
  being changed.
- [PR #6](https://github.com/Ayomisco/avaxskills/pull/6) (closes #3) - `precompiles.md`, the single
  `transactionAllowListConfig` -> `txAllowListConfig` genesis-key fix.
- [PR #7](https://github.com/Ayomisco/avaxskills/pull/7) (closes #4) - `wagmi.md`, updated "v2
  (latest)" to v3 and replaced the deprecated `useAccount` call with `useConnection` (confirmed as
  a same-shape drop-in rename against wagmi's own type declarations, not just the deprecation
  notice).

All three commits carry `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` and each PR
description discloses AI assistance explicitly, same as every finding in this document. `npm run
validate` (the repo's own CI check) passes locally for all edited files before each PR was opened.
None of these PRs are merged yet - the README's finding table links directly to each PR's live
status rather than asserting it's accepted.
