import { UgfRegistryResponse, NormalizedPaymentOption } from "./types";

export function normalizeRegistry(
  registry: UgfRegistryResponse,
  currentChainId: string,
): NormalizedPaymentOption[] {
  return (
    registry.payment_options
      // only x402
      .filter((option) => option.type === "x402")

      // flatten
      .flatMap((option) =>
        option.chains
          // only current chain
          .filter((chain) => chain.chain_id === currentChainId)

          // map to flat structure
          .map((chain) => ({
            token: option.token,
            chainId: chain.chain_id,
            tokenAddress: chain.address,
            receiver: option.receiver_address,
          })),
      )
  );
}
