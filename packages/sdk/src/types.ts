/**
 * Result of an attestation verification query (mirrors the contract's
 * `verify()` return order: verified, tier, timestamp, expiry).
 *
 * `verified` is `false` if the attestation is expired, revoked, or never issued; in that
 * case every other field is `0`.
 */
export interface AttestationResult {
  verified: boolean;
  tier: number;
  /** When the attestation was issued, in UNIX seconds. */
  timestamp: number;
  /** When the attestation expires, in UNIX seconds. */
  expiry: number;
}

/** Full attestation record (only returned for valid, unexpired attestations) */
export interface Attestation {
  subject: string;
  verified: boolean;
  tier: number;
  /** When the attestation was issued, in UNIX seconds. */
  timestamp: number;
  /** When the attestation expires, in UNIX seconds. */
  expiry: number;
  verifier: string;
}

/** Configuration for a KYC tier */
export interface TierConfig {
  tier: number;
  name: string;
  description: string;
  requiredChecks: string[];
}

/**
 * Requirement descriptor for gating access by KYC/KYB/KYA tier.
 *
 * - `person`: verified person whose tier is between `minLevel` and 3 (Basic < Standard < Enhanced).
 * - `business`: verified business (exactly Tier 4, KYB).
 * - `agent`: verified autonomous agent (exactly Tier 5, KYA).
 */
export type TierRequirement =
  | { kind: "person"; minLevel: 1 | 2 | 3 }
  | { kind: "business" }
  | { kind: "agent" };

/** Supported networks. `kumply-l1` is the dedicated Compliance L1 (chain registered on Fuji; validator activation pending). */
export type KumplyNetwork = "fuji" | "mainnet" | "kumply-l1";

/** Options for creating a KumplyClient instance */
export interface KumplyClientOptions {
  network: KumplyNetwork;
  rpcUrl?: string;
  contractAddress: string;
}

/** Network configuration */
export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  name: string;
  explorerUrl: string;
  /** Whether the network is live and accepting transactions. False for Deploy-Ready networks. */
  live?: boolean;
  /** Native gas token symbol. */
  symbol?: string;
}

/** Validator record for the KUMPLY Compliance L1 (ACP-99 ValidatorSetManager) */
export interface L1Validator {
  nodeID: string;
  owner: string;
  weight: bigint;
  registeredAt: number;
  expiresAt: number;
  active: boolean;
}

/** Snapshot of the KUMPLY L1 validator set */
export interface L1ValidatorSet {
  totalWeight: bigint;
  activeCount: number;
  epochChurn: number;
  epochStart: number;
}
