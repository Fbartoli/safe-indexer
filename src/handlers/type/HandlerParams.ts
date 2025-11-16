import { ponder } from "ponder:registry";
// Helper type to extract handler parameters from any ponder.on event
export type HandlerParams<
  T extends
    | "SafeProxyMainnet:SafeSetup"
    | "SafeProxyWorldChain:SafeSetup"
    | "SafeProxyWorldChain:ExecutionSuccess"
    | "SafeProxyWorldChain:AddedOwner"
    | "SafeProxyWorldChain:RemovedOwner"
    | "SafeProxyWorldChain:ChangedThreshold"
    | "SafeProxyWorldChain:ChangedGuard"
    | "SafeProxyWorldChain:ChangedFallbackHandler"
> = Parameters<Parameters<typeof ponder.on<T>>[1]>[0];