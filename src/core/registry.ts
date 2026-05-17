import { UgfRegistryResponse } from "./types";
import { UGF_CONFIG } from "./config";
import { getClient } from "./client";
import { DEFAULT_UGF_MODE, normalizeMode, type UGFMode } from "./mode";

export async function fetchRegistry(
  mode: UGFMode = DEFAULT_UGF_MODE,
): Promise<UgfRegistryResponse> {
  const normalizedMode = normalizeMode(mode);

  if (normalizedMode === "testnet") {
    return (await getClient(normalizedMode).registry.get()) as UgfRegistryResponse;
  }

  const url = `${UGF_CONFIG.BASE_URL}${UGF_CONFIG.ENDPOINTS.REGISTRY}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch UGF registry");
  }

  return (await res.json()) as UgfRegistryResponse;
}
