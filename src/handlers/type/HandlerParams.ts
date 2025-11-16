import { ponder } from "ponder:registry";

// Define your contract prefixes here - add new chains as you add them to ponder.config.ts
// This should match the contract naming pattern: SafeProxy{ChainName}
type ContractPrefix = "SafeProxyMainnet" | "SafeProxyWorldChain";
// Add more as needed: | "SafeProxyPolygon" | "SafeProxyArbitrum" | "SafeProxyOptimism"

// Define all event names that your contracts emit
type EventName =
  | "SafeSetup"
  | "ExecutionSuccess"
  | "AddedOwner"
  | "RemovedOwner"
  | "ChangedThreshold"
  | "ChangedGuard"
  | "ChangedFallbackHandler";

// Helper type to extract handler parameters from any ponder.on event
type HandlerParamsSingle<T extends `${ContractPrefix}:${EventName}`> =
  Parameters<Parameters<typeof ponder.on<T>>[1]>[0];

/**
 * Scalable handler params type that automatically includes all chains for a given event.
 *
 * Usage:
 * - MultiChainHandlerParams<"SafeSetup"> - includes all chains for SafeSetup
 * - MultiChainHandlerParams<"ExecutionSuccess"> - includes all chains for ExecutionSuccess
 *
 * When you add a new chain, just add it to ContractPrefix above and it will automatically
 * be included in all handler params!
 */
export type MultiChainHandlerParams<Event extends EventName> =
  HandlerParamsSingle<`${ContractPrefix}:${Event}`>;

// Keep the single-chain version for backward compatibility or specific use cases
export type HandlerParams<T extends `${ContractPrefix}:${EventName}`> =
  HandlerParamsSingle<T>;
