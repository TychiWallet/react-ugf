import { ethers } from "ethers";

const CHAIN_CONFIGS: Record<string, object> = {
  "84532": {
    chainId: "0x14a34",
    chainName: "Base Sepolia",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
};

export async function switchChain(signer: ethers.Signer, chainId: string) {
  const provider = signer.provider as ethers.BrowserProvider;
  const hexChainId = "0x" + parseInt(chainId).toString(16);

  const network = await provider.getNetwork();
  if (String(network.chainId) === chainId) return;

  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: hexChainId }]);
  } catch (err: unknown) {
    const isUnknownChain =
      JSON.stringify(err).includes("4902") ||
      JSON.stringify(err).includes("wallet_switchEthereumChain first");

    if (isUnknownChain && CHAIN_CONFIGS[chainId]) {
      await provider.send("wallet_addEthereumChain", [CHAIN_CONFIGS[chainId]]);
    } else {
      throw err;
    }
  }
}
