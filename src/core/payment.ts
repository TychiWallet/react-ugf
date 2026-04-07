import type { Signer } from "ethers";
import { ensureAuth } from "./client";
import { UGFPaymentToken } from "./types";

export async function executeX402Payment(params: {
  signer: Signer;
  quote: any;
  token: UGFPaymentToken;
}) {
  const { signer, quote, token } = params;

  const client = await ensureAuth(signer);

  await client.payment.x402.execute({
    quote,
    signer,
    token,
  });
}