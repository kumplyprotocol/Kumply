# KUMPLY vs Avalanche Official Tooling - Audit (17 Aug 2026)

Audit of KUMPLY's contracts and Sumsub integration against AVAXSKILLS (Ayomisco/avaxskills,
Apache-2.0) and three Ava Labs reference repositories (avalanche-cli, avalanche-starter-kit,
icm-contracts). Setup steps are in SETUP.md. This is not a rewrite: findings are reported here
first, with only low-risk tooling additions applied directly. Anything touching identity
verification logic, custody, or an already-verified deployed contract is proposed, not applied,
per repo policy.

Tooling versions used: AVAXSKILLS as installed via `npx openskills install Ayomisco/avaxskills`
on 17 Aug 2026; avalanche-cli, avalanche-starter-kit, icm-contracts as shallow clones (depth 1)
of `main` on the same date.

## Fix - confirmed and applied same day

Findings 1 through 3 below were reported first, then confirmed by the project owner and applied
the same day. `KumplyValidatorSetManager` was redeployed and re-verified on Fuji at
`0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64` (superseding `0x7Dc03c4Af8a604E602A0237eb2f6868B95097333`,
which carried the bug described in finding 1 and is now itself superseded, following the same
pattern as the 21 Jul 2026 redeploy). All 164 tests pass after the fix.

### 1. L1 bootstrap will fail against the real P-Chain (Critical)

File: `contracts/contracts/libraries/ValidatorMessages.sol`, function `computeConversionID`.

KUMPLY's `computeConversionID` builds the pre-image for the L1 conversion hash like this:

```solidity
bytes memory preimage = abi.encodePacked(
    CODEC_ID,
    data.subnetID,
    data.validatorManagerBlockchainID,
    data.validatorManagerAddress, // 20 bytes, no length prefix
    uint32(data.initialValidators.length)
);
```

The real Ava Labs implementation (`icm-contracts/contracts/validator-manager/ValidatorMessages.sol`,
function `packConversionData`) builds the same pre-image with one extra field: a `uint32(20)`
length prefix immediately before the manager address.

```solidity
bytes memory res = abi.encodePacked(
    CODEC_ID,
    conversionData.subnetID,
    conversionData.validatorManagerBlockchainID,
    uint32(20),
    conversionData.validatorManagerAddress,
    uint32(conversionData.initialValidators.length)
);
```

The P-Chain signs a `SubnetToL1ConversionMessage` whose `conversionID` is `sha256` of that
Ava Labs layout. KUMPLY's pre-image is missing 4 bytes, so `sha256(preimage)` will never equal
the real conversionID. `initializeValidatorSet` calls `ConversionIDMismatch` on any genuine
P-Chain-issued conversion message. In practice this means the KUMPLY Compliance L1 cannot be
bootstrapped as the code stands today, which is the core of milestone M4.

Why the existing 27 KumplyValidatorSetManager tests did not catch this: `MockWarpMessenger`
lets a test inject any payload directly via `_mockSetVerified(...)`, so a test that builds its
mock payload using KUMPLY's own `computeConversionID` will always agree with itself. The tests
never exercise the mismatch against the real Ava Labs wire format, because nothing in the test
suite calls the real `icm-contracts` packing function to build the injected message.

Suggested fix: insert `uint32(20)` into the pre-image immediately before
`data.validatorManagerAddress`, matching the reference layout exactly.

Status: fixed and redeployed. `uint32(20)` added to the pre-image in
`contracts/contracts/libraries/ValidatorMessages.sol`. The test suite's off-chain JS
re-implementation of this same packing (`contracts/test/KumplyValidatorSetManager.test.ts`) had
the identical gap and was fixed in lockstep, since it is what let the bug pass 27/27 tests
undetected in the first place. Redeployed to Fuji at
`0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64`, Snowtrace-verified, 110/110 contract tests pass.

### 2. initializeValidatorSet is missing two sanity checks present in the reference (Medium)

File: `contracts/contracts/KumplyValidatorSetManager.sol`, function `initializeValidatorSet`.

The reference `ValidatorManager.initializeValidatorSet` checks, before trusting the conversion
data:

```solidity
if (conversionData.validatorManagerBlockchainID != WARP_MESSENGER.getBlockchainID()) {
    revert InvalidValidatorManagerBlockchainID(conversionData.validatorManagerBlockchainID);
}
if (address(conversionData.validatorManagerAddress) != address(this)) {
    revert InvalidValidatorManagerAddress(address(conversionData.validatorManagerAddress));
}
```

KUMPLY's version only checks `data.subnetID != _subnetID` before verifying the Warp payload
hash. Because the conversionID is tied to the full ConversionData contents by a P-Chain-signed
hash, this is not independently exploitable on its own, since only the real P-Chain conversion
for this exact subnet could produce a Warp message with a matching conversionID. It is
defense-in-depth against operational mistakes, for example the same calldata being replayed
against a different contract deployment or the wrong network, and it is cheap to add.

Status: fixed in the same redeploy as finding 1. Both checks added to `initializeValidatorSet`,
with two new custom errors (`InvalidValidatorManagerBlockchainID`, `InvalidValidatorManagerAddress`).

### 3. Webhook HMAC comparison is not constant-time (Medium)

Files: `apps/web/src/app/api/webhook/route.ts:47`, `apps/api/src/index.ts:263`.

Both handlers compute the expected Sumsub signature and compare it with plain string
inequality:

```typescript
if (!signature || signature !== calculated) {
```

Standard practice for HMAC/webhook signature checks is a constant-time comparison, for example
Node's `crypto.timingSafeEqual`, which needs a length-equality guard first since it throws on
mismatched buffer lengths:

```typescript
const sigBuf = Buffer.from(signature ?? "", "utf8");
const calcBuf = Buffer.from(calculated, "utf8");
const valid = sigBuf.length === calcBuf.length && crypto.timingSafeEqual(sigBuf, calcBuf);
if (!signature || !valid) { ... }
```

A plain `!==` comparison leaks timing information proportional to the position of the first
differing byte, which is a known side channel for guessing secrets over many requests. Real-world
exploitability here is limited (network jitter, and the attacker would need to guess a
384-bit HMAC digest byte by byte), but the fix is small and this endpoint gates on-chain
attestation issuance.

Status: fixed. Both handlers now compare with `crypto.timingSafeEqual` behind a length-equality
guard. 17/17 API tests pass, including the existing invalid-signature and truncated-signature
cases.

## Improve - also applied directly

### 4. verify-contracts.ts did not cover KumplyValidatorSetManager

File: `contracts/scripts/verify-contracts.ts`.

The script verified `AttestationStore` and `ComplianceGate` on Snowtrace but not
`KumplyValidatorSetManager`, even though the manager was verified manually once (per project
history) outside any script. Added a third verification step, gated to Fuji only since the
manager is not deployed on mainnet, reading constructor arguments from
`l1/.deployment/validator-manager.json` (written by `deploy-validator-manager.ts`) with an
env var fallback. This is tooling only: it does not change any deployed contract's behavior,
only how an already-deployed, already-verified contract's source gets published reproducibly.
Type-checked clean against the project's own `tsconfig.json`.

## Remove

No dead code, obsolete dependency, or superseded pattern was found that qualifies for removal.
Reporting this plainly rather than inventing an item to fill the category.

## Add - flagged, not applied

### 5. Gas optimization vs Retro9000

`skills/gas` and `skills/precompiles` list standard storage-packing, calldata, and unchecked-loop
optimizations. AttestationStore, ComplianceGate, and KumplyValidatorSetManager already follow the
main patterns those skills recommend: custom errors instead of require strings, calldata for
external function inputs, events over storage-based history, checked arithmetic outside of
explicitly bounded loops. No unsafe or clearly-missed optimization was found.

Flagging the tension explicitly, as asked: KUMPLY intends to apply to Retro9000, which rewards
AVAX burned via gas on Mainnet C-Chain. Reducing gas per call directly reduces that metric. Any
future gas optimization pass on these contracts should be a deliberate business decision made
with that trade-off in view, not a default "smaller is better" pass. Not applying anything gas
related here for that reason, beyond what was already true before this audit.

### 6. ReentrancyGuard on AttestationStore.withdrawFees

`skills/security` and `skills/audit` both list `nonReentrant` on all external state-changing
functions as a checklist item. `AttestationStore.withdrawFees()` sends AVAX via a low-level
`.call{value: amount}("")` without `nonReentrant`. Reviewed for actual risk: the function reads
`address(this).balance` fresh on every call rather than a separate stored ledger variable, so a
reentrant call from a malicious `DEFAULT_ADMIN_ROLE` holder would see the already-reduced balance
and revert on `NoFeesToWithdraw`, not double-withdraw. Not independently exploitable as coded.
Still recommend adding `ReentrancyGuard` (already imported and used in
`KumplyValidatorSetManager`, so no new dependency) as free defense-in-depth matching the audit
checklist, ahead of the M1 hardening pass.

Confirmation needed because: same policy as findings 1 to 3, this touches the deployed, verified
AttestationStore.

## Design difference noted, not a bug

`KumplyValidatorSetManager`'s churn control caps the number of add/remove/weight-change events
per day (`MAX_CHURN_PER_PERIOD = 20`) plus a separate 20% per-validator weight cap, rather than
the reference `ValidatorManager`'s single mechanism of capping churn as a percentage of total
validator weight per period. The contract's own comment already documents this as a deliberate,
gas-cheaper simplification ("ACP-99 leaves churn control to the implementer"). Recorded here for
completeness, not raised as a finding, since it is an already-documented intentional choice.

## Sumsub integration vs skills/kyc-aml-integration

Already matches the skill's rules: HMAC-verified webhook with no environment bypass, on-chain
storage limited to tier and expiry with no PII, a regulated third-party provider rather than
custom AML screening, and idempotency on both the on-chain `isVerified()` check (persistent
across serverless cold starts) and an in-memory guard on the long-lived Express process. The one
gap found is the timing-safe comparison in finding 3 above.

## icm-contracts vs the L1 plan

Beyond findings 1 and 2, `KumplyValidatorSetManager`'s `packRegisterL1ValidatorMessage`,
`unpackL1ValidatorRegistrationMessage`, and `packL1ValidatorWeightMessage` /
`unpackL1ValidatorWeightMessage` byte layouts were checked field by field against the reference
`ValidatorMessages.sol` and match exactly, including the `PChainOwner` sub-encoding
(threshold, address count, addresses). The initial-validator `validationID` derivation
(`sha256(subnetID || index)`) also matches the reference exactly. `contracts/scripts/icm-verify.ts`
references the real Fuji C-Chain Teleporter address
(`0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf`), which matches the address documented in
`skills/teleporter` for all EVM chains.

## avalanche-starter-kit vs KUMPLY's structure

The starter kit is Foundry-based (`lib/forge-std`, `lib/icm-contracts`, `lib/openzeppelin-contracts`)
with contracts split under `interchain-messaging/` and `interchain-token-transfer/`. KUMPLY is
Hardhat-based, which is already documented project-wide (CLAUDE.md, hardhat.config.ts, CI). This
is a tooling choice, not a defect. No changes suggested here, since a Foundry migration would be
a rewrite and was explicitly out of scope. The starter kit has no LICENSE file, so nothing from
it was copied, per SETUP.md.

## avalanche-cli vs KUMPLY's deploy scripts

`contracts/scripts/deploy-l1.sh` uses `avalanche blockchain create`, `avalanche blockchain deploy`,
and `avalanche blockchain describe`. `skills/subnet-deployment` states that `avalanche subnet` is
deprecated in favor of a "Platform CLI" (`platform subnet create`, `platform chain create`,
`platform l1 register-validator`, and so on). Checked against the actual cloned
`ava-labs/avalanche-cli` source: the root Cobra command is named `avalanche`
(`cmd/root.go:59`), the relevant subcommand package is `blockchaincmd` with `Use: "blockchain"`
(`cmd/blockchaincmd/blockchain.go:17`), and there is no `platform` command anywhere in the
repository. KUMPLY's script already matches the real, current CLI. The skill's guidance does
not match the source at the version cloned for this audit and was reported upstream:
https://github.com/Ayomisco/avaxskills/issues/2

## Summary

| # | Category | File | Severity | Status |
|---|---|---|---|---|
| 1 | Fix | contracts/contracts/libraries/ValidatorMessages.sol | Critical | Fixed, redeployed, verified |
| 2 | Fix | contracts/contracts/KumplyValidatorSetManager.sol | Medium | Fixed in same redeploy |
| 3 | Fix | apps/web/src/app/api/webhook/route.ts, apps/api/src/index.ts | Medium | Fixed |
| 4 | Improve | contracts/scripts/verify-contracts.ts | N/A | Applied |
| 5 | Add | gas optimization | N/A | Flagged, not applied (Retro9000 trade-off) |
| 6 | Add | contracts/contracts/AttestationStore.sol | Low | Reported, needs confirmation |
| 7 | External (upstream) | AVAXSKILLS skills/precompiles | N/A | Filed, avaxskills#3, open |
| 8 | External (upstream) | AVAXSKILLS skills/validator-management | N/A | Filed as comment on avaxskills#2, open |
| 9 | Fix | contracts/scripts/deploy-l1.sh | N/A (deploy tooling) | Flag renames applied; jq/describe issue flagged, not applied |
| 10 | Fix | contracts/scripts/deploy-l1.sh | N/A (unverified named entities) | Scrubbed |
| 11 | External (upstream) | AVAXSKILLS skills/custom-vm | N/A | Filed as comment on avaxskills#2, open |
| 12 | External (upstream) | AVAXSKILLS skills/wagmi | N/A | Filed, avaxskills#4, open |

New Fuji deployment from this audit: `KumplyValidatorSetManager` at
`0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64` (supersedes `0x7Dc03c4Af8a604E602A0237eb2f6868B95097333`,
which carried finding 1's bug).

External finding filed upstream, not a KUMPLY issue: AVAXSKILLS `subnet-deployment` skill
documents CLI commands that do not exist in `ava-labs/avalanche-cli`
(https://github.com/Ayomisco/avaxskills/issues/2).

## Round 2 (same day) - a second pass focused on skills KUMPLY actually uses

A second pass targeted the AVAXSKILLS skills KUMPLY's own patterns actually match
(kyc-aml-integration, validator-management, subnet-governance, security, audit,
contract-verification), plus `ava-labs/subnet-evm` (freshly cloned, LGPL-3.0) checked against
KUMPLY's real `genesis.json`, and a closer look at `avalanche-cli`'s actual genesis-generation
flags against `contracts/scripts/deploy-l1.sh`, the script KUMPLY would run to redeploy or deploy
a second L1 environment.

### 7. AVAXSKILLS precompiles skill: wrong TxAllowList genesis key

`skills/precompiles/SKILL.md` documents the TxAllowList precompile's genesis config key as
`transactionAllowListConfig`. The real key, confirmed against `ava-labs/subnet-evm`
(`precompile/contracts/txallowlist/module.go:20`, `const ConfigKey = "txAllowListConfig"`), is
`txAllowListConfig`. The other four precompile keys documented in the same skill file
(`contractDeployerAllowListConfig`, `contractNativeMinterConfig`, `feeManagerConfig`,
`warpConfig`, `rewardManagerConfig`) all check out correct against the same source. KUMPLY's own
`contracts/l1/genesis.json` already uses the correct `txAllowListConfig`, independently of this
skill, so no KUMPLY-side fix was needed here. Filed upstream:
https://github.com/Ayomisco/avaxskills/issues/3

### 8. AVAXSKILLS validator-management skill: CLI commands that do not exist

Same root cause as finding in issue #2 (stale CLI vocabulary), found in a different skill file.
`skills/validator-management/SKILL.md` documents `avalanche primaryNetwork addValidator` (real:
`avalanche primary addValidator`, confirmed in `cmd/primarycmd/`) and `avalanche subnet
addValidator` / `avalanche subnet removeValidator` (no `subnet` command family exists at all;
`cmd/validatorcmd` currently exposes `increaseBalance`, `list`, and `getBalance`, not
add/removeValidator). Filed as a comment on the existing issue rather than a new one, since it's
the same class of problem: https://github.com/Ayomisco/avaxskills/issues/2#issuecomment-5320383561

### 9. KUMPLY's own deploy-l1.sh does not match the current avalanche-cli (Fix - applied where unambiguous)

Not an external finding. Checking `contracts/scripts/deploy-l1.sh` against the actual flags
registered on `avalanche blockchain create`/`deploy`/`describe` in the cloned `avalanche-cli`
source turned up three real breakages:

- `--evm-defaults` does not exist on `avalanche blockchain create`. It exists only on the separate
  `avalanche node wiz` command (`cmd/nodecmd/wiz.go:118`). The real flags on `blockchain create`
  for this purpose are `--production-defaults` / `--test-defaults`.
- `--custom-vm-genesis` does not exist anywhere in `avalanche-cli`. The real flag to supply a
  genesis file to `blockchain create` is `--genesis` (`cmd/blockchaincmd/create.go:104`).
- `avalanche blockchain describe` has no JSON or machine-readable output mode at all (confirmed:
  no `--json`/`--output` flag on the command or on root; it prints a formatted table via
  `github.com/jedib0t/go-pretty`). The script pipes its output through `jq -r '.subnetID'` and
  similar, which cannot work against table output. The `|| echo ""` fallback means this fails
  silently into empty IDs rather than a loud error.

`avalanche blockchain deploy "$L1_NAME" --"$NETWORK"` (expanding to `--fuji`/`--mainnet`) and
`--output-tx-path` were both checked and are correct as written.

Applied directly, since these are unambiguous syntax corrections in a deploy script, not a
deployed contract: `--evm-defaults` to `--test-defaults` (matching the script's own stated
default of targeting Fuji), `--custom-vm-genesis` to `--genesis`. Not applied, left as a flagged
comment in the script itself: the `describe`/`jq` extraction is a real design problem, not a typo,
and needs either table-output parsing or reading `subnetID`/`blockchainID` directly from the
CLI's own on-disk sidecar data (`pkg/models/sidecar.go` has a `SubnetID` field; exact on-disk path
and field names not fully traced in this pass) - worth resolving before this script is next run
for real, likely ahead of M4.

### 10. Unconfirmed named entities in deploy-l1.sh, scrubbed

Also noticed in the same script: Step 4/5's output listed "Expected initial validators:
Bankaool, Arkangeles, KUMPLY Protocol Treasury." Checked against every other mention of these two
names in the repo (LITEPAPER.md section 1.1, pitch-deck.ts slide 9): both are consistently and
correctly scoped everywhere else as the entities who defined institutional challenges for
Avalanche's LatAm Institutional Hackathon in May 2026, explicitly caveated ("that demand signal
belongs to Avalanche, not to us"; "KUMPLY participated; we did not place"). Nothing anywhere in
the repo, in this audit, or in prior project history establishes that either entity agreed to run
a KUMPLY L1 validator, or has any confirmed operational relationship with KUMPLY at all. This one
script line was the sole exception to an otherwise consistently honest framing, and named two real
companies as if they were confirmed counterparties without their consent. Scrubbed: the line now
states plainly that no initial validators are confirmed beyond the treasury wallet, and points to
the litepaper's real-time M0 status instead of naming anyone. This was not left as a flagged
comment, unlike finding 9's `jq`/JSON issue, because the risk profile is different: an unresolved
technical gap fails loudly the next time the script runs, while an uncorrected unverified name in
a public, committed script keeps being true-sounding indefinitely until someone reads closely
enough to question it.

No genuine finding in kyc-aml-integration, subnet-governance, security, audit, or
contract-verification beyond what was already covered in the first pass. No genuine finding in
OpenZeppelin `contracts` (v5.6.1, used unmodified for `AccessControl`, `Pausable`,
`ReentrancyGuard`): the version is current, the usage pattern is vanilla with no overrides, and
this library is audited far beyond what a source read in this pass could add to. Reporting this
plainly rather than manufacturing something to fill the section.

## Round 3 (same day) - ava-labs/precompile-evm, and skills KUMPLY's frontend/SDK actually use

Cloned `ava-labs/precompile-evm` (LGPL-3.0, added to SETUP.md) as directed. It is a template for
registering custom Go precompiles into a Subnet-EVM build, an architecturally different path from
what KUMPLY does today (genesis-level configuration of existing built-in precompiles, already
checked in Round 2). No AVAXSKILLS skill makes claims about custom precompile registration that
this repo could confirm or contradict, and precompile-evm's own build/test scripts are internally
consistent on inspection. No genuine finding here: reporting the repo as checked, with no
comparison surface found, rather than forcing one.

### 11. AVAXSKILLS custom-vm skill: same stale CLI commands, third instance

`skills/custom-vm/SKILL.md` Step 6 documents `avalanche subnet create` / `avalanche subnet
deploy`, the same non-existent command family as issues covered in #2 (subnet-deployment) and the
validator-management comment on the same issue. Custom-VM support in the real CLI is exposed via
flags on `blockchain create` (`--custom-vm-repo-url`, `--custom-vm-branch`,
`--custom-vm-build-script`, `--custom-vm-path`, all confirmed present in `cmd/blockchaincmd/create.go`),
not a separate `subnet` verb. Filed as a third comment on the same issue rather than a new one:
https://github.com/Ayomisco/avaxskills/issues/2#issuecomment-5321360572

### 12. AVAXSKILLS wagmi skill: stale version claim and a now-deprecated hook

`skills/wagmi/SKILL.md` states it covers "wagmi v2 (latest)." wagmi v3 has since shipped and is
what `npm install wagmi` resolves to today (checked: `npm view wagmi version` -> 3.7.6). KUMPLY's
own web app is already on wagmi ^3.6.15. The skill's own example code calls `useAccount()`, which
is not removed in v3 but is an explicitly `@deprecated` alias for the renamed `useConnection()`
hook (confirmed directly in the installed package's type declarations:
`node_modules/wagmi/dist/types/exports/index.d.ts`). Lower severity than the CLI findings, since
the code still runs, not a hard break, but the skill teaches a wrong "latest" version number and
an API the library itself says to stop using. Filed:
https://github.com/Ayomisco/avaxskills/issues/4

Checked and clean: `skills/viem` against the actually-installed `viem@2.48.11` (KUMPLY's SDK
dependency) -- chain IDs (43114 mainnet, 43113 Fuji), RPC URLs, block explorer URLs, and the
Multicall3 address all match the installed package's own chain definitions exactly. No finding.

## Round 4 (same day) - evm-hardhat and testing, against KUMPLY's real hardhat.config.ts

Checked `skills/evm-hardhat` and `skills/testing` against `contracts/hardhat.config.ts` and the
real test harness (`MockWarpMessenger` installed via `hardhat_setCode`). The skill's
`evmVersion: "paris"` recommendation differs from KUMPLY's own `"cancun"`, but this is a
conservative default for custom Subnets that may predate Cancun opcode support, not a factual
error -- KUMPLY's own `cancun` target compiles, deploys, and verifies successfully on both Fuji
and mainnet C-Chain today, confirmed repeatedly earlier in this same audit. The skill's
Teleporter-mocking pattern (a standalone `MockTeleporter` contract) is a different, also-valid
approach from KUMPLY's precompile-level mock, not a contradiction. No genuine finding in either
skill this round.

## Round 5 (same day) - remaining named skills

`skills/avalanche-sdk` and `skills/avalanche-js` (the official Ava Labs JS/TS SDK): checked
`package.json` in every workspace and `pnpm-lock.yaml` for any direct or transitive dependency on
either package. Zero matches. KUMPLY's entire stack (SDK, API, frontend) is built on plain viem
and wagmi, with no Avalanche-specific JS SDK anywhere in the tree. No comparison surface exists,
so no finding is possible either way -- not "checked and clean," genuinely not applicable.
`skills/contract-verification` was already checked in Round 1 (finding 4's context) against the
real `verify-contracts.ts` workflow and Snowtrace/Routescan API, no issue found there.

## Round 6 (same day) - remaining real dependencies (wallet connector, OpenZeppelin depth)

Listed every `dependencies`/`devDependencies` entry across all 5 `package.json` files in the
monorepo to find any AVAXSKILLS-relevant package not yet checked. Non-Avalanche-specific
libraries (Express, Zod, Next.js, React Three Fiber, TanStack Query) have no matching skill and
were skipped as genuinely out of scope, not silently ignored.

### 13. Real dependency found: `@reown/appkit` / `@reown/appkit-adapter-wagmi` (KUMPLY's actual wallet connector)

Cross-checked `skills/evm-wallet-integration` against `apps/web/src/providers/Web3Provider.tsx`.
The skill's documented pattern imports `avalanche`/`avalancheFuji` from `@reown/appkit/networks`;
KUMPLY's code imported them from `wagmi/chains` instead, with `const networks = [avalancheFuji,
avalanche] as any;` -- an `as any` cast papering over a real type mismatch. Traced it precisely:
`@reown/appkit-adapter-wagmi`'s `WagmiAdapter` and `@reown/appkit`'s `createAppKit` both type
their `networks` parameter as `AppKitNetwork` (from `@reown/appkit-common`), not viem/wagmi's
`Chain` type, even though `@reown/appkit/networks` itself just re-exports `viem/chains` under the
hood (confirmed: `export * from 'viem/chains'` in the installed package's source) -- so the
runtime values are identical, but the exported type identity differs, which is exactly what the
`as any` was silently hiding.

This is not an AVAXSKILLS bug -- the skill's guidance is correct. It is a small type-safety gap in
KUMPLY's own code, matching the same category as the deploy-l1.sh findings: found as a byproduct
of verifying the skill against real, currently-used code. Fixed: import from
`@reown/appkit/networks` instead of `wagmi/chains`, and typed `networks` explicitly as
`[AppKitNetwork, ...AppKitNetwork[]]` (the tuple `createAppKit` actually requires -- a plain
`AppKitNetwork[]` still fails type-check, since array literals widen to non-tuple arrays by
default; confirmed by re-running `tsc` after the import-only change and seeing the same class of
error resurface one level up). `as any` removed entirely. `apps/web` type-checks clean
(`npx tsc --noEmit`, zero errors) and builds clean (`pnpm --filter web build`, succeeds,
all 15 routes generated) after the fix.

### 14. OpenZeppelin `contracts`, checked past the surface this time

Round 2 noted "no genuine finding" in OpenZeppelin based on version currency and unmodified usage
alone. Went further this round: pulled OpenZeppelin's actual published GitHub Security Advisories
(`gh api repos/OpenZeppelin/openzeppelin-contracts/security-advisories`, 19 advisories returned,
spanning 2021 to 2025). None affect `AccessControl`, `Pausable`, or `ReentrancyGuard` -- the only
three OpenZeppelin modules KUMPLY imports, all unmodified. Every advisory found instead touches
Bytes/Base64 utilities, Governor variants, ERC165Checker, ERC721Consecutive, ERC1155Supply,
UUPSUpgradeable, TimelockController, ECDSA, TransparentUpgradeableProxy, or cross-chain/ERC2771
utilities -- none of which KUMPLY's contracts use. This is now a substantiated "nothing found,"
not a surface-level pass.
