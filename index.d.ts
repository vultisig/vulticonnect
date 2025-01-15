// import { Window as KeplrWindow } from '@keplr-wallet/types';
interface Window {
  bitcoin: any;
  bitcoincash: any;
  cosmos: any;
  dash: any;
  dogecoin: any;
  ethereum: any;
  litecoin: any;
  lodash: unknown;
  maya: any;
  thorchain: any;
  providers: EthereumProvider[];
  vultisig: any;
  keplr: any;
  vultiConnect: { getVaults: () => Promise<VaultProps[]> };
  vultiConnectRouter: {
    vultisigProvider: EthereumProvider;
    lastInjectedProvider?: EthereumProvider;
    currentProvider: EthereumProvider;
    providers: EthereumProvider[];
    setDefaultProvider: (vultiAsDefault: boolean) => void;
    addProvider: (provider: EthereumProvider) => void;
  };
  xfi: any;
  ctrlKeplrProviders: any;
  ctrlEthProviders: any;
  isCtrl: boolean;
  windowKeplr: any;
  keplrRequestAccountsCallback: any;
}
