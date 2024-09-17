import { ChainKey, errorKey } from "~utils/constants";
import type { VaultProps } from "~utils/interfaces";
import useWalletCore from "~hooks/get-core";
import api from "~utils/api";

const useAddress = (): ((
  chain: ChainKey,
  vault: VaultProps
) => Promise<string>) => {
  const getCore = useWalletCore();

  const getECDSAAddress = (
    chain: ChainKey,
    vault: VaultProps,
    prefix?: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      getCore()
        .then(({ core, chainRef }) => {
          const coin = chainRef[chain];

          api
            .derivePublicKey({
              publicKeyEcdsa: vault.publicKeyEcdsa,
              hexChainCode: vault.hexChainCode,
              derivePath: core.CoinTypeExt.derivationPath(coin),
            })
            .then(({ data }) => {
              const bytes = core.HexCoding.decode(data.publicKey);
              let address: string;

              const publicKey = core.PublicKey.createWithData(
                bytes,
                core.PublicKeyType.secp256k1
              );

              if (prefix) {
                address = core.AnyAddress.createBech32WithPublicKey(
                  publicKey,
                  coin,
                  prefix
                )?.description();
              } else {
                address = core.AnyAddress.createWithPublicKey(
                  publicKey,
                  coin
                )?.description();
              }

              address ? resolve(address) : reject(errorKey.FAIL_TO_GET_ADDRESS);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const getEDDSAAddress = (
    chain: ChainKey,
    vault: VaultProps
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      getCore()
        .then(({ core, chainRef }) => {
          const coin = chainRef[chain];

          const bytes = core.HexCoding.decode(vault.publicKeyEddsa);

          const eddsaKey = core.PublicKey.createWithData(
            bytes,
            core.PublicKeyType.ed25519
          );

          const address = core.AnyAddress.createWithPublicKey(
            eddsaKey,
            coin
          )?.description();

          address ? resolve(address) : reject(errorKey.FAIL_TO_GET_ADDRESS);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const getAddress = (chain: ChainKey, vault: VaultProps): Promise<string> => {
    return new Promise((resolve, reject) => {
      switch (chain) {
        // EDDSA
        case ChainKey.POLKADOT:
        case ChainKey.SOLANA:
        case ChainKey.SUI: {
          getEDDSAAddress(chain, vault)
            .then((address) => {
              resolve(address);
            })
            .catch((error) => {
              reject(error);
            });

          break;
        }
        // ECDSA
        case ChainKey.MAYACHAIN: {
          getECDSAAddress(chain, vault, "maya")
            .then((address) => {
              resolve(address);
            })
            .catch((error) => {
              reject(error);
            });

          break;
        }
        case ChainKey.BITCOINCASH: {
          getECDSAAddress(chain, vault)
            .then((address) => {
              resolve(address.replace("bitcoincash:", ""));
            })
            .catch((error) => {
              reject(error);
            });

          break;
        }
        default: {
          getECDSAAddress(chain, vault)
            .then((address) => {
              resolve(address);
            })
            .catch((error) => {
              reject(error);
            });

          break;
        }
      }
    });
  };

  return getAddress;
};

export default useAddress;
