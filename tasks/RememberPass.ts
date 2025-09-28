import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the RememberPass contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the RememberPass contract
 *
 *   npx hardhat --network localhost task:store-password --title "Gmail" --password "mypassword123"
 *   npx hardhat --network localhost task:get-count
 *   npx hardhat --network localhost task:get-password --index 0
 *   npx hardhat --network localhost task:list-passwords
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the RememberPass contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the RememberPass contract
 *
 *   npx hardhat --network sepolia task:store-password --title "Gmail" --password "mypassword123"
 *   npx hardhat --network sepolia task:get-count
 *   npx hardhat --network sepolia task:get-password --index 0
 *   npx hardhat --network sepolia task:list-passwords
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the RememberPass address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const rememberPass = await deployments.get("RememberPass");

  console.log("RememberPass address is " + rememberPass.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:store-password --title "Gmail" --password "mypassword123"
 *   - npx hardhat --network sepolia task:store-password --title "Gmail" --password "mypassword123"
 */
task("task:store-password", "Stores a password entry")
  .addOptionalParam("address", "Optionally specify the RememberPass contract address")
  .addParam("title", "The title for the password")
  .addParam("password", "The password to encrypt and store")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const RememberPassDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("RememberPass");
    console.log(`RememberPass: ${RememberPassDeployment.address}`);

    const signers = await ethers.getSigners();

    const rememberPassContract = await ethers.getContractAt("RememberPass", RememberPassDeployment.address);

    // Simulate frontend encryption: generate a random key address and encrypt password
    const keyAddress = ethers.Wallet.createRandom().address;
    console.log(`Generated key address: ${keyAddress}`);

    // In real implementation, frontend would encrypt the password with this key
    // For demo purposes, we'll just use the password as "encrypted"
    const encryptedPassword = `encrypted_${taskArguments.password}`;
    const encryptedKeyAddress = `encrypted_${keyAddress}`;

    // Create access control value using FHEVM
    const accessControlValue = 1;
    const encryptedAccessControl = await fhevm
      .createEncryptedInput(RememberPassDeployment.address, signers[0].address)
      .add32(accessControlValue)
      .encrypt();

    const tx = await rememberPassContract
      .connect(signers[0])
      .storePassword(
        taskArguments.title,
        encryptedPassword,
        encryptedKeyAddress,
        encryptedAccessControl.handles[0],
        encryptedAccessControl.inputProof
      );
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Password stored successfully with title: ${taskArguments.title}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-count
 *   - npx hardhat --network sepolia task:get-count
 */
task("task:get-count", "Gets the password count for the caller")
  .addOptionalParam("address", "Optionally specify the RememberPass contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const RememberPassDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("RememberPass");
    console.log(`RememberPass: ${RememberPassDeployment.address}`);

    const signers = await ethers.getSigners();

    const rememberPassContract = await ethers.getContractAt("RememberPass", RememberPassDeployment.address);

    const count = await rememberPassContract.connect(signers[0]).getPasswordCount();
    console.log(`Password count: ${count}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-password --index 0
 *   - npx hardhat --network sepolia task:get-password --index 0
 */
task("task:get-password", "Gets a password entry by index")
  .addOptionalParam("address", "Optionally specify the RememberPass contract address")
  .addParam("index", "The index of the password entry")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const index = parseInt(taskArguments.index);
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`Argument --index must be a non-negative integer`);
    }

    const RememberPassDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("RememberPass");
    console.log(`RememberPass: ${RememberPassDeployment.address}`);

    const signers = await ethers.getSigners();

    const rememberPassContract = await ethers.getContractAt("RememberPass", RememberPassDeployment.address);

    try {
      const entry = await rememberPassContract.connect(signers[0]).getPasswordEntry(index);
      console.log(`Password Entry ${index}:`);
      console.log(`  Title: ${entry.title}`);
      console.log(`  Encrypted Password: ${entry.encryptedPassword}`);
      console.log(`  Timestamp: ${new Date(Number(entry.timestamp) * 1000).toISOString()}`);
    } catch (error) {
      console.error(`Error getting password entry ${index}:`, error);
    }
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:list-passwords
 *   - npx hardhat --network sepolia task:list-passwords
 */
task("task:list-passwords", "Lists all password entries for the caller")
  .addOptionalParam("address", "Optionally specify the RememberPass contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const RememberPassDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("RememberPass");
    console.log(`RememberPass: ${RememberPassDeployment.address}`);

    const signers = await ethers.getSigners();

    const rememberPassContract = await ethers.getContractAt("RememberPass", RememberPassDeployment.address);

    const count = await rememberPassContract.connect(signers[0]).getPasswordCount();
    console.log(`Total password entries: ${count}`);

    if (count > 0) {
      const entries = await rememberPassContract.connect(signers[0]).getAllPasswordEntries();

      console.log("\nPassword Entries:");
      for (let i = 0; i < entries.length; i++) {
        console.log(`${i}: ${entries[i].title} - ${entries[i].encryptedPassword} (${new Date(Number(entries[i].timestamp) * 1000).toISOString()})`);
      }
    } else {
      console.log("No password entries found.");
    }
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:delete-password --index 0
 *   - npx hardhat --network sepolia task:delete-password --index 0
 */
task("task:delete-password", "Deletes a password entry by index")
  .addOptionalParam("address", "Optionally specify the RememberPass contract address")
  .addParam("index", "The index of the password entry to delete")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const index = parseInt(taskArguments.index);
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`Argument --index must be a non-negative integer`);
    }

    const RememberPassDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("RememberPass");
    console.log(`RememberPass: ${RememberPassDeployment.address}`);

    const signers = await ethers.getSigners();

    const rememberPassContract = await ethers.getContractAt("RememberPass", RememberPassDeployment.address);

    try {
      const tx = await rememberPassContract.connect(signers[0]).deletePassword(index);
      console.log(`Wait for tx:${tx.hash}...`);

      const receipt = await tx.wait();
      console.log(`tx:${tx.hash} status=${receipt?.status}`);

      console.log(`Password entry ${index} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting password entry ${index}:`, error);
    }
  });