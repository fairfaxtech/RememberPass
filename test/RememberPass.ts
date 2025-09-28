import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { RememberPass, RememberPass__factory } from "../types";
import { expect } from "chai";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("RememberPass")) as RememberPass__factory;
  const rememberPassContract = (await factory.deploy()) as RememberPass;
  const rememberPassContractAddress = await rememberPassContract.getAddress();

  return { rememberPassContract, rememberPassContractAddress };
}

describe("RememberPass", function () {
  let signers: Signers;
  let rememberPassContract: RememberPass;
  let rememberPassContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ rememberPassContract, rememberPassContractAddress } = await deployFixture());

    // Store a test password entry for subsequent tests
    const title = "Test Password";
    const encryptedPassword = "encrypted_password_string";
    const encryptedKeyAddress = "frontend_encrypted_key_address";

    // Create access control value
    const accessControlValue = 1;
    const encryptedAccessControl = await fhevm
      .createEncryptedInput(rememberPassContractAddress, signers.alice.address)
      .add32(accessControlValue)
      .encrypt();

    await rememberPassContract
      .connect(signers.alice)
      .storePassword(
        title,
        encryptedPassword,
        encryptedKeyAddress,
        encryptedAccessControl.handles[0],
        encryptedAccessControl.inputProof
      );
  });

  it("should store a password entry", async function () {
    const count = await rememberPassContract.connect(signers.alice).getPasswordCount();
    expect(count).to.equal(1);
  });

  it("should retrieve a password entry", async function () {
    const entry = await rememberPassContract.connect(signers.alice).getPasswordEntry(0);
    expect(entry.title).to.equal("Test Password");
    expect(entry.encryptedPassword).to.equal("encrypted_password_string");
    expect(entry.timestamp).to.be.greaterThan(0);
  });

  it("should get encrypted key address", async function () {
    const encryptedKeyAddress = await rememberPassContract.connect(signers.alice).getEncryptedKeyAddress(0);
    expect(encryptedKeyAddress).to.equal("frontend_encrypted_key_address");
  });

  it("should get all password entries", async function () {
    const entries = await rememberPassContract.connect(signers.alice).getAllPasswordEntries();
    expect(entries.length).to.equal(1);
    expect(entries[0].title).to.equal("Test Password");
    expect(entries[0].encryptedPassword).to.equal("encrypted_password_string");
  });

  it("should update a password entry", async function () {
    const newTitle = "Updated Password";
    const newEncryptedPassword = "new_encrypted_password_string";
    const newEncryptedKeyAddress = "new_frontend_encrypted_key_address";
    const newAccessControlValue = 2;
    const encryptedAccessControl = await fhevm
      .createEncryptedInput(rememberPassContractAddress, signers.alice.address)
      .add32(newAccessControlValue)
      .encrypt();

    await rememberPassContract
      .connect(signers.alice)
      .updatePassword(
        0,
        newTitle,
        newEncryptedPassword,
        newEncryptedKeyAddress,
        encryptedAccessControl.handles[0],
        encryptedAccessControl.inputProof
      );

    const entry = await rememberPassContract.connect(signers.alice).getPasswordEntry(0);
    expect(entry.title).to.equal(newTitle);
    expect(entry.encryptedPassword).to.equal(newEncryptedPassword);
  });

  it("should delete a password entry", async function () {
    await rememberPassContract.connect(signers.alice).deletePassword(0);

    const count = await rememberPassContract.connect(signers.alice).getPasswordCount();
    expect(count).to.equal(0);
  });

  it("should handle multiple users independently", async function () {
    const bobTitle = "Bob Password";
    const bobEncryptedPassword = "bob_encrypted_password";
    const bobEncryptedKeyAddress = "bob_frontend_encrypted_key_address";
    const bobAccessControlValue = 1;
    const bobEncryptedAccessControl = await fhevm
      .createEncryptedInput(rememberPassContractAddress, signers.bob.address)
      .add32(bobAccessControlValue)
      .encrypt();

    await rememberPassContract
      .connect(signers.bob)
      .storePassword(
        bobTitle,
        bobEncryptedPassword,
        bobEncryptedKeyAddress,
        bobEncryptedAccessControl.handles[0],
        bobEncryptedAccessControl.inputProof
      );

    const aliceCount = await rememberPassContract.connect(signers.alice).getPasswordCount();
    const bobCount = await rememberPassContract.connect(signers.bob).getPasswordCount();

    expect(aliceCount).to.equal(1); // Alice has the entry from beforeEach
    expect(bobCount).to.equal(1); // Bob has the entry just created

    const aliceEntry = await rememberPassContract.connect(signers.alice).getPasswordEntry(0);
    const bobEntry = await rememberPassContract.connect(signers.bob).getPasswordEntry(0);

    expect(aliceEntry.title).to.equal("Test Password"); // From beforeEach
    expect(bobEntry.title).to.equal(bobTitle);
  });

  it("should revert on invalid index", async function () {
    await expect(rememberPassContract.connect(signers.alice).getPasswordEntry(999))
      .to.be.revertedWith("Index out of bounds");

    await expect(rememberPassContract.connect(signers.alice).getEncryptedKeyAddress(999))
      .to.be.revertedWith("Index out of bounds");

    await expect(rememberPassContract.connect(signers.alice).deletePassword(999))
      .to.be.revertedWith("Index out of bounds");
  });
});