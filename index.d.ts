interface Window {
  ethereum: any;
  vultiConnect: { getVaults: () => Promise<VaultProps[]> };
  vultisig: any;
  thorchain: any;
  lodash: unknown;
  providers: EthereumProvider[];
  vultiConnectRouter: {
    vultisigProvider: EthereumProvider;
    lastInjectedProvider?: EthereumProvider;
    currentProvider: EthereumProvider;
    providers: EthereumProvider[];
    setDefaultProvider: (vultiAsDefault: boolean) => void;
    addProvider: (provider: EthereumProvider) => void;
  };
  xfi: any;
}

// import { Window as KeplrWindow } from '@keplr-wallet/types'
// declare global {
//   interface Window extends KeplrWindow {
//     ethereum: any
//     BinanceChain: any
//     web3: any
//     celo: any
//     xfi: any
//     terraWallets: any[]
//     keplr: any
//   }
// }
