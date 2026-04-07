import React, { createContext, useContext, useState } from "react";
import type { Signer, TransactionRequest } from "ethers";
import { getChains } from "../core/chains";
import { switchChain } from "../core/switchChain";
import { useUGF } from "../hooks/useUGF";
import { UGFModal } from "./UGFModal";

type UGFParams = {
  signer: Signer;
  tx: TransactionRequest;
  destChainId: string;
};

type UGFResult = { txHash: string };

type UGFContextType = {
  openUGF: (params: UGFParams) => void;
  result: UGFResult | null;
};

const UGFContext = createContext<UGFContextType | null>(null);

export function useUGFModal() {
  const ctx = useContext(UGFContext);
  if (!ctx) throw new Error("UGFProvider missing");
  return ctx;
}

export function UGFProvider({ children }: { children: React.ReactNode }) {
  const { run, step, loading, error } = useUGF();

  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<UGFParams | null>(null);
  const [result, setResult] = useState<UGFResult | null>(null);

  async function openUGF(p: UGFParams) {
    const chains = await getChains();
    const isSupported = chains.some(
      (c: any) => c.chain_type === "evm" && c.chain_id === p.destChainId,
    );

    if (!isSupported) {
      const tx = await p.signer.sendTransaction(p.tx);
      setResult({ txHash: tx.hash });
      return;
    }

    setParams(p);
    setOpen(true);
  }

  async function handleConfirm(token: string, paymentChainId: string) {
    if (!params) return;

    // switch to payment chain before run
    await switchChain(params.signer, paymentChainId);

    const res = await run({
      signer: params.signer,
      tx: params.tx,
      token,
      paymentChainId,
      destChainId: params.destChainId,
      onSuccess: (r) => setResult(r),
    });
    await new Promise((r) => setTimeout(r, 2000));
    setOpen(false);
    return res;
  }

  async function handleFallback() {
    if (!params) return;
    const tx = await params.signer.sendTransaction(params.tx);
    setResult({ txHash: tx.hash });
    setOpen(false);
  }

  return (
    <UGFContext.Provider value={{ openUGF, result }}>
      {children}
      <UGFModal
        open={open}
        onClose={() => setOpen(false)}
        onFallback={handleFallback}
        step={step}
        loading={loading}
        error={error}
        onConfirm={handleConfirm}
        signer={params?.signer ?? null}
        tx={params?.tx ?? null}
        destChainId={params?.destChainId ?? ""}
      />
    </UGFContext.Provider>
  );
}
