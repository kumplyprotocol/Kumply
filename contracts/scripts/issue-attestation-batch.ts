import { ethers, network } from "hardhat";

/**
 * KUMPLY — Batch-issue an attestation to many wallets (verifier-only).
 *
 * Live-workshop path: issue the same tier to a list of attendee addresses
 * in one run — any tier (1-5), whatever the session is actually teaching.
 * Live-tested for Tier 5 (Agent/KYA, 24-Sep KYA workshop) and Tier 4
 * (Business/KYB, ACP-99 workshop). Same mechanism as issue-attestation.ts,
 * looped over a list instead of one subject. No personal data is ever
 * required or stored — only the address.
 *
 * The signer must hold VERIFIER_ROLE on the target AttestationStore.
 *
 * Env:
 *   ISSUE_SUBJECTS — comma-separated list of addresses to attest (required)
 *   ISSUE_TIER     — 1..5 (default 5 = Agent/KYA)
 *
 * Usage:
 *   ISSUE_SUBJECTS=0xabc...,0xdef... ISSUE_TIER=5 \
 *     npx hardhat run scripts/issue-attestation-batch.ts --network fuji
 *
 * Never run with --network avalanche for a demo/workshop batch — mainnet
 * issuance is manual-only and reserved for real, non-demo attestations.
 */

const STORE: Record<string, string> = {
  avalanche: "0xa116261Ed3a848A9E1cd34923D5A0442D1455F71",
  fuji: "0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD",
};

// Same defensive pin as the API's issueAttestation call — Fuji's RPC has
// intermittently returned absurd gas estimates for this call.
const GAS_LIMIT = 300_000n;

async function main() {
  const storeAddress = STORE[network.name];
  if (!storeAddress) throw new Error(`No AttestationStore configured for network "${network.name}"`);

  const rawSubjects = process.env.ISSUE_SUBJECTS;
  if (!rawSubjects) throw new Error("ISSUE_SUBJECTS is required (comma-separated addresses)");
  const subjects = rawSubjects.split(",").map((s) => s.trim()).filter(Boolean);
  if (subjects.length === 0) throw new Error("ISSUE_SUBJECTS parsed to an empty list");

  for (const s of subjects) {
    if (!ethers.isAddress(s)) throw new Error(`Not a valid address: "${s}"`);
  }

  const tier = Number(process.env.ISSUE_TIER || "5");
  if (tier < 1 || tier > 5) throw new Error(`ISSUE_TIER must be 1-5, got ${tier}`);

  const [signer] = await ethers.getSigners();
  const store = await ethers.getContractAt("AttestationStore", storeAddress);

  const isVerifier = await (store as any).isVerifier(signer.address);
  if (!isVerifier) throw new Error(`Signer ${signer.address} is not a verifier on ${storeAddress}`);

  const ONE_YEAR = 365 * 24 * 60 * 60;
  const explorer = network.name === "avalanche" ? "https://snowtrace.io" : "https://testnet.snowtrace.io";

  console.log(`Batch-issuing tier ${tier} to ${subjects.length} addresses on ${network.name}...\n`);

  const results: { subject: string; status: "skipped" | "issued" | "failed"; detail: string }[] = [];

  for (const subject of subjects) {
    try {
      const existing = await (store as any).verify(subject);
      if (existing[0]) {
        console.log(`⏭️  ${subject} — already verified at tier ${existing[1]}, skipping.`);
        results.push({ subject, status: "skipped", detail: `already tier ${existing[1]}` });
        continue;
      }

      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);

      const tx = await (store as any).issueAttestation(subject, tier, expiry, { gasLimit: GAS_LIMIT });
      const receipt = await tx.wait();
      console.log(`✅ ${subject} — tx ${tx.hash} (block ${receipt.blockNumber})`);
      console.log(`   ${explorer}/tx/${tx.hash}`);
      results.push({ subject, status: "issued", detail: tx.hash });
    } catch (err: any) {
      console.log(`❌ ${subject} — FAILED: ${err.shortMessage || err.message}`);
      results.push({ subject, status: "failed", detail: err.shortMessage || err.message });
    }
  }

  console.log("\n── Summary ──");
  const issued = results.filter((r) => r.status === "issued").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed = results.filter((r) => r.status === "failed").length;
  console.log(`${issued} issued, ${skipped} skipped (already verified), ${failed} failed — of ${subjects.length} total.`);
  if (failed > 0) {
    console.log("\nFailed:");
    for (const r of results.filter((r) => r.status === "failed")) {
      console.log(`  ${r.subject}: ${r.detail}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
