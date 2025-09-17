import { GloriaClient } from '../src';

async function fetchNewsExample() {
  const gloria = new GloriaClient({
    topics: ['crypto', 'ai_agents', 'macro']
  });

  // Fetch latest news with default settings
  const news = await gloria.fetchNews();
  console.log(`Found ${news.length} news items`);

  // Fetch with specific parameters
  const recentNews = await gloria.fetchNews({
    limit: 5,
    page: 1,
    topics: ['crypto'] // Override default topics
  });

  recentNews.forEach(item => {
    const date = new Date(item.timestamp * 1000);
    console.log(`[${date.toLocaleTimeString()}] ${item.signal}`);
  });
}

fetchNewsExample().catch(console.error);