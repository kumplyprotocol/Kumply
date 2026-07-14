import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploys KumplyValidatorSetManager.sol to the target network (typically C-Chain
 * since the manager governs the L1 validator set from outside the L1 itself).
 *
 * Reads the SubnetID from contracts/l1/.deployment/deployment.json which is
 * produced by deploy-l1.sh. If not present, falls back to the env var
 * KUMPLY_L1_SUBNET_ID.
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Deploying KumplyValidatorSetManager");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Deployer:       ", deployer.address);
  console.log("  Balance:        ", (await ethers.provider.getBalance(deployer.address)).toString(), "wei");
  console.log("  Chain:          ", (await ethers.provider.getNetwork()).chainId.toString());

  // ── Resolve AttestationStore address ─────────────────────────────
  const attestationStore = process.env.CONTRACT_ATTESTATION_STORE;
  if (!attestationStore) {
    throw new Error("CONTRACT_ATTESTATION_STORE not set in .env — deploy AttestationStore first.");
  }
  console.log("  AttestationStore:", attestationStore);

  // ── Resolve SubnetID ─────────────────────────────────────────────
  let subnetID: string;
  const deploymentFile = path.join(__dirname, "../l1/.deployment/deployment.json");
  if (fs.existsSync(deploymentFile)) {
    const data = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
    subnetID = data.subnetID;
    console.log("  SubnetID (from .deployment/):", subnetID);
  } else if (process.env.KUMPLY_L1_SUBNET_ID) {
    subnetID = process.env.KUMPLY_L1_SUBNET_ID;
    console.log("  SubnetID (from env):", subnetID);
  } else {
    // Placeholder for "deploy-ready but not yet deployed" mode — uses a deterministic
    // SubnetID derived from the deployer address. Replace once the L1 is created via
    // `avalanche blockchain deploy`.
    subnetID = ethers.keccak256(ethers.toUtf8Bytes("KUMPLY_L1_PENDING_DEPLOYMENT"));
    console.log("  ⚠ SubnetID not found — using placeholder:", subnetID);
    console.log("    Re-run after `avalanche blockchain deploy kumply-l1` to set the real ID.");
  }

  // ── Deploy ──────────────────────────────────────────────────────
  console.log("\n🚀 Deploying KumplyValidatorSetManager…");
  const ManagerFactory = await ethers.getContractFactory("KumplyValidatorSetManager");
  const manager = await ManagerFactory.deploy(deployer.address, attestationStore, subnetID);
  await manager.waitForDeployment();
  const managerAddr = await manager.getAddress();

  console.log("\n✅ KumplyValidatorSetManager deployed:");
  console.log("   Address:        ", managerAddr);
  console.log("   Admin:          ", deployer.address);
  console.log("   L1_MANAGER_ROLE:", deployer.address);

  // ── Persist for downstream tooling ───────────────────────────────
  const outFile = path.join(__dirname, "../l1/.deployment/validator-manager.json");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        address: managerAddr,
        admin: deployer.address,
        attestationStore,
        subnetID,
        chainId: (await ethers.provider.getNetwork()).chainId.toString(),
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  // ── Resolve placeholders in l1-config.json ──────────────────────
  const l1ConfigPath = path.join(__dirname, "../l1/l1-config.json");
  if (fs.existsSync(l1ConfigPath)) {
    const cfg = JSON.parse(fs.readFileSync(l1ConfigPath, "utf-8"));
    cfg.validatorSet.managerContract = managerAddr;
    cfg.compliance.validatorSetManager = managerAddr;
    fs.writeFileSync(l1ConfigPath, JSON.stringify(cfg, null, 2) + "\n");
    console.log("\n✏️  Patched l1-config.json with managerContract + compliance.validatorSetManager");
  }

  console.log("\nUpdate your .env with:");
  console.log(`  CONTRACT_VALIDATOR_SET_MANAGER=${managerAddr}`);
  console.log("\nNext steps (ACP-99 two-phase lifecycle):");
  console.log("  1. After the P-Chain processes ConvertSubnetToL1Tx, an L1_MANAGER_ROLE");
  console.log("     holder calls initializeValidatorSet(conversionData, messageIndex).");
  console.log("  2. Each institutional validator (KYB-verified) calls");
  console.log("     initiateValidatorRegistration(nodeID, blsPublicKey, balanceOwner,");
  console.log("     disableOwner, weight) — gated by Tier-4 (KYB) attestation.");
  console.log("  3. Their off-chain bot picks up the P-Chain ack and calls");
  console.log("     completeValidatorRegistration(messageIndex) within 23h of step 2.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
