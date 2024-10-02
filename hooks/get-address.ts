import { ChainKey, errorKey } from "~utils/constants";
import type { VaultProps } from "~utils/interfaces";
import useWalletCore from "~hooks/get-wallet-core";
import api from "~utils/api";

interface AddressProps {
  address: string;
  derivationKey?: string;
}

const useAddress = (): ((
  chain: ChainKey,
  vault: VaultProps
) => Promise<AddressProps>) => {
  const getCore = useWalletCore();

  const getECDSAAddress = (
    chain: ChainKey,
    vault: VaultProps,
    prefix?: string
  ): Promise<AddressProps> => {
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
            .then(({ data: { publicKey: derivationKey } }) => {
              const bytes = core.HexCoding.decode(derivationKey);
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

              address
                ? resolve({ address, derivationKey })
                : reject(errorKey.FAIL_TO_GET_ADDRESS);
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
  ): Promise<AddressProps> => {
    return new Promise((resolve, reject) => {
      getCore()
        .then(({ core, chainRef }) => {
          const coin = chainRef[chain];

          const bytes = core.HexCoding.decode(vault.publicKeyEddsa);

          const publicKey = core.PublicKey.createWithData(
            bytes,
            core.PublicKeyType.ed25519
          );

          const address = core.AnyAddress.createWithPublicKey(
            publicKey,
            coin
          )?.description();

          address ? resolve({ address }) : reject(errorKey.FAIL_TO_GET_ADDRESS);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const getAddress = (
    chain: ChainKey,
    vault: VaultProps
  ): Promise<AddressProps> => {
    return new Promise((resolve, reject) => {
      switch (chain) {
        // EDDSA
        case ChainKey.POLKADOT:
        case ChainKey.SOLANA:
        case ChainKey.SUI: {
          getEDDSAAddress(chain, vault).then(resolve).catch(reject);

          break;
        }
        // ECDSA
        case ChainKey.MAYACHAIN: {
          getECDSAAddress(chain, vault, "maya").then(resolve).catch(reject);

          break;
        }
        case ChainKey.BITCOINCASH: {
          getECDSAAddress(chain, vault)
            .then(({ address, derivationKey }) => {
              resolve({
                address: address.replace("bitcoincash:", ""),
                derivationKey,
              });
            })
            .catch(reject);

          break;
        }
        default: {
          getECDSAAddress(chain, vault).then(resolve).catch(reject);

          break;
        }
      }
    });
  };

  return getAddress;
};

export default useAddress;
