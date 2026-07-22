# KUMPLY 🛡️

**The First Institutional-Grade Compliance Identity Layer for the AVALANCHE® Public Blockchain**

KUMPLY provides non-custodial, on-chain identity verification (KYC/KYB/KYA) for the AVALANCHE® network. By bridging real-world regulatory compliance with DeFi anonymity, we empower institutions, exchanges, and autonomous AI agents to operate seamlessly across the C-Chain and custom AVALANCHE® L1s without compromising user privacy.

*Live on the AVALANCHE® Fuji Testnet, with a read-only beta on Mainnet C-Chain.*

> **Trademark Notice:** The AVALANCHE® and AVAX® trademarks are owned by Ava Labs, Inc. KUMPLY is an independent project — not endorsed by, sponsored by, or affiliated with Ava Labs, Inc. or the Avalanche Foundation.

[![CI](https://github.com/kumplyprotocol/Kumply/actions/workflows/ci.yml/badge.svg)](https://github.com/kumplyprotocol/Kumply/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@kumply/sdk)](https://www.npmjs.com/package/@kumply/sdk)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

## 🌐 Live Contracts

All contracts are deployed and verified. **164 tests** run on every push.

### Mainnet C-Chain (read-only beta)

The read layer is live on mainnet. `verificationFee` is currently **0**, so compliance reads and the SDK are free. Paid queries are enabled in a later milestone — see the [litepaper roadmap](LITEPAPER.md#7-roadmap).

| Contract | Address |
|---|---|
| AttestationStore | [`0xa116261Ed3a848A9E1cd34923D5A0442D1455F71`](https://snowtrace.io/address/0xa116261Ed3a848A9E1cd34923D5A0442D1455F71) |
| ComplianceGate | [`0x01BEEA13A485c7bAD58f926E345325e9e3773bEe`](https://snowtrace.io/address/0x01BEEA13A485c7bAD58f926E345325e9e3773bEe) |

### Fuji Testnet

Full read/write environment — this is where the KYC flow at [kumply.xyz/verify](https://kumply.xyz/verify) issues attestations.

| Contract | Address |
|---|---|
| AttestationStore | [`0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD`](https://testnet.snowtrace.io/address/0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD) |
| ComplianceGate | [`0xcFDdeA5482baE9A6733B58F6a39FC36BCe6164cF`](https://testnet.snowtrace.io/address/0xcFDdeA5482baE9A6733B58F6a39FC36BCe6164cF) |
| KumplyValidatorSetManager | [`0x903f6E46f965C9A1127652D761400dBe487F555D`](https://testnet.snowtrace.io/address/0x903f6E46f965C9A1127652D761400dBe487F555D) |

## ⚡ The Problem

As DeFi scales and institutions enter the Avalanche ecosystem, a massive friction point exists: **Compliance**. 
DApps must enforce KYC/AML laws, but forcing users to verify their identity on every single DApp destroys UX and creates dangerous data honeypots. Furthermore, the rise of Autonomous AI Agents trading on-chain brings a new question: *Who is legally responsible for this agent's actions?*

## 💡 The Solution

KUMPLY is a "Verify Once, Use Everywhere" protocol.
1. Users/Businesses/Agents complete identity verification via our licensed partner (Sumsub).
2. We issue an **on-chain attestation credential** to their wallet. The credential holds only `(tier, expiry, issuer, revocation status)` — **no personal data is ever written on-chain**. Documents stay with Sumsub; KUMPLY never stores them.
3. Avalanche Smart Contracts can check a user's compliance Tier (`1-5`) natively via our `AttestationStore` or `ComplianceGate` without touching personal data.

### Verification Tiers
- **Tier 1 (Basic)**: Email & Phone Verification
- **Tier 2 (Standard)**: Government ID + Liveness Check (KYC)
- **Tier 3 (Enhanced)**: Proof of Address + Source of Funds
- **Tier 4 (Business)**: Corporate Verification (KYB) + UBO Disclosure
- **Tier 5 (Agentic)**: AI Agent Verification (KYA) - Linking autonomous software to verified owners.

## 🏗️ Architecture

KUMPLY is built entirely around the Avalanche technical stack.

- **Software-Only Protocol** *(shipped)*: We never store user documents. Data is processed by Sumsub, while KUMPLY exclusively handles the cryptographic on-chain proofs. No custody, no financial intermediation.
- **PII-free attestations** *(shipped)*: `AttestationStore` records only tier, expiry, issuer and revocation status against an address. Reads are public and free.
- **Avalanche L1 Interoperability via ICM** *(designed, not yet shipped)*: The architecture targets Interchain Messaging so a credential issued on C-Chain can be read from any Avalanche L1 without a bridge. `AttestationStoreL1.sol` (the ICM-mirrored reader) is on the Q3 2026 roadmap — today, cross-chain reads are not yet live.
- **Encrypted ERC (eERC)** *(Phase 2, not yet shipped)*: `AttestationStore` exposes an admin-only `setEercToken()` hook so encrypted credentials can be added once AvaCloud's EncryptedERC integration lands. In Phase 1 this is set to `address(0)` — attestations today are plaintext tier records, not encrypted tokens.

> We list roadmap items explicitly as roadmap. If it says *shipped*, you can verify it on Snowtrace or in the test suite right now.

## ⛓️ KUMPLY Compliance L1 (Registered on Fuji — Activation Pending)

We are introducing the first Avalanche L1 where only **KYB-verified institutions can validate**. Every block is signed by a licensed entity, baking compliance directly into the consensus layer.
- **Validator Architecture (ACP-77 + ACP-99)**: Uses `KumplyValidatorSetManager.sol` to enforce Tier 4 (KYB) attestation as a prerequisite for validation.
- **Sub-Cent Compliance Reads**: Predictable, near-zero fees for compliance lookups at institutional scale.
- **Cross-L1 via Warp + ICM**: Attestations propagate natively without bridges or third-party trust assumptions.
- **Self-Healing Validator Set**: Anyone can call `disableExpiredValidator()` if a validator's KYB expires, removing non-compliant validators automatically without admin intervention.

### L1 Network Details (Fuji — chain registered, validator activation pending)
- **Network Name:** KUMPLY Compliance L1
- **RPC URL:** `https://subnets.avax.network/2pyvAQK1WQ318yHtnv4ZQeL9hWeJmmgMp9MEHqpJnDYttQEL6b/rpc`
- **Chain ID:** `43210`
- **Currency Symbol:** `KMP`
- **Subnet ID:** `2buHAwNvaybnQ6vQYRS4TeXizZhAo33bhpnonAJu21CKYLZoST`
- **Blockchain ID:** `2pyvAQK1WQ318yHtnv4ZQeL9hWeJmmgMp9MEHqpJnDYttQEL6b`
- **Validator Set Manager:** [`0x903f6E46f965C9A1127652D761400dBe487F555D`](https://testnet.snowtrace.io/address/0x903f6E46f965C9A1127652D761400dBe487F555D)

## 💻 Tech Stack

- **Smart Contracts**: Solidity 0.8.28, Hardhat, OpenZeppelin
- **Frontend**: Next.js 16 (App Router), React 19, Vanilla CSS (custom design system)
- **Web3 Interaction**: Wagmi v3, Viem v2, MetaMask / Core Wallet
- **API**: Express + TypeScript, Zod validation, HMAC-SHA256 webhooks
- **SDK**: [`@kumply/sdk`](https://www.npmjs.com/package/@kumply/sdk) (TypeScript package for DApps)

## 📦 Monorepo Layout

pnpm workspaces. Each package is independently testable and CI-gated.

```
kumply/
├── contracts/          # @kumply/contracts — Solidity 0.8.28 + Hardhat
│   ├── contracts/      #   AttestationStore · ComplianceGate · KumplyValidatorSetManager
│   └── l1/             #   KUMPLY Compliance L1: genesis, ACP-77 config, validator node
├── packages/sdk/       # @kumply/sdk — TypeScript SDK (viem-based), published to npm
├── apps/
│   ├── api/            # @kumply/api — Express API (Sumsub token proxy + webhook)
│   └── web/            # Next.js 16 frontend — kumply.xyz (EN/ES via next-intl)
└── docs/diagrams/      # Architecture diagrams (Mermaid)
```

## 🧪 Tests

```bash
pnpm test                              # everything — 164 tests
pnpm --filter @kumply/contracts test   # 110 — Hardhat + Chai
pnpm --filter @kumply/sdk test         # 37  — Vitest
pnpm --filter @kumply/api test         # 17  — Vitest + Supertest
```

Contract coverage includes roles and access control, pausability, the five tiers, revocation and expiry, the fee/subscription billing paths, and a bit-exact Avalanche-codec round-trip for the ACP-99 Warp payloads.

## 📖 Documentation

| Document | What it covers |
|---|---|
| [LITEPAPER.md](LITEPAPER.md) | Problem, architecture, tiers, business model, roadmap |
| [L1.md](L1.md) | KUMPLY Compliance L1 design and deployment path |
| [docs/diagrams/architecture.md](docs/diagrams/architecture.md) | Mermaid architecture diagrams |
| [contracts/l1/README.md](contracts/l1/README.md) | L1 genesis and node operation |
| [packages/sdk/README.md](packages/sdk/README.md) | SDK API reference |
| [apps/api/openapi.yaml](apps/api/openapi.yaml) | OpenAPI 3.0 spec for the REST API |

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kumplyprotocol/Kumply.git
   cd Kumply
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   # Add your specific keys (WalletConnect ID, Sumsub credentials if running locally)
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```
   *The frontend will be available at `http://localhost:3000`*

## 🔐 For Developers: Using the Kumply SDK

Integrating KUMPLY into your DApp is incredibly simple:

```bash
pnpm add @kumply/sdk    # or npm / yarn
```

```typescript
import { KumplyClient, DEPLOYMENTS, TIER } from '@kumply/sdk';

// `contractAddress` is required — use DEPLOYMENTS for the canonical addresses.
const client = new KumplyClient({
  network: 'mainnet',
  contractAddress: DEPLOYMENTS.mainnet.attestationStore,
});

// Check if a user has passed KYC Tier 2
const result = await client.verify('0xUserAddress');

if (result.verified && result.tier >= TIER.STANDARD) {
    // Allow deposit
} else {
    // Block action
}
```

Reads are free while `verificationFee` is 0. Swap `network: 'fuji'` with `DEPLOYMENTS.fuji.attestationStore` to target testnet.

Or enforce it directly in your Solidity contracts:

```solidity
import {ComplianceGate} from "@kumply/contracts/ComplianceGate.sol";

contract MyDeFiVault is ComplianceGate {
    // Require Tier 2 (Standard KYC) to interact.
    constructor(address _attestationStore) ComplianceGate(_attestationStore, 2) {}

    // `payable` matters: when a read fee is active and this gate is not
    // subscribed, `_requireVerified` forwards msg.value to checkCompliance.
    // While verificationFee is 0, calling with no value works fine.
    function deposit() external payable {
        _requireVerified(msg.sender); // reverts NotVerified / InsufficientTier
        // ... execute deposit
    }
}
```

Call `getVerificationFee()` on the gate to show users the current cost before they transact.

## 📜 Compliance & Brand Alignment

KUMPLY rigorously adheres to the May 2026 Ava Labs Trademark Usage Policy and AVALANCHE® ecosystem guidelines:

- ✅ Uses **AVALANCHE®** and **AVAX®** as adjectives (never as nouns or verbs)
- ✅ Uses the official **"AVALANCHE® L1"** nomenclature (not "Subnets")
- ✅ Stores **no personal data on-chain** — attestations are tier records, documents stay with Sumsub
- 🔜 **eERC** (Encrypted ERC) integration hook in place for Phase 2 — not yet active
- ✅ Categorizes autonomous actors as **"AI Agents"** with KYA verification
- ✅ Follows **responsible disclosure** practices for security vulnerabilities
- ✅ Operates as **Software-Only** infrastructure — non-custodial, no financial intermediation
- ✅ Published under the **Apache License 2.0** — permissive, with an explicit patent grant and no trademark license

## 📚 Official Avalanche Resources & References

The architecture and implementation of KUMPLY were built strictly following the official Avalanche documentation and ACPs (Avalanche Community Proposals):

- **Architecture & Ecosystem:** [Avalanche Network](https://www.avax.network/), [Developer Hub](https://www.avax.network/build/developer-hub), [Primary Network & Consensus](https://build.avax.network/docs/primary-network/avalanche-consensus)
- **Nodes & Validation:** [Run a Node](https://build.avax.network/docs/nodes/run-a-node), [Staking for Institutions](https://build.avax.network/docs/primary-network/validate/staking-for-finance-professionals), [Subnet-EVM Configs](https://build.avax.network/docs/nodes/chain-configs/avalanche-l1s/subnet-evm)
- **Avalanche L1s (Subnets):** [L1 Nodes](https://build.avax.network/docs/nodes/run-a-node/avalanche-l1-nodes), [L1 Architecture](https://build.avax.network/docs/nodes/architecture)
- **Interoperability (ICM/Warp):** [Avalanche Interchain Messaging](https://build.avax.network/docs/tooling/avalanche-sdk/interchain/icm), [Warp Building & Parsing](https://build.avax.network/docs/tooling/avalanche-sdk/interchain/warp)
- **Data API:** [Avalanche Data API](https://build.avax.network/docs/api-reference/data-api)
- **Smart Contract Verification:** [Verify on Snowtrace](https://build.avax.network/docs/primary-network/verify-contract/snowtrace), [Hardhat Integration](https://build.avax.network/docs/primary-network/verify-contract/hardhat)
- **Implemented ACPs:** 
  - [ACP-99: ValidatorSetManager Contract](https://build.avax.network/docs/acps/99-validatorsetmanager-contract)
  - [ACP-77: Reinventing Subnets](https://build.avax.network/docs/acps/77-reinventing-subnets)
  - [ACP-30: Avalanche Warp X EVM](https://build.avax.network/docs/acps/30-avalanche-warp-x-evm)

## 📄 License

This project is licensed under the **Apache License 2.0** — see [LICENSE](LICENSE) and [NOTICE](NOTICE).

Apache 2.0 was chosen over MIT deliberately: it carries an express patent grant (important for institutional adopters integrating a compliance primitive) and explicitly does not license trademarks.

> **Note on already-deployed contracts:** the contracts currently live on Fuji and Mainnet C-Chain were compiled and verified on Snowtrace under MIT, and remain verified as such. The license change affects only the Solidity `SPDX` identifier, which lives in contract metadata — it does not alter executable logic (verified: recompiling changes only the 86-byte CBOR metadata trailer, 99.24% of the bytecode is byte-identical). The next deployment will carry Apache 2.0 end to end.

---

*Built with ❤️ for the AVALANCHE® ecosystem.*

*The AVALANCHE® and AVAX® trademarks are owned by Ava Labs, Inc. KUMPLY is not endorsed by, sponsored by, or affiliated with Ava Labs, Inc.*
