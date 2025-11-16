import { safeProxy } from "ponder:schema";
import { HandlerParams } from "../type/HandlerParams";

// Type-safe handler for SafeSetup events
export const SafeSetupHandler = async ({
  event,
  context,
}: HandlerParams<"SafeProxyWorldChain:SafeSetup"> | HandlerParams<"SafeProxyMainnet:SafeSetup">) => {
  // Determine chain prefix based on context
  const chainPrefix = context.chain.name === "worldchain" ? "world" : "mainnet";
  const safeProxyId = `${chainPrefix}:${event.log.address as `0x${string}`}`;

  // Type guard: SafeSetup event args have owners, threshold, and initializer
  if ("owners" in event.args && "threshold" in event.args && "initializer" in event.args) {
    await context.db.insert(safeProxy).values({
      id: safeProxyId,
      address: event.log.address as `0x${string}`,
      owners: event.args.owners as `0x${string}`[],
      threshold: event.args.threshold as bigint,
      createdAt: new Date(),
      createdBy: event.args.initializer as `0x${string}`,
    });

    console.log(`SafeProxy ${context.chain.name}: ${safeProxyId}`);
  }
};