import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedRememberPass = await deploy("RememberPass", {
    from: deployer,
    log: true,
  });

  console.log(`RememberPass contract: `, deployedRememberPass.address);
};
export default func;
func.id = "deploy_rememberPass"; // id required to prevent reexecution
func.tags = ["RememberPass"];
