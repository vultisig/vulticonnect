import { create } from "@bufbuild/protobuf";
import { TW, type WalletCore } from "@trustwallet/wallet-core";
import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";
import Long from "long";
import {
  CosmosSpecificSchema,
  TransactionType,
  type CosmosSpecific,
} from "~protos/blockchain_specific_pb";
import { CoinSchema, type Coin } from "~protos/coin_pb";
import {
  KeysignPayloadSchema,
  type KeysignPayload,
} from "~protos/keysign_message_pb";
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import { ChainKey } from "~utils/constants";
import type {
  CosmosAccountData,
  SignatureProps,
  SpecificCosmos,
  TransactionProps,
  VaultProps,
} from "~utils/interfaces";
import api from "../../api";
import { createHash } from "crypto";
import { SignedTransactionResult } from "../../signed-transaction-result";
import { BaseTransactionProvider } from "../base-transaction-provider";

interface ChainRef {
  [chainKey: string]: CoinType;
}

export default class CosmosTransactionProvider extends BaseTransactionProvider {
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
  }

  public getSpecificTransactionInfo = (coin: Coin): Promise<SpecificCosmos> => {
    return new Promise<SpecificCosmos>(async (resolve) => {
      let defaultGas = 7500;
      if (coin.chain == ChainKey.DYDX) defaultGas = 2500000000000000;

      let result: SpecificCosmos = {
        gas: defaultGas,
        transactionType: 0,
        gasPrice: defaultGas,
        fee: defaultGas,
        accountNumber: 0,
        sequence: 0,
      };

      try {
        const account = await this.getAccountData(coin.address);
        if (account) {
          result.accountNumber = Number(account.accountNumber);
          result.sequence = Number(account.sequence);
        } else {
          console.error("No account data  found");
        }
      } catch (error) {
        console.error(error);
      }

      resolve(result);
    });
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
        hexPublicKey: vault.chains.find(
          (chain) => chain.name === transaction.chain.name
        ).derivationKey,
        isNativeToken: true,
        logo: transaction.chain.ticker.toLowerCase(),
      });
      this.getSpecificTransactionInfo(coin).then((specificData) => {
        const cosmosSpecific = create(CosmosSpecificSchema, {
          accountNumber: BigInt(specificData.accountNumber),
          sequence: BigInt(specificData.sequence),
          gas: BigInt(specificData.gas),
          transactionType: specificData.transactionType,
        });

        const keysignPayload = create(KeysignPayloadSchema, {
          toAddress: transaction.to,
          toAmount: transaction.value
            ? BigInt(parseInt(transaction.value)).toString()
            : "0",
          memo: transaction.data,
          vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
          vaultLocalPartyId: "VultiConnect",
          coin,
          blockchainSpecific: {
            case: "cosmosSpecific",
            value: cosmosSpecific,
          },
        });
        this.keysignPayload = keysignPayload;
        resolve(keysignPayload);
      });
    });
  };

  public getPreSignedInputData = (): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const cosmosSpecific = this.keysignPayload.blockchainSpecific
        .value as unknown as CosmosSpecific;
      const coinType = this.chainRef[this.chainKey];
      const pubKeyData = Buffer.from(
        this.keysignPayload.coin.hexPublicKey,
        "hex"
      );
      const toAddr = this.walletCore.AnyAddress.createWithString(
        this.keysignPayload.toAddress,
        coinType
      );

      if (!toAddr) {
        throw new Error("invalid to address");
      }

      const denom = this.denom();
      if (!denom) {
        console.error("denom is not defined");
        throw new Error("denom is not defined");
      }

      const message: TW.Cosmos.Proto.Message[] = [
        TW.Cosmos.Proto.Message.create({
          sendCoinsMessage: TW.Cosmos.Proto.Message.Send.create({
            fromAddress: this.keysignPayload.coin.address,
            toAddress: this.keysignPayload.toAddress,
            amounts: [
              TW.Cosmos.Proto.Amount.create({
                amount: this.keysignPayload.toAmount,
                denom: denom,
              }),
            ],
          }),
        }),
      ];

      const input = TW.Cosmos.Proto.SigningInput.create({
        publicKey: new Uint8Array(pubKeyData),
        signingMode: SigningMode.Protobuf,
        chainId: this.walletCore.CoinTypeExt.chainId(coinType),
        accountNumber: new Long(Number(cosmosSpecific.accountNumber)),
        sequence: new Long(Number(cosmosSpecific.sequence)),
        mode: BroadcastMode.SYNC,
        memo:
          cosmosSpecific.transactionType !== TransactionType.VOTE
            ? this.keysignPayload.memo || ""
            : "",
        messages: message,
        fee: TW.Cosmos.Proto.Fee.create({
          gas: new Long(200000),
          amounts: [
            TW.Cosmos.Proto.Amount.create({
              amount: cosmosSpecific.gas.toString(),
              denom: denom,
            }),
          ],
        }),
      });
      resolve(TW.Cosmos.Proto.SigningInput.encode(input).finish());
    });
  };

  public getSignedTransaction = (
    transaction: TransactionProps,
    signature: SignatureProps,
    inputData: Uint8Array,
    vault: VaultProps
  ): Promise<string> => {
    return new Promise((resolve) => {
      const coinType = this.walletCore.CoinType.thorchain;
      const allSignatures = this.walletCore.DataVector.create();
      const publicKeys = this.walletCore.DataVector.create();
      const pubkeyCosmos = vault.chains.find(
        (chain) => chain.name === transaction.chain.name
      ).derivationKey;
      const publicKeyData = Buffer.from(pubkeyCosmos, "hex");
      const modifiedSig = this.getSignature(signature);
      allSignatures.add(modifiedSig);
      publicKeys.add(publicKeyData);
      const compileWithSignatures =
        this.walletCore.TransactionCompiler.compileWithSignatures(
          coinType,
          inputData,
          allSignatures,
          publicKeys
        );
      const output = TW.Cosmos.Proto.SigningOutput.decode(
        compileWithSignatures
      );
      const serializedData = output.serialized;
      const parsedData = JSON.parse(serializedData);
      const txBytes = parsedData.tx_bytes;
      const decodedTxBytes = Buffer.from(txBytes, "base64");
      const hash = createHash("sha256")
        .update(decodedTxBytes as any)
        .digest("hex");
      const result = new SignedTransactionResult(
        serializedData,
        hash,
        undefined
      );
      resolve(result.transactionHash);
    });
  };

  protected getSignature(signature: SignatureProps): Uint8Array {
    const rData = this.walletCore.HexCoding.decode(signature.R);
    const sData = this.walletCore.HexCoding.decode(signature.S);
    const recoveryIDdata = this.walletCore.HexCoding.decode(
      signature.RecoveryID
    );
    const combinedData = new Uint8Array(
      rData.length + sData.length + recoveryIDdata.length
    );
    combinedData.set(rData);
    combinedData.set(sData, rData.length);
    combinedData.set(recoveryIDdata, rData.length + sData.length);
    return combinedData;
  }

  protected async getAccountData(
    address: string
  ): Promise<CosmosAccountData | null> {
    const url = this.accountNumberURL(address);
    if (!url) {
      return null;
    }
    return api.cosmos.getAccountData(url);
  }

  protected accountNumberURL(address: string): string | null {
    throw new Error("must override");
  }

  protected async calculateFee(_coin?: Coin): Promise<number> {
    throw new Error("not implemented");
  }

  protected denom(): string {
    throw new Error("must override");
  }
}
