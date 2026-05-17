import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

// Seed demo attestations for hackathon presentation
// Addresses used as demo subjects — must be real wallets to verify on-chain
const DEMO_ATTESTATIONS = [
  { address: "0xD65042534CE80fcb641fd6Eb99a16eBF6C0cd076", tier: 3, label: "Demo Enhanced KYC User" },
];

async function main() {
  const storeAddress = process.env.CONTRACT_ATTESTATION_STORE;
  if (!storeAddress) throw new Error("CONTRACT_ATTESTATION_STORE not set in .env");

  const [deployer] = await ethers.getSigners();
  console.log("Seeding with account:", deployer.address);
  console.log("AttestationStore:", storeAddress);

  const store = await ethers.getContractAt("AttestationStore", storeAddress);

  // Verify deployer is a verifier
  const isVerifier = await (store as any).isVerifier(deployer.address);
  if (!isVerifier) {
    console.error("❌ Deployer is not a verifier. Run deploy.ts first.");
    process.exit(1);
  }

  const ONE_YEAR = 365 * 24 * 60 * 60;
  const block = await ethers.provider.getBlock("latest");
  const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);

  for (const entry of DEMO_ATTESTATIONS) {
    const existing = await (store as any).attestations(entry.address);
    if (existing.verified) {
      console.log(`  ⏭️  ${entry.label} (${entry.address}) already attested at tier ${existing.tier}`);
      continue;
    }

    console.log(`  📋 Issuing Tier ${entry.tier} for ${entry.label}...`);
    const tx = await (store as any).issueAttestation(entry.address, entry.tier, expiry);
    await tx.wait();
    console.log(`  ✅ Done — tx: ${tx.hash}`);
  }

  console.log("\n═══════════════════════════════════════════");
  console.log("  KUMPLY Fuji Seed Complete");
  console.log(`  Total seeded: ${DEMO_ATTESTATIONS.length} attestation(s)`);
  console.log(`  Explorer: https://testnet.snowtrace.io/address/${storeAddress}`);
  console.log("═══════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
