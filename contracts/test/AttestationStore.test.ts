import { expect } from "chai";
import { ethers } from "hardhat";
import { AttestationStore } from "../typechain-types";


describe("AttestationStore", function () {
  let store: AttestationStore;
  let admin: any;
  let verifier: any;
  let user1: any;
  let user2: any;
  let eercToken: any;

  const ONE_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    [admin, verifier, user1, user2, eercToken] = await ethers.getSigners();

    const AttestationStoreFactory = await ethers.getContractFactory("AttestationStore");
    store = await AttestationStoreFactory.deploy(admin.address, eercToken.address) as unknown as AttestationStore;
    await store.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set admin with DEFAULT_ADMIN_ROLE", async function () {
      const DEFAULT_ADMIN_ROLE = await store.DEFAULT_ADMIN_ROLE();
      expect(await store.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("should set eercToken address", async function () {
      expect(await store.eercToken()).to.equal(eercToken.address);
    });

    it("should initialize 4 tiers", async function () {
      const [name1] = await store.getTier(1);
      expect(name1).to.equal("Basic");
      const [name2] = await store.getTier(2);
      expect(name2).to.equal("Standard");
      const [name3] = await store.getTier(3);
      expect(name3).to.equal("Enhanced");
      const [name4] = await store.getTier(4);
      expect(name4).to.equal("Business");
      const [name5] = await store.getTier(5);
      expect(name5).to.equal("Agent");
    });

    it("should start with zero total attestations", async function () {
      expect(await store.totalAttestations()).to.equal(0);
    });
  });

  describe("Verifier Management", function () {
    it("should add a verifier", async function () {
      await expect(store.connect(admin).addVerifier(verifier.address))
        .to.emit(store, "VerifierAdded")
        .withArgs(verifier.address);
      expect(await store.isVerifier(verifier.address)).to.be.true;
    });

    it("should remove a verifier", async function () {
      await store.connect(admin).addVerifier(verifier.address);
      await expect(store.connect(admin).removeVerifier(verifier.address))
        .to.emit(store, "VerifierRemoved")
        .withArgs(verifier.address);
      expect(await store.isVerifier(verifier.address)).to.be.false;
    });

    it("should revert when non-admin tries to add verifier", async function () {
      await expect(
        store.connect(user1).addVerifier(verifier.address)
      ).to.be.reverted;
    });
  });

  describe("Attestation Issuance", function () {
    beforeEach(async function () {
      await store.connect(admin).addVerifier(verifier.address);
    });

    it("should issue a valid attestation", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);

      await expect(
        store.connect(verifier).issueAttestation(user1.address, 2, expiry)
      )
        .to.emit(store, "AttestationIssued")
        .withArgs(user1.address, 2, expiry, verifier.address);

      expect(await store.totalAttestations()).to.equal(1);
    });

    it("should revert with InvalidTier for tier 0", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);

      await expect(
        store.connect(verifier).issueAttestation(user1.address, 0, expiry)
      ).to.be.revertedWithCustomError(store, "InvalidTier");
    });

    it("should revert with InvalidTier for tier 6", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);

      await expect(
        store.connect(verifier).issueAttestation(user1.address, 6, expiry)
      ).to.be.revertedWithCustomError(store, "InvalidTier");
    });

    it("should revert with InvalidExpiry for past expiry", async function () {
      await expect(
        store.connect(verifier).issueAttestation(user1.address, 2, 1000)
      ).to.be.revertedWithCustomError(store, "InvalidExpiry");
    });

    it("should revert when non-verifier tries to issue", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);

      await expect(
        store.connect(user1).issueAttestation(user2.address, 1, expiry)
      ).to.be.reverted;
    });
  });

  describe("Verification", function () {
    beforeEach(async function () {
      await store.connect(admin).addVerifier(verifier.address);
    });

    it("should return verified data for valid attestation", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);

      await store.connect(verifier).issueAttestation(user1.address, 3, expiry);

      const [verified, tier, timestamp, attestExpiry] = await store.verify(user1.address);
      expect(verified).to.be.true;
      expect(tier).to.equal(3);
      expect(timestamp).to.be.greaterThan(0);
      expect(attestExpiry).to.equal(expiry);
    });

    it("should return false for non-attested address", async function () {
      const [verified, tier] = await store.verify(user2.address);
      expect(verified).to.be.false;
      expect(tier).to.equal(0);
    });
  });

  describe("Revocation", function () {
    beforeEach(async function () {
      await store.connect(admin).addVerifier(verifier.address);
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(user1.address, 2, expiry);
    });

    it("should revoke an attestation", async function () {
      await expect(store.connect(verifier).revoke(user1.address))
        .to.emit(store, "AttestationRevoked")
        .withArgs(user1.address, verifier.address);

      const [verified] = await store.verify(user1.address);
      expect(verified).to.be.false;
    });

    it("should revert when non-verifier tries to revoke", async function () {
      await expect(
        store.connect(user1).revoke(user1.address)
      ).to.be.reverted;
    });
  });

  describe("Tier Queries", function () {
    it("should return correct tier info for tier 1", async function () {
      const [name, desc] = await store.getTier(1);
      expect(name).to.equal("Basic");
      expect(desc).to.equal("Email + phone verification");
    });

    it("should revert for invalid tier 0", async function () {
      await expect(store.getTier(0)).to.be.revertedWithCustomError(store, "InvalidTier");
    });

    it("should revert for invalid tier 6", async function () {
      await expect(store.getTier(6)).to.be.revertedWithCustomError(store, "InvalidTier");
    });
  });

  describe("Pausable", function () {
    beforeEach(async function () {
      await store.connect(admin).addVerifier(verifier.address);
    });

    it("should allow admin to pause", async function () {
      await expect(store.connect(admin).pause())
        .to.emit(store, "ContractPaused")
        .withArgs(admin.address);
    });

    it("should block issueAttestation when paused", async function () {
      await store.connect(admin).pause();
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);

      await expect(
        store.connect(verifier).issueAttestation(user1.address, 2, expiry)
      ).to.be.reverted;
    });

    it("should allow issueAttestation after unpause", async function () {
      await store.connect(admin).pause();
      await store.connect(admin).unpause();
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);

      await expect(
        store.connect(verifier).issueAttestation(user1.address, 2, expiry)
      ).to.emit(store, "AttestationIssued");
    });

    it("should allow verify() even when paused (read-only)", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(user1.address, 3, expiry);
      await store.connect(admin).pause();

      const [verified, tier] = await store.verify(user1.address);
      expect(verified).to.be.true;
      expect(tier).to.equal(3);
    });

    it("should revert when non-admin tries to pause", async function () {
      await expect(store.connect(user1).pause()).to.be.reverted;
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await store.connect(admin).addVerifier(verifier.address);
    });

    it("should allow overwriting an existing attestation", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);

      await store.connect(verifier).issueAttestation(user1.address, 2, expiry);
      await store.connect(verifier).issueAttestation(user1.address, 3, expiry);

      const [verified, tier] = await store.verify(user1.address);
      expect(verified).to.be.true;
      expect(tier).to.equal(3);
      // totalAttestations should count both issuances
      expect(await store.totalAttestations()).to.equal(2);
    });

    it("should return false for revoked attestation", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(user1.address, 2, expiry);
      await store.connect(verifier).revoke(user1.address);

      const [verified] = await store.verify(user1.address);
      expect(verified).to.be.false;
    });
  });

  describe("Admin Configuration", function () {
    it("should allow admin to update eercToken", async function () {
      const newEerc = user1.address; // use any address as mock eERC
      await expect(store.connect(admin).setEercToken(newEerc))
        .to.emit(store, "EercTokenUpdated")
        .withArgs(eercToken.address, newEerc);
      expect(await store.eercToken()).to.equal(newEerc);
    });

    it("should revert when non-admin tries to update eercToken", async function () {
      await expect(
        store.connect(user1).setEercToken(user2.address)
      ).to.be.reverted;
    });

    it("should allow setting eercToken to zero address (disable)", async function () {
      const zero = "0x0000000000000000000000000000000000000000";
      await store.connect(admin).setEercToken(zero);
      expect(await store.eercToken()).to.equal(zero);
    });
  });

  describe("Fee Management — checkCompliance / Verify Once model", function () {
    const FEE = 100n; // 100 wei — represents the ~$0.50 read fee in tests

    beforeEach(async function () {
      await store.connect(admin).addVerifier(verifier.address);
    });

    it("checkCompliance returns (true, tier) for verified user when fee is 0", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(user1.address, 2, expiry);

      const [verified, tier] = await store.connect(user2).checkCompliance.staticCall(user1.address);
      expect(verified).to.be.true;
      expect(tier).to.equal(2);
    });

    it("checkCompliance returns (false, 0) for unverified user when fee is 0", async function () {
      const [verified, tier] = await store.connect(user2).checkCompliance.staticCall(user2.address);
      expect(verified).to.be.false;
      expect(tier).to.equal(0);
    });

    it("checkCompliance works without ETH when fee is 0", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(user1.address, 3, expiry);

      await expect(
        store.connect(user2).checkCompliance(user1.address, { value: 0 })
      ).to.not.be.reverted;
    });

    it("setVerificationFee updates the fee and emits VerificationFeeUpdated", async function () {
      await expect(store.connect(admin).setVerificationFee(FEE))
        .to.emit(store, "VerificationFeeUpdated")
        .withArgs(0n, FEE);
      expect(await store.verificationFee()).to.equal(FEE);
    });

    it("setVerificationFee reverts for non-admin", async function () {
      await expect(
        store.connect(user1).setVerificationFee(FEE)
      ).to.be.reverted;
    });

    it("checkCompliance reverts InsufficientFee when fee > 0 and no ETH sent", async function () {
      await store.connect(admin).setVerificationFee(FEE);
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(user1.address, 2, expiry);

      await expect(
        store.connect(user2).checkCompliance(user1.address, { value: 0 })
      ).to.be.revertedWithCustomError(store, "InsufficientFee");
    });

    it("checkCompliance collects fee and emits ComplianceChecked for verified user", async function () {
      await store.connect(admin).setVerificationFee(FEE);
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(user1.address, 2, expiry);

      await expect(
        store.connect(user2).checkCompliance(user1.address, { value: FEE })
      )
        .to.emit(store, "ComplianceChecked")
        .withArgs(user2.address, user1.address, FEE);
    });

    it("totalFeesCollected increments on each paid compliance check", async function () {
      await store.connect(admin).setVerificationFee(FEE);
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(user1.address, 2, expiry);

      await store.connect(user2).checkCompliance(user1.address, { value: FEE });
      expect(await store.totalFeesCollected()).to.equal(FEE);

      await store.connect(user2).checkCompliance(user1.address, { value: FEE });
      expect(await store.totalFeesCollected()).to.equal(FEE * 2n);
    });

    it("checkCompliance does NOT collect fee for unverified user (no charge on failure)", async function () {
      await store.connect(admin).setVerificationFee(FEE);

      // unverified user — fee not collected even if ETH sent
      await store.connect(user2).checkCompliance(user2.address, { value: FEE });
      expect(await store.totalFeesCollected()).to.equal(0n);
    });

    it("setSubscription marks a caller as fee-exempt and emits SubscriptionUpdated", async function () {
      await expect(store.connect(admin).setSubscription(user1.address, true))
        .to.emit(store, "SubscriptionUpdated")
        .withArgs(user1.address, true);
      expect(await store.subscribedCallers(user1.address)).to.be.true;
    });

    it("setSubscription reverts for non-admin", async function () {
      await expect(
        store.connect(user1).setSubscription(user1.address, true)
      ).to.be.reverted;
    });

    it("subscribed caller bypasses fee in checkCompliance", async function () {
      await store.connect(admin).setVerificationFee(FEE);
      await store.connect(admin).setSubscription(user2.address, true);
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(user1.address, 2, expiry);

      // subscribed caller — no ETH required, no fee collected
      await expect(
        store.connect(user2).checkCompliance(user1.address, { value: 0 })
      ).to.not.be.reverted;
      expect(await store.totalFeesCollected()).to.equal(0n);
    });

    it("withdrawFees transfers balance to admin and emits FeesWithdrawn", async function () {
      await store.connect(admin).setVerificationFee(FEE);
      const block = await ethers.provider.getBlock("latest");
      const expiry = BigInt(block!.timestamp) + BigInt(ONE_YEAR);
      await store.connect(verifier).issueAttestation(user1.address, 2, expiry);
      await store.connect(user2).checkCompliance(user1.address, { value: FEE });

      const storeAddress = await store.getAddress();
      expect(await ethers.provider.getBalance(storeAddress)).to.equal(FEE);

      await expect(store.connect(admin).withdrawFees())
        .to.emit(store, "FeesWithdrawn")
        .withArgs(admin.address, FEE);

      expect(await ethers.provider.getBalance(storeAddress)).to.equal(0n);
    });

    it("withdrawFees reverts NoFeesToWithdraw when balance is zero", async function () {
      await expect(
        store.connect(admin).withdrawFees()
      ).to.be.revertedWithCustomError(store, "NoFeesToWithdraw");
    });
  });
});
