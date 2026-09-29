# Changelog

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
