# Frontend Example - Balance Change Graph (GraphQL)

This is a simple React frontend example that displays token balance changes over time using Ponder's GraphQL API.

**Using GraphQL API** as per [Ponder GraphQL documentation](https://ponder.sh/docs/query/graphql)

## Setup

1. Install dependencies:

```bash
cd frontend-example
pnpm install
```

2. Make sure your Ponder server is running (in the root directory):

```bash
# In the root directory
pnpm serve
```

3. Start the frontend dev server:

```bash
cd frontend-example
pnpm dev
```

4. Open your browser to `http://localhost:3000`

## Features

- **Live Balance Tracking**: Displays balance changes over time on an interactive chart
- **Filter by Safe Address**: Enter any Safe proxy address to view its balance history
- **Token Filtering**: Optionally filter by specific token address (leave empty for native ETH)
- **Chain Selection**: Select the chain to query (currently Mainnet)
- **Interactive Chart**: Hover over data points to see detailed information including:
  - Date and time
  - Balance amount
  - Change amount (positive/negative)
  - Block number

## Files

- `lib/ponder.ts` - Ponder client setup with schema definitions
- `components/BalanceChart.tsx` - Chart component using `usePonderQuery` hook
- `App.tsx` - Main app component with providers and input fields
- `vite.config.ts` - Vite configuration with proxy setup
- `index.html` - HTML entry point

## How It Works

1. The component queries Ponder's auto-generated GraphQL API at `/graphql`
2. Uses the `balanceHistorys` plural query field (auto-generated from `balanceHistory` table)
3. Filters by `safeAddress`, `tokenAddress` (optional), and `chain`
4. Orders by `blockTimestamp` descending to show most recent first
5. The chart displays balance changes over time using Recharts
6. Automatically polls for updates every 5 seconds (can be customized)

## GraphQL Query

The component uses this GraphQL query structure:

```graphql
query GetBalanceHistory(
  $safeAddress: String!
  $tokenAddress: String
  $chain: String!
  $limit: Int!
) {
  balanceHistorys(
    where: {
      safeAddress: $safeAddress
      tokenAddress: $tokenAddress
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
    totalCount
  }
}
```

See [Ponder GraphQL documentation](https://ponder.sh/docs/query/graphql) for more details.

## Troubleshooting

- **"Loading..." forever**: Make sure your Ponder server is running on `http://localhost:42069`
- **"No balance history found"**: The Safe address might not have any recorded transfers yet
- **Chart not displaying**: Check the browser console for errors and verify the Ponder server is accessible
