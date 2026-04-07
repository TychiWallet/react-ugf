import { ethers } from "ethers";

export async function switchChain(signer: ethers.Signer, chainId: string) {
  const provider = signer.provider as ethers.BrowserProvider;
  await provider.send("wallet_switchEthereumChain", [
    { chainId: "0x" + parseInt(chainId).toString(16) },
  ]);
}