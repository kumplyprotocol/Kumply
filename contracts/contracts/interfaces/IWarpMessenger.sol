// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/// @notice Avalanche Warp Messenger precompile interface (Subnet-EVM)
/// @dev    Address: 0x0200000000000000000000000000000000000005
///         See: https://build.avax.network/docs/acps/30-avalanche-warp-x-evm
interface IWarpMessenger {
    event SendWarpMessage(address indexed sender, bytes32 indexed messageID, bytes message);

    struct WarpMessage {
        bytes32 sourceChainID;
        address originSenderAddress;
        bytes payload;
    }

    struct WarpBlockHash {
        bytes32 sourceChainID;
        bytes32 blockHash;
    }

    function sendWarpMessage(bytes calldata payload) external returns (bytes32 messageID);

    function getVerifiedWarpMessage(uint32 index)
        external
        view
        returns (WarpMessage memory message, bool valid);

    function getVerifiedWarpBlockHash(uint32 index)
        external
        view
        returns (WarpBlockHash memory message, bool valid);

    function getBlockchainID() external view returns (bytes32 blockchainID);
}

address constant WARP_MESSENGER = 0x0200000000000000000000000000000000000005;
