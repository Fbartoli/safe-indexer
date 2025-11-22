import { onchainTable } from "ponder";

export const safeProxy = onchainTable("safeProxy", (t) => ({
  id: t.text().primaryKey(),
  address: t.text(),
  owners: t.text().array(),
  threshold: t.bigint(),
  createdAt: t.timestamp(),
  createdBy: t.text(),
}));

/**
 * Token balance table for Safe proxies.
 * Uses onchainTable to enable time-travel queries - you can query balances at any point in time.
 * Composite primary key: (safeAddress, tokenAddress, chain)
 */
export const tokenBalance = onchainTable("tokenBalance", (t) => ({
  safeAddress: t.text(),
  tokenAddress: t.text(),
  chain: t.text(),
  balance: t.bigint(),
  updatedAt: t.timestamp(),
  // Composite primary key
  id: t.text().primaryKey(),
}));

/**
 * Balance history table for tracking individual balance changes.
 * Uses onchainTable to enable time-travel queries for historical balance changes.
 * Useful for querying balance changes over time and understanding transaction history.
 */
export const balanceHistory = onchainTable("balanceHistory", (t) => ({
  id: t.text().primaryKey(), // Format: {chain}:{txHash}:{logIndex}
  safeAddress: t.text(),
  tokenAddress: t.text(),
  chain: t.text(),
  balance: t.bigint(), // Balance after this change
  change: t.bigint(), // Positive for incoming, negative for outgoing
  blockNumber: t.bigint(),
  blockTimestamp: t.bigint(),
  transactionHash: t.text(),
  logIndex: t.bigint(),
}));
