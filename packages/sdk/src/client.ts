import { createPublicClient, http, defineChain, isAddress, type PublicClient, type Chain } from "viem";
import { avalancheFuji, avalanche } from "viem/chains";
import type {
  AttestationResult,
  Attestation,
  TierConfig,
  KumplyClientOptions,
  KumplyNetwork,
} from "./types";
import { ATTESTATION_STORE_ABI } from "./contracts";
import { FUJI_CONFIG, MAINNET_CONFIG, KUMPLY_L1_CONFIG, TIER_DEFINITIONS, TIER } from "./constants";
import { meetsTierRequirement } from "./tier";

/**
 * Viem chain definition for the KUMPLY Compliance L1 (Deploy-Ready).
 * Resolved from {@link KUMPLY_L1_CONFIG} at runtime.
 */
const kumplyL1Chain: Chain = defineChain({
  id: KUMPLY_L1_CONFIG.chainId,
  name: KUMPLY_L1_CONFIG.name,
  nativeCurrency: { name: "KMP", symbol: "KMP", decimals: 18 },
  rpcUrls: {
    default: { http: [KUMPLY_L1_CONFIG.rpcUrl] },
    public: { http: [KUMPLY_L1_CONFIG.rpcUrl] },
  },
  blockExplorers: {
    default: { name: "KUMPLY Explorer", url: KUMPLY_L1_CONFIG.explorerUrl },
  },
  testnet: false,
});

/**
 * KumplyClient — Main SDK entry point for interacting with KUMPLY smart contracts.
 *
 * @example
 * ```typescript
 * import { KumplyClient, DEPLOYMENTS, TIER } from '@kumply/sdk';
 *
 * const client = new KumplyClient({
 *   network: 'mainnet',
 *   contractAddress: DEPLOYMENTS.mainnet.attestationStore,
 * });
 * const result = await client.verify('0x...');
 * console.log(result.verified); // true
 * ```
 */
export class KumplyClient {
  /** Underlying viem client — exposed for advanced use (custom reads, logs). */
  readonly publicClient: PublicClient;
  /** AttestationStore address this client reads from. */
  readonly contractAddress: `0x${string}`;
  /** Network this client is connected to. */
  readonly network: KumplyNetwork;
  private chain: Chain;

  constructor(options: KumplyClientOptions) {
    let config;
    if (options.network === "mainnet") {
      config = MAINNET_CONFIG;
      this.chain = avalanche;
      this.network = "mainnet";
    } else if (options.network === "kumply-l1") {
      if (!KUMPLY_L1_CONFIG.live && !options.rpcUrl) {
        throw new Error(
          '@kumply/sdk: network "kumply-l1" is not active yet (the L1 has not been converted and its public RPC does not serve requests). Use "fuji" or "mainnet", or pass rpcUrl to point at your own node.'
        );
      }
      config = KUMPLY_L1_CONFIG;
      this.chain = kumplyL1Chain;
      this.network = "kumply-l1";
    } else {
      config = FUJI_CONFIG;
      this.chain = avalancheFuji;
      this.network = "fuji";
    }

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(options.rpcUrl || config.rpcUrl),
    });


    if (!options.contractAddress) {
      throw new Error('@kumply/sdk: contractAddress is required. Deploy AttestationStore first or pass the deployed address.');
    }
    this.contractAddress = options.contractAddress as `0x${string}`;
  }

  /** Chain ID of the connected network (43113 Fuji · 43114 Mainnet · 43210 KUMPLY L1). */
  get chainId(): number {
    return this.chain.id;
  }

  /**
   * Validate that a string is a well-formed EVM address before it's used in
   * a contract call. Throws a clear `@kumply/sdk` error naming the bad input
   * instead of letting an unvalidated string reach `readContract`, where
   * viem or the RPC would otherwise throw an opaque low-level error.
   */
  private assertAddress(address: string): asserts address is `0x${string}` {
    if (!isAddress(address)) {
      throw new Error(`@kumply/sdk: "${address}" is not a valid address.`);
    }
  }

  /**
   * Verify the attestation status for a given address (free `view` read; works while the
   * contract is paused).
   *
   * `verified` is already `false` when the attestation is expired, revoked, or never issued,
   * and in that case `tier`, `timestamp` and `expiry` are all `0` — there is no need to compare
   * `expiry` against the current time yourself. The three cases are indistinguishable here.
   *
   * For smart accounts (ERC-4337), pass the exact address that signs or is sponsored — the
   * smart account itself, not its owner EOA.
   *
   * @param address - The wallet address to verify
   * @returns `{ verified, tier, timestamp, expiry }` — `timestamp` is the issuance time and
   *          `expiry` the expiration time, both in UNIX seconds
   */
  async verify(address: string): Promise<AttestationResult> {
    this.assertAddress(address);

    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: ATTESTATION_STORE_ABI,
      functionName: "verify",
      args: [address],
    });

    const [verified, tier, timestamp, expiry] = result as [boolean, number, bigint, bigint];

    return {
      verified,
      tier: Number(tier),
      timestamp: Number(timestamp),
      expiry: Number(expiry),
    };
  }

  /**
   * Get full attestation details for an address, including the issuing `verifier`.
   * @param address - The wallet address to query
   * @returns Full attestation data, or `null` if none exists, it was revoked, or it has expired
   *          (same validity rule as {@link verify}). `timestamp`/`expiry` are UNIX seconds.
   */
  async getAttestation(address: string): Promise<Attestation | null> {
    this.assertAddress(address);

    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: ATTESTATION_STORE_ABI,
      functionName: "attestations",
      args: [address],
    });

    const [verified, tier, timestamp, expiry, verifier] = result as [
      boolean,
      number,
      bigint,
      bigint,
      `0x${string}`,
    ];

    // The raw `attestations` mapping keeps `verified = true` after expiry, so apply the same
    // validity rule the contract's verify() uses: unexpired only.
    if (!verified || Number(expiry) <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      subject: address,
      verified,
      tier: Number(tier),
      timestamp: Number(timestamp),
      expiry: Number(expiry),
      verifier,
    };
  }

  /**
   * Check if an address is verified (any tier).
   * @param address - The wallet address to check
   * @returns True if the address has a valid, non-expired attestation
   */
  async isVerified(address: string): Promise<boolean> {
    const result = await this.verify(address);
    return result.verified;
  }

  /**
   * Check if an address holds a valid attestation at or above the given tier number.
   * @param address - The wallet address to check
   * @param tier - Minimum tier number
   * @returns True if verified and tier >= the requested tier
   *
   * @deprecated Compares tiers as a single ladder, so a Tier 5 agent passes
   * `hasTier(address, TIER.KYB)` and a Tier 4 business passes a Tier 2 person check.
   * Tiers 1-3 are a ladder for people; Tier 4 (business, KYB) and Tier 5 (agent, KYA)
   * are separate categories. Use {@link isPersonAtLeast}, {@link isBusiness} or
   * {@link isAgent} instead. Behavior is unchanged for backward compatibility.
   */
  async hasTier(address: string, tier: number): Promise<boolean> {
    const result = await this.verify(address);
    return result.verified && result.tier >= tier;
  }

  /**
   * Check if an address is a verified person at or above a KYC level.
   * Tiers 1-3 form a ladder for people (Basic < Standard < Enhanced). Businesses
   * (Tier 4) and agents (Tier 5) are separate categories and never satisfy this check.
   * @param address - The wallet address to check
   * @param level - Minimum person level: 1 (Basic), 2 (Standard) or 3 (Enhanced)
   * @returns True if verified with a tier between `level` and 3
   *
   * @example
   * ```typescript
   * import { TIER } from "@kumply/sdk";
   * const canDeposit = await client.isPersonAtLeast("0x...", TIER.STANDARD); // Tier 2 or 3
   * ```
   */
  async isPersonAtLeast(address: string, level: number): Promise<boolean> {
    if (!Number.isInteger(level) || level < TIER.BASIC || level > TIER.ENHANCED) {
      throw new Error(
        `@kumply/sdk: person level must be 1, 2 or 3 (got ${level}). Use isBusiness() for Tier 4 and isAgent() for Tier 5.`
      );
    }
    const result = await this.verify(address);
    return result.verified && meetsTierRequirement(result.tier, { kind: "person", minLevel: level as 1 | 2 | 3 });
  }

  /**
   * Check if an address is a verified business (exactly Tier 4, KYB).
   * @param address - The wallet address to check
   */
  async isBusiness(address: string): Promise<boolean> {
    const result = await this.verify(address);
    return result.verified && meetsTierRequirement(result.tier, { kind: "business" });
  }

  /**
   * Check if an address is a verified agent (exactly Tier 5, KYA).
   * @param address - The wallet address to check
   */
  async isAgent(address: string): Promise<boolean> {
    const result = await this.verify(address);
    return result.verified && meetsTierRequirement(result.tier, { kind: "agent" });
  }

  /**
   * Get the configuration for a specific tier.
   * @param tier - The tier number (1-5)
   * @returns Tier configuration from on-chain data
   */
  async getTierConfig(tier: number): Promise<TierConfig> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: ATTESTATION_STORE_ABI,
      functionName: "getTier",
      args: [tier],
    });

    const [name, description] = result as [string, string];
    const tierDef = TIER_DEFINITIONS.find((t) => t.tier === tier);

    return {
      tier,
      name,
      description,
      requiredChecks: tierDef?.requiredChecks || [],
    };
  }

  /**
   * List all available tiers with their configurations.
   * @returns Array of all tier configurations
   */
  async listTiers(): Promise<TierConfig[]> {
    return TIER_DEFINITIONS;
  }

  /**
   * Get the total number of attestations ever issued.
   * @returns Total attestation count
   */
  async getTotalAttestations(): Promise<number> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: ATTESTATION_STORE_ABI,
      functionName: "totalAttestations",
    });

    return Number(result);
  }

  /**
   * Get the current per-call read fee for the "Verify Once" model.
   * @returns Fee in wei (0n means free)
   */
  async getVerificationFee(): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: ATTESTATION_STORE_ABI,
      functionName: "verificationFee",
    });
    return result as bigint;
  }

  /**
   * Get the cumulative fees collected by the Kumply protocol.
   * @returns Total fees collected in wei (historical, not current balance)
   */
  async getTotalFeesCollected(): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: ATTESTATION_STORE_ABI,
      functionName: "totalFeesCollected",
    });
    return result as bigint;
  }
}
