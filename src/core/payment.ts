import type { Signer } from "ethers";
import { ensureAuth } from "./client";
import { UGFPaymentToken } from "./types";
import { DEFAULT_UGF_MODE, type UGFMode } from "./mode";

export async function executeX402Payment(params: {
  signer: Signer;
  quote: any;
  token: UGFPaymentToken;
  mode?: UGFMode;
}) {
  const { signer, quote, token, mode = DEFAULT_UGF_MODE } = params;

  const client = await ensureAuth(signer, mode);

  await client.payment.x402.execute({
    quote,
    signer,
    token,
  });
}
