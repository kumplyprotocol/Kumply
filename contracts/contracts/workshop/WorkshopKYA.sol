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
