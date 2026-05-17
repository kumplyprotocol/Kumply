import { expect } from "chai";
import { ethers, network } from "hardhat";
import {
  AttestationStore,
  KumplyValidatorSetManager,
  MockWarpMessenger,
} from "../typechain-types";

const WARP_ADDR = "0x0200000000000000000000000000000000000005";
const SUBNET_ID = "0x" + "ab".repeat(32);
const P_CHAIN_ID = "0x" + "00".repeat(32);
const ONE_YEAR = 365 * 24 * 60 * 60;

const NODE_ID_1 = "0x" + "11".repeat(20);
const NODE_ID_2 = "0x" + "22".repeat(20);
const NODE_ID_3 = "0x" + "33".repeat(20);
const NODE_ID_4 = "0x" + "44".repeat(20);

const BLS_KEY_1 = "0x" + "aa".repeat(48);
const BLS_KEY_2 = "0x" + "bb".repeat(48);
const BLS_KEY_3 = "0x" + "cc".repeat(48);
const BLS_KEY_4 = "0x" + "dd".repeat(48);

const CODEC_ID = "0x0000";
const TYPE_REGISTER_ACK = "0x00000002";

/** Pack `L1ValidatorRegistrationMessage{validationID, registered}` (39 bytes) */
function packRegistrationAck(validationID: string, registered: boolean): string {
  return ethers.solidityPacked(
    ["uint16", "uint32", "bytes32", "uint8"],
    [CODEC_ID, TYPE_REGISTER_ACK, validationID, registered ? 1 : 0]
  );
}

/** Pack `L1ValidatorWeightMessage{validationID, nonce, weight}` (54 bytes) */
function packWeightMessage(validationID: string, nonce: bigint, weight: bigint): string {
  return ethers.solidityPacked(
    ["uint16", "uint32", "bytes32", "uint64", "uint64"],
    [CODEC_ID, "0x00000003", validationID, nonce, weight]
  );
}

/** Pack `SubnetToL1ConversionMessage{conversionID}` (38 bytes) */
function packConversion(conversionID: string): string {
  return ethers.solidityPacked(
    ["uint16", "uint32", "bytes32"],
    [CODEC_ID, "0x00000000", conversionID]
  );
}

/** Re-implements ValidatorMessages.computeConversionID off-chain (must match contract bit-for-bit) */
function computeConversionID(
  subnetID: string,
  validatorManagerBlockchainID: string,
  validatorManagerAddress: string,
  initialValidators: { nodeID: string; blsPublicKey: string; weight: bigint }[]
): string {
  let pre = ethers.solidityPacked(
    ["uint16", "bytes32", "bytes32", "address", "uint32"],
    [
      CODEC_ID,
      subnetID,
      validatorManagerBlockchainID,
      validatorManagerAddress,
      initialValidators.length,
    ]
  );
  for (const v of initialValidators) {
    pre = ethers.concat([
      pre,
      ethers.solidityPacked(
        ["uint32", "bytes", "bytes", "uint64"],
        [ethers.getBytes(v.nodeID).length, v.nodeID, v.blsPublicKey, v.weight]
      ),
    ]);
  }
  return ethers.sha256(pre);
}

/** Re-implements ValidatorMessages.initialValidationID off-chain */
function initialValidationID(subnetID: string, index: number): string {
  return ethers.sha256(
    ethers.solidityPacked(["bytes32", "uint32"], [subnetID, index])
  );
}

/** Re-implements packRegisterL1ValidatorMessage off-chain to predict validationID */
function packRegisterPayload(
  subnetID: string,
  nodeID: string,
  blsPublicKey: string,
  expiry: bigint,
  remainingBalanceOwner: { threshold: number; addresses: string[] },
  disableOwner: { threshold: number; addresses: string[] },
  weight: bigint
): { payload: string; validationID: string } {
  const nodeBytes = ethers.getBytes(nodeID);
  let payload = ethers.solidityPacked(
    ["uint16", "uint32", "bytes32", "uint32", "bytes", "bytes", "uint64"],
    [CODEC_ID, "0x00000001", subnetID, nodeBytes.length, nodeID, blsPublicKey, expiry]
  );
  // remainingBalanceOwner
  payload = ethers.concat([
    payload,
    ethers.solidityPacked(
      ["uint32", "uint32"],
      [remainingBalanceOwner.threshold, remainingBalanceOwner.addresses.length]
    ),
    ...remainingBalanceOwner.addresses.map((a) =>
      ethers.solidityPacked(["address"], [a])
    ),
  ]);
  // disableOwner
  payload = ethers.concat([
    payload,
    ethers.solidityPacked(
      ["uint32", "uint32"],
      [disableOwner.threshold, disableOwner.addresses.length]
    ),
    ...disableOwner.addresses.map((a) =>
      ethers.solidityPacked(["address"], [a])
    ),
  ]);
  payload = ethers.concat([payload, ethers.solidityPacked(["uint64"], [weight])]);
  return { payload: ethers.hexlify(payload), validationID: ethers.sha256(payload) };
}

/** Install MockWarpMessenger bytecode at the precompile address 0x05 */
async function installMockWarp(): Promise<MockWarpMessenger> {
  const MockFactory = await ethers.getContractFactory("MockWarpMessenger");
  const deployed = await MockFactory.deploy();
  await deployed.waitForDeployment();
  const runtimeCode = await ethers.provider.getCode(await deployed.getAddress());
  await network.provider.send("hardhat_setCode", [WARP_ADDR, runtimeCode]);
  return MockFactory.attach(WARP_ADDR) as unknown as MockWarpMessenger;
}

describe("KumplyValidatorSetManager (ACP-99)", function () {
  let store: AttestationStore;
  let manager: KumplyValidatorSetManager;
  let warp: MockWarpMessenger;
  let admin: any;
  let verifier: any;
  let bank: any;
  let vc: any;
  let retail: any;
  let unverified: any;

  const pchainOwner = () => ({ threshold: 1, addresses: [admin.address] });

  async function issueTier(addr: string, tier: number, ttl = ONE_YEAR) {
    const expiry = (await ethers.provider.getBlock("latest"))!.timestamp + ttl;
    await store.connect(verifier).issueAttestation(addr, tier, expiry);
  }

  /**
   * Bootstrap helper — initializes the validator set with N initial validators so that
   * `initialized = true` and `_l1TotalWeight > 0`, mimicking the post-ConvertSubnetToL1Tx state.
   */
  async function bootstrapInitialSet(weights: bigint[]) {
    const initial = weights.map((w, i) => ({
      nodeID: "0x" + ((i + 0xa0).toString(16).padStart(2, "0")).repeat(20),
      blsPublicKey: "0x" + ((i + 0xa0).toString(16).padStart(2, "0")).repeat(48),
      weight: w,
    }));
    const managerAddr = await manager.getAddress();
    const bcID = await warp.getBlockchainID();
    const conversionID = computeConversionID(SUBNET_ID, bcID, managerAddr, initial);
    const ackPayload = packConversion(conversionID);
    await warp._mockSetVerified(0, P_CHAIN_ID, ethers.ZeroAddress, ackPayload, true);

    await manager.connect(admin).initializeValidatorSet(
      {
        subnetID: SUBNET_ID,
        validatorManagerBlockchainID: bcID,
        validatorManagerAddress: managerAddr,
        initialValidators: initial,
      },
      0
    );
  }

  beforeEach(async function () {
    [admin, verifier, bank, vc, retail, unverified] = await ethers.getSigners();

    warp = await installMockWarp();

    const StoreFactory = await ethers.getContractFactory("AttestationStore");
    store = (await StoreFactory.deploy(admin.address, ethers.ZeroAddress)) as unknown as AttestationStore;
    await store.waitForDeployment();
    await store.connect(admin).addVerifier(verifier.address);

    const ManagerFactory = await ethers.getContractFactory("KumplyValidatorSetManager");
    manager = (await ManagerFactory.deploy(
      admin.address,
      await store.getAddress(),
      SUBNET_ID
    )) as unknown as KumplyValidatorSetManager;
    await manager.waitForDeployment();

    await issueTier(bank.address, 4);
    await issueTier(vc.address, 4);
    await issueTier(retail.address, 2);
  });

  // ────────────────────────────────────────────────────────────────────
  describe("Deployment", function () {
    it("sets admin and L1_MANAGER_ROLE", async function () {
      const DEFAULT_ADMIN_ROLE = await manager.DEFAULT_ADMIN_ROLE();
      const L1_MANAGER_ROLE = await manager.L1_MANAGER_ROLE();
      expect(await manager.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await manager.hasRole(L1_MANAGER_ROLE, admin.address)).to.be.true;
    });

    it("stores attestationStore reference + subnetID", async function () {
      expect(await manager.attestationStore()).to.equal(await store.getAddress());
      expect(await manager.subnetID()).to.equal(SUBNET_ID);
    });

    it("rejects zero subnetID at construction", async function () {
      const ManagerFactory = await ethers.getContractFactory("KumplyValidatorSetManager");
      await expect(
        ManagerFactory.deploy(admin.address, await store.getAddress(), ethers.ZeroHash)
      ).to.be.revertedWithCustomError(manager, "InvalidSubnetID");
    });

    it("starts uninitialized with zero weight", async function () {
      expect(await manager.initialized()).to.be.false;
      expect(await manager.l1TotalWeight()).to.equal(0);
      expect(await manager.activeValidatorCount()).to.equal(0);
    });
  });

  // ────────────────────────────────────────────────────────────────────
  describe("Bootstrap — initializeValidatorSet", function () {
    it("registers initial validators when conversionID matches", async function () {
      await bootstrapInitialSet([100n, 100n, 100n, 100n, 100n]);
      expect(await manager.initialized()).to.be.true;
      expect(await manager.l1TotalWeight()).to.equal(500);
      expect(await manager.activeValidatorCount()).to.equal(5);
      const vID = initialValidationID(SUBNET_ID, 0);
      const v = await manager.getValidator(vID);
      expect(v.status).to.equal(2); // Active
      expect(v.weight).to.equal(100);
    });

    it("emits RegisteredInitialValidator per validator", async function () {
      const initial = [
        { nodeID: NODE_ID_1, blsPublicKey: BLS_KEY_1, weight: 200n },
      ];
      const managerAddr = await manager.getAddress();
      const bcID = await warp.getBlockchainID();
      const conversionID = computeConversionID(SUBNET_ID, bcID, managerAddr, initial);
      await warp._mockSetVerified(0, P_CHAIN_ID, ethers.ZeroAddress, packConversion(conversionID), true);

      await expect(
        manager.connect(admin).initializeValidatorSet(
          {
            subnetID: SUBNET_ID,
            validatorManagerBlockchainID: bcID,
            validatorManagerAddress: managerAddr,
            initialValidators: initial,
          },
          0
        )
      )
        .to.emit(manager, "RegisteredInitialValidator")
        .withArgs(initialValidationID(SUBNET_ID, 0), NODE_ID_1, SUBNET_ID, 200n, 0);
    });

    it("rejects mismatched conversionID", async function () {
      const initial = [{ nodeID: NODE_ID_1, blsPublicKey: BLS_KEY_1, weight: 100n }];
      const managerAddr = await manager.getAddress();
      const bcID = await warp.getBlockchainID();
      const fakeID = "0x" + "ff".repeat(32);
      await warp._mockSetVerified(0, P_CHAIN_ID, ethers.ZeroAddress, packConversion(fakeID), true);

      await expect(
        manager.connect(admin).initializeValidatorSet(
          {
            subnetID: SUBNET_ID,
            validatorManagerBlockchainID: bcID,
            validatorManagerAddress: managerAddr,
            initialValidators: initial,
          },
          0
        )
      ).to.be.revertedWithCustomError(manager, "ConversionIDMismatch");
    });

    it("rejects invalid Warp message", async function () {
      const initial = [{ nodeID: NODE_ID_1, blsPublicKey: BLS_KEY_1, weight: 100n }];
      const managerAddr = await manager.getAddress();
      const bcID = await warp.getBlockchainID();
      // valid=false
      await warp._mockSetVerified(0, P_CHAIN_ID, ethers.ZeroAddress, packConversion(ethers.ZeroHash), false);

      await expect(
        manager.connect(admin).initializeValidatorSet(
          {
            subnetID: SUBNET_ID,
            validatorManagerBlockchainID: bcID,
            validatorManagerAddress: managerAddr,
            initialValidators: initial,
          },
          0
        )
      ).to.be.revertedWithCustomError(manager, "WarpMessageInvalid");
    });

    it("rejects re-initialization", async function () {
      await bootstrapInitialSet([100n]);
      const initial = [{ nodeID: NODE_ID_2, blsPublicKey: BLS_KEY_2, weight: 100n }];
      const managerAddr = await manager.getAddress();
      const bcID = await warp.getBlockchainID();
      const conversionID = computeConversionID(SUBNET_ID, bcID, managerAddr, initial);
      await warp._mockSetVerified(1, P_CHAIN_ID, ethers.ZeroAddress, packConversion(conversionID), true);

      await expect(
        manager.connect(admin).initializeValidatorSet(
          {
            subnetID: SUBNET_ID,
            validatorManagerBlockchainID: bcID,
            validatorManagerAddress: managerAddr,
            initialValidators: initial,
          },
          1
        )
      ).to.be.revertedWithCustomError(manager, "AlreadyInitialized");
    });

    it("rejects non-L1_MANAGER_ROLE caller", async function () {
      const initial = [{ nodeID: NODE_ID_1, blsPublicKey: BLS_KEY_1, weight: 100n }];
      const managerAddr = await manager.getAddress();
      const bcID = await warp.getBlockchainID();
      const conversionID = computeConversionID(SUBNET_ID, bcID, managerAddr, initial);
      await warp._mockSetVerified(0, P_CHAIN_ID, ethers.ZeroAddress, packConversion(conversionID), true);

      await expect(
        manager.connect(bank).initializeValidatorSet(
          {
            subnetID: SUBNET_ID,
            validatorManagerBlockchainID: bcID,
            validatorManagerAddress: managerAddr,
            initialValidators: initial,
          },
          0
        )
      ).to.be.reverted;
    });
  });

  // ────────────────────────────────────────────────────────────────────
  describe("Initiate Registration — KYB Gate", function () {
    beforeEach(async function () {
      await bootstrapInitialSet([100_000n, 100_000n, 100_000n, 100_000n, 100_000n]);
    });

    it("KYB-verified address initiates successfully", async function () {
      await expect(
        manager
          .connect(bank)
          .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n)
      ).to.emit(manager, "InitiatedValidatorRegistration");

      const vID = await manager.validationIDByOwner(bank.address);
      const v = await manager.getValidator(vID);
      expect(v.status).to.equal(1); // PendingAdded
      expect(v.weight).to.equal(1000n);
    });

    it("emits Warp SendWarpMessage", async function () {
      const sentBefore = await warp._mockSentCount();
      await manager
        .connect(bank)
        .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n);
      expect(await warp._mockSentCount()).to.equal(sentBefore + 1n);
    });

    it("rejects unverified address", async function () {
      await expect(
        manager
          .connect(unverified)
          .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n)
      ).to.be.revertedWithCustomError(manager, "ValidatorNotKYBVerified");
    });

    it("rejects Tier 2", async function () {
      await expect(
        manager
          .connect(retail)
          .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n)
      ).to.be.revertedWithCustomError(manager, "InsufficientValidatorTier");
    });

    it("rejects bad nodeID length", async function () {
      const tooShort = "0x" + "aa".repeat(10);
      await expect(
        manager
          .connect(bank)
          .initiateValidatorRegistration(tooShort, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n)
      ).to.be.revertedWithCustomError(manager, "InvalidNodeID");
    });

    it("rejects bad BLS key length", async function () {
      const badBls = "0x" + "aa".repeat(32);
      await expect(
        manager
          .connect(bank)
          .initiateValidatorRegistration(NODE_ID_1, badBls, pchainOwner(), pchainOwner(), 1000n)
      ).to.be.revertedWithCustomError(manager, "InvalidBlsPublicKey");
    });

    it("rejects zero weight", async function () {
      await expect(
        manager
          .connect(bank)
          .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 0n)
      ).to.be.revertedWithCustomError(manager, "InvalidWeight");
    });

    it("rejects duplicate nodeID", async function () {
      await manager
        .connect(bank)
        .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n);
      await expect(
        manager
          .connect(vc)
          .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_2, pchainOwner(), pchainOwner(), 1000n)
      ).to.be.revertedWithCustomError(manager, "ValidatorAlreadyRegistered");
    });

    it("rejects same owner registering twice", async function () {
      await manager
        .connect(bank)
        .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n);
      await expect(
        manager
          .connect(bank)
          .initiateValidatorRegistration(NODE_ID_2, BLS_KEY_2, pchainOwner(), pchainOwner(), 1000n)
      ).to.be.revertedWithCustomError(manager, "ValidatorAlreadyRegistered");
    });

    it("rejects weight exceeding 20% cap", async function () {
      // bootstrap total = 500_000. Cap is 20% of new total = (500_000 + w) * 0.2 >= w → w <= 125_000.
      await expect(
        manager
          .connect(bank)
          .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 200_000n)
      ).to.be.revertedWithCustomError(manager, "InvalidWeight");
    });

    it("reverts when uninitialized", async function () {
      // Fresh deployment without bootstrap
      const ManagerFactory = await ethers.getContractFactory("KumplyValidatorSetManager");
      const m2 = (await ManagerFactory.deploy(
        admin.address,
        await store.getAddress(),
        SUBNET_ID
      )) as unknown as KumplyValidatorSetManager;
      await m2.waitForDeployment();
      await expect(
        m2.connect(bank).initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n)
      ).to.be.revertedWithCustomError(m2, "NotInitialized");
    });
  });

  // ────────────────────────────────────────────────────────────────────
  describe("Complete Registration", function () {
    let validationID: string;

    beforeEach(async function () {
      await bootstrapInitialSet([100_000n, 100_000n, 100_000n, 100_000n, 100_000n]);
      await manager
        .connect(bank)
        .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n);
      validationID = await manager.validationIDByOwner(bank.address);
    });

    it("transitions PendingAdded → Active and increments active count", async function () {
      const before = await manager.activeValidatorCount();
      await warp._mockSetVerified(1, P_CHAIN_ID, ethers.ZeroAddress, packRegistrationAck(validationID, true), true);
      await expect(manager.completeValidatorRegistration(1))
        .to.emit(manager, "CompletedValidatorRegistration")
        .withArgs(validationID, 1000n);
      const v = await manager.getValidator(validationID);
      expect(v.status).to.equal(2); // Active
      expect(await manager.activeValidatorCount()).to.equal(before + 1n);
    });

    it("rejects ack for registered=false (treated as invalidation)", async function () {
      await warp._mockSetVerified(1, P_CHAIN_ID, ethers.ZeroAddress, packRegistrationAck(validationID, false), true);
      await expect(manager.completeValidatorRegistration(1))
        .to.be.revertedWithCustomError(manager, "InvalidValidatorStatus");
    });

    it("rejects unknown validationID", async function () {
      const fake = "0x" + "ee".repeat(32);
      await warp._mockSetVerified(1, P_CHAIN_ID, ethers.ZeroAddress, packRegistrationAck(fake, true), true);
      await expect(manager.completeValidatorRegistration(1))
        .to.be.revertedWithCustomError(manager, "InvalidValidatorStatus");
    });

    it("rejects double complete", async function () {
      await warp._mockSetVerified(1, P_CHAIN_ID, ethers.ZeroAddress, packRegistrationAck(validationID, true), true);
      await manager.completeValidatorRegistration(1);
      await expect(manager.completeValidatorRegistration(1))
        .to.be.revertedWithCustomError(manager, "InvalidValidatorStatus");
    });

    it("rejects invalid Warp", async function () {
      await warp._mockSetVerified(1, P_CHAIN_ID, ethers.ZeroAddress, packRegistrationAck(validationID, true), false);
      await expect(manager.completeValidatorRegistration(1))
        .to.be.revertedWithCustomError(manager, "WarpMessageInvalid");
    });
  });

  // ────────────────────────────────────────────────────────────────────
  describe("Removal Lifecycle", function () {
    let validationID: string;

    beforeEach(async function () {
      await bootstrapInitialSet([100_000n, 100_000n, 100_000n, 100_000n, 100_000n]);
      await manager
        .connect(bank)
        .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n);
      validationID = await manager.validationIDByOwner(bank.address);
      await warp._mockSetVerified(1, P_CHAIN_ID, ethers.ZeroAddress, packRegistrationAck(validationID, true), true);
      await manager.completeValidatorRegistration(1);
    });

    it("owner can initiateValidatorRemoval (Active → PendingRemoved)", async function () {
      await expect(manager.connect(bank).initiateValidatorRemoval(validationID))
        .to.emit(manager, "InitiatedValidatorRemoval");
      const v = await manager.getValidator(validationID);
      expect(v.status).to.equal(3); // PendingRemoved
      expect(await manager.activeValidatorCount()).to.equal(5); // bootstrap 5, +1 -1
    });

    it("admin can adminInitiateValidatorRemoval", async function () {
      await expect(
        manager.connect(admin).adminInitiateValidatorRemoval(validationID)
      ).to.emit(manager, "InitiatedValidatorRemoval");
    });

    it("non-owner cannot initiate voluntary removal", async function () {
      await expect(
        manager.connect(vc).initiateValidatorRemoval(validationID)
      ).to.be.revertedWithCustomError(manager, "UnauthorizedCaller");
    });

    it("non-admin cannot adminInitiateValidatorRemoval", async function () {
      await expect(
        manager.connect(vc).adminInitiateValidatorRemoval(validationID)
      ).to.be.reverted;
    });

    it("disableExpiredValidator allows permissionless purge when KYB revoked", async function () {
      await store.connect(verifier).revoke(bank.address);
      await expect(
        manager.connect(unverified).disableExpiredValidator(validationID)
      ).to.emit(manager, "InitiatedValidatorRemoval");
    });

    it("disableExpiredValidator reverts while attestation valid", async function () {
      await expect(
        manager.connect(unverified).disableExpiredValidator(validationID)
      ).to.be.revertedWithCustomError(manager, "AttestationStillValid");
    });

    it("completeValidatorRemoval garbage-collects indices and weight", async function () {
      await manager.connect(bank).initiateValidatorRemoval(validationID);
      const weightBefore = await manager.l1TotalWeight();
      await warp._mockSetVerified(2, P_CHAIN_ID, ethers.ZeroAddress, packRegistrationAck(validationID, false), true);
      await expect(manager.completeValidatorRemoval(2))
        .to.emit(manager, "CompletedValidatorRemoval")
        .withArgs(validationID);

      const v = await manager.getValidator(validationID);
      expect(v.status).to.equal(4); // Completed
      expect(await manager.l1TotalWeight()).to.equal(weightBefore - 1000n);
      expect(await manager.validationIDByOwner(bank.address)).to.equal(ethers.ZeroHash);
    });

    it("completeValidatorRemoval rejects registered=true ack", async function () {
      await manager.connect(bank).initiateValidatorRemoval(validationID);
      await warp._mockSetVerified(2, P_CHAIN_ID, ethers.ZeroAddress, packRegistrationAck(validationID, true), true);
      await expect(manager.completeValidatorRemoval(2))
        .to.be.revertedWithCustomError(manager, "InvalidValidatorStatus");
    });
  });

  // ────────────────────────────────────────────────────────────────────
  describe("Weight Update Lifecycle", function () {
    let validationID: string;

    beforeEach(async function () {
      await bootstrapInitialSet([100_000n, 100_000n, 100_000n, 100_000n, 100_000n]);
      await manager
        .connect(bank)
        .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n);
      validationID = await manager.validationIDByOwner(bank.address);
      await warp._mockSetVerified(1, P_CHAIN_ID, ethers.ZeroAddress, packRegistrationAck(validationID, true), true);
      await manager.completeValidatorRegistration(1);
    });

    it("owner can initiate increase", async function () {
      await expect(
        manager.connect(bank).initiateValidatorWeightUpdate(validationID, 1500n)
      ).to.emit(manager, "InitiatedValidatorWeightUpdate");
      const v = await manager.getValidator(validationID);
      expect(v.weight).to.equal(1500n);
      expect(v.sentNonce).to.equal(1n);
    });

    it("owner can initiate decrease", async function () {
      await manager.connect(bank).initiateValidatorWeightUpdate(validationID, 500n);
      const v = await manager.getValidator(validationID);
      expect(v.weight).to.equal(500n);
    });

    it("rejects unchanged weight", async function () {
      await expect(
        manager.connect(bank).initiateValidatorWeightUpdate(validationID, 1000n)
      ).to.be.revertedWithCustomError(manager, "InvalidWeight");
    });

    it("rejects zero weight", async function () {
      await expect(
        manager.connect(bank).initiateValidatorWeightUpdate(validationID, 0n)
      ).to.be.revertedWithCustomError(manager, "InvalidWeight");
    });

    it("rejects increase exceeding 20% cap", async function () {
      await expect(
        manager.connect(bank).initiateValidatorWeightUpdate(validationID, 200_000n)
      ).to.be.revertedWithCustomError(manager, "InvalidWeight");
    });

    it("non-owner cannot initiate", async function () {
      await expect(
        manager.connect(vc).initiateValidatorWeightUpdate(validationID, 2000n)
      ).to.be.revertedWithCustomError(manager, "UnauthorizedCaller");
    });

    it("completeValidatorWeightUpdate updates receivedNonce", async function () {
      await manager.connect(bank).initiateValidatorWeightUpdate(validationID, 1500n);
      await warp._mockSetVerified(2, P_CHAIN_ID, ethers.ZeroAddress, packWeightMessage(validationID, 1n, 1500n), true);
      await expect(manager.completeValidatorWeightUpdate(2))
        .to.emit(manager, "CompletedValidatorWeightUpdate")
        .withArgs(validationID, 1n, 1500n);
      const v = await manager.getValidator(validationID);
      expect(v.receivedNonce).to.equal(1n);
    });

    it("rejects stale nonce", async function () {
      await manager.connect(bank).initiateValidatorWeightUpdate(validationID, 1500n);
      await warp._mockSetVerified(2, P_CHAIN_ID, ethers.ZeroAddress, packWeightMessage(validationID, 1n, 1500n), true);
      await manager.completeValidatorWeightUpdate(2);
      // Replay
      await warp._mockSetVerified(3, P_CHAIN_ID, ethers.ZeroAddress, packWeightMessage(validationID, 1n, 1500n), true);
      await expect(manager.completeValidatorWeightUpdate(3))
        .to.be.revertedWithCustomError(manager, "InvalidValidatorStatus");
    });
  });

  // ────────────────────────────────────────────────────────────────────
  describe("Churn Limit", function () {
    beforeEach(async function () {
      await bootstrapInitialSet([10_000_000n]);
    });

    it("enforces MAX_CHURN_PER_PERIOD (20) per 24h", async function () {
      const signers = await ethers.getSigners();
      // 20 new validators OK; 21st reverts. Use signers 10..30; each gets KYB.
      for (let i = 10; i < 31 && i < signers.length; i++) {
        await issueTier(signers[i].address, 4);
      }
      for (let i = 0; i < 20; i++) {
        const signer = signers[10 + i];
        const node = "0x" + (0x60 + i).toString(16).padStart(2, "0").repeat(20);
        const bls = "0x" + (0x60 + i).toString(16).padStart(2, "0").repeat(48);
        await manager
          .connect(signer)
          .initiateValidatorRegistration(node, bls, pchainOwner(), pchainOwner(), 1000n);
      }
      const sig21 = signers[30];
      const node21 = "0x" + "f0".repeat(20);
      const bls21 = "0x" + "f0".repeat(48);
      await expect(
        manager
          .connect(sig21)
          .initiateValidatorRegistration(node21, bls21, pchainOwner(), pchainOwner(), 1000n)
      ).to.be.revertedWithCustomError(manager, "ChurnLimitExceeded");
    });

    it("resets after CHURN_PERIOD elapses", async function () {
      const signers = await ethers.getSigners();
      for (let i = 10; i < 31 && i < signers.length; i++) {
        await issueTier(signers[i].address, 4);
      }
      for (let i = 0; i < 20; i++) {
        const signer = signers[10 + i];
        const node = "0x" + (0x60 + i).toString(16).padStart(2, "0").repeat(20);
        const bls = "0x" + (0x60 + i).toString(16).padStart(2, "0").repeat(48);
        await manager
          .connect(signer)
          .initiateValidatorRegistration(node, bls, pchainOwner(), pchainOwner(), 1000n);
      }
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      const sig21 = signers[30];
      const node21 = "0x" + "f0".repeat(20);
      const bls21 = "0x" + "f0".repeat(48);
      await expect(
        manager
          .connect(sig21)
          .initiateValidatorRegistration(node21, bls21, pchainOwner(), pchainOwner(), 1000n)
      ).to.emit(manager, "InitiatedValidatorRegistration");
    });
  });

  // ────────────────────────────────────────────────────────────────────
  describe("Pausable", function () {
    beforeEach(async function () {
      await bootstrapInitialSet([100_000n]);
    });

    it("blocks initiate operations when paused", async function () {
      await manager.connect(admin).pause();
      await expect(
        manager
          .connect(bank)
          .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n)
      ).to.be.reverted;
    });

    it("allows complete operations when paused (they're settlement)", async function () {
      await manager
        .connect(bank)
        .initiateValidatorRegistration(NODE_ID_1, BLS_KEY_1, pchainOwner(), pchainOwner(), 1000n);
      const vID = await manager.validationIDByOwner(bank.address);
      await manager.connect(admin).pause();
      await warp._mockSetVerified(1, P_CHAIN_ID, ethers.ZeroAddress, packRegistrationAck(vID, true), true);
      await expect(manager.completeValidatorRegistration(1)).to.not.be.reverted;
    });
  });

  // ────────────────────────────────────────────────────────────────────
  describe("Constants", function () {
    it("REQUIRED_VALIDATOR_TIER == 4", async function () {
      expect(await manager.REQUIRED_VALIDATOR_TIER()).to.equal(4);
    });

    it("MAX_CHURN_PER_PERIOD == 20", async function () {
      expect(await manager.MAX_CHURN_PER_PERIOD()).to.equal(20);
    });

    it("MAX_VALIDATOR_WEIGHT_BPS == 2000", async function () {
      expect(await manager.MAX_VALIDATOR_WEIGHT_BPS()).to.equal(2000);
    });

    it("CHURN_PERIOD == 1 day", async function () {
      expect(await manager.CHURN_PERIOD()).to.equal(24 * 60 * 60);
    });
  });
});
