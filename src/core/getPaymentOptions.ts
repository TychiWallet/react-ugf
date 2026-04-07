import { fetchRegistry } from "./registry";
import { normalizeRegistry } from "./normalize";
import { NormalizedPaymentOption } from "./types";

async function getPaymentOptions(
  currentChainId: string,
): Promise<NormalizedPaymentOption[]> {
  const registry = await fetchRegistry();

  const options = normalizeRegistry(registry, currentChainId);

  return options;
}

const cache: Record<string, any[]> = {};

export async function getCachedPaymentOptions(chainId: string) {
  if (cache[chainId]) return cache[chainId];

  const data = await getPaymentOptions(chainId);

  cache[chainId] = data;

  return data;
}
