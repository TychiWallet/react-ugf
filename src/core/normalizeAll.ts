import { fetchRegistry } from "./registry";
import {
  BASE_SEPOLIA_CHAIN_ID,
  TYI_USD_PAYMENT_COIN,
} from "@tychilabs/ugf-testnet-js";
import { DEFAULT_UGF_MODE, type UGFMode } from "./mode";

function isMainnetHiddenToken(token: string) {
  const normalized = token.trim().toUpperCase();
  return normalized === "TYI" || normalized === "TYI_MOCK_USD";
}

export interface TokenOption {
  token: string;
  chains: {
    chainId: string;
    tokenAddress: string;
    receiver: string;
  }[];
}

const cacheByMode: Partial<Record<UGFMode, TokenOption[]>> = {};

export async function getAllPaymentOptions(
  mode: UGFMode = DEFAULT_UGF_MODE,
): Promise<TokenOption[]> {
  if (cacheByMode[mode]) return cacheByMode[mode] as TokenOption[];

  const registry = await fetchRegistry(mode);

  cacheByMode[mode] = registry.payment_options
    .filter((o) => {
      if (mode === "testnet") return o.token === TYI_USD_PAYMENT_COIN;
      return !isMainnetHiddenToken(o.token);
    })
    .filter((o) => o.type === "x402")
    .map((o) => ({
      token: o.token,
      chains: o.chains
        .filter((c) =>
          mode === "testnet" ? c.chain_id === BASE_SEPOLIA_CHAIN_ID : true,
        )
        .map((c) => ({
          chainId: c.chain_id,
          tokenAddress: c.address,
          receiver: o.receiver_address,
        })),
    }));

  return cacheByMode[mode] as TokenOption[];
}
