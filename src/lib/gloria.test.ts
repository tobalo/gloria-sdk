import { test, expect } from "bun:test";
import { GloriaConfig, NewsItem, RecapData, WebSocketMessage } from "./gloria";
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

test("NewsItem validates correct news item", () => {
  const validItem = {
    timestamp: 1234567890,
    signal: "BTC price surge",
    feed_category: "crypto",
    extra_field: "allowed"
  };
  
  const result = NewsItem(validItem);
  expect(result instanceof type.errors).toBe(false);
  expect(result).toEqual(validItem);
});

test("NewsItem requires timestamp and signal", () => {
  const invalidItem = {
    feed_category: "crypto"
  };
  
  const result = NewsItem(invalidItem);
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

test("RecapData accepts any object", () => {
  const validRecap = {
    summary: "Market overview",
    data: { price: 50000 },
    nested: { deep: { value: true } }
  };
  
  const result = RecapData(validRecap);
  expect(result instanceof type.errors).toBe(false);
  expect(result).toEqual(validRecap);
});