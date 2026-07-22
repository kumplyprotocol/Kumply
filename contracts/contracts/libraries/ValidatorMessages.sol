// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {IACP99Manager} from "../interfaces/IACP99Manager.sol";

/// @title ValidatorMessages — Avalanche codec (NOT EVM ABI) for ACP-77/99 P-Chain Warp messages
/// @notice Encodes and decodes the four payload types exchanged between an L1 ValidatorManager
///         contract and the P-Chain:
///           - SubnetToL1ConversionMessage      (typeID 0x00000000) — consumed
///           - RegisterL1ValidatorMessage       (typeID 0x00000001) — emitted
///           - L1ValidatorRegistrationMessage   (typeID 0x00000002) — consumed
///           - L1ValidatorWeightMessage         (typeID 0x00000003) — emitted & consumed
///
/// @dev    Encoding rules (Avalanche codec, see https://build.avax.network/docs/acps/77):
///           - All multi-byte integers are big-endian.
///           - `[]byte` is length-prefixed with a 4-byte big-endian uint32 length.
///           - `PChainOwner` = `uint32 threshold || uint32 addressesLen || N × 20-byte address`.
///           - Fixed-size byte arrays are packed without length prefix.
///           - codecID is 2 bytes (`0x0000`); typeID is 4 bytes.
///         We use `abi.encodePacked` (NOT `abi.encode`) so values are not padded to 32 bytes.
library ValidatorMessages {
    // ──────────────────────────────────────────────────────────────────
    //  Constants
    // ──────────────────────────────────────────────────────────────────

    uint16 internal constant CODEC_ID = 0x0000;

    uint32 internal constant CONVERSION_TYPE_ID = 0x00000000;
    uint32 internal constant REGISTER_L1_VALIDATOR_TYPE_ID = 0x00000001;
    uint32 internal constant L1_VALIDATOR_REGISTRATION_TYPE_ID = 0x00000002;
    uint32 internal constant L1_VALIDATOR_WEIGHT_TYPE_ID = 0x00000003;

    /// @notice BLS public key length per BLS12-381 G1 compressed point (Avalanche convention).
    uint256 internal constant BLS_PUBLIC_KEY_LENGTH = 48;

    /// @notice Avalanche node IDs are 20 bytes (same width as an EVM address).
    uint256 internal constant NODE_ID_LENGTH = 20;

    // ──────────────────────────────────────────────────────────────────
    //  Custom Errors
    // ──────────────────────────────────────────────────────────────────

    error InvalidCodecID(uint16 actual);
    error InvalidMessageType(uint32 actual, uint32 expected);
    error InvalidMessageLength(uint256 actual, uint256 expected);
    error InvalidBlsPublicKeyLength(uint256 actual);
    error InvalidNodeIDLength(uint256 actual);
    error InvalidPChainOwnerThreshold();

    // ──────────────────────────────────────────────────────────────────
    //  SubnetToL1ConversionMessage (typeID 0x00000000) — INBOUND
    //  Layout: codecID(2) || typeID(4) || conversionID([32]byte)   = 38 bytes
    // ──────────────────────────────────────────────────────────────────

    function unpackSubnetToL1ConversionMessage(bytes memory input)
        internal
        pure
        returns (bytes32 conversionID)
    {
        if (input.length != 38) revert InvalidMessageLength(input.length, 38);
        uint16 codecID = _readUint16(input, 0);
        if (codecID != CODEC_ID) revert InvalidCodecID(codecID);
        uint32 typeID = _readUint32(input, 2);
        if (typeID != CONVERSION_TYPE_ID) {
            revert InvalidMessageType(typeID, CONVERSION_TYPE_ID);
        }
        conversionID = _readBytes32(input, 6);
    }

    /// @notice Re-computes the off-chain `conversionID` from the on-chain `ConversionData`.
    /// @dev    Pre-image layout (Avalanche codec):
    ///           codecID(2) || subnetID(32) || managerChainID(32) ||
    ///           managerAddress(20) || validators-len(uint32) ||
    ///           N × [ nodeIDLen(uint32) || nodeID || blsPubKey(48) || weight(uint64) ]
    ///         conversionID = sha256(pre-image).
    function computeConversionID(IACP99Manager.ConversionData calldata data)
        internal
        pure
        returns (bytes32)
    {
        bytes memory preimage = abi.encodePacked(
            CODEC_ID,
            data.subnetID,
            data.validatorManagerBlockchainID,
            data.validatorManagerAddress, // 20 bytes, no length prefix
            uint32(data.initialValidators.length)
        );
        for (uint256 i = 0; i < data.initialValidators.length; i++) {
            IACP99Manager.InitialValidator calldata v = data.initialValidators[i];
            if (v.blsPublicKey.length != BLS_PUBLIC_KEY_LENGTH) {
                revert InvalidBlsPublicKeyLength(v.blsPublicKey.length);
            }
            preimage = abi.encodePacked(
                preimage,
                uint32(v.nodeID.length),
                v.nodeID,
                v.blsPublicKey,
                v.weight
            );
        }
        return sha256(preimage);
    }

    /// @notice Initial-validator `validationID` derivation (ACP-77 §"Initial Validators"):
    ///         sha256(subnetID || uint32(validatorIndex)).
    function initialValidationID(bytes32 subnetID_, uint32 index) internal pure returns (bytes32) {
        return sha256(abi.encodePacked(subnetID_, index));
    }

    // ──────────────────────────────────────────────────────────────────
    //  RegisterL1ValidatorMessage (typeID 0x00000001) — OUTBOUND
    //  Layout:
    //    codecID(2) || typeID(4) || subnetID(32) ||
    //    nodeIDLen(uint32) || nodeID || blsPublicKey(48) || expiry(uint64) ||
    //    remainingBalanceOwner(PChainOwner) || disableOwner(PChainOwner) || weight(uint64)
    //  validationID = sha256(this payload)
    // ──────────────────────────────────────────────────────────────────

    function packRegisterL1ValidatorMessage(
        bytes32 subnetID_,
        bytes memory nodeID,
        bytes memory blsPublicKey,
        uint64 expiry,
        IACP99Manager.PChainOwner memory remainingBalanceOwner,
        IACP99Manager.PChainOwner memory disableOwner,
        uint64 weight
    ) internal pure returns (bytes memory payload, bytes32 validationID) {
        if (nodeID.length != NODE_ID_LENGTH) revert InvalidNodeIDLength(nodeID.length);
        if (blsPublicKey.length != BLS_PUBLIC_KEY_LENGTH) {
            revert InvalidBlsPublicKeyLength(blsPublicKey.length);
        }
        if (remainingBalanceOwner.threshold == 0 || disableOwner.threshold == 0) {
            revert InvalidPChainOwnerThreshold();
        }

        payload = abi.encodePacked(
            CODEC_ID,
            REGISTER_L1_VALIDATOR_TYPE_ID,
            subnetID_,
            uint32(nodeID.length),
            nodeID,
            blsPublicKey,
            expiry,
            _packPChainOwner(remainingBalanceOwner),
            _packPChainOwner(disableOwner),
            weight
        );
        validationID = sha256(payload);
    }

    function _packPChainOwner(IACP99Manager.PChainOwner memory owner)
        private
        pure
        returns (bytes memory)
    {
        bytes memory out = abi.encodePacked(owner.threshold, uint32(owner.addresses.length));
        for (uint256 i = 0; i < owner.addresses.length; i++) {
            out = abi.encodePacked(out, owner.addresses[i]); // 20 bytes each
        }
        return out;
    }

    // ──────────────────────────────────────────────────────────────────
    //  L1ValidatorRegistrationMessage (typeID 0x00000002) — INBOUND
    //  Layout: codecID(2) || typeID(4) || validationID(32) || registered(bool=1) = 39 bytes
    // ──────────────────────────────────────────────────────────────────

    function unpackL1ValidatorRegistrationMessage(bytes memory input)
        internal
        pure
        returns (bytes32 validationID, bool registered)
    {
        if (input.length != 39) revert InvalidMessageLength(input.length, 39);
        uint16 codecID = _readUint16(input, 0);
        if (codecID != CODEC_ID) revert InvalidCodecID(codecID);
        uint32 typeID = _readUint32(input, 2);
        if (typeID != L1_VALIDATOR_REGISTRATION_TYPE_ID) {
            revert InvalidMessageType(typeID, L1_VALIDATOR_REGISTRATION_TYPE_ID);
        }
        validationID = _readBytes32(input, 6);
        registered = uint8(input[38]) != 0;
    }

    // ──────────────────────────────────────────────────────────────────
    //  L1ValidatorWeightMessage (typeID 0x00000003) — OUTBOUND & INBOUND
    //  Layout: codecID(2) || typeID(4) || validationID(32) || nonce(uint64) || weight(uint64) = 54 bytes
    // ──────────────────────────────────────────────────────────────────

    function packL1ValidatorWeightMessage(
        bytes32 validationID,
        uint64 nonce,
        uint64 weight
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(
            CODEC_ID,
            L1_VALIDATOR_WEIGHT_TYPE_ID,
            validationID,
            nonce,
            weight
        );
    }

    function unpackL1ValidatorWeightMessage(bytes memory input)
        internal
        pure
        returns (bytes32 validationID, uint64 nonce, uint64 weight)
    {
        if (input.length != 54) revert InvalidMessageLength(input.length, 54);
        uint16 codecID = _readUint16(input, 0);
        if (codecID != CODEC_ID) revert InvalidCodecID(codecID);
        uint32 typeID = _readUint32(input, 2);
        if (typeID != L1_VALIDATOR_WEIGHT_TYPE_ID) {
            revert InvalidMessageType(typeID, L1_VALIDATOR_WEIGHT_TYPE_ID);
        }
        validationID = _readBytes32(input, 6);
        nonce = _readUint64(input, 38);
        weight = _readUint64(input, 46);
    }

    // ──────────────────────────────────────────────────────────────────
    //  Big-endian primitive readers (memory)
    // ──────────────────────────────────────────────────────────────────

    function _readUint16(bytes memory data, uint256 offset) private pure returns (uint16 result) {
        require(data.length >= offset + 2, "ValidatorMessages: oob u16");
        assembly {
            result := shr(240, mload(add(add(data, 0x20), offset)))
        }
    }

    function _readUint32(bytes memory data, uint256 offset) private pure returns (uint32 result) {
        require(data.length >= offset + 4, "ValidatorMessages: oob u32");
        assembly {
            result := shr(224, mload(add(add(data, 0x20), offset)))
        }
    }

    function _readUint64(bytes memory data, uint256 offset) private pure returns (uint64 result) {
        require(data.length >= offset + 8, "ValidatorMessages: oob u64");
        assembly {
            result := shr(192, mload(add(add(data, 0x20), offset)))
        }
    }

    function _readBytes32(bytes memory data, uint256 offset) private pure returns (bytes32 result) {
        require(data.length >= offset + 32, "ValidatorMessages: oob b32");
        assembly {
            result := mload(add(add(data, 0x20), offset))
        }
    }
}
