import { task } from "hardhat/config";

task("remember:add", "Add a demo record")
  .addParam("contract", "RememberPass contract address")
  .addParam("title", "Title string")
  .addParam("cipher", "Cipher string")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const remember = await hre.ethers.getContractAt("RememberPass", args.contract, signer);

    const input = await hre.fhevm
      .createEncryptedInput(await remember.getAddress(), signer.address)
      .add256(BigInt(signer.address))
      .encrypt();

    const tx = await remember.addRecord(args.title, args.cipher, input.handles[0], input.inputProof);
    console.log("tx:", tx.hash);
    await tx.wait();
    console.log("record added");
  });

task("remember:count", "Get record count for user")
  .addParam("contract", "RememberPass contract address")
  .addParam("user", "User address")
  .setAction(async (args, hre) => {
    const remember = await hre.ethers.getContractAt("RememberPass", args.contract);
    const n = await remember.getRecordCount(args.user);
    console.log("count:", n.toString());
  });

