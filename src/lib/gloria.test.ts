import { test, expect } from "bun:test";
import { GloriaConfig, NewsItem, RecapData, WebSocketMessage, FEED_CATEGORIES, NarrativeItem, ArticleItem, TickerSummary, FeedCategoryInfo } from "./gloria";
import { type } from "arktype";

test("GloriaConfig validates correct config", () => {
  const validConfig = {
    apiKey: "test-key",
    baseUrl: "https://example.com",
    topics: ["crypto", "ai"],
    defaultLimit: 50
  };

  const result = GloriaConfig(validConfig);
  expect(result instanceof type.errors).toBe(false);
  expect(result).toEqual(validConfig);
});

test("GloriaConfig allows empty config", () => {
  const result = GloriaConfig({});
  expect(result instanceof type.errors).toBe(false);
  expect(result).toEqual({});
});

test("GloriaConfig rejects invalid types", () => {
  const invalidConfig = {
    apiKey: 123, // should be string
    defaultLimit: "not a number"
  };

  const result = GloriaConfig(invalidConfig);
  expect(result instanceof type.errors).toBe(true);
});

test("NewsItem validates full API response", () => {
  const validItem = {
    id: "3eb6c79c-6295-48e5-95ab-710b7ed66812",
    signal: "BlackRock plans to launch Bitcoin ETF in Australia",
    sentiment: "bullish" as const,
    sentiment_value: 0.95,
    timestamp: 1762247231.193328,
    feed_categories: ["crypto", "bitcoin", "macro"],
    short_context: "BlackRock has launched a spot Bitcoin ETF in Australia.",
    long_context: "Entities mentioned or implied in the tweet...",
    sources: ["https://x.com/example/status/123"],
    author: "solidintel_x",
    tokens: ["$BTC"],
    tweet_url: "https://x.com/solidintel_x/status/1985634552664985964",
    narrative_id: "32a92ee7-0dc1-47b6-a095-d27e830bdd5d"
  };

  const result = NewsItem(validItem);
  expect(result instanceof type.errors).toBe(false);
  expect(result).toEqual(validItem);
});

test("NewsItem accepts null author", () => {
  const itemWithNullAuthor = {
    id: "abc-123",
    signal: "Some news signal",
    sentiment: "neutral" as const,
    sentiment_value: 0.5,
    timestamp: 1762247231,
    feed_categories: ["crypto"],
    short_context: "Context",
    long_context: "Long context",
    sources: [],
    author: null,
    tokens: [],
    tweet_url: "https://x.com/example/status/123",
    narrative_id: "def-456"
  };

  const result = NewsItem(itemWithNullAuthor);
  expect(result instanceof type.errors).toBe(false);
  expect((result as any).author).toBeNull();
});

test("NewsItem accepts string sentiment_value from WebSocket", () => {
  const wsItem = {
    id: "abc-123",
    signal: "Some news",
    sentiment: "neutral" as const,
    sentiment_value: "0.87",
    timestamp: 1762247231,
    feed_categories: ["crypto"],
    short_context: "Context",
    long_context: "Long context",
    sources: [],
    author: "DeItaone",
    tokens: [],
    tweet_url: "https://x.com/example/status/123",
    narrative_id: "def-456"
  };

  const result = NewsItem(wsItem);
  expect(result instanceof type.errors).toBe(false);
});

test("NewsItem allows extra fields for forward compatibility", () => {
  const itemWithExtra = {
    id: "abc-123",
    signal: "Some news",
    sentiment: "bearish" as const,
    sentiment_value: 0.3,
    timestamp: 1762247231,
    feed_categories: ["crypto"],
    short_context: "Context",
    long_context: "Long context",
    sources: [],
    author: "test",
    tokens: [],
    tweet_url: "https://x.com/example/status/123",
    narrative_id: "def-456",
    new_future_field: "some value"
  };

  const result = NewsItem(itemWithExtra);
  expect(result instanceof type.errors).toBe(false);
});

test("NewsItem accepts null narrative_id", () => {
  const item = {
    id: "abc-123",
    signal: "Some news",
    sentiment: "neutral" as const,
    sentiment_value: 0.5,
    timestamp: 1762247231,
    feed_categories: ["crypto"],
    short_context: "Context",
    long_context: "Long context",
    sources: [],
    author: "DeItaone",
    tokens: [],
    tweet_url: "https://x.com/example/status/123",
    narrative_id: null
  };

  const result = NewsItem(item);
  expect(result instanceof type.errors).toBe(false);
  expect((result as any).narrative_id).toBeNull();
});

test("NewsItem rejects missing required fields", () => {
  const invalidItem = {
    feed_category: "crypto"
  };

  const result = NewsItem(invalidItem);
  expect(result instanceof type.errors).toBe(true);
});

test("RecapData validates correct recap response", () => {
  const validRecap = {
    feed_category: "macro",
    timeframe: "12h",
    recap: "Bitcoin ETFs recorded $1.7 billion in net purchases this week...",
    created_at: "2025-09-12T14:50:18.849965Z"
  };

  const result = RecapData(validRecap);
  expect(result instanceof type.errors).toBe(false);
  expect(result).toEqual(validRecap);
});

test("RecapData rejects missing required fields", () => {
  const invalidRecap = {
    summary: "Market overview"
  };

  const result = RecapData(invalidRecap);
  expect(result instanceof type.errors).toBe(true);
});

test("WebSocketMessage validates message types", () => {
  const validMessage = {
    type: "subscribe" as const,
    feed_category: "crypto"
  };

  const result = WebSocketMessage(validMessage);
  expect(result instanceof type.errors).toBe(false);
  expect(result).toEqual(validMessage);
});

test("WebSocketMessage rejects invalid type", () => {
  const invalidMessage = {
    type: "invalid-type",
    feed_category: "crypto"
  };

  const result = WebSocketMessage(invalidMessage);
  expect(result instanceof type.errors).toBe(true);
});

test("WebSocketMessage validates connected message", () => {
  const connectedMsg = {
    type: "connected" as const,
    message: "Connection established."
  };

  const result = WebSocketMessage(connectedMsg);
  expect(result instanceof type.errors).toBe(false);
  expect((result as any).type).toBe("connected");
});

test("WebSocketMessage validates unsubscribed message", () => {
  const unsubMsg = {
    type: "unsubscribed" as const,
    feed_category: "crypto"
  };

  const result = WebSocketMessage(unsubMsg);
  expect(result instanceof type.errors).toBe(false);
});

test("WebSocketMessage validates ping/pong", () => {
  const ping = { type: "ping" as const, timestamp: 1148216.120805222 };
  const pong = { type: "pong" as const, timestamp: 1148216.120805222 };

  expect(WebSocketMessage(ping) instanceof type.errors).toBe(false);
  expect(WebSocketMessage(pong) instanceof type.errors).toBe(false);
});

test("FEED_CATEGORIES contains all available feeds", () => {
  expect(FEED_CATEGORIES).toContain("ai");
  expect(FEED_CATEGORIES).toContain("ai_agents");
  expect(FEED_CATEGORIES).toContain("base");
  expect(FEED_CATEGORIES).toContain("bitcoin");
  expect(FEED_CATEGORIES).toContain("crypto");
  expect(FEED_CATEGORIES).toContain("dats");
  expect(FEED_CATEGORIES).toContain("defi");
  expect(FEED_CATEGORIES).toContain("ethereum");
  expect(FEED_CATEGORIES).toContain("hyperliquid");
  expect(FEED_CATEGORIES).toContain("machine_learning");
  expect(FEED_CATEGORIES).toContain("macro");
  expect(FEED_CATEGORIES).toContain("on_chain_whale");
  expect(FEED_CATEGORIES).toContain("perps");
  expect(FEED_CATEGORIES).toContain("ripple");
  expect(FEED_CATEGORIES).toContain("rwa");
  expect(FEED_CATEGORIES).toContain("solana");
  expect(FEED_CATEGORIES).toContain("tech");
  expect(FEED_CATEGORIES).toContain("token_listings");
  expect(FEED_CATEGORIES).toContain("virtuals");
  expect(FEED_CATEGORIES.length).toBe(19);
});

test("NarrativeItem validates correct narrative", () => {
  const narrative = {
    narrative_id: "32a92ee7-0dc1-47b6-a095-d27e830bdd5d",
    updated_at: "2026-02-16T14:30:00Z",
    tag: "BlackRock Expands Bitcoin ETF to Australia",
    summary: "BlackRock continues its global expansion...",
    content: [{ id: "abc", signal: "test" }]
  };

  const result = NarrativeItem(narrative);
  expect(result instanceof type.errors).toBe(false);
  expect(result).toEqual(narrative);
});

test("NarrativeItem rejects missing fields", () => {
  const invalid = { tag: "test" };
  const result = NarrativeItem(invalid);
  expect(result instanceof type.errors).toBe(true);
});

test("ArticleItem validates correct article", () => {
  const article = {
    id: "article-uuid",
    data: { headline: "Test", body: "Content" },
    created_at: "2026-02-16T10:00:00Z"
  };

  const result = ArticleItem(article);
  expect(result instanceof type.errors).toBe(false);
  expect(result).toEqual(article);
});

test("TickerSummary validates correct summary", () => {
  const summary = {
    summary: "Solana saw increased network activity over the past 24 hours..."
  };

  const result = TickerSummary(summary);
  expect(result instanceof type.errors).toBe(false);
  expect(result).toEqual(summary);
});

test("FeedCategoryInfo validates category with timeframe", () => {
  const category = {
    code: "crypto",
    name: "Crypto",
    recap_timeframe: "12h"
  };

  const result = FeedCategoryInfo(category);
  expect(result instanceof type.errors).toBe(false);
});

test("FeedCategoryInfo accepts null recap_timeframe", () => {
  const category = {
    code: "token_listings",
    name: "Token Listings",
    recap_timeframe: null
  };

  const result = FeedCategoryInfo(category);
  expect(result instanceof type.errors).toBe(false);
  expect((result as any).recap_timeframe).toBeNull();
});
