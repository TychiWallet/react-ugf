import { UgfRegistryResponse } from "./types";
import { UGF_CONFIG } from "./config";

export async function fetchRegistry(): Promise<UgfRegistryResponse> {
  const url = `${UGF_CONFIG.BASE_URL}${UGF_CONFIG.ENDPOINTS.REGISTRY}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch UGF registry");
  }

  return (await res.json()) as UgfRegistryResponse;
}