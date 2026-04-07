import { UGF_CONFIG } from "./config";

let chainsCache: any[] | null = null;

export async function getChains() {
  if (chainsCache) return chainsCache;

  const res = await fetch(
    `${UGF_CONFIG.BASE_URL}${UGF_CONFIG.ENDPOINTS.CHAINS}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch chains");
  }

  const data = await res.json();

  chainsCache = data;

  return data;
}