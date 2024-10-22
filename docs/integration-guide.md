# VultiConnect Integration Guide

## Introduction
VultiConnect is a Chrome extension that enhances the experience of interacting with decentralized finance (DeFi) applications. It provides a secure way for users to connect without storing private keys on their browsers. VultiConnect introduces `window.vultisig` for new integrations and provides a MetaMask-compatible interface (`window.ethereum`) to ensure seamless integration with existing DeFi applications.

## How VultiConnect Works
- **Private Key Security**: VultiConnect does not store private keys. Instead, transactions are converted to QR codes that users can scan and sign using VultiSig peer devices.
- **Compatibility**: The extension provides both `window.ethereum` and `window.vultisig`. This allows your app to maintain compatibility with MetaMask while also supporting VultiConnect's enhanced features.
- **Prioritize VultiConnect**: VultiConnect has a switch button titled "Prioritize VultiConnect". When enabled, VultiConnect will override `window.ethereum`, making it the default provider. When disabled, it only overrides `window.vultisig`, allowing MetaMask or other providers to handle `window.ethereum`.
- **MetaMask Interoperable Provider Descriptor (MIPD)**: VultiConnect uses MIPD to introduce itself as a provider, allowing DeFi applications to easily extract provider information and support integration.

## Steps to Integrate with VultiConnect

### 1. Detect VultiConnect Support
To detect whether VultiConnect is available, check for the presence of `window.vultisig`. Since VultiConnect is designed to replace MetaMask, it also exposes `window.ethereum` for compatibility.

```javascript
if (window.vultisig) {
    console.log("VultiConnect is available!");
    // Your integration logic for VultiSig here
} else if (window.ethereum) {
    console.log("Ethereum provider available (MetaMask or VultiConnect)");
    // Fallback to existing MetaMask-compatible logic
} else {
    console.log("No compatible wallet found.");
}
```

### 2. Connecting to VultiConnect
To initiate a connection, follow the same process as you would for MetaMask. This ensures backward compatibility while allowing users to choose between MetaMask or VultiConnect.

```javascript
const connectWallet = async () => {
    if (window.vultisig || window.ethereum) {
        try {
            const provider = window.vultisig || window.ethereum;
            await provider.request({ method: 'eth_requestAccounts' });
            console.log("Connected to wallet");
        } catch (error) {
            console.error("Connection failed", error);
        }
    } else {
        alert("No compatible wallet found. Please install VultiConnect or MetaMask.");
    }
};

document.getElementById("connectButton").addEventListener("click", connectWallet);
```

### 3. Handling Transactions with VultiConnect
When users initiate a transaction using VultiConnect, the extension converts the transaction into a QR code. The user then scans the QR code with a VultiSig peer device to securely sign the transaction, ensuring that private keys are never exposed in the browser.

Ensure that your app can handle pending transactions and track their status through events provided by `window.vultisig` or `window.ethereum`.

```javascript
const sendTransaction = async (txDetails) => {
    if (window.vultisig) {
        try {
            const transactionHash = await window.vultisig.request({
                method: 'eth_sendTransaction',
                params: [txDetails],
            });
            console.log("Transaction Hash: ", transactionHash);
        } catch (error) {
            console.error("Transaction failed", error);
        }
    }
};
```

### 4. Supported Methods
VultiConnect adheres to the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) standard for provider interfaces, ensuring seamless integration with DeFi applications. The following methods are currently supported:

- **Account Management**:
  - `eth_accounts`: Get a list of user accounts currently connected.
  - `eth_requestAccounts`: Request user accounts to connect to the app.

- **Chain Management**:
  - `eth_chainId`: Get the current chain ID.
  - `wallet_addEthereumChain`: Add a new Ethereum chain to the wallet.
  - `wallet_switchEthereumChain`: Switch to a different Ethereum chain.

- **Transaction Management**:
  - `eth_sendTransaction`: Send transactions from the connected account.
  - `eth_getTransactionByHash`: Get transaction details by its hash.
  - `eth_estimateGas`: Estimate gas needed for a transaction.

- **Blockchain Queries**:
  - `eth_blockNumber`: Get the current block number.

- **Permissions Management**:
  - `wallet_getPermissions`: Get the current wallet permissions.
  - `wallet_requestPermissions`: Request new permissions from the user.
  - `wallet_revokePermissions`: Revoke specific permissions granted to the app.

- **Event Handling**:
  - VultiConnect currently supports the `CONNECT` and `DISCONNECT` events. Make sure to listen to these events for a better user experience:

  ```javascript
  if (window.vultisig) {
      window.vultisig.on('CONNECT', (info) => {
          console.log('Connected to network:', info);
          // Handle connect logic here
      });

      window.vultisig.on('DISCONNECT', (error) => {
          console.log('Disconnected:', error);
          // Handle disconnect logic here
      });
  }
  ```

## Summary
Integrating your DeFi application with VultiConnect is straightforward, as it supports MetaMask-compatible methods while offering an alternative interface for new integrations via `window.vultisig`. By adhering to the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) standard, VultiConnect ensures minimal friction during integration, providing developers with a secure and flexible option for interacting with DeFi applications.
