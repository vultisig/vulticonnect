interface Window {
  ethereum: any;
  vultiConnect: { getVaults: () => Promise<VaultProps[]> };
  maya: any;
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
}
