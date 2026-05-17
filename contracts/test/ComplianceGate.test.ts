import { expect } from "chai";
import { ethers } from "hardhat";
import { AttestationStore, ComplianceGate } from "../typechain-types";


describe("ComplianceGate", function () {
  let store: AttestationStore;
  let gate: ComplianceGate;
  let admin: any;
  let verifier: any;
  let verifiedUser: any;
  let unverifiedUser: any;
  let eercToken: any;

  const ONE_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    [admin, verifier, verifiedUser, unverifiedUser, eercToken] = await ethers.getSigners();

    const AttestationStoreFactory = await ethers.getContractFactory("AttestationStore");
    store = await AttestationStoreFactory.deploy(admin.address, eercToken.address) as unknown as AttestationStore;
    await store.waitForDeployment();

    const ComplianceGateFactory = await ethers.getContractFactory("ComplianceGate");
    gate = await ComplianceGateFactory.deploy(await (store as any).getAddress(), 2) as unknown as ComplianceGate;
    await gate.waitForDeployment();

    await store.connect(admin).addVerifier(verifier.address);
    const block = await ethers.provider.getBlock("latest");
    const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
    await store.connect(verifier).issueAttestation(verifiedUser.address, 3, expiry);
  });

  describe("Deployment", function () {
    it("should set the correct AttestationStore address", async function () {
      expect(await (gate as any).store()).to.equal(await (store as any).getAddress());
    });

    it("should set the correct required tier", async function () {
      expect(await gate.requiredTier()).to.equal(2);
    });

    it("should set deployer as admin", async function () {
      expect(await gate.admin()).to.equal(admin.address);
    });
  });

  describe("Protected Action", function () {
    it("should allow verified user with sufficient tier", async function () {
      await expect(gate.connect(verifiedUser).protectedAction())
        .to.emit(gate, "ProtectedActionExecuted")
        .withArgs(verifiedUser.address, 3);

      const result = await gate.connect(verifiedUser).protectedAction.staticCall();
      expect(result).to.be.true;
    });

    it("should revert for unverified user", async function () {
      await expect(
        gate.connect(unverifiedUser).protectedAction()
      ).to.be.revertedWithCustomError(gate, "NotVerified");
    });

    it("should revert for user with insufficient tier", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(unverifiedUser.address, 1, expiry);

      await expect(
        gate.connect(unverifiedUser).protectedAction()
      ).to.be.revertedWithCustomError(gate, "InsufficientTier");
    });
  });

  describe("Update Required Tier", function () {
    it("should allow admin to update required tier", async function () {
      await expect(gate.connect(admin).updateRequiredTier(3))
        .to.emit(gate, "RequiredTierUpdated")
        .withArgs(2, 3);
      expect(await gate.requiredTier()).to.equal(3);
    });

    it("should allow admin to set tier 5 (Agent/KYA)", async function () {
      await expect(gate.connect(admin).updateRequiredTier(5))
        .to.emit(gate, "RequiredTierUpdated")
        .withArgs(2, 5);
      expect(await gate.requiredTier()).to.equal(5);
    });

    it("should revert when non-admin updates tier", async function () {
      await expect(
        gate.connect(verifiedUser).updateRequiredTier(1)
      ).to.be.revertedWithCustomError(gate, "NotAdmin");
    });

    it("should revert for invalid tier 0", async function () {
      await expect(
        gate.connect(admin).updateRequiredTier(0)
      ).to.be.revertedWithCustomError(gate, "InvalidRequiredTier");
    });

    it("should revert for invalid tier 6", async function () {
      await expect(
        gate.connect(admin).updateRequiredTier(6)
      ).to.be.revertedWithCustomError(gate, "InvalidRequiredTier");
    });
  });

  describe("Fee Integration — Verify Once model", function () {
    const FEE = 100n;

    it("getVerificationFee returns 0 by default", async function () {
      expect(await gate.getVerificationFee()).to.equal(0n);
    });

    it("getVerificationFee reflects store fee after admin sets it", async function () {
      await store.connect(admin).setVerificationFee(FEE);
      expect(await gate.getVerificationFee()).to.equal(FEE);
    });

    it("protectedAction still works without ETH when fee is 0", async function () {
      await expect(gate.connect(verifiedUser).protectedAction())
        .to.emit(gate, "ProtectedActionExecuted")
        .withArgs(verifiedUser.address, 3);
    });

    it("protectedAction succeeds when caller sends the required fee", async function () {
      await store.connect(admin).setVerificationFee(FEE);

      await expect(gate.connect(verifiedUser).protectedAction({ value: FEE }))
        .to.emit(gate, "ProtectedActionExecuted")
        .withArgs(verifiedUser.address, 3);
    });

    it("protectedAction reverts InsufficientFee when fee is set and no ETH sent", async function () {
      await store.connect(admin).setVerificationFee(FEE);

      await expect(
        gate.connect(verifiedUser).protectedAction({ value: 0 })
      ).to.be.revertedWithCustomError(gate, "InsufficientFee");
    });

    it("subscribed gate passes protectedAction without ETH even when fee is set", async function () {
      await store.connect(admin).setVerificationFee(FEE);
      const gateAddress = await (gate as any).getAddress();
      await store.connect(admin).setSubscription(gateAddress, true);

      // subscribed gate — uses free verify() path, no ETH required
      await expect(gate.connect(verifiedUser).protectedAction({ value: 0 }))
        .to.emit(gate, "ProtectedActionExecuted")
        .withArgs(verifiedUser.address, 3);
    });
  });
});
