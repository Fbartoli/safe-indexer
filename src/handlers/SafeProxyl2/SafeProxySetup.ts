import { safeProxy } from "ponder:schema";
import { MultiChainHandlerParams } from "../type/HandlerParams";
import { createChainPrefixedId } from "../../utils/chainPrefix";

// Type-safe handler for SafeSetup events (works for all chains automatically!)
export const SafeSetupHandler = async ({
  event,
  context,
}: MultiChainHandlerParams<"SafeSetup">) => {
  // Get chain-prefixed ID (scalable for any number of chains)
  const safeProxyId = createChainPrefixedId(
    context.chain.name,
    event.log.address as `0x${string}`,
  );

  await context.db.insert(safeProxy).values({
    id: safeProxyId,
    address: event.log.address as `0x${string}`,
    owners: event.args.owners as `0x${string}`[],
    threshold: event.args.threshold as bigint,
    createdAt: new Date(),
    createdBy: event.args.initializer as `0x${string}`,
  });
};
