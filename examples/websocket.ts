import { GloriaClient } from '../src';

async function websocketExample() {
  const gloria = new GloriaClient({
    topics: ['crypto', 'macro', 'ai_agents']
  });

  // Connect and auto-subscribe to configured topics
  await gloria.connect();
  console.log('Connected! Listening to:', gloria.getSubscribedTopics());

  // Handle real-time updates
  gloria.onMessage('data', (message) => {
    if (message.content?.signal) {
      const time = new Date().toLocaleTimeString();
      console.log(`[${time}] ${message.feed_category || 'NEWS'}: ${message.content.signal}`);
    }
  });

  // Add more topics dynamically
  setTimeout(() => {
    gloria.subscribe('macro');
    console.log('Added macro subscription');
  }, 5000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nClosing connection...');
    gloria.disconnect();
    process.exit(0);
  });
}

websocketExample().catch(console.error);