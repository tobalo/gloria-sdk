import { GloriaClient } from '../src';

async function fetchRecapsExample() {
  const gloria = new GloriaClient({
    topics: ['crypto', 'macro', 'tech'],
    defaultTimeframe: '12h'
  });

  // Fetch single recap
  const cryptoRecap = await gloria.fetchRecap('crypto');
  console.log('Crypto 12h Recap:');
  console.log(cryptoRecap.recap?.substring(0, 300) + '...\n');

  // Fetch all recaps for configured topics
  const allRecaps = await gloria.fetchAllRecaps('24h');
  
  console.log('All 24h Recaps:');
  Object.entries(allRecaps).forEach(([topic, data]) => {
    if (!data.error) {
      console.log(`\n${topic.toUpperCase()}:`);
      console.log(data.recap?.substring(0, 200) + '...');
    }
  });
}

fetchRecapsExample().catch(console.error);