// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GasComparison {
    event GasUsed(string transactionType, uint256 gasUsed);
    uint256[200] private storageArray; // Increased array size for more gas usage
    uint256 private constant LOOP_COUNT = 50; // Number of iterations

    function simpleTransaction() external {
        // Simple operation - just one storage write
        storageArray[0] = block.timestamp;
        emit GasUsed("Simple Transaction", 21000); // Base transaction cost
    }

    function complexTransaction() external {
        uint256[100] memory memoryArray;
        uint256 sum = 0;
        
        // Complex memory operations
        for(uint256 i = 0; i < LOOP_COUNT; i++) {
            memoryArray[i] = i * block.timestamp;
            sum += memoryArray[i];
            memoryArray[i] = sum / (i + 1);
        }
        
        // Store final result
        storageArray[0] = sum;
        emit GasUsed("Complex Transaction", gasleft());
    }

    function storageTransaction() external {
        // Multiple storage operations
        for(uint256 i = 0; i < LOOP_COUNT; i++) {
            storageArray[i] = i * block.timestamp;
            storageArray[i + LOOP_COUNT] = storageArray[i] * 2;
        }
        
        // Additional storage reads and writes
        uint256 sum = 0;
        for(uint256 i = 0; i < LOOP_COUNT; i++) {
            sum += storageArray[i];
            storageArray[i + LOOP_COUNT * 2] = sum;
        }
        
        emit GasUsed("Storage Transaction", gasleft());
    }
}
