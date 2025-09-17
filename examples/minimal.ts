import { GloriaClient } from '../src';

// Minimal usage - just needs API key in .env
const gloria = new GloriaClient();

// Get crypto news
gloria.fetchNews({ limit: 3, topics: ['crypto'] })
  .then(news => {
    news.forEach(item => console.log(item.signal));
  })
  .catch(console.error);