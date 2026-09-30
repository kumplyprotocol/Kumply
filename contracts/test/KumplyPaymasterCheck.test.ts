import { expect } from "chai";
import { ethers, network } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

// ERC-4337 validationData layout: authorizer (low 160 bits) | validUntil (48) | validAfter (48)
const SIG_VALIDATION_FAILED = 1n;
const unpack = (vd: bigint) => ({
  authorizer: vd & ((1n << 160n) - 1n),
  validUntil: (vd >> 160n) & ((1n << 48n) - 1n),
  validAfter: vd >> 208n,
});

/** Opcodes executed by a read-only call, via Hardhat's debug_traceCall. */
async function executedOpcodes(to: string, data: string): Promise<Set<string>> {
  const trace = await network.provider.send("debug_traceCall", [{ to, data }, "latest"]);
  return new Set(trace.structLogs.map((l: { op: string }) => l.op));
}

describe("KumplyPaymasterCheck (docs example)", function () {
  const ONE_YEAR = 365 * 24 * 60 * 60;
  let store: any;
  let check: any;
  let admin: any, verifier: any, account: any, lowTier: any, stranger: any, eerc: any;
  let expiry: bigint;

  beforeEach(async function () {
    [admin, verifier, account, lowTier, stranger, eerc] = await ethers.getSigners();

    store = await (await ethers.getContractFactory("AttestationStore")).deploy(admin.address, eerc.address);
    await store.waitForDeployment();
    await store.connect(admin).addVerifier(verifier.address);

    check = await (await ethers.getContractFactory("KumplyPaymasterCheck")).deploy(await store.getAddress(), 5);
    await check.waitForDeployment();

    const block = await ethers.provider.getBlock("latest");
    expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
    await store.connect(verifier).issueAttestation(account.address, 5, expiry);
    await store.connect(verifier).issueAttestation(lowTier.address, 3, expiry);
  });

  it("returns validUntil = expiry and a zero authorizer for an attested account", async function () {
    const vd = unpack(await check.kumplyValidationData(account.address));
    expect(vd.authorizer).to.equal(0n);
    expect(vd.validUntil).to.equal(expiry);
    expect(vd.validAfter).to.equal(0n);
  });

  it("fails validation for an address that was never attested", async function () {
    expect(await check.kumplyValidationData(stranger.address)).to.equal(SIG_VALIDATION_FAILED);
  });

  it("fails validation when the tier is below minTier", async function () {
    expect(await check.kumplyValidationData(lowTier.address)).to.equal(SIG_VALIDATION_FAILED);
  });

  it("fails validation after the attestation is revoked", async function () {
    await store.connect(verifier).revoke(account.address);
    expect(await check.kumplyValidationData(account.address)).to.equal(SIG_VALIDATION_FAILED);
  });

  it("leaves expiry to the EntryPoint: an expired record still packs its past validUntil", async function () {
    await network.provider.send("evm_increaseTime", [ONE_YEAR + 1]);
    await network.provider.send("evm_mine", []);
    const latest = await ethers.provider.getBlock("latest");

    const vd = unpack(await check.kumplyValidationData(account.address));
    expect(vd.validUntil).to.equal(expiry);
    expect(vd.validUntil < BigInt(latest!.timestamp)).to.equal(true); // EntryPoint rejects it
    const [verified] = await store.verify(account.address);
    expect(verified).to.equal(false); // same outcome verify() gives
  });

  it("reflects a re-issue, since issueAttestation overwrites the existing record", async function () {
    const newExpiry = expiry + 1000n;
    await store.connect(verifier).issueAttestation(account.address, 5, newExpiry);
    expect(unpack(await check.kumplyValidationData(account.address)).validUntil).to.equal(newExpiry);
  });

  it("never executes TIMESTAMP (ERC-7562 OP-011), unlike verify()", async function () {
    const checkOps = await executedOpcodes(
      await check.getAddress(),
      check.interface.encodeFunctionData("kumplyValidationData", [account.address])
    );
    expect(checkOps.has("STATICCALL")).to.equal(true); // it really reached AttestationStore
    expect(checkOps.has("TIMESTAMP")).to.equal(false);

    const verifyOps = await executedOpcodes(
      await store.getAddress(),
      store.interface.encodeFunctionData("verify", [account.address])
    );
    expect(verifyOps.has("TIMESTAMP")).to.equal(true);
  });

  it("matches the snippet published on /developers byte for byte", function () {
    const sol = readFileSync(join(__dirname, "../contracts/examples/KumplyPaymasterCheck.sol"), "utf8");
    const ts = readFileSync(
      join(__dirname, "../../apps/web/src/content/paymaster-check-snippet.ts"),
      "utf8"
    );
    const snippet = ts.slice(ts.indexOf("`") + 1, ts.lastIndexOf("`"));
    expect(snippet).to.equal(sol);
  });
});
