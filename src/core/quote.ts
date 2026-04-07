import type { Signer, TransactionRequest } from "ethers";
import { ensureAuth } from "./client";
import { UGFPaymentToken } from "./types";

export interface GetQuoteParams {
  signer: Signer;
  tx: TransactionRequest;

  paymentToken: UGFPaymentToken;

  paymentChainId: string; // where user pays (current chain)
  destChainId: string; // where tx executes
}

export async function getUGFQuote(params: GetQuoteParams) {
  const { signer, tx, paymentToken, paymentChainId, destChainId } = params;

  const client = await ensureAuth(signer);

  const payerAddress = await signer.getAddress();

  // serialize tx properly
  const txObject = {
    from: payerAddress,
    to: tx.to,
    data: tx.data ?? "0x",
    value: tx.value ? tx.value.toString() : "0",
  };

  const quote = await client.quote.get({
    payment_coin: paymentToken,
    payer_address: payerAddress,
    payment_chain: paymentChainId,
    payment_chain_type: "evm",

    tx_object: JSON.stringify(txObject),

    dest_chain_id: destChainId,
    dest_chain_type: "evm",
  });

  return quote;
}
