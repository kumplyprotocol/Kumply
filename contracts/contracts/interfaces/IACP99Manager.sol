// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/// @title IACP99Manager — Standard interface for an ACP-99 ValidatorSetManager
/// @notice https://build.avax.network/docs/acps/99-validatorsetmanager-contract
interface IACP99Manager {
    // ──────────────────────────────────────────────────────────────────
    //  Types (verbatim from ACP-99 §"Type Definitions")
    // ──────────────────────────────────────────────────────────────────

    enum ValidatorStatus {
        Unknown,
        PendingAdded,
        Active,
        PendingRemoved,
        Completed,
        Invalidated
    }

    struct PChainOwner {
        uint32 threshold;
        address[] addresses;
    }

    struct Validator {
        ValidatorStatus status;
        bytes nodeID;
        uint64 startingWeight;
        uint64 sentNonce;
        uint64 receivedNonce;
        uint64 weight;
        uint64 startTime;
        uint64 endTime;
    }

    struct InitialValidator {
        bytes nodeID;
        bytes blsPublicKey;
        uint64 weight;
    }

    struct ConversionData {
        bytes32 subnetID;
        bytes32 validatorManagerBlockchainID;
        address validatorManagerAddress;
        InitialValidator[] initialValidators;
    }

    // ──────────────────────────────────────────────────────────────────
    //  Events (ACP-99 §"Events")
    // ──────────────────────────────────────────────────────────────────

    event RegisteredInitialValidator(
        bytes32 indexed validationID,
        bytes20 indexed nodeID,
        bytes32 indexed subnetID,
        uint64 weight,
        uint32 index
    );

    event InitiatedValidatorRegistration(
        bytes32 indexed validationID,
        bytes20 indexed nodeID,
        bytes32 registrationMessageID,
        uint64 registrationExpiry,
        uint64 weight
    );

    event CompletedValidatorRegistration(bytes32 indexed validationID, uint64 weight);

    event InitiatedValidatorRemoval(
        bytes32 indexed validationID,
        bytes32 validatorWeightMessageID,
        uint64 weight,
        uint64 endTime
    );

    event CompletedValidatorRemoval(bytes32 indexed validationID);

    event InitiatedValidatorWeightUpdate(
        bytes32 indexed validationID,
        uint64 nonce,
        bytes32 weightUpdateMessageID,
        uint64 weight
    );

    event CompletedValidatorWeightUpdate(
        bytes32 indexed validationID,
        uint64 nonce,
        uint64 weight
    );

    // ──────────────────────────────────────────────────────────────────
    //  Views
    // ──────────────────────────────────────────────────────────────────

    function subnetID() external view returns (bytes32);

    function getValidator(bytes32 validationID) external view returns (Validator memory);

    function l1TotalWeight() external view returns (uint64);

    // ──────────────────────────────────────────────────────────────────
    //  Bootstrap (single-phase, consumes SubnetToL1ConversionMessage)
    // ──────────────────────────────────────────────────────────────────

    function initializeValidatorSet(
        ConversionData calldata conversionData,
        uint32 messageIndex
    ) external;

    // ──────────────────────────────────────────────────────────────────
    //  Two-phase lifecycle (initiate-* are internal in the standard;
    //  exposed here so external wrappers can be discovered by tooling.)
    // ──────────────────────────────────────────────────────────────────

    function completeValidatorRegistration(uint32 messageIndex)
        external
        returns (bytes32 validationID);

    function completeValidatorRemoval(uint32 messageIndex)
        external
        returns (bytes32 validationID);

    function completeValidatorWeightUpdate(uint32 messageIndex)
        external
        returns (bytes32 validationID, uint64 nonce);
}
