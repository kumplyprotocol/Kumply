// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/// @title WorkshopKYA — Educational attest -> tier -> verify() toy contract
/// @notice Built for KUMPLY's live "KYA: Verifying AI Agents On-Chain" workshop with Team1
///         LatAm (Sept 24, 2026). It mirrors the same attest -> tier -> verify() pattern
///         KUMPLY's real AttestationStore.sol runs in production, stripped down so it
///         compiles and deploys in minutes inside Remix, with no local setup.
/// @dev EDUCATIONAL ONLY. `issueTier` is deliberately left open, with no access control,
///      no roles, no pausing, no expiry, and no fees, so every workshop attendee can call
///      it directly on their own deployment during the session. That is the opposite of
///      how KUMPLY's real AttestationStore.sol works in production, where `issueTier`'s
///      equivalent (`issueAttestation`) is restricted to accounts holding `VERIFIER_ROLE`.
///      DO NOT deploy this contract to mainnet and DO NOT reuse this code in anything that
///      touches real value or real compliance decisions - it has none of the access
///      control, expiry, or revocation logic that makes an attestation contract safe to
///      rely on. Use AttestationStore.sol (contracts/AttestationStore.sol in this repo) for
///      anything real.
/// @dev REMIX SETUP: in the Solidity Compiler panel, open "Advanced Configurations" and set
///      "EVM Version" to "cancun" explicitly - do NOT leave it on "default". Checked live on
///      20-Sep-2026: Remix's "default" with the compiler it ships today resolves to "osaka",
///      a newer EVM target than what Avalanche C-Chain/Fuji currently run (this repo's own
///      Hardhat config compiles everything against "cancun" - confirmed by
///      scripts/test-workshop-kya.ts's real Fuji deployment). Deploying with the wrong EVM
///      version selected is the most likely way this exercise breaks live for an attendee.
///      Do NOT change the compiler version to fix this - leave it on Remix's actual current
///      default (0.8.34 as of 20-Sep-2026), which already supports "cancun" fine. Manually
///      lowering it to something below 0.8.24 breaks the combination outright: solc only
///      added "cancun" as a valid EVM Version target in 0.8.24 (Solidity 0.8.24 release,
///      26-Jan-2024) - an older compiler simply doesn't recognize "cancun" as an option.
///      Confirmed live the hard way: dropping to exactly 0.8.20 (this file's own pragma
///      floor) and selecting "cancun" fails. The only setting that needs to change from
///      Remix's defaults is EVM Version; the compiler dropdown can stay untouched.
contract WorkshopKYA {
    /// @notice Tier currently assigned to each address. 0 means "no tier issued."
    mapping(address => uint32) public tierOf;

    /// @notice Emitted whenever a tier is issued (or overwritten) for a subject address.
    event TierIssued(address indexed subject, uint32 tier);

    /// @notice Assign a tier to any address. No access control on purpose - see the
    ///         contract-level warning above. Anyone can call this on anyone.
    /// @param subject The address to assign a tier to.
    /// @param tier The tier value to assign (any uint32; the real contract validates 1-5,
    ///        this workshop version doesn't, to keep the exercise minimal).
    function issueTier(address subject, uint32 tier) external {
        tierOf[subject] = tier;
        emit TierIssued(subject, tier);
    }

    /// @notice Read the tier currently assigned to an address.
    /// @param subject The address to check.
    /// @return tier The tier assigned to `subject` (0 if none was ever issued).
    function verify(address subject) external view returns (uint32 tier) {
        return tierOf[subject];
    }
}
