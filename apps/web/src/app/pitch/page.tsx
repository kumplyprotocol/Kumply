import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { DECK_CSS, DECK_HTML } from "./pitch-deck";

// ISR: refresh the on-chain attestation count at most once an hour.
export const revalidate = 3600;

const ATTESTATION_STORE = (process.env.NEXT_PUBLIC_CONTRACT_ATTESTATION_STORE ||
  "0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD") as `0x${string}`;

async function getTotalAttestations(): Promise<string> {
  try {
    const client = createPublicClient({
      chain: avalancheFuji,
      transport: http(
        process.env.NEXT_PUBLIC_FUJI_RPC_URL ||
          "https://api.avax-test.network/ext/bc/C/rpc"
      ),
    });
    const total = await client.readContract({
      address: ATTESTATION_STORE,
      abi: [
        {
          name: "totalAttestations",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ type: "uint256" }],
        },
      ] as const,
      functionName: "totalAttestations",
    });
    return total.toString();
  } catch {
    return "10"; // last known count if the RPC is unreachable at render time
  }
}

export default async function PitchPage() {
  const total = await getTotalAttestations();
  const html = DECK_HTML.replace("__TOTAL_ATTESTATIONS__", total);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DECK_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
