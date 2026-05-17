/** Result of an attestation verification query */
export interface AttestationResult {
  verified: boolean;
  tier: number;
  timestamp: number;
  expiry: number;
}

/** Full attestation record */
export interface Attestation {
  subject: string;
  verified: boolean;
  tier: number;
  timestamp: number;
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

/** Options for creating a KumplyClient instance */
export interface KumplyClientOptions {
  network: "fuji" | "mainnet";
  rpcUrl?: string;
  contractAddress: string;
}

/** Network configuration */
export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  name: string;
  explorerUrl: string;
}
