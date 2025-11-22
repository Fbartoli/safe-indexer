import { tokenBalance, balanceHistory } from "ponder:schema";
import { HandlerParams, TransferHandlerParams } from "../type/HandlerParams";

// Extract the database type from TransferHandlerParams
type DB =
  TransferHandlerParams<"SafeAccountMainnet:transfer:to">["context"]["db"];

const NATIVE_TOKEN_ADDRESS = "0x000000000000000000000" as `0x${string}`;

/**
 * Helper function to update token balance and record history for a Safe proxy
 */
async function processTokenTransfer(
  db: DB,
  chainName: string,
  safeAddress: string,
  tokenAddress: string,
  balanceChange: bigint,
  log: {
    blockNumber: bigint;
    blockTimestamp: bigint;
    transactionHash: `0x${string}`;
    logIndex: number;
  },
) {
  const balanceId = `${chainName}:${safeAddress.toLowerCase()}:${tokenAddress.toLowerCase()}`;

  // Get current balance (at the previous block, since handlers run sequentially)
  const currentRecord = await db.find(tokenBalance, {
    id: balanceId,
  });

  const currentBalance = currentRecord?.balance ?? 0n;
  const newBalance = currentBalance + balanceChange;

  // Update token balance (onchainTable handles versioning automatically)
  // Use onConflictDoUpdate to handle upsert - inserts if new, updates if exists
  await db
    .insert(tokenBalance)
    .values({
      id: balanceId,
      safeAddress: safeAddress.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
      chain: chainName,
      balance: newBalance,
      updatedAt: new Date(Number(log.blockTimestamp) * 1000),
    })
    .onConflictDoUpdate((row) => ({
      balance: newBalance,
      updatedAt: new Date(Number(log.blockTimestamp) * 1000),
    }));

  // Record in balance history
  // Use onConflictDoNothing since history records are immutable - skip if already exists
  const historyId = `${chainName}:${log.transactionHash}:${log.logIndex}`;
  await db
    .insert(balanceHistory)
    .values({
      id: historyId,
      safeAddress: safeAddress.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
      chain: chainName,
      balance: newBalance,
      change: balanceChange,
      blockNumber: log.blockNumber,
      blockTimestamp: log.blockTimestamp,
      transactionHash: log.transactionHash,
      logIndex: BigInt(log.logIndex),
    })
    .onConflictDoNothing();
}

/**
 * Handler for ERC20 Transfer events TO Safe proxies (incoming transfers)
 * Event format: {accountName}:transfer:to
 */
export const TokenTransferToHandler = async ({
  event,
  context,
}: TransferHandlerParams<"SafeAccountMainnet:transfer:to">) => {
  const chainName = context.chain.name;

  // Token address is the contract that emitted the Transfer event
  const tokenAddress = NATIVE_TOKEN_ADDRESS;
  const safeAddress = event.transaction.to as `0x${string}`;
  const transferAmount = event.transaction.value as bigint;

  // Process the incoming transfer (positive change)
  await processTokenTransfer(
    context.db,
    chainName,
    safeAddress,
    tokenAddress,
    transferAmount,
    {
      blockNumber: event.block.number,
      blockTimestamp: event.block.timestamp,
      transactionHash: event.transaction.hash,
      logIndex: event.trace.traceIndex, // Use trace index for uniqueness
    },
  );
};

/**
 * Handler for Native Transfer events FROM Safe proxies (outgoing transfers)
 */
export const TokenTransferFromHandler = async ({
  event,
  context,
}: TransferHandlerParams<"SafeAccountMainnet:transfer:from">) => {
  const chainName = context.chain.name;

  // For transfer:from events, we use native token address (ETH)
  // Note: For ERC20 tokens, you may need to track Transfer events separately
  const tokenAddress = NATIVE_TOKEN_ADDRESS;
  const safeAddress = event.transfer.from as `0x${string}`;
  const transferAmount = event.transfer.value as bigint;

  // Process the outgoing transfer (negative change)
  await processTokenTransfer(
    context.db,
    chainName,
    safeAddress,
    tokenAddress,
    -transferAmount,
    {
      blockNumber: event.block.number,
      blockTimestamp: event.block.timestamp,
      transactionHash: event.transaction.hash,
      logIndex: event.trace.traceIndex, // Use trace index for uniqueness
    },
  );
};
