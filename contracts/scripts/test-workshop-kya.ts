import { ethers, network } from "hardhat";

/**
 * One-off live verification for WorkshopKYA.sol ahead of the 24-Sep workshop.
 * Deploys to Fuji, issues a tier to the signer's own address, reads it back,
 * and confirms it matches. Not meant to be run repeatedly - it's a dry run
 * proving the exact source attendees will paste into Remix behaves correctly
 * on the real network, compiled with the same solc.
 *
 * Usage: npx hardhat run scripts/test-workshop-kya.ts --network fuji
 */

async function main() {
  if (network.name !== "fuji") {
    throw new Error(`Refusing to run on "${network.name}" - this is a Fuji-only dry run.`);
  }

  const [signer] = await ethers.getSigners();
  console.log(`Deploying WorkshopKYA from ${signer.address} on ${network.name}...`);

  const Factory = await ethers.getContractFactory("WorkshopKYA");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`  deployed at: ${address}`);
  console.log(`  Snowtrace: https://testnet.snowtrace.io/address/${address}`);

  const TEST_TIER = 5;
  console.log(`\nCalling issueTier(${signer.address}, ${TEST_TIER})...`);
  const tx = await contract.issueTier(signer.address, TEST_TIER);
  const receipt = await tx.wait();
  console.log(`  tx: ${tx.hash} (block ${receipt!.blockNumber})`);
  console.log(`  Snowtrace: https://testnet.snowtrace.io/tx/${tx.hash}`);

  console.log(`\nCalling verify(${signer.address})...`);
  const tier = await contract.verify(signer.address);
  console.log(`  returned tier: ${tier}`);

  console.log(`\nCross-checking via public tierOf(${signer.address}) getter...`);
  const tierOfResult = await contract.tierOf(signer.address);
  console.log(`  tierOf: ${tierOfResult}`);

  if (Number(tier) !== TEST_TIER || Number(tierOfResult) !== TEST_TIER) {
    throw new Error(`MISMATCH: expected ${TEST_TIER}, got verify()=${tier} tierOf()=${tierOfResult}`);
  }

  console.log(`\n✅ PASS - verify() and tierOf() both correctly return ${TEST_TIER} after issueTier().`);
  console.log(`Deployed address for reference: ${address}`);
}

main().catch((error) => {
  console.error("❌ FAILED:", error);
  process.exitCode = 1;
});
