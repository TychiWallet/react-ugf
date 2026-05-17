export type UGFMode = "mainnet" | "testnet";

export const DEFAULT_UGF_MODE: UGFMode = "mainnet";

export function normalizeMode(mode?: UGFMode): UGFMode {
  return mode ?? DEFAULT_UGF_MODE;
}
