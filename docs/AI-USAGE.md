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
