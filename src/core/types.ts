export type UGFPaymentToken = string;

export interface RegistryChain {
  chain_id: string;
  chain_type: "evm";
  address: string;
}

export interface RegistryOption {
  token: UGFPaymentToken;
  type: "x402";
  chain_type: "evm";
  receiver_address: string;
  chains: RegistryChain[];
}

export interface UgfRegistryResponse {
  payment_options: RegistryOption[];
}

/* ---------- NORMALIZED (used internally) ---------- */

export interface NormalizedPaymentOption {
  token: UGFPaymentToken;
  chainId: string;

  // ERC20 address on that chain
  tokenAddress: string;

  // x402 receiver
  receiver: string;
}

/* ---------- EXECUTION INPUT ---------- */

import type { Signer, TransactionRequest } from "ethers";

export interface UGFExecuteParams {
  signer: Signer;
  tx: TransactionRequest;

  // selected token by user
  token: UGFPaymentToken;
}
