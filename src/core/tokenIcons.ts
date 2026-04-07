const BASE =
  "https://raw.githubusercontent.com/TychiWallet/Wallet-Assets/main/x402_tokens";

export function getTokenIcon(symbol: string) {
  const key = symbol.toLowerCase();

  if (key === "usdc") return `${BASE}/usdc-logo.png`;
  if (key === "eurc") return `${BASE}/eurc-logo.png`;
  if (key === "$u" || key === "u") return `${BASE}/u-logo.png`;

  return "";
}