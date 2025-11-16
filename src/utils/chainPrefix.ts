/**
 * Maps chain names to their corresponding prefixes for database IDs.
 * This centralizes chain prefix logic and makes it easy to add new chains.
 */
const CHAIN_PREFIX_MAP: Record<string, string> = {
  mainnet: "mainnet",
  worldchain: "world",
  // Add more chains as needed:
  // polygon: "polygon",
  // arbitrum: "arbitrum",
  // optimism: "optimism",
  // base: "base",
  // sepolia: "sepolia",
} as const;

/**
 * Gets the prefix for a given chain name.
 * Falls back to the chain name itself if no mapping exists.
 *
 * @param chainName - The name of the chain from context.chain.name
 * @returns The prefix string to use in database IDs
 */
export function getChainPrefix(chainName: string): string {
  return CHAIN_PREFIX_MAP[chainName] ?? chainName;
}

/**
 * Creates a prefixed ID for a given chain and address.
 *
 * @param chainName - The name of the chain
 * @param address - The address to prefix
 * @returns A formatted ID string like "world:0x1234..."
 */
export function createChainPrefixedId(
  chainName: string,
  address: `0x${string}`,
): string {
  const prefix = getChainPrefix(chainName);
  return `${prefix}:${address}`;
}
