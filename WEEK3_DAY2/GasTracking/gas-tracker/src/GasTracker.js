import React, { useState } from "react";
import { BrowserProvider, Contract } from "ethers";

const CONTRACT_ADDRESS = "0x50E241089F5a30D0f88A0190DE0A0Ee8AC4Cc19C"; // New Sepolia contract address
const ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "transactionType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gasUsed",
        "type": "uint256"
      }
    ],
    "name": "GasUsed",
    "type": "event",
    "selector": "0x443ab68a4cacb08d38c92183e87a41d7056d4e3f5587d896f025fb5026afc096"
  },
  {
    "inputs": [],
    "name": "complexTransaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "selector": "0xedd3e74a"
  },
  {
    "inputs": [],
    "name": "simpleTransaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "selector": "0xc869c3e5"
  },
  {
    "inputs": [],
    "name": "storageTransaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "selector": "0xce30c5ed"
  }
];

const GasTracker = () => {
  const [gasUsed, setGasUsed] = useState("");

  const executeTransaction = async (functionName) => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      // Get gas estimate before transaction
      const gasEstimate = await contract[functionName].estimateGas();

      // Execute transaction
      const tx = await contract[functionName]();
      console.log("Transaction hash:", tx.hash);
      const receipt = await tx.wait();

      // Calculate actual gas used
      const actualGasUsed = receipt.gasUsed;
      const gasPrice = tx.gasPrice;
      const gasCost = actualGasUsed * gasPrice;

      setGasUsed(
        `Gas used for ${functionName}:\n` +
        `Transaction hash: ${tx.hash}\n` +
        `Estimated gas: ${gasEstimate.toString()}\n` +
        `Actual gas used: ${actualGasUsed.toString()}\n` +
        `Gas price: ${gasPrice.toString()} wei\n` +
        `Total cost: ${gasCost.toString()} wei`
      );
    } catch (error) {
      console.error("Transaction error:", error);
      setGasUsed(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Gas Tracker</h2>
      <div style={{ marginBottom: "20px" }}>
        <p>Contract Address: {CONTRACT_ADDRESS}</p>
        <p>Network: Sepolia Testnet</p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => executeTransaction("simpleTransaction")}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Simple Transaction
        </button>
        <button
          onClick={() => executeTransaction("storageTransaction")}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Storage Transaction
        </button>
        <button
          onClick={() => executeTransaction("complexTransaction")}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Complex Transaction
        </button>
      </div>
      <pre style={{
        whiteSpace: 'pre-wrap',
        textAlign: 'left',
        margin: '20px auto',
        maxWidth: '600px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '5px',
        border: '1px solid #ddd'
      }}>
        {gasUsed}
      </pre>
    </div>
  );
};

export default GasTracker;
