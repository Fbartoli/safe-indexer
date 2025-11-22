import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BalanceChart } from "./components/BalanceChart";
import { useState } from "react";

type TimeGranularity = "raw" | "hour" | "day" | "week" | "month";

// Create a client instance for TanStack Query
// This provides caching, background updates, and better state management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  },
});

function App() {
  const [safeAddress, setSafeAddress] = useState(
    "0x6dd09d21b535d5bcee36fec8f50726f0f0e6725b",
  );
  const [tokenAddress, setTokenAddress] = useState("");
  const [chain, setChain] = useState("mainnet");
  const [granularity, setGranularity] = useState<TimeGranularity>("day");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Safe Token Balance Tracker (GraphQL + TanStack Query)
          </h1>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Safe Address
                </label>
                <input
                  type="text"
                  value={safeAddress}
                  onChange={(e) => setSafeAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Address (optional, leave empty for native ETH)
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0x... or leave empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chain
                </label>
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mainnet">Mainnet</option>
                  {/* Add more chains as needed */}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-4">
              <label className="block text-sm font-medium text-gray-700">
                Time Granularity:
              </label>
              <select
                value={granularity}
                onChange={(e) =>
                  setGranularity(e.target.value as TimeGranularity)
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="raw">Raw (All Transactions)</option>
                <option value="hour">By Hour</option>
                <option value="day">By Day</option>
                <option value="week">By Week</option>
                <option value="month">By Month</option>
              </select>
              <span className="text-sm text-gray-500">
                {granularity === "raw"
                  ? "Shows all individual transactions"
                  : `Aggregated by ${granularity}`}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {safeAddress && (
              <BalanceChart
                safeAddress={safeAddress}
                tokenAddress={tokenAddress || undefined}
                chain={chain}
                limit={1000}
                granularity={granularity}
              />
            )}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
