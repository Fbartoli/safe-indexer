import { createClient } from "@ponder/client";
import { pgTable, text, bigint, timestamp } from "drizzle-orm/pg-core";

// Create Ponder client instance
// The URL must include /sql path for SQL over HTTP endpoint
export const client = createClient(
  import.meta.env.VITE_PONDER_URL || "http://localhost:42069/sql",
);

// Define schema tables for client-side queries
// Column names must match the actual database column names (case-sensitive)
// Ponder uses lowercase with underscores for column names in PostgreSQL
export const schema = {
  balanceHistory: pgTable("balanceHistory", {
    id: text("id").primaryKey(),
    safeAddress: text("safe_address"),
    tokenAddress: text("token_address"),
    chain: text("chain"),
    balance: bigint("balance", { mode: "bigint" }),
    change: bigint("change", { mode: "bigint" }),
    blockNumber: bigint("block_number", { mode: "bigint" }),
    blockTimestamp: bigint("block_timestamp", { mode: "bigint" }),
    transactionHash: text("transaction_hash"),
    logIndex: bigint("log_index", { mode: "bigint" }),
  }),
  tokenBalance: pgTable("tokenBalance", {
    id: text("id").primaryKey(),
    safeAddress: text("safe_address"),
    tokenAddress: text("token_address"),
    chain: text("chain"),
    balance: bigint("balance", { mode: "bigint" }),
    updatedAt: timestamp("updated_at"),
  }),
};
