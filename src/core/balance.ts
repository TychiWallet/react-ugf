import { Contract, JsonRpcProvider, formatUnits, type Signer } from "ethers";
import { ensureAuth } from "./client";
import { DEFAULT_UGF_MODE, type UGFMode } from "./mode";

const BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export async function getTokenBalance(
  signer: Signer,
  tokenAddress: string,
  chainId: string,
  mode: UGFMode = DEFAULT_UGF_MODE,
): Promise<{ raw: string; decimals: number; formatted: string }> {
  if (mode === "testnet") {
    const address = await signer.getAddress();
    const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
    const token = new Contract(tokenAddress, ERC20_ABI, provider);
    const [raw, decimals] = await Promise.all([
      token.balanceOf(address),
      token.decimals(),
    ]);

    return {
      raw: raw.toString(),
      decimals: Number(decimals),
      formatted: Number(formatUnits(raw, decimals)).toFixed(4),
    };
  }

  const client = await ensureAuth(signer, mode);
  const address = await signer.getAddress();

  const res = await (client as any).http.get(
    `/balance?chain_id=${chainId}&token_address=${tokenAddress}&address=${address}`,
  );

  const dec = Number(res.decimals);
  const formatted = (Number(res.raw) / Math.pow(10, dec)).toFixed(4);

  return { raw: res.raw, decimals: dec, formatted };
}
