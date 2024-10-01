// @generated by protoc-gen-es v2.1.0 with parameter "target=ts"
// @generated from file 1inch_swap_payload.proto (package keysign, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Coin } from "./coin_pb";
import { file_coin } from "./coin_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file 1inch_swap_payload.proto.
 */
export const file_1inch_swap_payload: GenFile = /*@__PURE__*/
  fileDesc("ChgxaW5jaF9zd2FwX3BheWxvYWQucHJvdG8SB2tleXNpZ24iawoST25lSW5jaFRyYW5zYWN0aW9uEgwKBGZyb20YASABKAkSCgoCdG8YAiABKAkSDAoEZGF0YRgDIAEoCRINCgV2YWx1ZRgEIAEoCRIRCglnYXNfcHJpY2UYBSABKAkSCwoDZ2FzGAYgASgDIksKDE9uZUluY2hRdW90ZRISCgpkc3RfYW1vdW50GAEgASgJEicKAnR4GAIgASgLMhsua2V5c2lnbi5PbmVJbmNoVHJhbnNhY3Rpb24irAEKEk9uZUluY2hTd2FwUGF5bG9hZBIgCglmcm9tX2NvaW4YASABKAsyDS5rZXlzaWduLkNvaW4SHgoHdG9fY29pbhgCIAEoCzINLmtleXNpZ24uQ29pbhITCgtmcm9tX2Ftb3VudBgDIAEoCRIZChF0b19hbW91bnRfZGVjaW1hbBgEIAEoCRIkCgVxdW90ZRgFIAEoCzIVLmtleXNpZ24uT25lSW5jaFF1b3RlYgZwcm90bzM", [file_coin]);

/**
 * @generated from message keysign.OneInchTransaction
 */
export type OneInchTransaction = Message<"keysign.OneInchTransaction"> & {
  /**
   * @generated from field: string from = 1;
   */
  from: string;

  /**
   * @generated from field: string to = 2;
   */
  to: string;

  /**
   * @generated from field: string data = 3;
   */
  data: string;

  /**
   * @generated from field: string value = 4;
   */
  value: string;

  /**
   * @generated from field: string gas_price = 5;
   */
  gasPrice: string;

  /**
   * @generated from field: int64 gas = 6;
   */
  gas: bigint;
};

/**
 * Describes the message keysign.OneInchTransaction.
 * Use `create(OneInchTransactionSchema)` to create a new message.
 */
export const OneInchTransactionSchema: GenMessage<OneInchTransaction> = /*@__PURE__*/
  messageDesc(file_1inch_swap_payload, 0);

/**
 * @generated from message keysign.OneInchQuote
 */
export type OneInchQuote = Message<"keysign.OneInchQuote"> & {
  /**
   * @generated from field: string dst_amount = 1;
   */
  dstAmount: string;

  /**
   * @generated from field: keysign.OneInchTransaction tx = 2;
   */
  tx?: OneInchTransaction;
};

/**
 * Describes the message keysign.OneInchQuote.
 * Use `create(OneInchQuoteSchema)` to create a new message.
 */
export const OneInchQuoteSchema: GenMessage<OneInchQuote> = /*@__PURE__*/
  messageDesc(file_1inch_swap_payload, 1);

/**
 * @generated from message keysign.OneInchSwapPayload
 */
export type OneInchSwapPayload = Message<"keysign.OneInchSwapPayload"> & {
  /**
   * @generated from field: keysign.Coin from_coin = 1;
   */
  fromCoin?: Coin;

  /**
   * @generated from field: keysign.Coin to_coin = 2;
   */
  toCoin?: Coin;

  /**
   * @generated from field: string from_amount = 3;
   */
  fromAmount: string;

  /**
   * @generated from field: string to_amount_decimal = 4;
   */
  toAmountDecimal: string;

  /**
   * @generated from field: keysign.OneInchQuote quote = 5;
   */
  quote?: OneInchQuote;
};

/**
 * Describes the message keysign.OneInchSwapPayload.
 * Use `create(OneInchSwapPayloadSchema)` to create a new message.
 */
export const OneInchSwapPayloadSchema: GenMessage<OneInchSwapPayload> = /*@__PURE__*/
  messageDesc(file_1inch_swap_payload, 2);
