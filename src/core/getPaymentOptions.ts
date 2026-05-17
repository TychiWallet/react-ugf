import { fetchRegistry } from "./registry";
import { normalizeRegistry } from "./normalize";
import { NormalizedPaymentOption } from "./types";
import {
  BASE_SEPOLIA_CHAIN_ID,
  TYI_USD_PAYMENT_COIN,
} from "@tychilabs/ugf-testnet-js";
import { DEFAULT_UGF_MODE, normalizeMode, type UGFMode } from "./mode";

async function getPaymentOptions(
  currentChainId: string,
  mode: UGFMode = DEFAULT_UGF_MODE,
): Promise<NormalizedPaymentOption[]> {
  const registry = await fetchRegistry(mode);

  const effectiveChainId =
    mode === "testnet" ? BASE_SEPOLIA_CHAIN_ID : currentChainId;

  const options = normalizeRegistry(registry, effectiveChainId).filter((o) =>
    mode === "testnet" ? o.token === TYI_USD_PAYMENT_COIN : true,
  );

  return options;
}

const cache: Record<string, any[]> = {};

export async function getCachedPaymentOptions(
  chainId: string,
  mode: UGFMode = DEFAULT_UGF_MODE,
) {
  const cacheKey = `${normalizeMode(mode)}:${chainId}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const data = await getPaymentOptions(chainId, mode);

  cache[cacheKey] = data;

  return data;
}
