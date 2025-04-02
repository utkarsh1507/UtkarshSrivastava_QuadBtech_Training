require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/XiO3AlehF2iWqiIG1lMskl6ayXbAjc-t",
      accounts: ["172fa91a2188fc34c215b55e1d53ffff527fdd27909a9750ff05a72d1ac4d227"]
    }
  }
};
