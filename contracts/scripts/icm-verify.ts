/**
 * KUMPLY — ICM Cross-L1 Attestation Verification Example
 *
 * Demonstrates how to verify a KUMPLY attestation from any Avalanche L1
 * using the Avalanche Interchain Messaging (ICM) SDK.
 *
 * The AVALANCHE® trademark is owned by Ava Labs, Inc.
 * This script is part of the independent KUMPLY project.
 *
 * Usage:
 *   npx ts-node scripts/icm-verify.ts <walletAddress>
 *
 * What it does:
 *   1. Reads the attestation directly from AttestationStore on Fuji C-Chain (primary)
 *   2. Shows how the same data would be requested from a remote Avalanche L1 via ICM
 *   3. Prints the attestation result with tier and expiry info
 *
 * Reference:
 *   https://build.avax.network/docs/tooling/avalanche-sdk/interchain/icm
 */

import { createPublicClient, http, parseAbiItem, decodeEventLog } from "viem";
import { avalancheFuji } from "viem/chains";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// ── Config ──────────────────────────────────────────────────────────────────

const ATTESTATION_STORE = process.env.CONTRACT_ATTESTATION_STORE as `0x${string}`;
const FUJI_RPC = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";

// Fuji C-Chain block chain ID (used by ICM)
const FUJI_CHAIN_ID = "yH8D7ThNJkxmtkuv2jgBa4P1Rn3Qpr4ED7HZRmkGQS9j5TW3";

// ICM Teleporter contract on Fuji C-Chain (Avalanche official address)
// Source: https://build.avax.network/docs/tooling/avalanche-sdk/interchain/icm
const TELEPORTER_ADDRESS = "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf" as `0x${string}`;

const ATTESTATION_STORE_ABI = [
  {
    name: "verify",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_subject", type: "address" }],
    outputs: [
      { name: "verified", type: "bool" },
      { name: "tier", type: "uint32" },
      { name: "timestamp", type: "uint64" },
      { name: "expiry", type: "uint64" },
    ],
  },
  {
    name: "totalAttestations",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const TIER_LABELS: Record<number, string> = {
  0: "Not Verified",
  1: "Basic (email + phone)",
  2: "Standard (government ID + liveness)",
  3: "Enhanced (proof of address + source of funds)",
  4: "Business / KYB (company registration + UBO)",
  5: "Agent / KYA (AI agent verification)",
};

// ── ICM Cross-L1 Verification Pattern ───────────────────────────────────────

/**
 * Solidity interface that a remote L1 contract would implement to request
 * cross-chain attestation verification from the KUMPLY C-Chain contract.
 *
 * The remote contract sends an ICM message to the C-Chain AttestationStore,
 * which responds with the attestation data via a return message.
 *
 * Reference implementation:
 *   https://build.avax.network/docs/tooling/avalanche-sdk/interchain/icm/methods
 *
 * @example Solidity snippet for remote L1:
 * ```solidity
 * // SPDX-License-Identifier: Apache-2.0
 * pragma solidity ^0.8.28;
 *
 * import "@avalabs/icm-contracts/contracts/interfaces/ITeleporterMessenger.sol";
 *
 * interface IKumplyRemoteVerifier {
 *     // Call this from any Avalanche L1 to check compliance on C-Chain
 *     function requestVerification(address subject, bytes32 sourceChainId) external;
 *     // Implement this to receive the result
 *     function receiveVerification(
 *         address subject, bool verified, uint32 tier, uint64 expiry
 *     ) external;
 * }
 *
 * contract CrossL1ComplianceGate is IKumplyRemoteVerifier {
 *     ITeleporterMessenger public immutable teleporter;
 *     bytes32 public immutable kumplyCChainId;
 *     address public immutable kumplyAttestationStore;
 *
 *     constructor(
 *         address _teleporter,
 *         bytes32 _kumplyCChainId,
 *         address _kumplyAttestationStore
 *     ) {
 *         teleporter = ITeleporterMessenger(_teleporter);
 *         kumplyCChainId = _kumplyCChainId;
 *         kumplyAttestationStore = _kumplyAttestationStore;
 *     }
 *
 *     function requestVerification(address subject, bytes32 sourceChainId) external {
 *         teleporter.sendCrossChainMessage(
 *             TeleporterMessageInput({
 *                 destinationBlockchainID: kumplyCChainId,
 *                 destinationAddress: kumplyAttestationStore,
 *                 feeInfo: TeleporterFeeInfo({ feeTokenAddress: address(0), amount: 0 }),
 *                 requiredGasLimit: 100000,
 *                 allowedRelayerAddresses: new address[](0),
 *                 message: abi.encode(subject, sourceChainId)
 *             })
 *         );
 *     }
 * }
 * ```
 */
function explainIcmPattern() {
  console.log("\n" + "═".repeat(70));
  console.log("ICM Cross-L1 Verification Pattern");
  console.log("═".repeat(70));
  console.log(`
How a remote Avalanche L1 verifies KUMPLY attestations:

  Remote L1 Contract
      │
      │  1. sendCrossChainMessage(destinationChainId=Fuji, message=subject)
      ▼
  ICM Teleporter (${TELEPORTER_ADDRESS})
      │
      │  2. Routes message to C-Chain via Avalanche Warp Messaging (AWM)
      ▼
  KUMPLY AttestationStore on Fuji C-Chain (${ATTESTATION_STORE || "<not configured>"})
      │
      │  3. verify(subject) → (verified, tier, timestamp, expiry)
      │  4. sendCrossChainMessage back to remote L1 with result
      ▼
  Remote L1 Contract
      │
      │  5. receiveVerification(subject, verified, tier, expiry)
      │     → grant or deny access based on tier

References:
  • ICM SDK: https://build.avax.network/docs/tooling/avalanche-sdk/interchain/icm
  • ICM Methods: https://build.avax.network/docs/tooling/avalanche-sdk/interchain/icm/methods
  • Warp ACP-30: https://build.avax.network/docs/acps/30-avalanche-warp-x-evm
  • Fuji Chain ID: ${FUJI_CHAIN_ID}
  • Teleporter: ${TELEPORTER_ADDRESS}
`);
}

// ── Direct C-Chain Verification (primary) ───────────────────────────────────

async function verifyOnCChain(subject: string) {
  if (!ATTESTATION_STORE) {
    throw new Error("CONTRACT_ATTESTATION_STORE not set in .env");
  }

  const client = createPublicClient({
    chain: avalancheFuji,
    transport: http(FUJI_RPC),
  });

  console.log("\n" + "═".repeat(70));
  console.log("Direct C-Chain Attestation Lookup");
  console.log("═".repeat(70));
  console.log(`  Network : Avalanche Fuji Testnet (chainId 43113)`);
  console.log(`  Contract: ${ATTESTATION_STORE}`);
  console.log(`  Subject : ${subject}`);

  const blockNumber = await client.getBlockNumber();
  console.log(`  Block   : #${blockNumber}`);

  const result = await client.readContract({
    address: ATTESTATION_STORE,
    abi: ATTESTATION_STORE_ABI,
    functionName: "verify",
    args: [subject as `0x${string}`],
  });

  const [verified, tier, timestamp, expiry] = result as [boolean, number, bigint, bigint];

  const totalAttestations = await client.readContract({
    address: ATTESTATION_STORE,
    abi: ATTESTATION_STORE_ABI,
    functionName: "totalAttestations",
  });

  console.log("\n  ── Result ──────────────────────────────────────────");
  console.log(`  Verified          : ${verified ? "✓ YES" : "✗ NO"}`);

  if (verified) {
    const now = Math.floor(Date.now() / 1000);
    const expiryTs = Number(expiry);
    const isExpired = expiryTs < now;

    console.log(`  Tier              : ${tier} — ${TIER_LABELS[tier] || "Unknown"}`);
    console.log(`  Issued            : ${new Date(Number(timestamp) * 1000).toISOString()}`);
    console.log(`  Expires           : ${new Date(expiryTs * 1000).toISOString()}${isExpired ? " ⚠ EXPIRED" : ""}`);
    console.log(`  Access (Tier ≥ 2) : ${tier >= 2 && !isExpired ? "✓ GRANTED" : "✗ DENIED"}`);
  }

  console.log(`\n  Total Attestations Issued: ${totalAttestations}`);
  console.log(`  Snowtrace: https://testnet.snowtrace.io/address/${ATTESTATION_STORE}`);

  return { verified, tier: Number(tier), timestamp: Number(timestamp), expiry: Number(expiry) };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const subject = process.argv[2];

  if (!subject || !/^0x[0-9a-fA-F]{40}$/.test(subject)) {
    console.error("Usage: npx ts-node scripts/icm-verify.ts <0x...walletAddress>");
    console.error("Example: npx ts-node scripts/icm-verify.ts 0xD65042534CE80fcb641fd6Eb99a16eBF6C0cd076");
    process.exit(1);
  }

  try {
    await verifyOnCChain(subject);
    explainIcmPattern();
    console.log("\n✓ Done.\n");
  } catch (error) {
    console.error("\n✗ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
