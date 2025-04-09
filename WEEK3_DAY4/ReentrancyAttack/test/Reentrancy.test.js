const assert = require("assert");
const hre = require("hardhat");
const ethers = hre.ethers;

describe("Reentrancy (Fixed)", function () {
  let contract;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ContractFactory = await ethers.getContractFactory("Fixed");
    contract = await ContractFactory.deploy();
  });

  it("should accept deposits", async function () {
    const amount = ethers.parseEther("1");
    await contract.connect(user1).deposit({ value: amount });

    const balance = await contract.balances(user1.address);
    assert.strictEqual(balance.toString(), amount.toString());
  });

  it("should allow withdrawal", async function () {
    const amount = ethers.parseEther("1");
    await contract.connect(user1).deposit({ value: amount });

    const initialBalance = await ethers.provider.getBalance(user1.address);
    const tx = await contract.connect(user1).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const finalBalance = await ethers.provider.getBalance(user1.address);
    const expected = initialBalance + amount - gasUsed;

    assert.ok(finalBalance >= expected - ethers.parseEther("0.001"));
    assert.ok(finalBalance <= expected + ethers.parseEther("0.001"));
  });

  it("should fail to withdraw if balance is zero", async function () {
    try {
      await contract.connect(user2).withdraw();
      assert.fail("Expected error not received");
    } catch (error) {
      assert.ok(error.message.includes("No balance"));
    }
  });
});
