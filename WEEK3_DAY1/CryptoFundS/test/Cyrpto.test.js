const { ethers } = require("hardhat");
const assert = require("assert");

describe("CryptoKids", function () {
    let CryptoKids, cryptoKids, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        CryptoKids = await ethers.getContractFactory("CryptoKids");
        cryptoKids = await CryptoKids.deploy();
        await cryptoKids.waitForDeployment();
    });

    it("Should set the owner correctly", async function () {
        const contractOwner = await cryptoKids.owner();
        assert.strictEqual(contractOwner, owner.address, "Owner is incorrect");
    });

    it("Should allow the owner to add a kid", async function () {
        await cryptoKids.addKid(addr1.address, "Alice", "Doe", Math.floor(Date.now() / 1000) + 3600);
        const kid = await cryptoKids.kids(0);
        assert.strictEqual(kid.walletAddress, addr1.address, "Kid wallet is incorrect");
    });

    it("Should allow deposits and update balance", async function () {
        await cryptoKids.addKid(addr1.address, "Alice", "Doe", Math.floor(Date.now() / 1000) + 3600);
        const depositAmount = ethers.parseEther("1.0");

        await cryptoKids.deposit(addr1.address, { value: depositAmount });

        const kid = await cryptoKids.kids(0);
        assert.strictEqual(kid.amount.toString(), depositAmount.toString(), "Deposit amount mismatch");
    });

    it("Should not allow withdrawal before release time", async function () {
        await cryptoKids.addKid(addr1.address, "Alice", "Doe", Math.floor(Date.now() / 1000) + 3600);
        try {
            await cryptoKids.connect(addr1).withdraw();
            assert.fail("Withdraw should not be allowed before release time");
        } catch (error) {
            assert.ok(error.message.includes("Withdrawal not allowed"), "Incorrect error message");
        }
    });

    it("Should allow withdrawal after release time", async function () {
        const releaseTime = Math.floor(Date.now() / 1000) - 10; // Already past
        await cryptoKids.addKid(addr1.address, "Alice", "Doe", releaseTime);

        const depositAmount = ethers.parseEther("1.0");
        await cryptoKids.deposit(addr1.address, { value: depositAmount });

        await cryptoKids.connect(addr1).availableToWithdraw(addr1.address);
        await cryptoKids.connect(addr1).withdraw();

        const updatedKid = await cryptoKids.kids(0);
        assert.strictEqual(updatedKid.amount.toString(), "0", "Balance should be zero after withdrawal");
    });
});
