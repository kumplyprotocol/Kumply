// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "./AttestationStore.sol";

/// @title ComplianceGate — Gate DeFi/institutional operations by KYC tier
/// @notice Provides gated access to DeFi actions based on the caller's KYC tier.
///         Supports two billing models:
///           1. Pay-per-use: caller forwards the AttestationStore read fee via msg.value
///           2. SaaS subscription: gate address is whitelisted in AttestationStore — no per-call fee
///         DApps and L1s deploy their own ComplianceGate pointing to Kumply's AttestationStore.
/// @dev When verificationFee > 0 and this gate is not subscribed, protectedAction() is payable
///      and the fee is forwarded to AttestationStore.checkCompliance(). The fee is only effectively
///      collected when the entire call succeeds (Solidity revert semantics).
/// @author KUMPLY Team
contract ComplianceGate {
    // ──────────────────────────────────────────────────────────────────
    //  Custom Errors
    // ──────────────────────────────────────────────────────────────────

    /// @notice Thrown when caller is not KYC verified
    error NotVerified();
    /// @notice Thrown when caller's KYC tier is below the required level
    error InsufficientTier();
    /// @notice Thrown when caller is not the admin
    error NotAdmin();
    /// @notice Thrown when an invalid tier is provided
    error InvalidRequiredTier();
    /// @notice Thrown when caller does not include the required read fee in msg.value
    error InsufficientFee();

    // ──────────────────────────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────────────────────────

    /// @notice Reference to the AttestationStore contract
    AttestationStore public store;

    /// @notice The minimum KYC tier required to pass the gate
    uint32 public requiredTier;

    /// @notice The admin address that can update the required tier
    address public admin;

    // ──────────────────────────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────────────────────────

    /// @notice Emitted when the required tier is updated
    event RequiredTierUpdated(uint32 oldTier, uint32 newTier);

    /// @notice Emitted when a protected action is executed successfully
    event ProtectedActionExecuted(address indexed caller, uint32 tier);

    // ──────────────────────────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────────────────────────

    /// @notice Initializes the ComplianceGate
    /// @param _store Address of the deployed AttestationStore contract
    /// @param _requiredTier The minimum tier required (1-5)
    constructor(address _store, uint32 _requiredTier) {
        store = AttestationStore(payable(_store));
        requiredTier = _requiredTier;
        admin = msg.sender;
    }

    // ──────────────────────────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────────────────────────

    /// @notice Restricts access to the admin
    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    // ──────────────────────────────────────────────────────────────────
    //  Internal Helpers
    // ──────────────────────────────────────────────────────────────────

    /// @dev Verifies compliance via AttestationStore. Forwards msg.value as read fee when required.
    ///      Uses the fee-exempt verify() path for subscribed gates (SaaS model) or when fee is 0.
    ///      Reverts with NotVerified or InsufficientTier on compliance failure.
    function _requireVerified(address subject) internal returns (uint32 tier) {
        bool verified;
        uint256 fee = store.verificationFee();

        if (fee > 0 && !store.subscribedCallers(address(this))) {
            if (msg.value < fee) revert InsufficientFee();
            (verified, tier) = store.checkCompliance{value: msg.value}(subject);
        } else {
            (verified, tier,,) = store.verify(subject);
        }

        if (!verified) revert NotVerified();
        if (tier < requiredTier) revert InsufficientTier();
    }

    // ──────────────────────────────────────────────────────────────────
    //  Functions
    // ──────────────────────────────────────────────────────────────────

    /// @notice Gated action — caller must be KYC verified with sufficient tier.
    ///         When a read fee is active, include it in msg.value. Subscribed gates are fee-exempt.
    /// @return success True if the action was executed successfully
    function protectedAction() external payable returns (bool success) {
        uint32 tier = _requireVerified(msg.sender);
        emit ProtectedActionExecuted(msg.sender, tier);
        return true;
    }

    /// @notice Returns the current read fee from AttestationStore for DApp frontend integration
    /// @return The verification fee in wei (0 if fees are disabled or gate is subscribed)
    function getVerificationFee() external view returns (uint256) {
        return store.verificationFee();
    }

    /// @notice Updates the required tier level
    /// @param _newTier The new minimum tier (1-5)
    function updateRequiredTier(uint32 _newTier) external onlyAdmin {
        if (_newTier < 1 || _newTier > 5) revert InvalidRequiredTier();
        uint32 oldTier = requiredTier;
        requiredTier = _newTier;
        emit RequiredTierUpdated(oldTier, _newTier);
    }
}
