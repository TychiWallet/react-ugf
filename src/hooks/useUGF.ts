import { useState } from "react";
import type { Signer, TransactionRequest } from "ethers";
import { ensureAuth } from "../core/client";
import { getUGFQuote } from "../core/quote";
import { executeX402Payment } from "../core/payment";
import { switchChain } from "../core/switchChain";
import { DEFAULT_UGF_MODE, type UGFMode } from "../core/mode";

export function useUGF(mode: UGFMode = DEFAULT_UGF_MODE) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<
    "idle" | "quote" | "payment" | "execute" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function run(params: {
    signer: Signer;
    tx: TransactionRequest;
    token: string;
    paymentChainId: string;
    destChainId: string;
    onSuccess?: (res: { txHash: string }) => void;
    onError?: (err: any) => void;
  }) {
    const {
      signer,
      tx,
      token,
      paymentChainId,
      destChainId,
      onSuccess,
      onError,
    } = params;

    try {
      setLoading(true);
      setError(null);

      // 1. quote
      setStep("quote");
      const quote = await getUGFQuote({
        signer,
        tx,
        paymentToken: token,
        paymentChainId,
        destChainId,
        mode,
      });
      // 2. payment
      setStep("payment");
      console.log("[ugf] submitting payment...");
      await executeX402Payment({ signer, quote, token, mode });
      console.log("[ugf] payment submitted...");

      setStep("execute");
      const client = await ensureAuth(signer, mode);
      const { userTxHash } = await client.chains.evm.sponsorAndExecute(
        quote.digest,
        signer,
        async (s) => {
          await switchChain(s, destChainId);
          const freshSigner = await (s.provider as any).getSigner();

          if (mode === "testnet") {
            // Testnet SDK broadcasts itself — return unsigned TransactionRequest only.
            return {
              to: tx.to as string,
              data: (tx.data as string) ?? "0x",
              value: tx.value ? BigInt(tx.value.toString()) : 0n,
            } as any;
          }

          const gasLimit = await freshSigner.estimateGas(tx);

          // Mainnet SDK trusts returned {hash, wait} — broadcast here.
          // bypass ethers internal getNetwork check
          const txHash = await (freshSigner.provider as any).send(
            "eth_sendTransaction",
            [
              {
                from: await freshSigner.getAddress(),
                to: tx.to as string,
                data: (tx.data as string) ?? "0x",
                value: tx.value
                  ? "0x" + BigInt(tx.value.toString()).toString(16)
                  : "0x0",
                gas: "0x" + gasLimit.toString(16),
              },
            ],
          );

          return {
            hash: txHash,
            wait: async () => ({ hash: txHash, status: 1 }),
          } as any;
        },
      );

      setStep("success");
      const result = { txHash: userTxHash };

      onSuccess?.(result);
      return result;
    } catch (e: any) {
      setStep("error");
      setError(e?.message || "Something went wrong");
      onError?.(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { run, loading, step, error };
}
