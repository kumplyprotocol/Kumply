import { TIER } from "./constants";
import type { TierRequirement } from "./types";

/**
 * Pure helper to test whether a tier number satisfies a {@link TierRequirement}.
 *
 * Tier semantics:
 * - `person`: `tier >= req.minLevel && tier <= 3` (Tiers 1-3 form a ladder for people: Basic < Standard < Enhanced)
 * - `business`: `tier === 4` (Tier 4 / KYB is a distinct category)
 * - `agent`: `tier === 5` (Tier 5 / KYA is a distinct category)
 * - Tier 0 (unverified / expired / revoked) never satisfies any requirement.
 *
 * @param tier - Tier number (0–5, e.g. from `verify().tier` or contract query)
 * @param req - The requirement to check against
 * @returns `true` if the tier satisfies the requirement, `false` otherwise
 *
 * @example
 * ```typescript
 * import { meetsTierRequirement } from "@kumply/sdk";
 *
 * const { tier } = await client.verify("0x...");
 * if (meetsTierRequirement(tier, { kind: "person", minLevel: 2 })) {
 *   // Person at Tier 2 (Standard) or Tier 3 (Enhanced)
 * }
 * ```
 */
export function meetsTierRequirement(tier: number, req: TierRequirement): boolean {
  if (!Number.isInteger(tier) || tier <= 0) {
    return false;
  }

  switch (req.kind) {
    case "person":
      return tier >= req.minLevel && tier <= TIER.ENHANCED;
    case "business":
      return tier === TIER.KYB;
    case "agent":
      return tier === TIER.KYA;
    default:
      return false;
  }
}
