import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

/**
 * Issues a Tier-4 (KYB) attestation to the deployer on AttestationStore (C-Chain Fuji).
 * Required before the deployer can call KumplyValidatorSetManager.initializeValidatorRegistration
 * to bootstrap the L1 validator set.
 *
 * Idempotent: re-issues only when the existing tier is < 4 or expired.
 */
async function main() {
  const storeAddress = process.env.CONTRACT_ATTESTATION_STORE;
  if (!storeAddress) throw new Error("CONTRACT_ATTESTATION_STORE not set in .env");

  const [deployer] = await ethers.getSigners();
  const subject = process.env.TIER4_SUBJECT ?? deployer.address;

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Issuing Tier-4 (KYB) Attestation");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Signer:           ", deployer.address);
  console.log("  Subject:          ", subject);
  console.log("  AttestationStore: ", storeAddress);

  const store = await ethers.getContractAt("AttestationStore", storeAddress);

  const isVerifier = await (store as any).isVerifier(deployer.address);
  if (!isVerifier) {
    throw new Error(`Signer ${deployer.address} lacks VERIFIER_ROLE on ${storeAddress}.`);
  }

  const ONE_YEAR = 365 * 24 * 60 * 60;
  const block = await ethers.provider.getBlock("latest");
  const now = block!.timestamp;
  const expiry = BigInt(now) + BigInt(ONE_YEAR);

  const existing = await (store as any).attestations(subject);
  if (existing.verified && Number(existing.tier) >= 4 && Number(existing.expiry) > now) {
    console.log(
      `  ⏭️  Subject already has Tier-${existing.tier} attestation valid until ${new Date(
        Number(existing.expiry) * 1000
      ).toISOString()} — nothing to do.`
    );
    return;
  }

  console.log("\n🚀 Issuing Tier 4 (Business/KYB), expiry +1y …");
  const tx = await (store as any).issueAttestation(subject, 4, expiry);
  console.log("   tx:", tx.hash);
  const receipt = await tx.wait();
  console.log("   ✅ confirmed in block", receipt.blockNumber);

  const after = await (store as any).attestations(subject);
  console.log("\n  Result:");
  console.log("    verified:", after.verified);
  console.log("    tier:    ", after.tier.toString());
  console.log("    expiry:  ", new Date(Number(after.expiry) * 1000).toISOString());
  console.log("\n  Subject is now eligible to call KumplyValidatorSetManager.initializeValidatorRegistration.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
