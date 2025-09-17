import { GloriaClient } from '../src';

async function fullDemo() {
  // Initialize with all options
  const gloria = new GloriaClient({
    topics: ['crypto', 'ai_agents', 'macro', 'rwa', 'tech'],
    defaultLimit: 20,
    defaultTimeframe: '24h'
  });

  try {
    // 1. Fetch latest news
    console.log('📰 Latest News:');
    const news = await gloria.fetchNews({ limit: 5 });
    news.forEach(item => {
      const time = new Date(item.timestamp * 1000).toLocaleTimeString();
      console.log(`  [${time}] ${item.signal}`);
    });

    // 2. Get market recaps
    console.log('\n📊 Market Recaps:');
    const recaps = await gloria.fetchAllRecaps('12h');
    Object.entries(recaps).forEach(([topic, data]) => {
      if (!data.error) {
        console.log(`  ${topic}: ${data.recap?.substring(0, 100)}...`);
      }
    });

    // 3. Connect to WebSocket
    console.log('\n🔄 Connecting to real-time feed...');
    await gloria.connect();
    console.log(`Connected to: ${gloria.getSubscribedTopics().join(', ')}`);

    // Handle real-time updates
    gloria.onMessage('data', (message) => {
      if (message.content?.signal) {
        console.log(`[LIVE] ${message.feed_category || 'UPDATE'}: ${message.content.signal}`);
      }
    });

    // Keep running
    console.log('\n👂 Listening for updates (Ctrl+C to exit)...');
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down...');
      gloria.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error:', error);
    gloria.disconnect();
    process.exit(1);
  }
}

fullDemo();