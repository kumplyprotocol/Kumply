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

New Fuji deployment from this audit: `KumplyValidatorSetManager` at
`0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64` (supersedes `0x7Dc03c4Af8a604E602A0237eb2f6868B95097333`,
which carried finding 1's bug).

External finding filed upstream, not a KUMPLY issue: AVAXSKILLS `subnet-deployment` skill
documents CLI commands that do not exist in `ava-labs/avalanche-cli`
(https://github.com/Ayomisco/avaxskills/issues/2).
