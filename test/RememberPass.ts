import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { RememberPass, RememberPass__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("RememberPass")) as RememberPass__factory;
  const contract = (await factory.deploy()) as RememberPass;
  const address = await contract.getAddress();
  return { contract, address };
}

describe("RememberPass", function () {
  let signers: Signers;
  let contract: RememberPass;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }
    ({ contract, address: contractAddress } = await deployFixture());
  });

  it("should add and retrieve a record, and decrypt key", async function () {
    const user = signers.alice;
    const title = "email";
    const cipher = "base64:abcd";

    // Use a demo uint256 key (could be an address encoded in lower 160 bits)
    const keyUint256 = 12345678901234567890n;

    const enc = await fhevm
      .createEncryptedInput(contractAddress, user.address)
      .add256(keyUint256)
      .encrypt();

    const tx = await contract
      .connect(user)
      .addRecord(title, cipher, enc.handles[0], enc.inputProof);
    await tx.wait();

    const count = await contract.getRecordCount(user.address);
    expect(count).to.eq(1n);

    const record = await contract.getRecord(user.address, 0);
    expect(record[0]).to.eq(title);
    expect(record[1]).to.eq(cipher);

    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint256,
      record[2],
      contractAddress,
      user,
    );
    expect(decrypted).to.eq(keyUint256);
  });
});
