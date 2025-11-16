import { ponder } from "ponder:registry";
import { SafeSetupHandler } from "../handlers/SafeProxyl2/SafeProxySetup";
import { ExecutionSuccessHandler } from "../handlers/SafeProxyl2/ExecutionSuccess";

// Reuse the same handler for both chains
ponder.on("SafeProxyMainnet:SafeSetup", SafeSetupHandler);
ponder.on("SafeProxyMainnet:ExecutionSuccess", ExecutionSuccessHandler);
ponder.on("SafeProxyMainnet:AddedOwner", async ({ event }) => {});
ponder.on("SafeProxyMainnet:ChangedThreshold", async ({ event }) => {});
ponder.on("SafeProxyMainnet:ChangedGuard", async ({ event }) => {});
ponder.on("SafeProxyMainnet:ChangedFallbackHandler", async ({ event }) => {});
ponder.on("SafeProxyMainnet:RemovedOwner", async ({ event }) => {});
