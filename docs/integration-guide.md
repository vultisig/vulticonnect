
# VultiConnect Integration Guide

## Introduction

VultiConnect is a Chrome extension that enhances the experience of interacting with decentralized finance (DeFi) applications. It provides a secure way for users to connect without storing private keys on their browsers. VultiConnect introduces:

- **`window.vultisig.ethereum`** for Ethereum integrations (previously `window.vultisig`).
- **`window.thorchain` and `window.vultisig.thorchain`** for Thorchain support.
- A MetaMask-compatible interface (`window.ethereum`) to ensure seamless integration with existing DeFi applications.
- Support for multiple other chains including MayaChain, GaiaChain, Osmosis, Kujira, DyDx, BitcoinCash, Dash, DogeCoin, LiteCoin, and Bitcoin.

## Supported Chains

VultiConnect currently supports the following chains:

- Ethereum `(0x1)`
- Thorchain `(Thorchain_1)`
- MayaChain `(MayaChain-1)`
- GaiaChain `(cosmoshub-4)`
- Osmosis `(osmosis-1)`
- Kujira `(kaiyo-1)`
- DyDx `(dydx-1)`
- BitcoinCash `(0x2710)`
- Dash `(Dash_dash)`
- DogeCoin `(0x7d0)`
- LiteCoin `(Litecoin_litecoin)`
- Bitcoin `(0x1f96)`

## How VultiConnect Works

- **Private Key Security**: VultiConnect does not store private keys. Instead, transactions are converted to QR codes that users can scan and sign using VultiSig peer devices.
- **Compatibility**: The extension provides:
  - `window.ethereum` for MetaMask-compatible Ethereum integration.
  - `window.vultisig.ethereum` for VultiConnect-enhanced Ethereum features.
  - `window.thorchain` and `window.vultisig.thorchain` for Thorchain functionality.
  - Additional chain support for other chains using `window.chain` and `window.vultisig.chain`.

---

## Steps to Integrate with VultiConnect

### 1. Detect VultiConnect Support

```javascript
if (window.vultisig?.ethereum) {
  console.log("VultiConnect Ethereum provider is available!");
  // Integration logic for Ethereum
} else if (window.ethereum) {
  console.log("Ethereum provider available (MetaMask or VultiConnect)");
  // Fallback to MetaMask-compatible logic
}

if (window.chain || window.vultisig?.chain) {
  console.log("VultiConnect [Chain] provider is available!");
  // Integration logic for the chain
} else {
  console.log("No compatible [chain] provider found.");
}
```

### 2. Connecting to VultiConnect

#### Ethereum

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

#### Other Supported Chains

```javascript
const connectChain = async (chain) => {
  const provider = window[chain] || window.vultisig?.[chain];
  if (provider) {
    try {
      const accounts = await provider.request({ method: "request_accounts" });
      console.log(`Connected to ${chain} wallet:`, accounts);
    } catch (error) {
      console.error(`${chain} connection failed`, error);
    }
  } else {
    alert(`No ${chain} provider found. Please install VultiConnect.`);
  }
};
```

Replace `chain` with the desired chain identifier such as `thorchain`, `maya`, `cosmos`, etc.

## Supported Methods

### Ethereum (`window.vultisig.ethereum`)

- **Account Management**:  
  - `eth_accounts`  
  - `eth_requestAccounts`
- **Chain Management**:  
  - `eth_chainId`  
  - `wallet_addEthereumChain`  
  - `wallet_switchEthereumChain`
- **Transaction Management**:  
  - `eth_sendTransaction`  
  - `eth_getTransactionByHash`  
  - `eth_estimateGas`

### Other Supported Chains

#### Thorchain (`window.thorchain` and `window.vultisig.thorchain`)

- **Account Management**:  
  - `request_accounts`  
  - `get_accounts`
- **Transaction Management**:  
  - `send_transaction` 
  - `deposit_transaction` 
  - `get_transaction_by_hash`  


#### Cosmos-Based Chains (GaiaChain, Osmosis, Kujira, DyDx)

- **Account Management**:  
  - `request_accounts`  
  - `get_accounts`
  - `chain_id`

- **Chain Management**:  
  - `wallet_add_chain`  
  - `wallet_switch_chain`
- **Transaction Management**:  
  - `send_transaction`  
  - `get_transaction_by_hash`
- **Notes**: Accessing a specific Cosmos-based chain (such as Kujira or Osmosis) requires calling `chain_id` to retrieve the active chain's ID or using `wallet_add_chain` and `wallet_switch_chain` to add or switch to the desired chain.

#### Other Chains (`window.chain` and `window.vultisig.chain`)

- **Account Management**:  
  - `request_accounts`
  - `get_accounts`
- **Transaction Management**:  
  - `send_transaction`  
  - `get_transaction_by_hash`

##### Supported Chains

The following chains are fully supported through their respective interfaces:

- MayaChain
- BitcoinCash
- Dash
- DogeCoin
- LiteCoin
- Bitcoin

Each chain uses a unified interface accessible via `window.chain` and `window.vultisig.chain` for seamless interaction across different blockchain networks.
## Summary

VultiConnect ensures secure and multi-chain integration with DeFi applications, providing seamless support across popular chains. Its adherence to [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) guarantees compatibility with existing applications while delivering a secure and user-friendly experience.
