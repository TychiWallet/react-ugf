import { UGFClient } from "@tychilabs/ugf-sdk";
import type { Signer } from "ethers";
import { UGF_CONFIG } from "./config";

let client: UGFClient | null = null;
let authenticatedAddress: string | null = null;
let authInFlight: Promise<UGFClient> | null = null;

const STORAGE_KEY = "ugf_auth";

function getClient() {
  if (!client) {
    client = new UGFClient({ baseUrl: UGF_CONFIG.BASE_URL });
  }
  return client;
}

export async function ensureAuth(signer: Signer): Promise<UGFClient> {
  const currentAddress = await signer.getAddress();
  const c = getClient();

  // 1. check localStorage
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);

      if (
        parsed.address === currentAddress &&
        parsed.expiry > Date.now()
      ) {
        authenticatedAddress = currentAddress;

        // reuse token properly
        c.auth.setToken(parsed.token);

        return c;
      }
    } catch {}
  }

  // 2. in-memory reuse
  if (authenticatedAddress === currentAddress && c.auth.getToken()) {
    return c;
  }

  // 3. lock
  if (authInFlight) return authInFlight;

  authInFlight = (async () => {
    // login → returns token
    const token = await c.auth.login(signer);

    // persist (24h)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        address: currentAddress,
        token,
        expiry: Date.now() + 24 * 60 * 60 * 1000,
      })
    );

    authenticatedAddress = currentAddress;
    authInFlight = null;

    return c;
  })();

  return authInFlight;
}