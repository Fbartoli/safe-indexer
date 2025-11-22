import { useState, useEffect } from "react";
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

interface BalanceChartGraphQLProps {
  safeAddress: string;
  tokenAddress?: string;
  chain?: string;
  limit?: number;
}

/**
 * GraphQL version of BalanceChart
 *
 * Advantages:
 * - Built-in time-travel query support
 * - Simpler query syntax
 * - Auto-generated types
 * - No schema setup needed
 *
 * Disadvantages:
 * - Requires manual polling for live updates
 * - Less control over query optimization
 */
export function BalanceChartGraphQL({
  safeAddress,
  tokenAddress,
  chain = "mainnet",
  limit = 100,
}: BalanceChartGraphQLProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const query = `
          query GetBalanceHistory(
            $safeAddress: String!
            $tokenAddress: String
            $chain: String!
            $limit: Int!
          ) {
            balanceHistorys(
              where: {
                safeAddress: $safeAddress
                ${tokenAddress ? "tokenAddress: $tokenAddress" : ""}
                chain: $chain
              }
              orderBy: "blockTimestamp"
              orderDirection: "desc"
              limit: $limit
            ) {
              items {
                balance
                change
                blockNumber
                blockTimestamp
                transactionHash
              }
            }
          }
        `;

        const variables = {
          safeAddress: safeAddress.toLowerCase(),
          tokenAddress: tokenAddress?.toLowerCase(),
          chain,
          limit,
        };

        const response = await fetch("http://localhost:42069/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        const items = result.data?.balanceHistorys?.items || [];
        setData(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();

    // Poll for updates every 5 seconds (GraphQL doesn't have built-in live updates)
    const interval = setInterval(() => {
      void fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [safeAddress, tokenAddress, chain, limit]);

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
        <div className="text-red-500">Error: {error}</div>
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

  // Transform data for the chart
  const chartData = [...data].reverse().map((record) => ({
    timestamp: Number(record.blockTimestamp),
    date: new Date(Number(record.blockTimestamp) * 1000).toLocaleDateString(),
    time: new Date(Number(record.blockTimestamp) * 1000).toLocaleTimeString(),
    balance: Number(record.balance) / 1e18,
    change: Number(record.change) / 1e18,
    blockNumber: Number(record.blockNumber),
  }));

  return (
    <div className="w-full h-96 p-4">
      <h2 className="text-xl font-bold mb-4">
        Balance History for {safeAddress.slice(0, 10)}... (GraphQL)
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
