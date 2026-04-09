// Gloria SDK - AI News Hub Client
export { default as GloriaClient } from './lib/gloria';

// Export both types and validators
export type {
  GloriaConfig,
  NewsItem,
  RecapData,
  WebSocketMessage,
  FeedCategory,
  NarrativeItem,
  ArticleItem,
  TickerSummary,
  FeedCategoryInfo,
} from './lib/gloria';

export {
  GloriaConfig as GloriaConfigSchema,
  NewsItem as NewsItemSchema,
  RecapData as RecapDataSchema,
  WebSocketMessage as WebSocketMessageSchema,
  NarrativeItem as NarrativeItemSchema,
  ArticleItem as ArticleItemSchema,
  TickerSummary as TickerSummarySchema,
  FeedCategoryInfo as FeedCategoryInfoSchema,
  FEED_CATEGORIES,
} from './lib/gloria';
