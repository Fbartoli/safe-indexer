import { parseAbiItem } from "abitype";
import { createConfig, factory } from "ponder";

import { SafeSingletonAbi } from "./abis/1.4.1/SafeSingleton";

const proxyFactoryAddress =
  `0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67` as `0x${string}`;

export default createConfig({
  chains: {
    mainnet: {
      id: 1,
      rpc: process.env.PONDER_RPC_URL_1,
    },
    worldchain: {
      id: 480,
      rpc: process.env.PONDER_RPC_URL_480,
    },
  },
  contracts: {
    SafeProxyMainnet: {
      chain: "mainnet",
      abi: SafeSingletonAbi,
      address: factory({
        address: proxyFactoryAddress,
        event: parseAbiItem(
          "event ProxyCreation(address indexed proxy, address indexed singleton)",
        ),
        parameter: "proxy",
      }),
      startBlock: 23804491,
    },
    SafeProxyWorldChain: {
      chain: "worldchain",
      abi: SafeSingletonAbi,
      address: factory({
        address: proxyFactoryAddress,
        event: parseAbiItem(
          "event ProxyCreation(address indexed proxy, address indexed singleton)",
        ),
        parameter: "proxy",
      }),
      startBlock: 21900000,
    },
  },
});
