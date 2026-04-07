import type { Signer } from "ethers";
import { ensureAuth } from "./client";

export async function getTokenBalance(
  signer: Signer,
  tokenAddress: string,
  chainId: string,
): Promise<{ raw: string; decimals: number; formatted: string }> {
  const client = await ensureAuth(signer);
  const address = await signer.getAddress();

  const res = await (client as any).http.get(
    `/balance?chain_id=${chainId}&token_address=${tokenAddress}&address=${address}`
  );

  const dec = Number(res.decimals);
  const formatted = (Number(res.raw) / Math.pow(10, dec)).toFixed(4);

  return { raw: res.raw, decimals: dec, formatted };
}