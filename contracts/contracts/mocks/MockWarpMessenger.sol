// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {IWarpMessenger} from "../interfaces/IWarpMessenger.sol";

/// @title MockWarpMessenger — In-process mock of the Subnet-EVM precompile at 0x05
/// @dev    Installed at 0x0200000000000000000000000000000000000005 by the test harness
///         via `hardhat_setCode`. Records every `sendWarpMessage` (for assertions) and
///         allows tests to inject the result of `getVerifiedWarpMessage(uint32)`.
contract MockWarpMessenger is IWarpMessenger {
    // Outbound capture
    bytes[] private _sent;
    bytes32[] private _sentMessageIDs;
    uint256 private _nonce;

    // Inbound injection
    mapping(uint32 => WarpMessage) private _verified;
    mapping(uint32 => bool) private _verifiedValid;

    bytes32 private _blockchainID = bytes32(uint256(0xCAFEBABE));

    // ── IWarpMessenger ────────────────────────────────────────────────

    function sendWarpMessage(bytes calldata payload) external override returns (bytes32 messageID) {
        _nonce += 1;
        messageID = keccak256(abi.encodePacked(_nonce, payload));
        _sent.push(payload);
        _sentMessageIDs.push(messageID);
        emit SendWarpMessage(msg.sender, messageID, payload);
    }

    function getVerifiedWarpMessage(uint32 index)
        external
        view
        override
        returns (WarpMessage memory, bool)
    {
        return (_verified[index], _verifiedValid[index]);
    }

    function getVerifiedWarpBlockHash(uint32)
        external
        pure
        override
        returns (WarpBlockHash memory, bool)
    {
        return (WarpBlockHash(bytes32(0), bytes32(0)), false);
    }

    function getBlockchainID() external view override returns (bytes32) {
        return _blockchainID;
    }

    // ── Test helpers (not part of IWarpMessenger; only callable in tests) ──

    function _mockSetVerified(
        uint32 index,
        bytes32 sourceChainID,
        address originSenderAddress,
        bytes calldata payload,
        bool valid
    ) external {
        _verified[index] = WarpMessage(sourceChainID, originSenderAddress, payload);
        _verifiedValid[index] = valid;
    }

    function _mockSentCount() external view returns (uint256) {
        return _sent.length;
    }

    function _mockSentPayload(uint256 i) external view returns (bytes memory) {
        return _sent[i];
    }

    function _mockSentMessageID(uint256 i) external view returns (bytes32) {
        return _sentMessageIDs[i];
    }
}
