import { parseUnits, randomBytes } from "ethers";
import { create, toBinary } from "@bufbuild/protobuf";

import { EthereumSpecificSchema } from "~protos/blockchain_specific_pb";
import { CoinSchema } from "~protos/coin_pb";
import {
  KeysignPayloadSchema,
  KeysignMessageSchema,
} from "~protos/keysign_message_pb";
import {
  getGasLimit,
  getGasPrice,
  getMaxPriorityFeePerGas,
  getNonce,
} from "~utils/evm-api";
import type { TransactionProps, VaultProps } from "~utils/interfaces";
import useEncoder from "~hooks/encode-data";

const useSendKey = (): ((
  transaction: TransactionProps,
  vault: VaultProps
) => Promise<string>) => {
  const encodeData = useEncoder();

  const encryptionKeyHex = (): string => {
    const keyBytes = randomBytes(32);

    return Array.from(keyBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const getSendKey = (
    transaction: TransactionProps,
    vault: VaultProps
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const coin = create(CoinSchema, {
        chain: transaction.chain,
        ticker: transaction.ticker,
        address: transaction.from,
        decimals: transaction.decimals,
        hexPublicKey: vault.hexChainCode,
        isNativeToken: true,
        logo: transaction.ticker.toLowerCase(),
      });

      Promise.all([
        getGasLimit(),
        getGasPrice(transaction.chain),
        getMaxPriorityFeePerGas(transaction.chain),
        getNonce(transaction.chain, transaction.from),
      ])
        .then(([gasLimit, gasPrice, feePerGas, nonce]) => {
          const ethereumSpecific = create(EthereumSpecificSchema, {
            gasLimit: gasLimit.toString(),
            maxFeePerGasWei: (gasPrice * (BigInt(3) / BigInt(2))).toString(),
            priorityFee: feePerGas.toString(),
            nonce,
          });

          const keysignPayload = create(KeysignPayloadSchema, {
            toAddress: transaction.to,
            toAmount: parseUnits(
              transaction.value,
              transaction.decimals
            ).toString(),
            memo: transaction.data,
            vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
            vaultLocalPartyId: "VultiConnect",
            coin,
            blockchainSpecific: {
              case: "ethereumSpecific",
              value: ethereumSpecific,
            },
          });

          const keysignMessage = create(KeysignMessageSchema, {
            sessionId: transaction.id,
            serviceName: "VultiConnect",
            encryptionKeyHex: encryptionKeyHex(),
            useVultisigRelay: true,
            keysignPayload,
          });

          console.log(keysignMessage);

          const binary = toBinary(KeysignMessageSchema, keysignMessage);

          encodeData(binary).then((base64EncodedData) => {
            resolve(
              `vultisig://vultisig.com?type=SignTransaction&vault=${vault.publicKeyEcdsa}&jsonData=${base64EncodedData}`
            );
          });
        })
        .catch(() => {
          reject("");
        });
    });
  };

  return getSendKey;
};

export default useSendKey;
