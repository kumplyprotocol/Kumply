# Changelog

## 1.3.0

### Added
- `isPersonAtLeast(address, level)`: a verified person whose tier is between `level` and 3 (`level` is 1, 2 or 3). Tier 4 and 5 never pass. Throws for any other `level`.
- `isBusiness(address)`: exactly Tier 4 (KYB).
- `isAgent(address)`: exactly Tier 5 (KYA).

### Deprecated
- `hasTier(address, tier)`. It compares tiers as one ladder, so a Tier 5 agent passes `hasTier(x, TIER.KYB)`. Its behavior is unchanged; use the three methods above.

### Docs
- Tier rule: 1-3 are a ladder for people; 4 (business) and 5 (agent) are separate categories. Never gate with a bare `tier >= X`.
- The Solidity example uses `onlyPersonAtLeast` / `onlyBusiness` / `onlyAgent` instead of `tier >= requiredTier`.
- The deployed `ComplianceGate` contracts (Fuji and Mainnet C-Chain, `requiredTier = 2`) still use the ladder.

## 1.2.0

### Changed
- **`network: "kumply-l1"` now throws a clear `@kumply/sdk` error at construction** while the KUMPLY Compliance L1 is not active, unless you pass your own `rpcUrl` (for example a local devnet). Before, the constructor succeeded and every call failed later with an opaque transport error, because the L1 isn't converted yet and its public RPC answers HTTP 405. If you build a `kumply-l1` client without `rpcUrl`, catch the error or switch to `"fuji"`/`"mainnet"`.
- **`KUMPLY_L1_CONFIG.live` is now `false`.** It said `true` even though the L1 has no validators.

### Docs
- **Paymasters and ERC-7562:** don't call `verify()` inside `validatePaymasterUserOp`. It reads `block.timestamp`, which ERC-7562 (rule OP-011) blocks during validation. Read `attestations(sender)` instead and return `expiry` as `validUntil`. See kumply.xyz/developers#paymasters.
- **KUMPLY Compliance L1 marked not active:** it is registered on Fuji but not converted, has no validators, and its RPC does not serve requests.
- **Validator gate described as deployed:** Tier 4 (KYB) or higher. A fix that restricts it to exactly Tier 4 is in the code and ships with the manager's redeploy before activation.

## 1.1.3

### Fixed
- **`getAttestation()` now returns `null` for expired attestations.** Previously it read the raw
  `attestations` mapping, which keeps `verified = true` after expiry, so an expired attestation
  came back as a valid-looking record. It now applies the same rule as the contract's `verify()`
  (valid only while `expiry` is in the future). `verify()`, `isVerified()` and `hasTier()` are
  unchanged. If you relied on reading expired records through `getAttestation()`, read
  `attestations(address)` directly via `client.publicClient` instead.
- `DEPLOYMENTS.fuji.validatorSetManager` now points to the live `0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64`.
  1.1.2 still shipped the superseded `0x7Dc03c4Af8a604E602A0237eb2f6868B95097333`.

### Docs
- Documented `verify()` semantics: `timestamp` is issuance time and `expiry` is expiration time (UNIX
  seconds); `verified` is `false` for expired, revoked, or never-issued addresses with all other
  fields `0`; it is a free `view` call and works while the contract is paused.
- Added a note on smart accounts (ERC-4337): attest and query the exact address that signs or is sponsored.
- Removed a redundant `exp > block.timestamp` check from the Solidity example.
