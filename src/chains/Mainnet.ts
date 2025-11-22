import { ponder } from "ponder:registry";
import { SafeSetupHandler } from "../handlers/SafeProxyL2/SafeProxySetup";
import {
  TokenTransferToHandler,
  TokenTransferFromHandler,
} from "../handlers/SafeProxyL2/TokenTransfer";

// Reuse the same handler for both chains
ponder.on("SafeProxyMainnet:SafeSetup", SafeSetupHandler);

// Track ERC20 token transfers TO Safe proxies (incoming)
ponder.on("SafeAccountMainnet:transfer:to", TokenTransferToHandler);

// Track ERC20 token transfers FROM Safe proxies (outgoing)
ponder.on("SafeAccountMainnet:transfer:from", TokenTransferFromHandler);
