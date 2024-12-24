import {
  JsonRpcProvider,
  Transaction,
  formatUnits,
  hexlify,
  keccak256,
  toUtf8Bytes,
  toUtf8String,
} from "ethers";
import { create } from "@bufbuild/protobuf";
import { TW, type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import {
  EthereumSpecificSchema,
  type EthereumSpecific,
} from "~protos/blockchain_specific_pb";
import { CoinSchema } from "~protos/coin_pb";
import {
  KeysignPayloadSchema,
  type KeysignPayload,
} from "~protos/keysign_message_pb";

import { ChainKey, Currency, rpcUrl } from "~utils/constants";
import type {
  SignatureProps,
  TransactionProps,
  VaultProps,
} from "~utils/interfaces";
import api from "../../api";
import { bigintToByteArray, checkERC20Function } from "../../functions";
import { BaseTransactionProvider } from "../base-transaction-provider";

interface ChainRef {
  [chainKey: string]: CoinType;
}

export default class EVMTransactionProvider extends BaseTransactionProvider {
  private gasPrice: bigint;
  private maxPriorityFeePerGas: bigint;
  private nonce: bigint;

  private provider: JsonRpcProvider;

  constructor(
    chainKey: ChainKey,
    chainRef: ChainRef,
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    super(chainKey, chainRef, dataEncoder, walletCore);
    this.chainKey = chainKey;
    this.chainRef = chainRef;
    this.dataEncoder = dataEncoder;
    this.walletCore = walletCore;

    this.provider = new JsonRpcProvider(rpcUrl[this.chainKey]);
  }

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
        .then(({ gasPrice, maxFeePerGas, maxPriorityFeePerGas }) => {
          this.gasPrice = gasPrice;
          this.maxPriorityFeePerGas = maxPriorityFeePerGas;
          resolve();
        })
        .catch(() => {
          this.gasPrice = BigInt(0);
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
    transaction: TransactionProps,
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
        logo: transaction.chain.name.toLowerCase(),
        priceProviderId: "ethereum",
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
              modifiedMemo = isMemoFunction
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

  public getPreSignedInputData = (): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const blockchainSpecific = this.keysignPayload.blockchainSpecific as
        | { case: "ethereumSpecific"; value: EthereumSpecific }
        | undefined;

      if (
        !blockchainSpecific ||
        blockchainSpecific.case !== "ethereumSpecific"
      ) {
        reject("Invalid blockchain specific");
      } else if (!this.keysignPayload.coin) {
        reject("Invalid coin");
      }

      const { gasLimit, maxFeePerGasWei, nonce, priorityFee } =
        blockchainSpecific.value;

      const chainId: bigint = BigInt(
        this.walletCore.CoinTypeExt.chainId(this.chainRef[this.chainKey])
      );

      const chainIdHex = bigintToByteArray(BigInt(chainId));

      const nonceHex = bigintToByteArray(BigInt(nonce));

      const gasLimitHex = bigintToByteArray(BigInt(gasLimit));

      const maxFeePerGasHex = bigintToByteArray(BigInt(maxFeePerGasWei));

      const maxInclusionFeePerGasHex = bigintToByteArray(BigInt(priorityFee));

      const amountHex = bigintToByteArray(BigInt(this.keysignPayload.toAmount));
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
      if (!this.keysignPayload.coin.isNativeToken) {
        toAddress = this.keysignPayload.coin.contractAddress;
        evmTransaction = TW.Ethereum.Proto.Transaction.create({
          erc20Transfer: TW.Ethereum.Proto.Transaction.ERC20Transfer.create({
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
    });
  };

  public getSignedTransaction = (
    transaction: TransactionProps,
    signature: SignatureProps,
    inputData: Uint8Array,
    vault: VaultProps
  ): Promise<string> => {
    return new Promise((resolve) => {
      let tx = {};
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

      tx = transaction.data ? { ...props, data: transaction.data } : props;
      const txHash = keccak256(Transaction.from(tx).serialized);
      resolve(txHash);
    });
  };
}
