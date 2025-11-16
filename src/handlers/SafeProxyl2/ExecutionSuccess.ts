import { safeProxy } from "ponder:schema";
import { MultiChainHandlerParams } from "../type/HandlerParams";
import { createChainPrefixedId } from "../../utils/chainPrefix";

// Type-safe handler for ExecutionSuccess events (works for all chains automatically!)
export const ExecutionSuccessHandler = async ({
  event,
  context,
}: MultiChainHandlerParams<"ExecutionSuccess">) => {
  // Get chain-prefixed ID (scalable for any number of chains)
  const safeProxyId = createChainPrefixedId(
    context.chain.name,
    event.log.address as `0x${string}`,
  );

  console.log(`ExecutionSuccess ${context.chain.name}: ${safeProxyId}`);
};
