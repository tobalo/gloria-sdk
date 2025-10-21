# Gloria SDK

A TypeScript client for the Gloria AI News Hub API, providing real-time news updates, recaps, and WebSocket subscriptions for various financial and crypto topics.

## Features

- 📰 **News API** - Fetch latest news from multiple categories
- 📊 **Recap API** - Get AI-generated summaries by timeframe
- 🔄 **WebSocket** - Real-time updates with auto-reconnection
- 🎯 **Topic Management** - Configure topics once, use everywhere
- 🔒 **Type-Safe** - Full TypeScript support with runtime validation via [arktype](https://arktype.io)
- ✅ **Runtime Validation** - Automatic validation of API responses and WebSocket messages

## Installation

```bash
# Using bun
bun add gloria-sdk

# Using npm
npm install gloria-sdk

# using pnpm
pnpm install gloria-sdk

# Using yarn
yarn add gloria-sdk
```

## Setup

1. **Get your API key** from here: [Gloria AI](https://www.itsgloria.ai/api-keys-new)

2. **Create a `.env` file** in your project root:
```env
GLORIA_AI_API_KEY=your_api_key_here
```

## Quick Start

```typescript
import { GloriaClient } from 'gloria-sdk';

// Initialize the client
const gloria = new GloriaClient({
  topics: ['crypto', 'ai_agents', 'macro'],
  defaultLimit: 20
});

// Fetch latest news
const news = await gloria.fetchNews({ limit: 10 });

// Get a recap
const recap = await gloria.fetchRecap('macro', '12h');

// Connect to WebSocket
await gloria.connect();
gloria.onMessage('data', (message) => {
  if (message.content?.signal) {
    console.log('New:', message.content.signal);
  }
});
```

## Examples

Run the included examples:

```bash
# Minimal example
bun run example:minimal

# Fetch news
bun run example:news

# Fetch recaps
bun run example:recaps

# WebSocket real-time
bun run example:websocket

# Full demo
bun run example:full
```

## API Reference

### Configuration

```typescript
const gloria = new GloriaClient({
  apiKey?: string,           // Optional: Override env variable
  topics?: string[],         // Default: ['crypto', 'ai_agents', 'macro', 'rwa', 'tech']
  defaultLimit?: number,     // Default: 40
  defaultTimeframe?: string, // Default: '12h'
  baseUrl?: string,          // Optional: Override API endpoint
  wsUrl?: string             // Optional: Override WebSocket endpoint
});
```

### Available Topics

- `crypto` - Cryptocurrency news
- `ai_agents` - AI and agent-related news
- `macro` - Macroeconomic updates
- `rwa` - Real World Assets
- `tech` - Technology news
- `bitcoin` - Bitcoin-specific news
- `ethereum` - Ethereum-specific news
- `machine_learning` - ML developments

### Methods

#### Fetch News
```typescript
// Use configured topics
const news = await gloria.fetchNews();

// Override parameters
const news = await gloria.fetchNews({
  limit?: number,        // Number of items
  page?: number,         // Page number
  fromDate?: string,     // Start date (YYYY-MM-DD)
  toDate?: string,       // End date (YYYY-MM-DD)
  topics?: string[]      // Override topics
});
```

#### Fetch Recaps
```typescript
// Single recap
const recap = await gloria.fetchRecap('crypto', '12h');

// All configured topics
const allRecaps = await gloria.fetchAllRecaps('24h');
```

#### WebSocket
```typescript
// Connect (auto-subscribes to configured topics)
await gloria.connect();

// Manual subscription
gloria.subscribe('defi');

// Handle messages
gloria.onMessage('data', (message) => {
  console.log(message.content?.signal);
});

// Disconnect
gloria.disconnect();
```

#### Topic Management
```typescript
// Get current topics
const topics = gloria.getTopics();

// Get active subscriptions
const subscribed = gloria.getSubscribedTopics();

// Update topics dynamically
gloria.setTopics(['crypto', 'defi']);
```

## TypeScript Support

The SDK includes full TypeScript definitions with runtime validation:

```typescript
import { 
  GloriaClient, 
  NewsItem, 
  RecapData, 
  WebSocketMessage,
  // Optional: Import validators for custom validation
  NewsItemSchema,
  WebSocketMessageSchema 
} from 'gloria-sdk';

const handleMessage = (message: WebSocketMessage) => {
  // Type-safe message handling with automatic validation
};

const processNews = (items: NewsItem[]) => {
  // Type-safe news processing
};

// Optional: Use validators directly
const validated = NewsItemSchema(data);
if (validated instanceof Error) {
  console.error('Invalid news item:', validated);
}
```

## WebSocket Features

- **Auto-reconnection** with exponential backoff
- **Ping/pong** heartbeat to maintain connection
- **Auto-subscribe** to configured topics on connect
- **Custom message handlers** for extensibility
- **Graceful disconnection** handling

## Error Handling

```typescript
try {
  const news = await gloria.fetchNews();
} catch (error) {
  console.error('Failed to fetch news:', error);
}

// WebSocket error handling
gloria.onMessage('error', (message) => {
  console.error('WebSocket error:', message.error);
});
```

## Development

```bash
# Install dependencies
bun install

# Run examples
bun run example:full

# Build for production
bun run build

# Run tests
bun test
```