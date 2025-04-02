// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract CryptoKids {
    address public owner;

    event LogKidFundingReceived(
        address indexed addr,
        uint256 amount,
        uint256 contractBalance
    );
    event KidWithdrawn(address indexed addr, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    struct Kid {
        address payable walletAddress;
        string firstName;
        string lastName;
        uint256 releaseTime;
        uint256 amount;
        bool canWithdraw;
    }

    Kid[] public kids;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    function addKid(
        address payable walletAddress,
        string memory firstName,
        string memory lastName,
        uint256 releaseTime
    ) public onlyOwner {
        kids.push(
            Kid(walletAddress, firstName, lastName, releaseTime, 0, false)
        );
    }

    function balanceOf() public view returns (uint256) {
        return address(this).balance;
    }

    function deposit(address walletAddress) external payable {
        require(msg.value > 0, "Must send some ETH");
        uint256 index = getIndex(walletAddress);
        require(index != 999, "Kid not found");

        kids[index].amount += msg.value;
        emit LogKidFundingReceived(walletAddress, msg.value, balanceOf());
    }

    function getIndex(address walletAddress) private view returns (uint256) {
        for (uint256 i = 0; i < kids.length; i++) {
            if (kids[i].walletAddress == walletAddress) {
                return i;
            }
        }
        return 999;
    }

    function availableToWithdraw(address walletAddress) public returns (bool) {
        uint256 index = getIndex(walletAddress);
        require(index != 999, "Kid not found");
        require(
            block.timestamp >= kids[index].releaseTime,
            "Cannot withdraw yet"
        );

        kids[index].canWithdraw = true;
        return true;
    }

    function withdraw() external {
        uint256 index = getIndex(msg.sender);
        require(index != 999, "Kid not found");
        require(kids[index].canWithdraw, "Withdrawal not allowed");

        uint256 amount = kids[index].amount;
        require(amount > 0, "No funds available");

        kids[index].amount = 0;
        kids[index].canWithdraw = false;

        kids[index].walletAddress.transfer(amount);
        emit KidWithdrawn(msg.sender, amount);
    }
}
