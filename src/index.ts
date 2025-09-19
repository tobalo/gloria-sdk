// Gloria SDK - AI News Hub Client
export { default as GloriaClient } from './lib/gloria';

// Export both types and validators
export type { 
  GloriaConfig, 
  NewsItem, 
  RecapData, 
  WebSocketMessage 
} from './lib/gloria';

export {
  GloriaConfig as GloriaConfigSchema,
  NewsItem as NewsItemSchema,
  RecapData as RecapDataSchema,
  WebSocketMessage as WebSocketMessageSchema
} from './lib/gloria';