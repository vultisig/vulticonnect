import {
  formatUnits,
  hexlify,
  keccak256,
  randomBytes,
  toUtf8Bytes,
  toUtf8String,
  Transaction,
} from "ethers";
import { create, toBinary } from "@bufbuild/protobuf";
import { TW, type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import {
  EthereumSpecificSchema,
  type EthereumSpecific,
} from "~protos/blockchain_specific_pb";
import { CoinSchema } from "~protos/coin_pb";
import {
  KeysignMessageSchema,
  KeysignPayloadSchema,
  type KeysignPayload,
} from "~protos/keysign_message_pb";

import { ChainKey, rpcUrl } from "~utils/constants";
import type {
  ChainProps,
  SignatureProps,
  TransactionProps,
  VaultProps,
} from "~utils/interfaces";

interface ChainRef {
  [chain: string]: CoinType;
}

interface RpcError {
  code: number;
  message: string;
}

interface RpcPayload {
  method: string;
  params: any[];
  jsonrpc?: string;
  id?: number;
}

interface RpcResponse {
  id: number;
  result: string | null;
  error: RpcError | null;
}

export default class SignAPI {
  private baseFee: bigint;
  private gasPrice: bigint;
  private maxPriority: bigint;
  private nonce: bigint;

  constructor(
    private chain: ChainProps,
    private chainRef: ChainRef,
    private dataEncoder: (data: Uint8Array) => Promise<string>,
    private walletCore: WalletCore
  ) {
    this.chain = chain;
    this.chainRef = chainRef;
    this.dataEncoder = dataEncoder;
    this.walletCore = walletCore;
  }

  private fetchAPI = <T>(payload: RpcPayload): Promise<T> => {
    return new Promise((resolve, reject) => {
      const url = rpcUrl[this.chain.name];

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then(resolve)
        .catch(reject);
    });
  };

  private getGasLimit = (): number => {
    switch (this.chain.name) {
      case ChainKey.ARBITRUM:
        return 300000;
      default:
        return 40000;
    }
  };

  private getNonce = (address: string): Promise<bigint> => {
    return new Promise((resolve) => {
      if (this.nonce) {
        resolve(this.nonce);
      } else {
        const payload = {
          jsonrpc: "2.0",
          method: "eth_getTransactionCount",
          params: [address, "latest"],
          id: 1,
        };

        this.fetchAPI<RpcResponse>(payload)
          .then((response) => {
            this.nonce = BigInt(response?.result ?? 0);

            resolve(this.nonce);
          })
          .catch(() => {
            this.nonce = BigInt(0);

            resolve(this.nonce);
          });
      }
    });
  };

  private getGasPrice = (): Promise<bigint> => {
    return new Promise((resolve) => {
      if (this.gasPrice) {
        resolve(this.gasPrice);
      } else {
        const payload = {
          jsonrpc: "2.0",
          method: "eth_gasPrice",
          params: [],
          id: 1,
        };

        this.fetchAPI<RpcResponse>(payload)
          .then((response) => {
            this.gasPrice = BigInt(response.result ?? 0);

            resolve(this.gasPrice);
          })
          .catch(() => {
            this.gasPrice = BigInt(0);

            resolve(this.gasPrice);
          });
      }
    });
  };

  private getMaxPriorityFeePerGas = (): Promise<bigint> => {
    return new Promise((resolve) => {
      if (this.maxPriority) {
        resolve(this.maxPriority);
      } else {
        const payload = {
          jsonrpc: "2.0",
          method: "eth_maxPriorityFeePerGas",
          params: [],
          id: 1,
        };

        this.fetchAPI<RpcResponse>(payload)
          .then((response) => {
            this.maxPriority = BigInt(response?.result ?? 0);

            resolve(this.maxPriority);
          })
          .catch(() => {
            this.maxPriority = BigInt(0);

            resolve(this.maxPriority);
          });
      }
    });
  };

  private getBaseFeePerGas = (): Promise<bigint> => {
    return new Promise((resolve) => {
      if (this.baseFee) {
        resolve(this.baseFee);
      } else {
        const payload = {
          jsonrpc: "2.0",
          method: "eth_feeHistory",
          params: ["0x1", "latest", []],
          id: 1,
        };

        this.fetchAPI<RpcResponse>(payload)
          .then((response) => {
            const [baseFeePerGasHex] =
              (response.result as any).baseFeePerGas ?? [];

            this.baseFee = BigInt(baseFeePerGasHex ?? 0);

            resolve(this.baseFee);
          })
          .catch(() => {
            this.baseFee = BigInt(0);

            resolve(this.baseFee);
          });
      }
    });
  };

  private encryptionKeyHex = (): string => {
    const keyBytes = randomBytes(32);

    return Array.from(keyBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  private stripHexPrefix = (hex: string): string => {
    return hex.startsWith("0x") ? hex.slice(2) : hex;
  };

  public getEstimateTransactionFee = (): Promise<string> => {
    return new Promise((resolve) => {
      Promise.all([
        this.getBaseFeePerGas(),
        this.getMaxPriorityFeePerGas(),
        this.getGasLimit(),
      ])
        .then(([baseFeePerGas, maxPriorityFeePerGas, gasLimit]) => {
          const totalFeePerGas = baseFeePerGas + maxPriorityFeePerGas;
          const estimatedFeeInWei = totalFeePerGas * BigInt(gasLimit);
          const estimatedFeeInGwei = formatUnits(estimatedFeeInWei, "gwei");

          resolve(estimatedFeeInGwei);
        })
        .catch(() => {});
    });
  };

  public getKeysignPayload = (
    transaction: TransactionProps,
    vault: VaultProps
  ): Promise<KeysignPayload> => {
    return new Promise((resolve, reject) => {
      const coin = create(CoinSchema, {
        chain: this.chain.name,
        ticker: this.chain.ticker,
        address: this.chain.address,
        decimals: this.chain.decimals,
        hexPublicKey: vault.hexChainCode,
        isNativeToken: true,
        logo: this.chain.ticker.toLowerCase(),
      });

      Promise.all([
        this.getGasLimit(),
        this.getGasPrice(),
        this.getMaxPriorityFeePerGas(),
        this.getNonce(transaction.from),
      ])
        .then(([gasLimit, gasPrice, feePerGas, nonce]) => {
          const ethereumSpecific = create(EthereumSpecificSchema, {
            gasLimit: gasLimit.toString(),
            maxFeePerGasWei: (
              (BigInt(gasPrice) * BigInt(3)) /
              BigInt(2)
            ).toString(),
            priorityFee: feePerGas.toString(),
            nonce,
          });

          const keysignPayload = create(KeysignPayloadSchema, {
            toAddress: transaction.to,
            toAmount: BigInt(parseInt(transaction.value)).toString(),
            memo: toUtf8String(transaction.data),
            vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
            vaultLocalPartyId: "VultiConnect",
            coin,
            blockchainSpecific: {
              case: "ethereumSpecific",
              value: ethereumSpecific,
            },
          });

          resolve(keysignPayload);
        })
        .catch(() => {
          reject();
        });
    });
  };

  public getPreSignedImageHash = (
    preSignedInputData: Uint8Array
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
        this.chainRef[this.chain.name],
        preSignedInputData
      );

      const preSigningOutput =
        TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);

      if (preSigningOutput.errorMessage !== "")
        reject(preSigningOutput.errorMessage);

      const imageHash = this.walletCore.HexCoding.encode(
        preSigningOutput.dataHash
      )?.replace(/^0x/, "");

      resolve(imageHash);
    });
  };

  public getPreSignedInputData = (
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const blockchainSpecific = keysignPayload.blockchainSpecific as
        | { case: "ethereumSpecific"; value: EthereumSpecific }
        | undefined;

      if (
        !blockchainSpecific ||
        blockchainSpecific.case !== "ethereumSpecific"
      ) {
        reject("Invalid blockchain specific");
      } else if (!keysignPayload.coin) {
        reject("Invalid coin");
      }

      const { gasLimit, maxFeePerGasWei, nonce, priorityFee } =
        blockchainSpecific.value;

      const chainId: bigint = BigInt(
        this.walletCore.CoinTypeExt.chainId(this.chainRef[this.chain.name])
      );

      const chainIdHex = Buffer.from(
        this.stripHexPrefix(chainId.toString(16).padStart(2, "0")),
        "hex"
      );

      // Nonce: converted to hexadecimal, stripped of '0x', and padded
      const nonceHex = Buffer.from(
        this.stripHexPrefix(
          hexlify(toUtf8Bytes(nonce.toString())).padStart(2, "0")
        ),
        "hex"
      );

      // Gas limit: converted to hexadecimal, stripped of '0x'
      const gasLimitHex = Buffer.from(
        this.stripHexPrefix(hexlify(toUtf8Bytes(gasLimit))),
        "hex"
      );

      // Max fee per gas: converted to hexadecimal, stripped of '0x'
      const maxFeePerGasHex = Buffer.from(
        this.stripHexPrefix(hexlify(toUtf8Bytes(maxFeePerGasWei))),
        "hex"
      );

      // Max inclusion fee per gas (priority fee): converted to hexadecimal, stripped of '0x'
      const maxInclusionFeePerGasHex = Buffer.from(
        this.stripHexPrefix(hexlify(toUtf8Bytes(priorityFee))),
        "hex"
      );

      // Amount: converted to hexadecimal, stripped of '0x'
      const amountHex = Buffer.from(
        this.stripHexPrefix(hexlify(toUtf8Bytes(keysignPayload.toAmount))),
        "hex"
      );

      // Send native tokens
      let toAddress = keysignPayload.toAddress;
      let evmTransaction = TW.Ethereum.Proto.Transaction.create({
        transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
          amount: amountHex,
          data: Buffer.from(keysignPayload.memo ?? "", "utf8"),
        }),
      });

      // Send ERC20 tokens, it will replace the transaction object
      if (!keysignPayload.coin.isNativeToken) {
        toAddress = keysignPayload.coin.contractAddress;
        evmTransaction = TW.Ethereum.Proto.Transaction.create({
          erc20Transfer: TW.Ethereum.Proto.Transaction.ERC20Transfer.create({
            amount: amountHex,
            to: keysignPayload.toAddress,
          }),
        });
      }

      // Create the signing input with the constants
      const input = TW.Ethereum.Proto.SigningInput.create({
        toAddress: toAddress,
        chainId: chainIdHex,
        nonce: nonceHex,
        gasLimit: gasLimitHex,
        maxFeePerGas: maxFeePerGasHex,
        maxInclusionFeePerGas: maxInclusionFeePerGasHex,
        txMode: TW.Ethereum.Proto.TransactionMode.Enveloped,
        transaction: evmTransaction,
      });

      resolve(TW.Ethereum.Proto.SigningInput.encode(input).finish());
    });
  };

  public getSendKey = (
    keysignPayload: KeysignPayload,
    publicKeyEcdsa: string,
    transactionId: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const keysignMessage = create(KeysignMessageSchema, {
        sessionId: transactionId,
        serviceName: "VultiConnect",
        encryptionKeyHex: this.encryptionKeyHex(),
        useVultisigRelay: true,
        keysignPayload,
      });

      const binary = toBinary(KeysignMessageSchema, keysignMessage);

      this.dataEncoder(binary).then((base64EncodedData) => {
        resolve(
          `vultisig://vultisig.com?type=SignTransaction&vault=${publicKeyEcdsa}&jsonData=${base64EncodedData}`
        );
      });
    });
  };

  public getSignedTransaction = (
    transaction: TransactionProps,
    signature: SignatureProps
  ): Promise<string> => {
    return new Promise((resolve) => {
      let tx = {};

      const props = {
        chainId: parseInt(this.chain.id).toString(),
        nonce: Number(this.nonce),
        gasLimit: this.getGasLimit().toString(),
        maxFeePerGas: (BigInt(this.gasPrice) * BigInt(3)) / BigInt(2),
        maxPriorityFeePerGas: this.maxPriority,
        to: transaction.to,
        value: BigInt(transaction.value),
        signature: {
          v: BigInt(signature.RecoveryID),
          r: `0x${signature.R}`,
          s: `0x${signature.S}`,
        },
      };

      tx = transaction.data ? { ...props, data: transaction.data } : props;

      const txHash = keccak256(Transaction.from(tx).serialized);

      resolve(txHash);
    });
  };
}
