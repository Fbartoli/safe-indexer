import { useState } from "react";
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

interface BalanceChartTimeTravelProps {
  safeAddress: string;
  tokenAddress?: string;
  chain?: string;
  dates: string[]; // ISO date strings
}

/**
 * GraphQL version with time-travel queries
 *
 * This demonstrates GraphQL's built-in time-travel support,
 * allowing you to query balances at multiple specific points in time.
 */
export function BalanceChartTimeTravel({
  safeAddress,
  tokenAddress,
  chain = "mainnet",
  dates,
}: BalanceChartTimeTravelProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert dates to timestamps and query balances at each point
  useState(() => {
    const fetchBalances = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // GraphQL allows querying multiple balances at different times in one query
        const queryParts = dates.map((date, index) => {
          const timestamp = Math.floor(new Date(date).getTime() / 1000);
          return `
            balance${index}: tokenBalance(
              safeAddress: $safeAddress
              chain: $chain
              block: { timestamp: "${timestamp}" }
              where: {
                safeAddress: $safeAddress
                ${tokenAddress ? "tokenAddress: $tokenAddress" : ""}
                chain: $chain
              }
            ) {
              balance
              updatedAt
            }
          `;
        });

        const query = `
          query GetBalancesAtMultipleTimes(
            $safeAddress: String!
            $tokenAddress: String
            $chain: String!
          ) {
            ${queryParts.join("\n")}
          }
        `;

        const variables = {
          safeAddress: safeAddress.toLowerCase(),
          tokenAddress: tokenAddress?.toLowerCase(),
          chain,
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

        // Transform the result into chart data
        const chartData = dates.map((date, index) => {
          const balanceData = result.data[`balance${index}`];
          return {
            date,
            timestamp: Math.floor(new Date(date).getTime() / 1000),
            balance: balanceData ? Number(balanceData.balance) / 1e18 : null,
          };
        });

        setData(chartData.filter((d) => d.balance !== null));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBalances();
  }, [safeAddress, tokenAddress, chain, dates]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading historical balances...</div>
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

  return (
    <div className="w-full h-96 p-4">
      <h2 className="text-xl font-bold mb-4">
        Balance at Multiple Points in Time (GraphQL Time-Travel)
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Balance (ETH)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
