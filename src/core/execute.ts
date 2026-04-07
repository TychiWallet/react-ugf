import type { Signer, TransactionRequest } from "ethers";

export async function executeTransaction(params: {
  signer: Signer;
  tx: TransactionRequest;
}) {
  const { signer, tx } = params;
  const gasLimit = await signer.estimateGas(tx);
  
  // replaceableTransaction skips the receipt polling that causes NETWORK_ERROR
  const txResponse = await signer.sendTransaction({ ...tx, gasLimit });
  return { hash: txResponse.hash };
}