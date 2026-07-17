import { ethers, network } from "hardhat";

/**
 * KUMPLY — Live-network smoke test (read-only, zero gas)
 *
 * Exercises every public read path of the deployed AttestationStore and
 * ComplianceGate on the selected network, plus staticCall simulations of the
 * gated write path. Sends no transactions.
 *
 * Usage:
 *   npx hardhat run scripts/smoke-test.ts --network fuji
 *   npx hardhat run scripts/smoke-test.ts --network avalanche
 */

const DEPLOYMENTS: Record<string, { store: string; gate: string; verifiedWallet?: string }> = {
  fuji: {
    store: "0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD",
    gate: "0xcFDdeA5482baE9A6733B58F6a39FC36BCe6164cF",
    // Seeded demo attestation used by kumply.xyz/demo
    verifiedWallet: "0xD65042534CE80fcb641fd6Eb99a16eBF6C0cd076",
  },
  avalanche: {
    store: "0xa116261Ed3a848A9E1cd34923D5A0442D1455F71",
    gate: "0x01BEEA13A485c7bAD58f926E345325e9e3773bEe",
  },
};

const UNVERIFIED_WALLET = "0x000000000000000000000000000000000000dEaD";

let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, detail = "") {
  if (ok) {
    passed++;
    console.log(`  ✅ ${label}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed++;
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  const deployment = DEPLOYMENTS[network.name];
  if (!deployment) throw new Error(`No deployment config for network "${network.name}"`);

  const store = await ethers.getContractAt("AttestationStore", deployment.store);
  const gate = await ethers.getContractAt("ComplianceGate", deployment.gate);

  console.log(`\nKUMPLY smoke test — network: ${network.name} (chainId ${(await ethers.provider.getNetwork()).chainId})`);
  console.log(`AttestationStore: ${deployment.store}`);
  console.log(`ComplianceGate:   ${deployment.gate}\n`);

  // ── AttestationStore reads ──
  const fee: bigint = await store.verificationFee();
  check("verificationFee() readable", true, `${ethers.formatEther(fee)} AVAX`);

  const total: bigint = await store.totalAttestations();
  check("totalAttestations() readable", true, total.toString());

  const isPaused: boolean = await store.paused();
  check("contract not paused", !isPaused);

  const [vDead, tDead] = await store.verify(UNVERIFIED_WALLET);
  check("verify(unverified) → false", vDead === false && Number(tDead) === 0);

  // checkCompliance for an unverified subject never charges — must return (false, 0)
  const [ok0, tier0] = await store.checkCompliance.staticCall(UNVERIFIED_WALLET);
  check("checkCompliance(unverified) → (false, 0), no fee", ok0 === false && Number(tier0) === 0);

  // ── ComplianceGate reads + wiring ──
  const requiredTier: bigint = await gate.requiredTier();
  check("gate.requiredTier() == 2", Number(requiredTier) === 2);

  const gateFee: bigint = await gate.getVerificationFee();
  check("gate → store wiring (getVerificationFee matches)", gateFee === fee);

  // ── Gated write path (simulated, no gas spent) ──
  try {
    await gate.protectedAction.staticCall({ from: UNVERIFIED_WALLET });
    check("protectedAction blocks unverified caller", false, "did NOT revert");
  } catch {
    check("protectedAction blocks unverified caller", true, "reverted as expected");
  }

  if (deployment.verifiedWallet) {
    const [vOk, vTier] = await store.verify(deployment.verifiedWallet);
    check("verify(seeded wallet) → verified", vOk === true, `tier ${vTier}`);

    try {
      await gate.protectedAction.staticCall({ from: deployment.verifiedWallet, value: fee });
      check("protectedAction admits verified caller", true);
    } catch (e: any) {
      check("protectedAction admits verified caller", false, e.message?.slice(0, 80));
    }
  }

  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} passed, ${failed} failed on ${network.name}\n`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
