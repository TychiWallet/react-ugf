import React, { useEffect, useState, useRef } from "react";
import type { Signer, TransactionRequest } from "ethers";
import { getAllPaymentOptions, type TokenOption } from "../core/normalizeAll";
import { getUGFQuote } from "../core/quote";
import { getTokenBalance } from "../core/balance";
import { getTokenIcon } from "../core/tokenIcons";
import { EVM_CHAIN_NAMES } from "../core/evm_chain_names";
import { DEFAULT_UGF_MODE, type UGFMode } from "../core/mode";

interface Props {
  open: boolean;
  onClose: () => void;
  onFallback: () => void;
  step: "idle" | "quote" | "payment" | "execute" | "success" | "error";
  loading: boolean;
  error: string | null;
  onConfirm: (token: string, paymentChainId: string) => void;
  signer: Signer | null;
  tx: TransactionRequest | null;
  destChainId: string;
  mode?: UGFMode;
}

interface Selection {
  token: string;
  chainId: string;
  tokenAddress: string;
}

function ExecuteStep() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
        Confirm transaction in your wallet{dots}
      </p>
      <p
        style={{
          fontSize: 11,
          color: "#aaa",
          margin: 0,
          fontFamily: "monospace",
        }}
      >
        UGF is sponsoring gas{dots}
      </p>
    </div>
  );
}

export function UGFModal({
  open,
  onClose,
  onFallback,
  step,
  loading,
  error,
  onConfirm,
  signer,
  tx,
  destChainId,
  mode = DEFAULT_UGF_MODE,
}: Props) {
  const [options, setOptions] = useState<TokenOption[]>([]);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [quote, setQuote] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [decimals, setDecimals] = useState<number>(6);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const balanceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  useEffect(() => {
    if (step !== "success") return;
    const timer = setTimeout(() => onClose(), 2000);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setQuote("");
    setBalance("");
    setOptionsLoading(true);

    getAllPaymentOptions(mode)
      .then((opts) => {
        setOptions(opts);
        if (opts.length > 0 && opts[0].chains.length > 0) {
          handleSelect(
            opts[0].token,
            opts[0].chains[0].chainId,
            opts[0].chains[0].tokenAddress,
          );
        }
      })
      .finally(() => setOptionsLoading(false));
  }, [open, mode]);

  async function handleSelect(
    token: string,
    chainId: string,
    tokenAddress: string,
  ) {
    if (balanceIntervalRef.current) clearInterval(balanceIntervalRef.current);
    setSelected({ token, chainId, tokenAddress });
    setQuote("");
    setBalance("");

    if (!signer || !tx) return;

    setQuoteLoading(true);

    // fetch quote
    try {
      const q = await getUGFQuote({
        signer,
        tx,
        paymentToken: token,
        paymentChainId: chainId,
        destChainId,
        mode,
      });
      setQuote(q?.payment_amount ?? "");
    } catch (e) {
      console.error("[ugf] quote failed", e);
    } finally {
      setQuoteLoading(false);
    }

    // balance fetcher
    const fetchBalance = async () => {
      if (!signer) return;
      try {
        const bal = await getTokenBalance(signer, tokenAddress, chainId, mode);
        setDecimals(bal.decimals);
        setBalance(bal.formatted);
      } catch {
        setBalance("—");
      }
    };

    await fetchBalance();
    balanceIntervalRef.current = setInterval(fetchBalance, 2000);
  }

  function formatAmount(raw: string): string {
    const num = Number(raw) / Math.pow(10, decimals);
    return num.toFixed(4);
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: 360,
          marginBottom: 32,
          borderRadius: 16,
          backgroundColor: "#fff",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          border: "1px solid #e5e5e5",
          overflow: "hidden",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
            Pay Gas
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "#999",
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{ padding: "12px 16px", maxHeight: 380, overflowY: "auto" }}
        >
          {step === "idle" &&
            (optionsLoading ? (
              <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                Loading options...
              </p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {options.map((opt) => (
                  <div key={opt.token}>
                    {/* Token label */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          overflow: "hidden",
                          backgroundColor: "#f5f5f5",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={getTokenIcon(opt.token)}
                          alt={opt.token}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: "#111" }}
                      >
                        {opt.token}
                      </span>
                    </div>

                    {/* Chain pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {opt.chains.map((chain) => {
                        const isSelected =
                          selected?.token === opt.token &&
                          selected?.chainId === chain.chainId;
                        return (
                          <button
                            key={chain.chainId}
                            onClick={() =>
                              handleSelect(
                                opt.token,
                                chain.chainId,
                                chain.tokenAddress,
                              )
                            }
                            style={{
                              padding: "4px 10px",
                              borderRadius: 20,
                              border: isSelected
                                ? "1px solid #111"
                                : "1px solid #e5e5e5",
                              backgroundColor: isSelected ? "#111" : "#fff",
                              color: isSelected ? "#fff" : "#555",
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            {EVM_CHAIN_NAMES[chain.chainId] ?? chain.chainId}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Selected summary */}
                {selected && (
                  <div
                    style={{
                      marginTop: 4,
                      padding: "10px 12px",
                      borderRadius: 12,
                      backgroundColor: "#f9f9f9",
                      border: "1px solid #eee",
                    }}
                  >
                    {quoteLoading ? (
                      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                        Fetching quote...
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                          }}
                        >
                          <span style={{ color: "#888" }}>Gas cost</span>
                          <span style={{ color: "#111", fontWeight: 600 }}>
                            {quote
                              ? `${formatAmount(quote)} ${selected.token}`
                              : "—"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                          }}
                        >
                          <span style={{ color: "#888" }}>Your balance</span>
                          <span
                            style={{
                              color:
                                balance !== "—" &&
                                quote &&
                                Number(balance) < Number(formatAmount(quote))
                                  ? "#dc2626"
                                  : "#111",
                              fontWeight: 600,
                            }}
                          >
                            {balance ? `${balance} ${selected.token}` : "—"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                          }}
                        >
                          <span style={{ color: "#888" }}>Paying from</span>
                          <span style={{ color: "#111", fontWeight: 600 }}>
                            {EVM_CHAIN_NAMES[selected.chainId] ??
                              selected.chainId}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

          {step === "quote" && (
            <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
              Preparing quote...
            </p>
          )}
          {step === "payment" && (
            <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
              Confirm gas payment in your wallet...
            </p>
          )}
          {step === "execute" && <ExecuteStep />}
          {step === "success" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <p
                style={{
                  fontSize: 13,
                  color: "#16a34a",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                ✅ Transaction complete
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "#aaa",
                  margin: 0,
                  fontFamily: "monospace",
                }}
              >
                Thank you for using UGF
              </p>
            </div>
          )}
          {step === "error" && (
            <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        {step === "idle" && (
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <button
              disabled={
                !selected ||
                quoteLoading ||
                (balance !== "—" &&
                  quote !== "" &&
                  Number(balance) < Number(formatAmount(quote)))
              }
              onClick={() =>
                selected && onConfirm(selected.token, selected.chainId)
              }
              style={{
                width: "100%",
                height: 40,
                borderRadius: 12,
                backgroundColor:
                  !selected ||
                  quoteLoading ||
                  (balance !== "—" &&
                    quote !== "" &&
                    Number(balance) < Number(formatAmount(quote)))
                    ? "#ccc"
                    : "#111",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor:
                  !selected ||
                  quoteLoading ||
                  (balance !== "—" &&
                    quote !== "" &&
                    Number(balance) < Number(formatAmount(quote)))
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {quoteLoading
                ? "Fetching quote..."
                : balance !== "—" &&
                    quote !== "" &&
                    Number(balance) < Number(formatAmount(quote))
                  ? "Insufficient balance"
                  : "Confirm"}
            </button>

            <button
              onClick={onFallback}
              style={{
                width: "100%",
                height: 40,
                borderRadius: 12,
                backgroundColor: "#fff",
                color: "#111",
                fontSize: 13,
                border: "1px solid #e5e5e5",
                cursor: "pointer",
              }}
            >
              Use normal transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
