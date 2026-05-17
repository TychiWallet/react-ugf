import { UGF_CONFIG } from "./config";
import { BASE_SEPOLIA_CHAIN_ID } from "@tychilabs/ugf-testnet-js";
import { DEFAULT_UGF_MODE, normalizeMode, type UGFMode } from "./mode";

const chainsCache: Partial<Record<UGFMode, any[]>> = {};

export async function getChains(mode: UGFMode = DEFAULT_UGF_MODE) {
  const normalizedMode = normalizeMode(mode);

  if (chainsCache[normalizedMode]) return chainsCache[normalizedMode];

  if (normalizedMode === "testnet") {
    const chains = [{ chain_type: "evm", chain_id: BASE_SEPOLIA_CHAIN_ID }];
    chainsCache[normalizedMode] = chains;
    return chains;
  }

  const res = await fetch(
    `${UGF_CONFIG.BASE_URL}${UGF_CONFIG.ENDPOINTS.CHAINS}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch chains");
  }

  const data = await res.json();

  chainsCache[normalizedMode] = data;

  return data;
}
