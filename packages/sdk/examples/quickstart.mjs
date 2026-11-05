// Usage: node quickstart.mjs <address> [address...]
import { KumplyClient, DEPLOYMENTS, TIER } from "@kumply/sdk";

const client = new KumplyClient({ network: "fuji", contractAddress: DEPLOYMENTS.fuji.attestationStore });

for (const address of process.argv.slice(2)) {
  const [person, business, agent] = await Promise.all([
    client.isPersonAtLeast(address, TIER.BASIC),
    client.isBusiness(address),
    client.isAgent(address),
  ]);
  console.log(`${address} -> isPersonAtLeast(1)=${person} isBusiness=${business} isAgent=${agent}`);
}
