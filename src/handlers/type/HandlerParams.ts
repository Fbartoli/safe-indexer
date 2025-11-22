import { ponder, type IndexingFunctionArgs } from "ponder:registry";

// Define your contract prefixes here - add new chains as you add them to ponder.config.ts
// This should match the contract naming pattern: SafeProxy{ChainName}
type ContractPrefix = "SafeProxyMainnet";
// Add more as needed: | "SafeProxyPolygon" | "SafeProxyArbitrum" | "SafeProxyOptimism"

// Define your account prefixes here - add new chains as you add them to ponder.config.ts
// This should match the account naming pattern: SafeAccount{ChainName}
type AccountPrefix = "SafeAccountMainnet";
// Add more as needed: | "SafeAccountPolygon" | "SafeAccountArbitrum" | "SafeAccountOptimism"

// Define all event names that your contracts emit
type ContractEventName =
  | "SafeSetup"
  | "ExecutionSuccess"
  | "AddedOwner"
  | "RemovedOwner"
  | "ChangedThreshold"
  | "ChangedGuard"
  | "ChangedFallbackHandler";

// Define transfer event names (account-level events)
// See: https://ponder.sh/docs/api-reference/ponder/indexing-functions#transfer-event
type TransferEventName = "transfer:to" | "transfer:from";

// Union of all event names (contract events + transfer events)
type EventName = ContractEventName | TransferEventName;

// Union of all prefixes (contracts + accounts)
type Prefix = ContractPrefix | AccountPrefix;

// Helper type to extract handler parameters from contract events
type ContractHandlerParams<T extends `${ContractPrefix}:${ContractEventName}`> =
  Parameters<Parameters<typeof ponder.on<T>>[1]>[0];

// Transfer event structure based on Ponder docs:
// https://ponder.sh/docs/api-reference/ponder/indexing-functions#transfer-event
type TransferEventStructure = {
  transfer: {
    from: `0x${string}`;
    to: `0x${string}`;
    value: bigint;
  };
  block: {
    number: bigint;
    timestamp: bigint;
    hash: `0x${string}`;
  };
  transaction: {
    hash: `0x${string}`;
    transactionIndex: number;
    to: `0x${string}` | null;
    value: bigint;
  };
  trace: {
    traceIndex: number;
    // ... other trace fields
  };
};

// Helper type to extract handler parameters from transfer events
// Uses manual type definition based on Ponder's TransferEvent structure
export type TransferHandlerParams<
  T extends `${AccountPrefix}:${TransferEventName}`,
> = {
  event: TransferEventStructure;
  context: IndexingFunctionArgs<"SafeProxyMainnet:SafeSetup">["context"];
};

// Helper type to extract handler parameters from any ponder.on event
// Uses explicit checks for each known pattern to help TypeScript inference
type HandlerParamsSingle<T extends `${Prefix}:${EventName}`> =
  T extends "SafeAccountMainnet:transfer:to"
    ? TransferHandlerParams<"SafeAccountMainnet:transfer:to">
    : T extends "SafeAccountMainnet:transfer:from"
      ? TransferHandlerParams<"SafeAccountMainnet:transfer:from">
      : T extends `${ContractPrefix}:${ContractEventName}`
        ? ContractHandlerParams<T & `${ContractPrefix}:${ContractEventName}`>
        : never;

/**
 * Scalable handler params type that automatically includes all chains for a given contract event.
 *
 * Usage:
 * - MultiChainHandlerParams<"SafeSetup"> - includes all chains for SafeSetup
 * - MultiChainHandlerParams<"ExecutionSuccess"> - includes all chains for ExecutionSuccess
 *
 * When you add a new chain, just add it to ContractPrefix above and it will automatically
 * be included in all handler params!
 *
 * Note: For transfer events, use HandlerParams directly with AccountPrefix.
 */
export type MultiChainHandlerParams<Event extends ContractEventName> =
  HandlerParamsSingle<`${ContractPrefix}:${Event}`>;

/**
 * Handler params type for any event (contract events or transfer events).
 *
 * Usage:
 * - HandlerParams<"SafeProxyMainnet:SafeSetup"> - for contract events
 * - HandlerParams<"SafeAccountMainnet:transfer:to"> - for incoming transfers
 * - HandlerParams<"SafeAccountMainnet:transfer:from"> - for outgoing transfers
 *
 * See: https://ponder.sh/docs/api-reference/ponder/indexing-functions#transfer-event
 */
export type HandlerParams<T extends `${Prefix}:${EventName}`> =
  HandlerParamsSingle<T>;
