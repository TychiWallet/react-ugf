import { fetchRegistry } from "./registry";

export interface TokenOption {
  token: string;
  chains: {
    chainId: string;
    tokenAddress: string;
    receiver: string;
  }[];
}

let cache: TokenOption[] | null = null;

export async function getAllPaymentOptions(): Promise<TokenOption[]> {
  if (cache) return cache;

  const registry = await fetchRegistry();

  cache = registry.payment_options
    .filter((o) => o.type === "x402")
    .map((o) => ({
      token: o.token,
      chains: o.chains.map((c) => ({
        chainId: c.chain_id,
        tokenAddress: c.address,
        receiver: o.receiver_address,
      })),
    }));

  return cache;
}