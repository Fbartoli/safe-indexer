import { ponder } from "ponder:registry";
import { SafeSetupHandler } from "../handlers/SafeProxyl2/SafeProxySetup";
import { ExecutionSuccessHandler } from "../handlers/SafeProxyl2/ExecutionSuccess";

// Reuse the same handler for both chains
ponder.on("SafeProxyWorldChain:SafeSetup", SafeSetupHandler);
ponder.on("SafeProxyWorldChain:ExecutionSuccess", ExecutionSuccessHandler);
ponder.on("SafeProxyWorldChain:AddedOwner", async ({ event }) => {});
ponder.on("SafeProxyWorldChain:ChangedThreshold", async ({ event }) => {});
ponder.on("SafeProxyWorldChain:ChangedGuard", async ({ event }) => {});
ponder.on(
  "SafeProxyWorldChain:ChangedFallbackHandler",
  async ({ event }) => {},
);
ponder.on("SafeProxyWorldChain:RemovedOwner", async ({ event }) => {});
