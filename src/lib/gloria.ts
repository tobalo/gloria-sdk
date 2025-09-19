import { type } from 'arktype';

export const GloriaConfig = type({
  "apiKey?": "string",
  "baseUrl?": "string",
  "wsUrl?": "string",
  "topics?": "string[]",
  "defaultLimit?": "number",
  "defaultTimeframe?": "string"
});

export type GloriaConfig = typeof GloriaConfig.infer;

export const NewsItem = type({
  timestamp: "number",
  signal: "string",
  "feed_category?": "string",
  "[string]": "unknown"
});

export type NewsItem = typeof NewsItem.infer;

// Enhanced RecapData with common properties while still allowing any additional properties
export const RecapData = type({
  "[string]": "unknown"
});

export type RecapData = typeof RecapData.infer;

export const WebSocketMessage = type({
  type: "'subscribe' | 'unsubscribe' | 'pong' | 'data' | 'error' | 'ping' | 'connected' | 'subscribed'",
  "feed_category?": "string",
  "content?": "unknown",
  "action?": "string",
  "error?": "string", 
  "details?": "string",
  "timestamp?": "number"
});

export type WebSocketMessage = typeof WebSocketMessage.infer;

export class GloriaClient {
  private apiKey: string;
  private baseUrl: string;
  private wsUrl: string;
  private topics: string[];
  private defaultLimit: number;
  private defaultTimeframe: string;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: Timer | null = null;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private subscribedTopics: Set<string> = new Set();

  constructor(config?: GloriaConfig) {
    // Validate config if provided
    if (config) {
      const validated = GloriaConfig(config);
      if (validated instanceof type.errors) {
        throw new Error(`Invalid config: ${validated.summary}`);
      }
    }
    
    this.apiKey = config?.apiKey || process.env.GLORIA_AI_API_KEY || '';
    this.baseUrl = config?.baseUrl || 'https://ai-hub.cryptobriefing.com';
    this.wsUrl = config?.wsUrl || 'wss://ai-hub.cryptobriefing.com/ws/feed';
    this.topics = config?.topics || ['crypto', 'ai_agents', 'macro', 'rwa', 'tech'];
    this.defaultLimit = config?.defaultLimit || 40;
    this.defaultTimeframe = config?.defaultTimeframe || '12h';
    
    if (!this.apiKey) {
      throw new Error('API key is required. Set GLORIA_AI_API_KEY env variable or pass it in config');
    }
  }

  // WebSocket methods
  connect(autoSubscribe: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.socket = new WebSocket(`${this.wsUrl}?token=${this.apiKey}`);

      this.socket.addEventListener('open', () => {
        console.log('Connected to Gloria WebSocket');
        this.reconnectAttempts = 0;
        this.startPingPong();
        
        // Auto-subscribe to configured topics
        if (autoSubscribe) {
          this.subscribeToAllTopics();
        }
        
        resolve();
      });

      this.socket.addEventListener('message', (event) => {
        try {
          const rawMessage = JSON.parse(event.data);
          const validated = WebSocketMessage(rawMessage);
          
          if (validated instanceof type.errors) {
            console.error('Invalid WebSocket message:', validated.summary);
            return;
          }
          
          this.handleMessage(validated);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      this.socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.stopPingPong();
        this.subscribedTopics.clear();
        this.attemptReconnect();
      });

      this.socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        reject(event);
      });
    });
  }

  private handleMessage(message: WebSocketMessage) {
    // Validate message with arktype
    const validated = WebSocketMessage(message);
    if (validated instanceof type.errors) {
      console.error('Invalid WebSocket message:', validated.summary);
      return;
    }

    switch (validated.type) {
      case 'connected':
        console.log('WebSocket connection confirmed');
        break;
      case 'subscribed':
        console.log(`Successfully subscribed to ${validated.feed_category}`);
        break;
      case 'data':
        if (validated.action === 'subscribed') {
          console.log(`Successfully subscribed to ${validated.feed_category}`);
        }
        break;
      case 'error':
        console.error('Error:', validated.error, validated.details);
        break;
      case 'ping':
        this.pong(validated.timestamp);
        break;
    }

    // Call custom handlers
    const handler = this.messageHandlers.get(validated.type);
    if (handler) {
      handler(validated);
    }
  }

  private pong(timestamp?: number) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'pong',
        timestamp
      }));
    }
  }

  private startPingPong() {
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  private subscribeToAllTopics() {
    for (const topic of this.topics) {
      this.subscribe(topic);
    }
  }

  subscribe(feedCategory: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected. Call connect() first');
    }

    this.socket.send(JSON.stringify({
      type: 'subscribe',
      feed_category: feedCategory
    }));
    this.subscribedTopics.add(feedCategory);
  }

  unsubscribe(feedCategory: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    this.socket.send(JSON.stringify({
      type: 'unsubscribe',
      feed_category: feedCategory
    }));
    this.subscribedTopics.delete(feedCategory);
  }

  onMessage(type: string, handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.set(type, handler);
  }

  disconnect() {
    this.stopPingPong();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // News API methods
  async fetchNews(params?: {
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
    topics?: string[];
  }): Promise<NewsItem[]> {
    const queryParams = new URLSearchParams({
      token: this.apiKey,
      feed_categories: (params?.topics || this.topics).join(','),
      page: (params?.page || 1).toString(),
      limit: (params?.limit || this.defaultLimit).toString()
    });

    if (params?.fromDate) {
      queryParams.append('from_date', params.fromDate);
    }
    if (params?.toDate) {
      queryParams.append('to_date', params.toDate);
    }

    const response = await fetch(`${this.baseUrl}/news?${queryParams}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate each news item
    if (!Array.isArray(data)) {
      throw new Error('Invalid response: expected array of news items');
    }
    
    return data.map((item: unknown) => {
      const validated = NewsItem(item);
      if (validated instanceof type.errors) {
        console.warn('Invalid news item:', validated.summary);
        // Return a minimal valid object or skip
        return { timestamp: Date.now(), signal: 'invalid' };
      }
      return validated;
    });
  }

  // Recap API methods
  async fetchRecap(category?: string, timeframe?: string): Promise<RecapData> {
    // If no category specified, fetch for first configured topic
    const feedCategory = category || this.topics[0];
    const tf = timeframe || this.defaultTimeframe;
    
    const response = await fetch(
      `${this.baseUrl}/recaps?token=${this.apiKey}&feed_category=${feedCategory}&timeframe=${tf}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} for ${feedCategory}`);
    }

    const data = await response.json();
    const validated = RecapData(data);
    
    if (validated instanceof type.errors) {
      throw new Error(`Invalid recap data: ${validated.summary}`);
    }
    
    return validated;
  }

  // Fetch recaps for all configured topics
  async fetchAllRecaps(timeframe?: string): Promise<Record<string, RecapData>> {
    const tf = timeframe || this.defaultTimeframe;
    const recaps: Record<string, RecapData> = {};
    
    await Promise.all(
      this.topics.map(async (topic) => {
        try {
          recaps[topic] = await this.fetchRecap(topic, tf);
        } catch (error) {
          console.error(`Failed to fetch recap for ${topic}:`, error);
          recaps[topic] = { error: `Failed to fetch: ${error}` };
        }
      })
    );
    
    return recaps;
  }

  // Getters for configuration
  getTopics(): string[] {
    return [...this.topics];
  }

  getSubscribedTopics(): string[] {
    return Array.from(this.subscribedTopics);
  }

  setTopics(topics: string[]) {
    this.topics = topics;
    // If connected, update subscriptions
    if (this.socket?.readyState === WebSocket.OPEN) {
      // Unsubscribe from topics not in the new list
      for (const topic of this.subscribedTopics) {
        if (!topics.includes(topic)) {
          this.unsubscribe(topic);
        }
      }
      // Subscribe to new topics
      for (const topic of topics) {
        if (!this.subscribedTopics.has(topic)) {
          this.subscribe(topic);
        }
      }
    }
  }
}

export default GloriaClient;