/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

/**
 * Helper to get Twitter API key from process env or .env file
 */
function getApiKey() {
  if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_KEY.trim() !== '') {
    return process.env.TWITTER_API_KEY.trim();
  }

  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/TWITTER_API_KEY=(.*)/);
    if (match && match[1] && match[1].trim() !== '') {
      return match[1].trim();
    }
  }

  throw new Error('TWITTER_API_KEY not found in process environment or .env file');
}

/**
 * Execute search query or get user posts from twitterapi.io and save output to JSON
 */
async function runTwitterApiTask() {
  const mode = process.argv[2] || 'search'; // 'search' or 'user'
  const queryOrUser = process.argv[3] || 'buildinpublic OR AI OR webdev';
  const outputFile = process.argv[4] || 'twitter_posts_output.json';

  console.log('----------------------------------------------------');
  console.log(`🚀 Starting TwitterAPI.io fetcher task...`);
  console.log(`📌 Mode: ${mode}`);
  console.log(`🔎 Query / Target: "${queryOrUser}"`);
  console.log(`📄 Target JSON Output File: ${outputFile}`);
  console.log('----------------------------------------------------');

  try {
    const apiKey = getApiKey();
    console.log(`🔑 API Key loaded: ${apiKey.slice(0, 8)}...`);

    let url = '';
    if (mode === 'user') {
      url = `https://api.twitterapi.io/twitter/user/last_tweets?userName=${encodeURIComponent(queryOrUser)}`;
    } else {
      url = `https://api.twitterapi.io/twitter/tweet/advanced_search?query=${encodeURIComponent(queryOrUser)}&queryType=Latest`;
    }

    console.log(`🌐 Fetching from API URL: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const outputPath = path.resolve(__dirname, '..', outputFile);

    // Save exact output to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`\n✅ Output saved successfully!`);
    console.log(`📁 File Location: ${outputPath}`);
    if (data.tweets && Array.isArray(data.tweets)) {
      console.log(`📊 Total Tweets Fetched: ${data.tweets.length}`);
    }
    if (data.has_next_page !== undefined) {
      console.log(`🔄 Has Next Page: ${data.has_next_page}`);
    }
    console.log('----------------------------------------------------\n');
  } catch (error) {
    console.error(`❌ Execution Failed:`, error.message);
    process.exit(1);
  }
}

runTwitterApiTask();
