import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

/**
 * KUMPLY — Contract Verification on Snowtrace
 *
 * Verifies both deployed contracts on the AVALANCHE® Fuji Testnet
 * via Routescan/Snowtrace API. Required for Retro9000 eligibility
 * and VC due diligence transparency.
 *
 * Usage:
 *   npx hardhat run scripts/verify-contracts.ts --network fuji
 *
 * Requirements:
 *   - CONTRACT_ATTESTATION_STORE and CONTRACT_COMPLIANCE_GATE set in .env
 *   - DEPLOYER_PRIVATE_KEY set in .env (used to derive the deployer address)
 *   - SNOWTRACE_API_KEY set in .env (or "verifyContract" for Routescan public endpoint)
 *   - Contracts must be deployed and the network synced
 */

import { run, ethers } from "hardhat";

async function main() {
  const storeAddress = process.env.CONTRACT_ATTESTATION_STORE;
  const gateAddress = process.env.CONTRACT_COMPLIANCE_GATE;

  if (!storeAddress || !gateAddress) {
    throw new Error("CONTRACT_ATTESTATION_STORE and CONTRACT_COMPLIANCE_GATE must be set in .env");
  }

  // Derive deployer address from private key — same key used at deploy time
  let deployerAddress: string;
  if (process.env.DEPLOYER_PRIVATE_KEY) {
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
    deployerAddress = wallet.address;
  } else {
    throw new Error(
      "DEPLOYER_PRIVATE_KEY must be set in .env to derive the deployer address for constructor argument verification."
    );
  }

  // eERC token address used at deploy time (zero address = no eERC integration yet)
  const eercTokenAddress = "0x0000000000000000000000000000000000000000";

  console.log("═══════════════════════════════════════════");
  console.log("  KUMPLY Contract Verification (Snowtrace)");
  console.log("═══════════════════════════════════════════\n");
  console.log(`  Deployer: ${deployerAddress}`);
  console.log(`  AttestationStore: ${storeAddress}`);
  console.log(`  ComplianceGate:   ${gateAddress}\n`);

  // 1. Verify AttestationStore
  console.log("1. Verifying AttestationStore...");
  try {
    await run("verify:verify", {
      address: storeAddress,
      constructorArguments: [deployerAddress, eercTokenAddress],
      contract: "contracts/AttestationStore.sol:AttestationStore",
    });
    console.log("   ✅ AttestationStore verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified") || error.message.includes("already verified")) {
      console.log("   ⏭️  Already verified\n");
    } else {
      console.error("   ❌ Error:", error.message, "\n");
    }
  }

  // 2. Verify ComplianceGate
  console.log("2. Verifying ComplianceGate...");
  try {
    await run("verify:verify", {
      address: gateAddress,
      constructorArguments: [storeAddress, 2],
      contract: "contracts/ComplianceGate.sol:ComplianceGate",
    });
    console.log("   ✅ ComplianceGate verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified") || error.message.includes("already verified")) {
      console.log("   ⏭️  Already verified\n");
    } else {
      console.error("   ❌ Error:", error.message, "\n");
    }
  }

  console.log("═══════════════════════════════════════════");
  console.log("  Verification Complete");
  console.log(`  AttestationStore: https://testnet.snowtrace.io/address/${storeAddress}`);
  console.log(`  ComplianceGate:   https://testnet.snowtrace.io/address/${gateAddress}`);
  console.log("═══════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
