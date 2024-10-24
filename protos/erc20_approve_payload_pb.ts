// @generated by protoc-gen-es v2.1.0 with parameter "target=ts"
// @generated from file erc20_approve_payload.proto (package keysign, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file erc20_approve_payload.proto.
 */
export const file_erc20_approve_payload: GenFile = /*@__PURE__*/
  fileDesc("ChtlcmMyMF9hcHByb3ZlX3BheWxvYWQucHJvdG8SB2tleXNpZ24iNgoTRXJjMjBBcHByb3ZlUGF5bG9hZBIOCgZhbW91bnQYASABKAkSDwoHc3BlbmRlchgCIAEoCWIGcHJvdG8z");

/**
 * @generated from message keysign.Erc20ApprovePayload
 */
export type Erc20ApprovePayload = Message<"keysign.Erc20ApprovePayload"> & {
  /**
   * @generated from field: string amount = 1;
   */
  amount: string;

  /**
   * @generated from field: string spender = 2;
   */
  spender: string;
};

/**
 * Describes the message keysign.Erc20ApprovePayload.
 * Use `create(Erc20ApprovePayloadSchema)` to create a new message.
 */
export const Erc20ApprovePayloadSchema: GenMessage<Erc20ApprovePayload> = /*@__PURE__*/
  messageDesc(file_erc20_approve_payload, 0);

