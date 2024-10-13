interface Window {
  ethereum: any;
  vultiConnect: { getVaults: () => Promise<VaultProps[]> };
  vultisig: any;
  lodash: unknown;
  providers: EthereumProvider[];
  vultiConnectRouter: {
    rainbowProvider: EthereumProvider;
    lastInjectedProvider?: EthereumProvider;
    currentProvider: EthereumProvider;
    providers: EthereumProvider[];
    setDefaultProvider: (rainbowAsDefault: boolean) => void;
    addProvider: (provider: EthereumProvider) => void;
  };
}
