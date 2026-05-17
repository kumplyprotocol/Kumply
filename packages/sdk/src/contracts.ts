/** ABI for AttestationStore contract */
export const ATTESTATION_STORE_ABI = [
  // ── Read: free public verification ───────────────────────────────────
  {
    inputs: [{ name: "_subject", type: "address" }],
    name: "verify",
    outputs: [
      { name: "verified", type: "bool" },
      { name: "tier", type: "uint32" },
      { name: "timestamp", type: "uint64" },
      { name: "expiry", type: "uint64" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "attestations",
    outputs: [
      { name: "verified", type: "bool" },
      { name: "tier", type: "uint32" },
      { name: "timestamp", type: "uint64" },
      { name: "expiry", type: "uint64" },
      { name: "verifier", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_tierId", type: "uint32" }],
    name: "getTier",
    outputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalAttestations",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_verifier", type: "address" }],
    name: "isVerifier",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "eercToken",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  // ── Read: fee & subscription state ───────────────────────────────────
  {
    inputs: [],
    name: "verificationFee",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalFeesCollected",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "subscribedCallers",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  // ── Write: verifier actions ───────────────────────────────────────────
  {
    inputs: [
      { name: "_subject", type: "address" },
      { name: "_tier", type: "uint32" },
      { name: "_expiry", type: "uint64" },
    ],
    name: "issueAttestation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_subject", type: "address" }],
    name: "revoke",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ── Write: payable DApp compliance check ("Verify Once" model) ────────
  {
    inputs: [{ name: "_subject", type: "address" }],
    name: "checkCompliance",
    outputs: [
      { name: "verified", type: "bool" },
      { name: "tier", type: "uint32" },
    ],
    stateMutability: "payable",
    type: "function",
  },

  // ── Write: admin fee management ───────────────────────────────────────
  {
    inputs: [{ name: "_fee", type: "uint256" }],
    name: "setVerificationFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_caller", type: "address" },
      { name: "_subscribed", type: "bool" },
    ],
    name: "setSubscription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ── Write: admin config ───────────────────────────────────────────────
  {
    inputs: [{ name: "_eercToken", type: "address" }],
    name: "setEercToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ── Events ────────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "subject", type: "address" },
      { indexed: false, name: "tier", type: "uint32" },
      { indexed: false, name: "expiry", type: "uint64" },
      { indexed: true, name: "verifier", type: "address" },
    ],
    name: "AttestationIssued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "subject", type: "address" },
      { indexed: true, name: "verifier", type: "address" },
    ],
    name: "AttestationRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "caller", type: "address" },
      { indexed: true, name: "subject", type: "address" },
      { indexed: false, name: "feePaid", type: "uint256" },
    ],
    name: "ComplianceChecked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "oldFee", type: "uint256" },
      { indexed: false, name: "newFee", type: "uint256" },
    ],
    name: "VerificationFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "caller", type: "address" },
      { indexed: false, name: "subscribed", type: "bool" },
    ],
    name: "SubscriptionUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "admin", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "FeesWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "oldToken", type: "address" },
      { indexed: true, name: "newToken", type: "address" },
    ],
    name: "EercTokenUpdated",
    type: "event",
  },
] as const;

/** ABI for ComplianceGate contract */
export const COMPLIANCE_GATE_ABI = [
  {
    inputs: [],
    name: "protectedAction",
    outputs: [{ name: "success", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getVerificationFee",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "requiredTier",
    outputs: [{ name: "", type: "uint32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "store",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_newTier", type: "uint32" }],
    name: "updateRequiredTier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
