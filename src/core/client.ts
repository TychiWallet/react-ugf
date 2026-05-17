import { UGFClient as MainnetUGFClient } from "@tychilabs/ugf-sdk";
import { UGFClient as TestnetUGFClient } from "@tychilabs/ugf-testnet-js";
import type { Signer } from "ethers";
import { UGF_CONFIG } from "./config";
import { DEFAULT_UGF_MODE, normalizeMode, type UGFMode } from "./mode";

type AnyUGFClient = MainnetUGFClient | TestnetUGFClient;

const clients: Partial<Record<UGFMode, AnyUGFClient>> = {};
const authenticatedAddresses: Partial<Record<UGFMode, string | null>> = {};
const authInFlight: Partial<Record<UGFMode, Promise<AnyUGFClient> | null>> = {};
const STORAGE_PREFIX = "ugf_auth";

function getStorageKey(mode: UGFMode) {
  return `${STORAGE_PREFIX}:${mode}`;
}

export function getClient(mode: UGFMode = DEFAULT_UGF_MODE): AnyUGFClient {
  const normalizedMode = normalizeMode(mode);

  if (!clients[normalizedMode]) {
    clients[normalizedMode] =
      normalizedMode === "testnet"
        ? new TestnetUGFClient()
        : new MainnetUGFClient({ baseUrl: UGF_CONFIG.BASE_URL });
  }

  return clients[normalizedMode] as AnyUGFClient;
}

export async function ensureAuth(
  signer: Signer,
  mode: UGFMode = DEFAULT_UGF_MODE,
): Promise<AnyUGFClient> {
  const normalizedMode = normalizeMode(mode);
  const currentAddress = await signer.getAddress();
  const c = getClient(normalizedMode);
  const storageKey = getStorageKey(normalizedMode);

  // 1. check localStorage
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);

      if (parsed.address === currentAddress && parsed.expiry > Date.now()) {
        authenticatedAddresses[normalizedMode] = currentAddress;

        // reuse token properly
        c.auth.setToken(parsed.token);

        return c;
      }
    } catch {}
  }

  // 2. in-memory reuse
  if (
    authenticatedAddresses[normalizedMode] === currentAddress &&
    c.auth.getToken()
  ) {
    return c;
  }

  // 3. lock
  if (authInFlight[normalizedMode]) {
    return authInFlight[normalizedMode] as Promise<AnyUGFClient>;
  }

  authInFlight[normalizedMode] = (async () => {
    try {
      // login -> returns token
      const token = await c.auth.login(signer);

      // persist (24h)
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          address: currentAddress,
          token,
          expiry: Date.now() + 24 * 60 * 60 * 1000,
        }),
      );

      authenticatedAddresses[normalizedMode] = currentAddress;

      return c;
    } finally {
      authInFlight[normalizedMode] = null;
    }
  })();

  return authInFlight[normalizedMode] as Promise<AnyUGFClient>;
}
