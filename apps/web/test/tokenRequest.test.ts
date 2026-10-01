import { describe, it, expect } from "vitest";
import { TokenRequestSchema, SUMSUB_LEVELS, createRateLimiter, clientIp } from "../src/lib/tokenRequest";

const ADDRESS = "0xD65042534CE80fcb641fd6Eb99a16eBF6C0cd076";

describe("TokenRequestSchema", () => {
  it.each(SUMSUB_LEVELS)("accepts a wallet address with level %s", (levelName) => {
    expect(TokenRequestSchema.safeParse({ userId: ADDRESS, levelName }).success).toBe(true);
  });

  it("accepts a lowercase address", () => {
    expect(TokenRequestSchema.safeParse({ userId: ADDRESS.toLowerCase(), levelName: "basic-kyc" }).success).toBe(true);
  });

  it.each([
    ["not an address", "alice"],
    ["too short", "0x1234"],
    ["bad checksum", "0xd65042534CE80fcb641fd6Eb99a16eBF6C0cd076"],
    ["empty", ""],
  ])("rejects userId: %s", (_label, userId) => {
    expect(TokenRequestSchema.safeParse({ userId, levelName: "basic-kyc" }).success).toBe(false);
  });

  it.each(["", "admin", "business-kyc", "BASIC-KYC"])("rejects unknown levelName %j", (levelName) => {
    expect(TokenRequestSchema.safeParse({ userId: ADDRESS, levelName }).success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(TokenRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe("createRateLimiter", () => {
  it("allows max requests per window, then blocks with a retry-after", () => {
    const check = createRateLimiter({ windowMs: 60_000, max: 20 });
    const t0 = 1_000_000;
    for (let i = 0; i < 20; i++) expect(check("1.2.3.4", t0 + i).allowed).toBe(true);
    const blocked = check("1.2.3.4", t0 + 30_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(30);
  });

  it("resets after the window", () => {
    const check = createRateLimiter({ windowMs: 60_000, max: 1 });
    expect(check("ip", 0).allowed).toBe(true);
    expect(check("ip", 59_999).allowed).toBe(false);
    expect(check("ip", 60_000).allowed).toBe(true);
  });

  it("keeps separate counters per key", () => {
    const check = createRateLimiter({ windowMs: 60_000, max: 1 });
    expect(check("a", 0).allowed).toBe(true);
    expect(check("b", 0).allowed).toBe(true);
    expect(check("a", 1).allowed).toBe(false);
  });
});

describe("clientIp", () => {
  it("prefers x-real-ip", () => {
    expect(clientIp(new Headers({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1" }))).toBe("9.9.9.9");
  });
  it("falls back to the first x-forwarded-for hop", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.1.1.1, 10.0.0.1" }))).toBe("1.1.1.1");
  });
  it("returns unknown without headers", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
