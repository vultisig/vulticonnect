import { Buffer } from "buffer";
import {
  JsonRpcProvider,
  Transaction,
  formatUnits,
  hexlify,
  keccak256,
  randomBytes,
  toUtf8Bytes,
  toUtf8String,
} from "ethers";
import { create, toBinary } from "@bufbuild/protobuf";
import { TW, WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import { EthereumSpecificSchema } from "protos/blockchain_specific_pb";
import { CoinSchema } from "protos/coin_pb";
import {
  KeysignMessageSchema,
  KeysignPayloadSchema,
  KeysignPayload,
} from "protos/keysign_message_pb";

import { ChainKey, Currency, rpcUrl } from "utils/constants";
import { ITransaction, SignedTransaction, VaultProps } from "utils/interfaces";
import { checkERC20Function } from "utils/functions";
import api from "utils/api";

interface ChainRef {
  [chainKey: string]: CoinType;
}

export default class EVMTransactionProvider {
  private gasPrice: bigint = BigInt(0);
  private keysignPayload?: KeysignPayload;
  private maxPriorityFeePerGas: bigint = BigInt(0);
  private nonce: bigint = BigInt(0);
  private provider: JsonRpcProvider;

  constructor(
    private chainKey: ChainKey,
    private chainRef: ChainRef,
    private dataEncoder: (data: Uint8Array) => Promise<string>,
    private walletCore: WalletCore
  ) {
    this.chainKey = chainKey;
    this.chainRef = chainRef;
    this.dataEncoder = dataEncoder;
    this.walletCore = walletCore;

    this.provider = new JsonRpcProvider(rpcUrl[chainKey]);
  }

  private encryptionKeyHex = (): string => {
    const keyBytes = randomBytes(32);

    return Array.from(keyBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  private stripHexPrefix = (hex: string): string => {
    return hex.startsWith("0x") ? hex.slice(2) : hex;
  };

  public getEstimateTransactionFee = (
    cmcId: number,
    currency: Currency
  ): Promise<string> => {
    return new Promise((resolve) => {
      api
        .cryptoCurrency(cmcId, currency)
        .then((price) => {
          const gwei = formatUnits(
            (this.gasPrice + this.maxPriorityFeePerGas) *
              BigInt(this.getGasLimit()),
            "gwei"
          );

          resolve((parseInt(gwei) * 1e-9 * price).toValueFormat(currency));
        })
        .catch(() => {
          resolve((0).toValueFormat(currency));
        });
    });
  };

  public getFeeData = (): Promise<void> => {
    return new Promise((resolve) => {
      this.provider
        .getFeeData()
        .then(({ gasPrice, maxPriorityFeePerGas }) => {
          if (gasPrice) this.gasPrice = gasPrice;
          if (maxPriorityFeePerGas)
            this.maxPriorityFeePerGas = maxPriorityFeePerGas;

          resolve();
        })
        .catch(() => {
          this.gasPrice = BigInt(0);
          // this.maxFeePerGas = BigInt(0);
          this.maxPriorityFeePerGas = BigInt(0);

          resolve();
        });
    });
  };

  public getGasLimit = (): number => {
    //TODO: update gaslimit based on chain and transaction type
    return 600000;
  };

  public getKeysignPayload = (
    transaction: ITransaction.METAMASK,
    vault: VaultProps
  ): Promise<KeysignPayload> => {
    return new Promise((resolve, reject) => {
      const coin = create(CoinSchema, {
        chain: transaction.chain.name,
        ticker: transaction.chain.ticker,
        address: transaction.from,
        decimals: transaction.chain.decimals,
        hexPublicKey: vault.hexChainCode,
        isNativeToken: true,
        logo: transaction.chain.ticker.toLowerCase(),
      });

      this.provider
        .getTransactionCount(transaction.from)
        .then((nonce) => {
          this.nonce = BigInt(nonce);

          const ethereumSpecific = create(EthereumSpecificSchema, {
            gasLimit: this.getGasLimit().toString(),
            maxFeePerGasWei: (
              (this.gasPrice * BigInt(5)) /
              BigInt(2)
            ).toString(),
            nonce: this.nonce,
            priorityFee:
              this.maxPriorityFeePerGas == null
                ? this.gasPrice.toString()
                : this.maxPriorityFeePerGas.toString(),
          });
          checkERC20Function(transaction.data).then((isMemoFunction) => {
            let modifiedMemo: string;
            try {
              modifiedMemo =
                isMemoFunction || transaction.data === "0x"
                  ? transaction.data ?? ""
                  : toUtf8String(transaction.data);
            } catch {
              modifiedMemo = transaction.data;
            }
            const keysignPayload = create(KeysignPayloadSchema, {
              toAddress: transaction.to,
              toAmount: transaction.value
                ? BigInt(parseInt(transaction.value)).toString()
                : "0",
              memo: modifiedMemo,
              vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
              vaultLocalPartyId: "VultiConnect",
              coin,
              blockchainSpecific: {
                case: "ethereumSpecific",
                value: ethereumSpecific,
              },
            });
            this.keysignPayload = keysignPayload;
            resolve(keysignPayload);
          });
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
        this.chainRef[this.chainKey],
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

  public getPreSignedInputData = (): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      if (this.keysignPayload) {
        if (this.keysignPayload.coin) {
          if (
            this.keysignPayload.blockchainSpecific?.case === "ethereumSpecific"
          ) {
            const { gasLimit, maxFeePerGasWei, nonce, priorityFee } =
              this.keysignPayload.blockchainSpecific.value;

            const chainId: bigint = BigInt(
              this.walletCore.CoinTypeExt.chainId(this.chainRef[this.chainKey])
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
              this.stripHexPrefix(
                hexlify(toUtf8Bytes(this.keysignPayload.toAmount))
              ),
              "hex"
            );

            // Send native tokens
            let toAddress = this.keysignPayload.toAddress;
            let evmTransaction = TW.Ethereum.Proto.Transaction.create({
              transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
                amount: amountHex,
                data: Buffer.from(
                  this.keysignPayload.memo
                    ? this.stripHexPrefix(this.keysignPayload.memo)
                    : "",
                  "utf8"
                ),
              }),
            });

            // Send ERC20 tokens, it will replace the transaction object
            if (
              this.keysignPayload.coin &&
              !this.keysignPayload.coin.isNativeToken
            ) {
              toAddress = this.keysignPayload.coin.contractAddress;
              evmTransaction = TW.Ethereum.Proto.Transaction.create({
                erc20Transfer:
                  TW.Ethereum.Proto.Transaction.ERC20Transfer.create({
                    amount: amountHex,
                    to: this.keysignPayload.toAddress,
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
          } else {
            reject("Invalid blockchain specific");
          }
        } else {
          reject("Invalid coin");
        }
      } else {
        reject("Invalid keysign payload");
      }
    });
  };

  public getSignedTransaction = ({
    signature,
    transaction,
  }: SignedTransaction): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (transaction) {
        const props = {
          chainId: parseInt(transaction.chain.id).toString(),
          nonce: Number(this.nonce),
          gasLimit: this.getGasLimit().toString(),
          maxFeePerGas: (this.gasPrice * BigInt(5)) / BigInt(2),
          maxPriorityFeePerGas: this.maxPriorityFeePerGas,
          to: transaction.to,
          value: transaction.value ? BigInt(transaction.value) : BigInt(0),
          signature: {
            v: BigInt(signature.RecoveryID),
            r: `0x${signature.R}`,
            s: `0x${signature.S}`,
          },
        };

        const tx = transaction.data
          ? { ...props, data: transaction.data }
          : props;

        const txHash = keccak256(Transaction.from(tx).serialized);

        resolve(txHash);
      } else {
        reject();
      }
    });
  };

  public getTransactionKey = (
    publicKeyEcdsa: string,
    transactionId: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const keysignMessage = create(KeysignMessageSchema, {
        sessionId: transactionId,
        serviceName: "VultiConnect",
        encryptionKeyHex: this.encryptionKeyHex(),
        useVultisigRelay: true,
        keysignPayload: this.keysignPayload,
      });

      const binary = toBinary(KeysignMessageSchema, keysignMessage);

      this.dataEncoder(binary).then((base64EncodedData) => {
        resolve(
          `vultisig://vultisig.com?type=SignTransaction&vault=${publicKeyEcdsa}&jsonData=${base64EncodedData}`
        );
      });
    });
  };
}
