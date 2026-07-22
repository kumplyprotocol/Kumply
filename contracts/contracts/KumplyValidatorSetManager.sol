// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {AttestationStore} from "./AttestationStore.sol";
import {IACP99Manager} from "./interfaces/IACP99Manager.sol";
import {IWarpMessenger, WARP_MESSENGER} from "./interfaces/IWarpMessenger.sol";
import {ValidatorMessages} from "./libraries/ValidatorMessages.sol";

/// @title KumplyValidatorSetManager — ACP-99 ValidatorSetManager with KYB gating
/// @notice Full ACP-99 / ACP-77 conformant L1 validator manager for the KUMPLY Compliance L1.
///         Layers a KYB (Tier-4 AttestationStore) gate on top of the canonical two-phase
///         lifecycle: initiate-* (emits a Warp message to the P-Chain) → P-Chain processes →
///         complete-* (consumes the P-Chain's Warp acknowledgment).
/// @dev    Reference: https://build.avax.network/docs/acps/99-validatorsetmanager-contract
///         and https://build.avax.network/docs/acps/77-reinventing-subnets.
///         Storage and validationID semantics follow ACP-99 §"Type Definitions" exactly —
///         validators are keyed by their 32-byte `validationID`, not by EVM owner address.
contract KumplyValidatorSetManager is
    IACP99Manager,
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    using ValidatorMessages for bytes;

    // ──────────────────────────────────────────────────────────────────
    //  Roles
    // ──────────────────────────────────────────────────────────────────

    bytes32 public constant L1_MANAGER_ROLE = keccak256("L1_MANAGER_ROLE");

    // ──────────────────────────────────────────────────────────────────
    //  Compliance Constants
    // ──────────────────────────────────────────────────────────────────

    /// @notice Minimum AttestationStore tier required to operate a validator (4 = KYB).
    uint32 public constant REQUIRED_VALIDATOR_TIER = 4;

    /// @notice Maximum number of validator-set events (add/remove/weight) per `CHURN_PERIOD`.
    /// @dev    ACP-99 leaves churn control to the implementer; we cap by event count to mirror
    ///         the spirit of the Ava Labs reference impl while staying gas-cheap.
    uint64 public constant MAX_CHURN_PER_PERIOD = 20;

    /// @notice Per-validator weight ceiling in basis points of total weight (2000 bps = 20%).
    uint64 public constant MAX_VALIDATOR_WEIGHT_BPS = 2000;

    /// @notice Churn window. ACP-77 mandates `expiry <= now + 24h`, so we align to 24h.
    uint64 public constant CHURN_PERIOD = 1 days;

    /// @notice Maximum lifespan accepted on a freshly issued P-Chain registration message.
    ///         ACP-77: `expiry MUST be <= now + 24h` once the P-Chain processes the message.
    uint64 public constant REGISTRATION_EXPIRY_MAX = 23 hours;

    // ──────────────────────────────────────────────────────────────────
    //  Wiring
    // ──────────────────────────────────────────────────────────────────

    /// @notice AttestationStore that gates validator entry (Tier-4 / KYB).
    AttestationStore public immutable attestationStore;

    /// @notice SubnetID this manager governs. Set at construction; immutable on-chain.
    bytes32 private immutable _subnetID;

    /// @notice IWarpMessenger precompile handle (0x05).
    IWarpMessenger private constant WARP = IWarpMessenger(WARP_MESSENGER);

    // ──────────────────────────────────────────────────────────────────
    //  Storage (ACP-99 keyed by validationID)
    // ──────────────────────────────────────────────────────────────────

    mapping(bytes32 => Validator) private _validators;

    /// @notice Index sha256(nodeID) → validationID. Prevents same node joining twice.
    mapping(bytes32 => bytes32) public validationIDByNodeID;

    /// @notice Index EVM owner → active validationID. Required for KYB-expiry purge.
    mapping(address => bytes32) public validationIDByOwner;

    /// @notice Reverse: validationID → owner. (Owner is the KYB-attested EVM address.)
    mapping(bytes32 => address) public ownerByValidationID;

    /// @notice Cached attestation expiry, used by `disableExpiredValidator`.
    mapping(bytes32 => uint64) public attestationExpiryByValidationID;

    /// @notice Cumulative weight of all validators in PendingAdded ∪ Active ∪ PendingRemoved.
    uint64 private _l1TotalWeight;

    /// @notice Currently `Active` (P-Chain-acked) validator count.
    uint64 public activeValidatorCount;

    /// @notice Churn counters per period.
    uint64 public churnInPeriod;
    uint64 public churnPeriodStart;

    /// @notice True after `initializeValidatorSet` has run. Prevents double bootstrap.
    bool public initialized;

    // ──────────────────────────────────────────────────────────────────
    //  Custom Errors
    // ──────────────────────────────────────────────────────────────────

    error InvalidSubnetID();
    error ValidatorNotKYBVerified();
    error InsufficientValidatorTier(uint32 actual, uint32 required);
    error InvalidNodeID();
    error InvalidBlsPublicKey();
    error InvalidWeight();
    error ChurnLimitExceeded();
    error WeightOverflow();
    error ValidatorAlreadyRegistered();
    error UnknownValidator();
    error InvalidValidatorStatus(ValidatorStatus current);
    error AttestationStillValid();
    error WarpMessageInvalid(uint32 messageIndex);
    error WarpSourceMismatch(bytes32 expected, bytes32 actual);
    error UnauthorizedCaller(address caller);
    error AlreadyInitialized();
    error NotInitialized();
    error ConversionIDMismatch(bytes32 expected, bytes32 actual);

    // ──────────────────────────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────────────────────────

    /// @param _admin    Initial holder of DEFAULT_ADMIN_ROLE + L1_MANAGER_ROLE.
    /// @param _store    Deployed AttestationStore providing the KYB attestations.
    /// @param _subnetID32  32-byte SubnetID produced by `ConvertSubnetToL1Tx`.
    constructor(address _admin, address _store, bytes32 _subnetID32) {
        if (_subnetID32 == bytes32(0)) revert InvalidSubnetID();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(L1_MANAGER_ROLE, _admin);

        attestationStore = AttestationStore(payable(_store));
        _subnetID = _subnetID32;
        churnPeriodStart = uint64(block.timestamp);
    }

    // ──────────────────────────────────────────────────────────────────
    //  IACP99Manager — views
    // ──────────────────────────────────────────────────────────────────

    function subnetID() external view override returns (bytes32) {
        return _subnetID;
    }

    function getValidator(bytes32 validationID)
        external
        view
        override
        returns (Validator memory)
    {
        return _validators[validationID];
    }

    function l1TotalWeight() external view override returns (uint64) {
        return _l1TotalWeight;
    }

    // ──────────────────────────────────────────────────────────────────
    //  Bootstrap — single-phase (consumes SubnetToL1ConversionMessage)
    //
    //  Called once, right after `ConvertSubnetToL1Tx` is accepted on the P-Chain.
    //  The P-Chain emits a `SubnetToL1ConversionMessage` whose payload is the SHA-256
    //  of the off-chain `ConversionData`. We re-compute that hash from `data` and
    //  assert equality, then register every initial validator as Active.
    // ──────────────────────────────────────────────────────────────────

    function initializeValidatorSet(
        ConversionData calldata data,
        uint32 messageIndex
    ) external override whenNotPaused onlyRole(L1_MANAGER_ROLE) {
        if (initialized) revert AlreadyInitialized();
        if (data.subnetID != _subnetID) revert InvalidSubnetID();

        bytes memory payload = _getVerifiedWarpPayload(messageIndex);
        bytes32 conversionID = ValidatorMessages.unpackSubnetToL1ConversionMessage(payload);
        bytes32 expected = ValidatorMessages.computeConversionID(data);
        if (conversionID != expected) revert ConversionIDMismatch(expected, conversionID);

        uint64 totalW;
        for (uint32 i = 0; i < data.initialValidators.length; i++) {
            InitialValidator calldata iv = data.initialValidators[i];
            if (iv.nodeID.length != ValidatorMessages.NODE_ID_LENGTH) revert InvalidNodeID();
            if (iv.weight == 0) revert InvalidWeight();

            bytes32 validationID = ValidatorMessages.initialValidationID(_subnetID, i);
            bytes32 nodeHash = sha256(iv.nodeID);

            _validators[validationID] = Validator({
                status: ValidatorStatus.Active,
                nodeID: iv.nodeID,
                startingWeight: iv.weight,
                sentNonce: 0,
                receivedNonce: 0,
                weight: iv.weight,
                startTime: uint64(block.timestamp),
                endTime: 0
            });
            validationIDByNodeID[nodeHash] = validationID;

            totalW += iv.weight;
            activeValidatorCount += 1;

            emit RegisteredInitialValidator(
                validationID,
                bytes20(iv.nodeID),
                _subnetID,
                iv.weight,
                i
            );
        }
        _l1TotalWeight = totalW;
        initialized = true;
    }

    // ──────────────────────────────────────────────────────────────────
    //  Initiate Registration — KYB-gated external wrapper
    //  Step 1 of 2. Emits RegisterL1ValidatorMessage via Warp.
    // ──────────────────────────────────────────────────────────────────

    /// @notice Initiate a validator registration. Caller MUST hold a valid Tier-4 attestation.
    /// @param  nodeID                Avalanche node identifier (20 bytes).
    /// @param  blsPublicKey          BLS12-381 compressed G1 public key (48 bytes, PoP-verified by P-Chain).
    /// @param  remainingBalanceOwner P-Chain owner that may claim the validator's leftover balance on exit.
    /// @param  disableOwner          P-Chain owner that may disable the validator.
    /// @param  weight                Voting weight (subject to per-validator BPS cap).
    /// @return validationID          Canonical 32-byte SHA-256 of the emitted Warp payload.
    function initiateValidatorRegistration(
        bytes calldata nodeID,
        bytes calldata blsPublicKey,
        PChainOwner calldata remainingBalanceOwner,
        PChainOwner calldata disableOwner,
        uint64 weight
    ) external whenNotPaused nonReentrant returns (bytes32 validationID) {
        if (!initialized) revert NotInitialized();
        _requireKyb(msg.sender);
        if (validationIDByOwner[msg.sender] != bytes32(0)) {
            revert ValidatorAlreadyRegistered();
        }
        return _initiateValidatorRegistration(
            nodeID,
            blsPublicKey,
            remainingBalanceOwner,
            disableOwner,
            weight
        );
    }

    function _initiateValidatorRegistration(
        bytes memory nodeID,
        bytes memory blsPublicKey,
        PChainOwner memory remainingBalanceOwner,
        PChainOwner memory disableOwner,
        uint64 weight
    ) internal returns (bytes32 validationID) {
        if (nodeID.length != ValidatorMessages.NODE_ID_LENGTH) revert InvalidNodeID();
        if (blsPublicKey.length != ValidatorMessages.BLS_PUBLIC_KEY_LENGTH) {
            revert InvalidBlsPublicKey();
        }
        if (weight == 0) revert InvalidWeight();

        bytes32 nodeHash = sha256(nodeID);
        if (validationIDByNodeID[nodeHash] != bytes32(0)) {
            revert ValidatorAlreadyRegistered();
        }

        _bumpChurnCounter();

        // Cache attestation expiry for self-healing purge.
        (, , , uint64 attExpiry) = attestationStore.verify(msg.sender);

        uint64 expiry = uint64(block.timestamp) + REGISTRATION_EXPIRY_MAX;

        bytes memory payload;
        (payload, validationID) = ValidatorMessages.packRegisterL1ValidatorMessage(
            _subnetID,
            nodeID,
            blsPublicKey,
            expiry,
            remainingBalanceOwner,
            disableOwner,
            weight
        );

        _validators[validationID] = Validator({
            status: ValidatorStatus.PendingAdded,
            nodeID: nodeID,
            startingWeight: weight,
            sentNonce: 0,
            receivedNonce: 0,
            weight: weight,
            startTime: 0,
            endTime: 0
        });
        validationIDByNodeID[nodeHash] = validationID;
        validationIDByOwner[msg.sender] = validationID;
        ownerByValidationID[validationID] = msg.sender;
        attestationExpiryByValidationID[validationID] = attExpiry;

        uint64 newTotal = _l1TotalWeight + weight;
        if (newTotal < _l1TotalWeight) revert WeightOverflow();
        _checkWeightCapAgainst(weight, newTotal);
        _l1TotalWeight = newTotal;

        bytes32 messageID = WARP.sendWarpMessage(payload);

        emit InitiatedValidatorRegistration(
            validationID,
            bytes20(nodeID),
            messageID,
            expiry,
            weight
        );
    }

    // ──────────────────────────────────────────────────────────────────
    //  Complete Registration — consumes L1ValidatorRegistrationMessage{registered:true}
    // ──────────────────────────────────────────────────────────────────

    function completeValidatorRegistration(uint32 messageIndex)
        external
        override
        nonReentrant
        returns (bytes32 validationID)
    {
        bytes memory payload = _getVerifiedWarpPayload(messageIndex);
        bool registered;
        (validationID, registered) = ValidatorMessages.unpackL1ValidatorRegistrationMessage(payload);
        if (!registered) revert InvalidValidatorStatus(ValidatorStatus.Invalidated);

        Validator storage v = _validators[validationID];
        if (v.status != ValidatorStatus.PendingAdded) {
            revert InvalidValidatorStatus(v.status);
        }
        v.status = ValidatorStatus.Active;
        v.startTime = uint64(block.timestamp);
        activeValidatorCount += 1;

        emit CompletedValidatorRegistration(validationID, v.weight);
    }

    // ──────────────────────────────────────────────────────────────────
    //  Initiate Removal — voluntary, admin, or KYB-expired purge
    //  Step 1 of 2. Emits L1ValidatorWeightMessage with weight=0.
    // ──────────────────────────────────────────────────────────────────

    /// @notice Voluntary exit by the validator owner.
    function initiateValidatorRemoval(bytes32 validationID) external whenNotPaused nonReentrant {
        address owner = ownerByValidationID[validationID];
        if (owner != msg.sender) revert UnauthorizedCaller(msg.sender);
        _initiateValidatorRemoval(validationID);
    }

    /// @notice Admin-forced removal (compliance violation, slashing). L1_MANAGER_ROLE only.
    function adminInitiateValidatorRemoval(bytes32 validationID)
        external
        nonReentrant
        onlyRole(L1_MANAGER_ROLE)
    {
        _initiateValidatorRemoval(validationID);
    }

    /// @notice Permissionless purge of a validator whose KYB attestation has expired/revoked.
    function disableExpiredValidator(bytes32 validationID) external nonReentrant {
        address owner = ownerByValidationID[validationID];
        if (owner == address(0)) revert UnknownValidator();
        (bool ok, , , uint64 attExpiry) = attestationStore.verify(owner);
        if (ok && attExpiry > uint64(block.timestamp)) revert AttestationStillValid();
        _initiateValidatorRemoval(validationID);
    }

    function _initiateValidatorRemoval(bytes32 validationID) internal {
        Validator storage v = _validators[validationID];
        if (v.status != ValidatorStatus.Active && v.status != ValidatorStatus.PendingAdded) {
            revert InvalidValidatorStatus(v.status);
        }

        _bumpChurnCounter();

        if (v.status == ValidatorStatus.Active) {
            activeValidatorCount -= 1;
        }
        v.status = ValidatorStatus.PendingRemoved;
        v.endTime = uint64(block.timestamp);
        v.sentNonce += 1;

        bytes memory payload = ValidatorMessages.packL1ValidatorWeightMessage(
            validationID,
            v.sentNonce,
            0
        );
        bytes32 messageID = WARP.sendWarpMessage(payload);

        emit InitiatedValidatorRemoval(validationID, messageID, v.weight, v.endTime);
    }

    // ──────────────────────────────────────────────────────────────────
    //  Complete Removal — consumes L1ValidatorRegistrationMessage{registered:false}
    // ──────────────────────────────────────────────────────────────────

    function completeValidatorRemoval(uint32 messageIndex)
        external
        override
        nonReentrant
        returns (bytes32 validationID)
    {
        bytes memory payload = _getVerifiedWarpPayload(messageIndex);
        bool registered;
        (validationID, registered) = ValidatorMessages.unpackL1ValidatorRegistrationMessage(payload);
        if (registered) revert InvalidValidatorStatus(ValidatorStatus.Active);

        Validator storage v = _validators[validationID];
        if (v.status != ValidatorStatus.PendingRemoved && v.status != ValidatorStatus.PendingAdded) {
            revert InvalidValidatorStatus(v.status);
        }
        // Garbage-collect indices and weight.
        _l1TotalWeight -= v.weight;
        bytes32 nodeHash = sha256(v.nodeID);
        address owner = ownerByValidationID[validationID];
        delete validationIDByNodeID[nodeHash];
        delete validationIDByOwner[owner];
        delete ownerByValidationID[validationID];
        delete attestationExpiryByValidationID[validationID];

        v.status = ValidatorStatus.Completed;
        emit CompletedValidatorRemoval(validationID);
    }

    // ──────────────────────────────────────────────────────────────────
    //  Weight Update (initiate + complete) — KYB owner only
    // ──────────────────────────────────────────────────────────────────

    function initiateValidatorWeightUpdate(bytes32 validationID, uint64 newWeight)
        external
        whenNotPaused
        nonReentrant
        returns (uint64 nonce, bytes32 messageID)
    {
        address owner = ownerByValidationID[validationID];
        if (owner != msg.sender) revert UnauthorizedCaller(msg.sender);
        return _initiateValidatorWeightUpdate(validationID, newWeight);
    }

    function _initiateValidatorWeightUpdate(bytes32 validationID, uint64 newWeight)
        internal
        returns (uint64 nonce, bytes32 messageID)
    {
        if (newWeight == 0) revert InvalidWeight();

        Validator storage v = _validators[validationID];
        if (v.status != ValidatorStatus.Active) revert InvalidValidatorStatus(v.status);

        uint64 oldWeight = v.weight;
        if (oldWeight == newWeight) revert InvalidWeight();
        _bumpChurnCounter();

        uint64 newTotal;
        if (newWeight > oldWeight) {
            newTotal = _l1TotalWeight + (newWeight - oldWeight);
            if (newTotal < _l1TotalWeight) revert WeightOverflow();
            _checkWeightCapAgainst(newWeight, newTotal);
        } else {
            newTotal = _l1TotalWeight - (oldWeight - newWeight);
        }
        _l1TotalWeight = newTotal;

        v.weight = newWeight;
        v.sentNonce += 1;
        nonce = v.sentNonce;

        bytes memory payload = ValidatorMessages.packL1ValidatorWeightMessage(
            validationID,
            nonce,
            newWeight
        );
        messageID = WARP.sendWarpMessage(payload);
        emit InitiatedValidatorWeightUpdate(validationID, nonce, messageID, newWeight);
    }

    function completeValidatorWeightUpdate(uint32 messageIndex)
        external
        override
        nonReentrant
        returns (bytes32 validationID, uint64 nonce)
    {
        bytes memory payload = _getVerifiedWarpPayload(messageIndex);
        uint64 weight;
        (validationID, nonce, weight) = ValidatorMessages.unpackL1ValidatorWeightMessage(payload);

        Validator storage v = _validators[validationID];
        if (v.status != ValidatorStatus.Active) revert InvalidValidatorStatus(v.status);
        if (nonce <= v.receivedNonce) revert InvalidValidatorStatus(v.status);
        v.receivedNonce = nonce;

        emit CompletedValidatorWeightUpdate(validationID, nonce, weight);
    }

    // ──────────────────────────────────────────────────────────────────
    //  Internal helpers
    // ──────────────────────────────────────────────────────────────────

    function _requireKyb(address subject) internal view {
        (bool ok, uint32 tier, , ) = attestationStore.verify(subject);
        if (!ok) revert ValidatorNotKYBVerified();
        if (tier < REQUIRED_VALIDATOR_TIER) {
            revert InsufficientValidatorTier(tier, REQUIRED_VALIDATOR_TIER);
        }
    }

    function _getVerifiedWarpPayload(uint32 messageIndex) internal view returns (bytes memory) {
        (IWarpMessenger.WarpMessage memory msg_, bool ok) = WARP.getVerifiedWarpMessage(messageIndex);
        if (!ok) revert WarpMessageInvalid(messageIndex);
        // sourceAddress for P-Chain-originated messages is empty per ACP-77; do not enforce here
        // because the P-Chain ID depends on the network — let the WarpMessenger precompile do
        // the signature/quorum verification and trust its `ok` result.
        return msg_.payload;
    }

    /// @dev Event-count churn limiter (count of add/remove/weight-change ops per CHURN_PERIOD).
    function _bumpChurnCounter() internal {
        if (block.timestamp >= churnPeriodStart + CHURN_PERIOD) {
            churnPeriodStart = uint64(block.timestamp);
            churnInPeriod = 0;
        }
        if (churnInPeriod >= MAX_CHURN_PER_PERIOD) revert ChurnLimitExceeded();
        churnInPeriod += 1;
    }

    /// @dev Cap-against-the-new-total weight check. Skipped when the candidate is the first
    ///      validator (no other weight to dilute) and when newTotal == weight.
    function _checkWeightCapAgainst(uint64 weight, uint64 newTotal) internal pure {
        if (newTotal == weight) return; // first validator
        if (uint256(weight) * 10_000 > uint256(newTotal) * MAX_VALIDATOR_WEIGHT_BPS) {
            revert InvalidWeight();
        }
    }

    // ──────────────────────────────────────────────────────────────────
    //  Admin
    // ──────────────────────────────────────────────────────────────────

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
