import { useState } from "react";
import { initWasm, type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import { ChainKey, errorKey } from "~utils/constants";

interface ChainRef {
  [chain: string]: CoinType;
}

interface InitialState {
  chainRef: ChainRef;
  core?: WalletCore;
}

const useWalletCore = (): (() => Promise<InitialState>) => {
  const initialState: InitialState = { chainRef: {} };
  const [state, setState] = useState(initialState);
  const { core, chainRef } = state;

  const getCore = (): Promise<InitialState> => {
    return new Promise((resolve, reject) => {
      if (core) {
        resolve({ core, chainRef });
      } else {
        initWasm()
          .then((core) => {
            const chainRef = {
              [ChainKey.ARBITRUM]: core.CoinType.arbitrum,
              [ChainKey.AVALANCHE]: core.CoinType.avalancheCChain,
              [ChainKey.BASE]: core.CoinType.base,
              [ChainKey.BITCOIN]: core.CoinType.bitcoin,
              [ChainKey.BITCOINCASH]: core.CoinType.bitcoinCash,
              [ChainKey.BLAST]: core.CoinType.blast,
              [ChainKey.BSCCHAIN]: core.CoinType.smartChain,
              [ChainKey.CRONOSCHAIN]: core.CoinType.cronosChain,
              [ChainKey.DASH]: core.CoinType.dash,
              [ChainKey.DOGECOIN]: core.CoinType.dogecoin,
              [ChainKey.DYDX]: core.CoinType.dydx,
              [ChainKey.ETHEREUM]: core.CoinType.ethereum,
              [ChainKey.GAIACHAIN]: core.CoinType.cosmos,
              [ChainKey.KUJIRA]: core.CoinType.kujira,
              [ChainKey.LITECOIN]: core.CoinType.litecoin,
              [ChainKey.MAYACHAIN]: core.CoinType.thorchain,
              [ChainKey.OPTIMISM]: core.CoinType.optimism,
              [ChainKey.POLKADOT]: core.CoinType.polkadot,
              [ChainKey.POLYGON]: core.CoinType.polygon,
              [ChainKey.SOLANA]: core.CoinType.solana,
              [ChainKey.SUI]: core.CoinType.sui,
              [ChainKey.THORCHAIN]: core.CoinType.thorchain,
              [ChainKey.ZKSYNC]: core.CoinType.zksync,
            };

            setState((prevState) => ({ ...prevState, core, chainRef }));

            resolve({ core, chainRef });
          })
          .catch(() => {
            reject(errorKey.FAIL_TO_INIT_WASM);
          });
      }
    });
  };

  return getCore;
};

export default useWalletCore;
