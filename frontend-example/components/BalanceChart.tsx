import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type TimeGranularity = "raw" | "hour" | "day" | "week" | "month";

interface BalanceChartProps {
  safeAddress: string;
  tokenAddress?: string;
  chain?: string;
  limit?: number;
  granularity?: TimeGranularity;
}

/**
 * BalanceChart component using GraphQL API with TanStack Query
 *
 * Uses Ponder's auto-generated GraphQL API as per:
 * https://ponder.sh/docs/query/graphql
 *
 * Uses TanStack Query for better state management, caching, and error handling
 * Reference: https://ponder.sh/docs/api-reference/ponder-react
 *
 * Advantages:
 * - Built-in time-travel query support
 * - Automatic caching and refetching
 * - Better error handling
 * - No manual state management needed
 */
/**
 * Aggregates balance history data by time granularity
 */
function aggregateByGranularity(
  data: any[],
  granularity: TimeGranularity,
): any[] {
  if (granularity === "raw" || data.length === 0) {
    return data;
  }

  // Group data by time period
  const groups = new Map<string, any[]>();

  data.forEach((record) => {
    const timestamp = Number(record.blockTimestamp) * 1000; // Convert to milliseconds
    const date = new Date(timestamp);
    let key: string;

    switch (granularity) {
      case "hour":
        // Group by hour: YYYY-MM-DD-HH
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}-${String(date.getHours()).padStart(2, "0")}`;
        break;
      case "day":
        // Group by day: YYYY-MM-DD
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        break;
      case "week":
        // Group by week: YYYY-WW (ISO week)
        const week = getWeek(date);
        key = `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
        break;
      case "month":
        // Group by month: YYYY-MM
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      default:
        key = "unknown";
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(record);
  });

  // Aggregate each group
  const aggregated: any[] = [];
  groups.forEach((records, key) => {
    // Sort records within group by timestamp (ascending)
    records.sort((a, b) => Number(a.blockTimestamp) - Number(b.blockTimestamp));

    // Use the last record's balance (most recent in the period)
    const lastRecord = records[records.length - 1];
    const firstRecord = records[0];

    // Calculate total change in the period
    const totalChange = records.reduce((sum, r) => sum + BigInt(r.change), 0n);

    // Use the timestamp of the last record in the period
    const periodTimestamp = Number(lastRecord.blockTimestamp);

    aggregated.push({
      ...lastRecord,
      blockTimestamp: BigInt(periodTimestamp),
      balance: lastRecord.balance, // Balance at end of period
      change: totalChange, // Total change during period
      // Store additional metadata
      _period: key,
      _count: records.length, // Number of transactions in this period
      _firstTimestamp: Number(firstRecord.blockTimestamp),
      _lastTimestamp: Number(lastRecord.blockTimestamp),
    });
  });

  // Sort aggregated data by timestamp (ascending)
  return aggregated.sort(
    (a, b) => Number(a.blockTimestamp) - Number(b.blockTimestamp),
  );
}

/**
 * Get ISO week number for a date
 */
function getWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function BalanceChart({
  safeAddress,
  tokenAddress,
  chain = "mainnet",
  limit = 1000, // Increased limit to support aggregation
  granularity = "raw",
}: BalanceChartProps) {
  // Use TanStack Query for GraphQL queries
  // This provides automatic caching, refetching, and better state management
  const { data, isLoading, error } = useQuery({
    queryKey: ["balanceHistory", safeAddress, tokenAddress, chain, limit],
    queryFn: async () => {
      // GraphQL query using Ponder's auto-generated API
      // Plural field: balanceHistorys (auto-generated from balanceHistory table)
      // Conditionally include tokenAddress variable and filter
      const hasTokenAddress = !!tokenAddress;
      const query = `
        query GetBalanceHistory(
          $safeAddress: String!
          ${hasTokenAddress ? "$tokenAddress: String!" : ""}
          $chain: String!
          $limit: Int!
        ) {
          balanceHistorys(
            where: {
              safeAddress: $safeAddress
              ${hasTokenAddress ? "tokenAddress: $tokenAddress" : ""}
              chain: $chain
            }
            orderBy: "blockTimestamp"
            orderDirection: "desc"
            limit: $limit
          ) {
            items {
              id
              safeAddress
              tokenAddress
              chain
              balance
              change
              blockNumber
              blockTimestamp
              transactionHash
              logIndex
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            totalCount
          }
        }
      `;

      const variables: any = {
        safeAddress: safeAddress.toLowerCase(),
        chain,
        limit,
      };

      if (hasTokenAddress) {
        variables.tokenAddress = tokenAddress.toLowerCase();
      }

      const response = await fetch("http://localhost:42069/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data?.balanceHistorys?.items || [];
    },
    enabled: !!safeAddress, // Only run query if safeAddress is provided
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading balance history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Error:{" "}
          {error instanceof Error ? error.message : "Failed to fetch data"}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No balance history found</div>
      </div>
    );
  }

  // Aggregate data based on granularity
  const aggregatedData = aggregateByGranularity(data, granularity);

  // Transform data for the chart (reverse to show chronological order)
  const chartData = [...aggregatedData].reverse().map((record) => {
    const timestamp = Number(record.blockTimestamp) * 1000;
    const date = new Date(timestamp);

    // Format date label based on granularity
    let dateLabel: string;
    let timeLabel: string;

    switch (granularity) {
      case "hour":
        dateLabel = date.toLocaleDateString();
        timeLabel = `${date.getHours()}:00`;
        break;
      case "day":
        dateLabel = date.toLocaleDateString();
        timeLabel = "";
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateLabel = `Week of ${weekStart.toLocaleDateString()}`;
        timeLabel = "";
        break;
      case "month":
        dateLabel = date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
        timeLabel = "";
        break;
      default:
        dateLabel = date.toLocaleDateString();
        timeLabel = date.toLocaleTimeString();
    }

    return {
      timestamp,
      date: dateLabel,
      time: timeLabel,
      balance: Number(record.balance) / 1e18, // Convert from wei to ETH
      change: Number(record.change) / 1e18, // Convert from wei to ETH
      blockNumber: Number(record.blockNumber),
      period: record._period,
      count: record._count || 1, // Number of transactions in this period
    };
  });

  return (
    <div className="w-full h-96 p-4">
      <h2 className="text-xl font-bold mb-4">
        Balance History for {safeAddress.slice(0, 10)}...
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value.toFixed(4)} ETH`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-semibold">{data.date}</p>
                    <p className="text-sm text-gray-600">{data.time}</p>
                    <p className="text-blue-600">
                      Balance: {data.balance.toFixed(6)} ETH
                    </p>
                    <p
                      className={
                        data.change >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      Change: {data.change >= 0 ? "+" : ""}
                      {data.change.toFixed(6)} ETH
                    </p>
                    <p className="text-xs text-gray-500">
                      Block: {data.blockNumber}
                    </p>
                    {granularity !== "raw" && data.count > 1 && (
                      <p className="text-xs text-gray-400">
                        {data.count} transactions in this period
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Balance (ETH)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
