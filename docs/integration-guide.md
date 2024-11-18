# VultiConnect Integration Guide

## Introduction

VultiConnect is a Chrome extension that enhances the experience of interacting with decentralized finance (DeFi) applications. It provides a secure way for users to connect without storing private keys on their browsers. VultiConnect introduces:

- **`window.vultisig.ethereum`** for Ethereum integrations (previously `window.vultisig`).
- **`window.thorchain` and `window.vultisig.thorchain`** for Thorchain support.
- A MetaMask-compatible interface (`window.ethereum`) to ensure seamless integration with existing DeFi applications.

## How VultiConnect Works

- **Private Key Security**: VultiConnect does not store private keys. Instead, transactions are converted to QR codes that users can scan and sign using VultiSig peer devices.
- **Compatibility**: The extension provides:
  - `window.ethereum` for MetaMask-compatible Ethereum integration.
  - `window.vultisig.ethereum` for VultiConnect-enhanced Ethereum features.
  - `window.thorchain` and `window.vultisig.thorchain` for Thorchain functionality.
- **Prioritize VultiConnect**: A switch titled "Prioritize VultiConnect" allows users to override `window.ethereum` and use VultiConnect as the default provider. When disabled, `window.ethereum` remains unchanged, and `window.vultisig.ethereum` provides access to VultiConnect.
- **MetaMask Interoperable Provider Descriptor (MIPD)**: VultiConnect introduces itself as a provider, allowing DeFi applications to extract provider information for smooth integration.

## Steps to Integrate with VultiConnect

### 1. Detect VultiConnect Support

To detect whether VultiConnect is available, check for `window.vultisig.ethereum` or `window.thorchain`.

```javascript
if (window.vultisig?.ethereum) {
  console.log("VultiConnect Ethereum provider is available!");
  // Your integration logic for Ethereum here
} else if (window.ethereum) {
  console.log("Ethereum provider available (MetaMask or VultiConnect)");
  // Fallback to existing MetaMask-compatible logic
}

if (window.thorchain || window.vultisig?.thorchain) {
  console.log("VultiConnect Thorchain provider is available!");
  // Your integration logic for Thorchain here
} else {
  console.log("No compatible Thorchain provider found.");
}
```

---

### 2. Connecting to VultiConnect

#### Ethereum

To connect to an Ethereum wallet, use the `eth_requestAccounts` method.

```javascript
const connectEthereum = async () => {
  const provider = window.vultisig?.ethereum || window.ethereum;
  if (provider) {
    try {
      await provider.request({ method: "eth_requestAccounts" });
      console.log("Connected to Ethereum wallet");
    } catch (error) {
      console.error("Ethereum connection failed", error);
    }
  } else {
    alert(
      "No Ethereum provider found. Please install VultiConnect or MetaMask."
    );
  }
};
```

#### Thorchain

To connect to a Thorchain wallet, use the `request_accounts` method.

```javascript
const connectThorchain = async () => {
  const provider = window.thorchain || window.vultisig?.thorchain;
  if (provider) {
    try {
      const accounts = await provider.request({ method: "request_accounts" });
      console.log("Connected to Thorchain wallet:", accounts);
    } catch (error) {
      console.error("Thorchain connection failed", error);
    }
  } else {
    alert("No Thorchain provider found. Please install VultiConnect.");
  }
};
```

---

### 3. Handling Transactions with VultiConnect

#### Ethereum

Send transactions using `eth_sendTransaction`.

```javascript
const sendEthereumTransaction = async (txDetails) => {
  if (window.vultisig?.ethereum) {
    try {
      const transactionHash = await window.vultisig.ethereum.request({
        method: "eth_sendTransaction",
        params: [txDetails],
      });
      console.log("Ethereum Transaction Hash: ", transactionHash);
    } catch (error) {
      console.error("Ethereum transaction failed", error);
    }
  }
};
```

#### Thorchain

Send transactions using `send_transaction`.

```javascript
const sendThorchainTransaction = async (txDetails) => {
  if (window.thorchain || window.vultisig?.thorchain) {
    try {
      const transactionHash = await (
        window.thorchain || window.vultisig?.thorchain
      ).request({
        method: "send_transaction",
        params: [txDetails],
      });
      console.log("Thorchain Transaction Hash: ", transactionHash);
    } catch (error) {
      console.error("Thorchain transaction failed", error);
    }
  }
};
```

---

### 4. Querying Transactions

#### Ethereum

Retrieve Ethereum transaction details with `eth_getTransactionByHash`.

```javascript
const getEthereumTransaction = async (txHash) => {
  if (window.vultisig?.ethereum) {
    try {
      const txDetails = await window.vultisig.ethereum.request({
        method: "eth_getTransactionByHash",
        params: [txHash],
      });
      console.log("Ethereum Transaction Details:", txDetails);
    } catch (error) {
      console.error("Failed to get Ethereum transaction details:", error);
    }
  }
};
```

#### Thorchain

Retrieve Thorchain transaction details using `get_transaction_by_hash`.

```javascript
const getThorchainTransaction = async (txHash) => {
  if (window.thorchain || window.vultisig?.thorchain) {
    try {
      const txDetails = await (
        window.thorchain || window.vultisig?.thorchain
      ).request({
        method: "get_transaction_by_hash",
        params: [txHash],
      });
      console.log("Thorchain Transaction Details:", txDetails);
    } catch (error) {
      console.error("Failed to get Thorchain transaction details:", error);
    }
  }
};
```

---

### 5. Event Handling

VultiConnect supports the `CONNECT` and `DISCONNECT` events for both Ethereum and Thorchain.

```javascript
if (window.vultisig?.ethereum || window.thorchain) {
  const provider = window.vultisig?.ethereum || window.thorchain;

  provider.on("CONNECT", (info) => {
    console.log("Connected:", info);
  });

  provider.on("DISCONNECT", (error) => {
    console.log("Disconnected:", error);
  });
}
```

---

### 6. Supported Methods

#### Ethereum (`window.vultisig.ethereum`)

- **Account Management**:  
  `eth_accounts`, `eth_requestAccounts`
- **Chain Management**:  
  `eth_chainId`, `wallet_addEthereumChain`, `wallet_switchEthereumChain`
- **Transaction Management**:  
  `eth_sendTransaction`, `eth_getTransactionByHash`, `eth_estimateGas`

#### Thorchain (`window.thorchain` and `window.vultisig.thorchain`)

- **Account Management**:  
  `request_accounts`
- **Transaction Management**:  
  `send_transaction`, `get_transaction_by_hash`

---

## Summary

VultiConnect enables secure, multi-chain integration for DeFi applications. It provides:

- MetaMask-compatible Ethereum support via `window.vultisig.ethereum`.
- Native Thorchain support via `window.thorchain` and `window.vultisig.thorchain`.

By adhering to [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193), VultiConnect ensures seamless integration with minimal effort, allowing developers to deliver a secure and user-friendly experience.
