import type { Signer, TransactionRequest } from "ethers";
import {
  BASE_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_TYPE,
  TYI_USD_PAYMENT_COIN,
} from "@tychilabs/ugf-testnet-js";
import { ensureAuth } from "./client";
import { UGFPaymentToken } from "./types";
import { DEFAULT_UGF_MODE, normalizeMode, type UGFMode } from "./mode";

export interface GetQuoteParams {
  signer: Signer;
  tx: TransactionRequest;

  paymentToken: UGFPaymentToken;

  paymentChainId: string; // where user pays (current chain)
  destChainId: string; // where tx executes
  mode?: UGFMode;
}

export async function getUGFQuote(params: GetQuoteParams) {
  const {
    signer,
    tx,
    paymentToken,
    paymentChainId,
    destChainId,
    mode = DEFAULT_UGF_MODE,
  } = params;
  const normalizedMode = normalizeMode(mode);

  const client = await ensureAuth(signer, normalizedMode);

  const payerAddress = await signer.getAddress();

  // serialize tx properly
  const txObject = {
    from: payerAddress,
    to: tx.to,
    data: tx.data ?? "0x",
    value: tx.value ? tx.value.toString() : "0",
  };

  const quote = await client.quote.get({
    payment_coin:
      normalizedMode === "testnet" ? TYI_USD_PAYMENT_COIN : paymentToken,
    payer_address: payerAddress,
    payment_chain:
      normalizedMode === "testnet" ? BASE_SEPOLIA_CHAIN_ID : paymentChainId,
    payment_chain_type:
      normalizedMode === "testnet" ? BASE_SEPOLIA_CHAIN_TYPE : "evm",

    tx_object: JSON.stringify(txObject),

    dest_chain_id:
      normalizedMode === "testnet" ? BASE_SEPOLIA_CHAIN_ID : destChainId,
    dest_chain_type:
      normalizedMode === "testnet" ? BASE_SEPOLIA_CHAIN_TYPE : "evm",
  });

  return quote;
}
