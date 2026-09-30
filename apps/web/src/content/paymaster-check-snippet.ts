// Mirrors contracts/contracts/examples/KumplyPaymasterCheck.sol exactly.
// contracts/test/KumplyPaymasterCheck.test.ts fails if the two drift apart.
export const PAYMASTER_CHECK_SOLIDITY = `// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/// @notice Read-only view of AttestationStore's public attestations getter.
interface IKumplyAttestations {
    function attestations(address subject) external view returns (
        bool verified,
        uint32 tier,
        uint64 timestamp,
        uint64 expiry,
        address verifier
    );
}

/// @title KumplyPaymasterCheck - example ERC-4337 paymaster gate on a KUMPLY attestation
/// @notice ERC-7562 (rule OP-011) blocks the TIMESTAMP opcode during UserOperation
///         validation, and AttestationStore.verify() reads block.timestamp. This helper
///         reads the raw attestations(sender) record instead and hands the expiry to
///         the EntryPoint as validUntil, so the time check happens outside validation.
/// @dev Call kumplyValidationData(userOp.sender) from validatePaymasterUserOp and return
///      the result as validationData. The record lives in a mapping keyed by the sender,
///      so it is storage associated with the account (ERC-7562 STO-021).
contract KumplyPaymasterCheck {
    /// @notice ERC-4337 validationData value meaning "reject this UserOperation"
    uint256 internal constant SIG_VALIDATION_FAILED = 1;

    /// @notice KUMPLY AttestationStore this paymaster reads from
    IKumplyAttestations public immutable kumply;
    /// @notice Exact tier required for sponsorship (5 = agent, KYA)
    /// @dev Tiers are not a single ladder: 1-3 are levels for people, 4 (business) and
    ///      5 (agent) are separate categories. An exact match keeps a business from
    ///      passing an agent check and the other way round.
    uint32 public immutable requiredTier;

    /// @param _kumply AttestationStore address (same address on the network you sponsor on)
    /// @param _requiredTier Exact tier to sponsor (use 5 for agents)
    constructor(IKumplyAttestations _kumply, uint32 _requiredTier) {
        kumply = _kumply;
        requiredTier = _requiredTier;
    }

    /// @notice ERC-4337 validationData for sponsoring sender
    /// @param sender The smart account address (userOp.sender), not its owner EOA
    /// @return validationData SIG_VALIDATION_FAILED if there is no attestation (never issued
    ///         or revoked) or the tier is not requiredTier; otherwise validUntil = expiry and
    ///         validAfter = 0, packed as validUntil << 160
    function kumplyValidationData(address sender) public view returns (uint256 validationData) {
        (bool verified, uint32 tier, , uint64 expiry, ) = kumply.attestations(sender);
        if (!verified || tier != requiredTier) return SIG_VALIDATION_FAILED;
        uint48 validUntil = expiry > type(uint48).max ? type(uint48).max : uint48(expiry);
        return uint256(validUntil) << 160;
    }
}
`;
