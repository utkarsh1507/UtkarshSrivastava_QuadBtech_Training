const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contract with account: ${deployer.address}`);

    const CryptoKids = await ethers.getContractFactory("CryptoKids");
    const cryptoKids = await CryptoKids.deploy();

    await cryptoKids.waitForDeployment();

    console.log(`CryptoKids deployed at: ${cryptoKids.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});