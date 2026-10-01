# @kumply/sdk

[![npm version](https://img.shields.io/npm/v/@kumply/sdk)](https://www.npmjs.com/package/@kumply/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@kumply/sdk)](https://www.npmjs.com/package/@kumply/sdk)
[![license](https://img.shields.io/npm/l/@kumply/sdk)](https://www.npmjs.com/package/@kumply/sdk)

TypeScript SDK for the KUMPLY compliance infrastructure on the AVALANCHE® public blockchain.

📦 **[View on npm → npmjs.com/package/@kumply/sdk](https://www.npmjs.com/package/@kumply/sdk)**  
🌐 **[REST API → kumply-api.fly.dev](https://kumply-api.fly.dev)**

*The AVALANCHE® trademark is owned by Ava Labs, Inc. KUMPLY is an independent project — not endorsed by, sponsored by, or affiliated with Ava Labs, Inc.*

## Installation

```bash
npm install @kumply/sdk
# or
pnpm add @kumply/sdk
```

**Requirements:** Node.js ≥ 18, TypeScript ≥ 5.

## Quick start

```typescript
import { KumplyClient, DEPLOYMENTS, TIER } from "@kumply/sdk";

const client = new KumplyClient({
  network: "mainnet",
  contractAddress: DEPLOYMENTS.mainnet.attestationStore,
});

// Check if a wallet is a verified person with at least Standard KYC (Tier 2 or 3)
if (await client.isPersonAtLeast("0xUserAddress", TIER.STANDARD)) {
  console.log("Standard KYC: allow deposit");
} else {
  console.log("User needs verification");
}
```

## Live deployments (source-verified on Snowtrace)

| Contract | Network | Address |
|----------|---------|---------|
| AttestationStore | Mainnet C-Chain | [`0xa116261Ed3a848A9E1cd34923D5A0442D1455F71`](https://snowtrace.io/address/0xa116261Ed3a848A9E1cd34923D5A0442D1455F71) |
| ComplianceGate | Mainnet C-Chain | [`0x01BEEA13A485c7bAD58f926E345325e9e3773bEe`](https://snowtrace.io/address/0x01BEEA13A485c7bAD58f926E345325e9e3773bEe) |
| AttestationStore | Fuji Testnet | [`0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD`](https://testnet.snowtrace.io/address/0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD) |
| ComplianceGate | Fuji Testnet | [`0xcFDdeA5482baE9A6733B58F6a39FC36BCe6164cF`](https://testnet.snowtrace.io/address/0xcFDdeA5482baE9A6733B58F6a39FC36BCe6164cF) |
| KumplyValidatorSetManager | Fuji Testnet | [`0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64`](https://testnet.snowtrace.io/address/0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64) |

All addresses ship in the SDK as the `DEPLOYMENTS` constant — no copy-pasting needed.
Mainnet currently runs as a **read-only beta with `verificationFee = 0`**; the automated
Sumsub KYC flow issues attestations on Fuji.

## API reference

### `new KumplyClient(options)`

| Option            | Type     | Required | Description                                              |
|-------------------|----------|----------|----------------------------------------------------------|
| `network`         | `string` | Yes      | `"fuji"` or `"mainnet"`. `"kumply-l1"` exists but is not usable yet (see Networks) |
| `contractAddress` | `string` | Yes      | `AttestationStore` address — use `DEPLOYMENTS.<network>` |
| `rpcUrl`          | `string` | No       | Custom RPC URL (defaults to public Fuji/mainnet)         |

Instances also expose `client.network`, `client.chainId` (43113 · 43114 · 43210),
`client.contractAddress`, and `client.publicClient` (the underlying viem client, for advanced use).

### Methods

#### `verify(address: string): Promise<AttestationResult>`

Full attestation lookup (free read). Returns `verified`, `tier`, `timestamp`, and `expiry` — in that order, matching the contract.

- `timestamp` is when the attestation was **issued**; `expiry` is when it **expires**. Both are UNIX time in **seconds**.
- `verified` is `false` if the attestation is **expired, revoked, or was never issued**. In that case `tier`, `timestamp` and `expiry` are all `0`. You do not need to compare `expiry` against the current time yourself, and the three cases are indistinguishable from this call.
- It is a free `view` call and keeps working while the contract is **paused** (pausing only blocks issuing new attestations).

```typescript
const { verified, tier, timestamp, expiry } = await client.verify("0x...");
```

**Smart accounts (ERC-4337).** Attestations are issued to, and looked up by, the exact address that signs or is sponsored. For a smart account (for example behind a paymaster) that is the smart account's own address, not its owner EOA. Verify the same address you attested.

**Paymasters: don't call `verify()` inside `validatePaymasterUserOp`.** ERC-7562 (rule OP-011) blocks the `TIMESTAMP` opcode during UserOperation validation, and `verify()` reads `block.timestamp`, so bundlers that enforce ERC-7562 will reject the UserOperation. During validation, read the raw `attestations(sender)` record instead and return its `expiry` as `validUntil`; the EntryPoint then does the time check. Outside validation (`postOp`, your own contracts, or an off-chain sponsorship service), `verify()` is fine. Tested example and details: [kumply.xyz/developers#paymasters](https://kumply.xyz/developers#paymasters).

#### `getAttestation(address: string): Promise<Attestation | null>`

Like `verify()`, plus the issuing `verifier` address. Returns `null` if there is no valid attestation (never issued, revoked, or expired).

#### `isVerified(address: string): Promise<boolean>`

Convenience wrapper — returns `true` if the address has a valid, non-expired attestation.

#### `isPersonAtLeast(address: string, level: number): Promise<boolean>`

`true` if the address is a verified person whose tier is between `level` and 3 (`level` is 1, 2 or 3). Businesses (Tier 4) and agents (Tier 5) never pass. Throws for any other `level`.

#### `isBusiness(address: string): Promise<boolean>`

`true` only for a verified Tier 4 (KYB) address.

#### `isAgent(address: string): Promise<boolean>`

`true` only for a verified Tier 5 (KYA) address.

```typescript
import { TIER } from "@kumply/sdk";

await client.isPersonAtLeast("0x...", TIER.STANDARD); // Tier 2 or 3
await client.isBusiness("0x...");                     // exactly Tier 4
await client.isAgent("0x...");                        // exactly Tier 5
```

#### `meetsTierRequirement(tier: number, req: TierRequirement): boolean`

Pure helper to test whether a tier number satisfies a requirement without making an RPC call. Useful when you already queried `verify()` or have cached verification results:

```typescript
import { meetsTierRequirement, type TierRequirement } from "@kumply/sdk";

// When you already have a tier number (e.g. from verify()):
const { verified, tier } = await client.verify("0x...");

// Check for a person at Tier 2 (Standard) or higher (Tier 2 or 3):
const canTrade = meetsTierRequirement(tier, { kind: "person", minLevel: 2 });

// Check for a business (exactly Tier 4):
const isCorporate = meetsTierRequirement(tier, { kind: "business" });

// Check for an AI agent (exactly Tier 5):
const isBot = meetsTierRequirement(tier, { kind: "agent" });
```

Tier 0 (unverified, expired, or revoked) never satisfies any requirement. Businesses (Tier 4) and agents (Tier 5) never satisfy person requirements, and vice versa.

#### `hasTier(address: string, tier: number)` *(deprecated)*

Compares tiers as one ladder (`tier >= X`), so a Tier 5 agent passes `hasTier(x, TIER.KYB)` and a Tier 4 business passes a Tier 2 check. Kept with the same behavior for backward compatibility; use the three methods above instead.

#### `getTotalAttestations(): Promise<number>`

Total attestations ever issued by the contract.

#### `getVerificationFee(): Promise<bigint>`

Current per-call compliance fee in wei (for `checkCompliance()`). Returns `0n` when free.

```typescript
import { AVAX_DECIMALS } from "@kumply/sdk";

const feeWei = await client.getVerificationFee();
const feeAvax = Number(feeWei) / Number(10n ** AVAX_DECIMALS); // e.g. 0.0005
```

#### `getTotalFeesCollected(): Promise<bigint>`

Cumulative protocol revenue collected in wei.

### Constants

```typescript
import {
  DEPLOYMENTS,            // Verified contract addresses per network (mainnet + fuji)
  TIER,                   // { BASIC: 1, STANDARD: 2, ENHANCED: 3, KYB: 4, KYA: 5 }
  FUJI_CONFIG,            // { chainId: 43113, rpcUrl, name, explorerUrl }
  MAINNET_CONFIG,         // { chainId: 43114, rpcUrl, name, explorerUrl }
  TIER_DEFINITIONS,       // TierConfig[] — all 5 KYC tier descriptions
  AVAX_DECIMALS,          // 18n — divide wei by 10n**AVAX_DECIMALS to get AVAX
  ATTESTATION_STORE_ABI,  // Typed ABI for AttestationStore
  COMPLIANCE_GATE_ABI,    // Typed ABI for ComplianceGate
} from "@kumply/sdk";
```

### KYC tiers

| Tier | Name     | Description                                 |
|------|----------|---------------------------------------------|
| 1    | Basic    | Email + phone verification                  |
| 2    | Standard | Government ID + liveness detection          |
| 3    | Enhanced | Proof of address + source of funds          |
| 4    | Business | KYB — Company registration + UBO disclosure |
| 5    | Agent    | KYA — Know Your Agent bot verification      |

**How to compare tiers.** Tiers 1-3 are a ladder for people: Standard (2) also covers Enhanced (3). Tier 4 (business) and Tier 5 (agent) are separate categories, not higher levels: a business is not a person with extra checks, and an agent is not a business. So never gate with a bare `tier >= X`. Ask for "a person at level N or higher", "a business" or "an agent".

> **Deployed ComplianceGate contracts use the old ladder.** The `ComplianceGate` deployments on Fuji and Mainnet C-Chain (`DEPLOYMENTS.<network>.complianceGate`) check `tier >= requiredTier` with `requiredTier = 2`, so a Tier 4 business or a Tier 5 agent passes them. They are immutable. A category-aware gate is planned for mainnet hardening.

> **Note:** "KYA" above is KUMPLY's own tier name, not the DIF-governed [KYA-OS](https://github.com/decentralized-identity/kya-os-mcp) protocol for MCP agents — same acronym, unrelated standard.

## Networks

| Network                  | Network ID    | Chain ID | Status                              | Explorer                     |
|--------------------------|---------------|----------|-------------------------------------|------------------------------|
| Avalanche C-Chain        | `mainnet`     | 43114    | **Live** (read-only beta, fee $0)   | https://snowtrace.io         |
| Avalanche Fuji           | `fuji`        | 43113    | **Live** (full suite + automated KYC) | https://testnet.snowtrace.io |
| KUMPLY Compliance L1     | `kumply-l1`   | 43210    | **Not active.** Chain registered on Fuji; not converted to an L1, no validators, public RPC not serving | https://testnet.avascan.info |

The **KUMPLY Compliance L1** is a planned custom Avalanche L1 (ACP-77 + ACP-99) whose validator manager gates registration on a KUMPLY attestation: today the deployed `KumplyValidatorSetManager` accepts Tier 4 (KYB) or higher, and a fix that restricts it to exactly Tier 4 is already in the code and ships with the manager's redeploy before the L1 is activated. The chain is registered on the Fuji P-Chain with its genesis committed, and the manager is deployed and verified on Fuji C-Chain, but it is not initialized and the L1 has no validators yet.

> **Don't use `network: "kumply-l1"` until activation.** Its public RPC does not serve requests yet (it answers HTTP 405). Constructing a client with `network: "kumply-l1"` throws a clear error unless you pass your own `rpcUrl` (for example a local devnet). `KUMPLY_L1_CONFIG.live` is `false` until activation. See [kumply.xyz/l1](https://kumply.xyz/l1) for live status and [`contracts/l1/`](https://github.com/kumplyprotocol/Kumply/tree/main/contracts/l1) for the architecture.

## Using ABIs directly with viem

```typescript
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { ATTESTATION_STORE_ABI } from "@kumply/sdk";

const viemClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

const [verified, tier] = await viemClient.readContract({
  address: "0xYourAttestationStoreAddress",
  abi: ATTESTATION_STORE_ABI,
  functionName: "verify",
  args: ["0xUserAddress"],
});
```

## Solidity integration

```solidity
interface IAttestationStore {
    function verify(address subject) external view returns (
        bool verified, uint32 tier, uint64 timestamp, uint64 expiry
    );
}

contract MyProtocol {
    IAttestationStore public kumply;

    // verify() already returns ok == false for expired, revoked, or unknown addresses.
    // Tiers 1-3 are a ladder for people; 4 (business) and 5 (agent) are separate categories.

    modifier onlyPersonAtLeast(uint32 level) {
        (bool ok, uint32 tier, , ) = kumply.verify(msg.sender);
        require(ok && tier >= level && tier <= 3, "person KYC required");
        _;
    }

    modifier onlyBusiness() {
        (bool ok, uint32 tier, , ) = kumply.verify(msg.sender);
        require(ok && tier == 4, "business KYB required");
        _;
    }

    modifier onlyAgent() {
        (bool ok, uint32 tier, , ) = kumply.verify(msg.sender);
        require(ok && tier == 5, "agent KYA required");
        _;
    }

    function deposit(uint256 amount) external onlyPersonAtLeast(2) {
        // only people with Standard (2) or Enhanced (3) KYC reach here
    }
}
```

## License

Apache License 2.0 — see [LICENSE](../../LICENSE) and [NOTICE](../../NOTICE).
