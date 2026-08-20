import * as fs from "fs";
import * as path from "path";

export interface TwitterApiSearchOptions {
  query: string;
  queryType?: "Latest" | "Top";
  cursor?: string;
  timeoutMs?: number;
}

export interface TwitterUserTweetsOptions {
  userName: string;
  cursor?: string;
  timeoutMs?: number;
}

const BASE_URL = "https://api.twitterapi.io";

/**
 * Get API Key from environment variables or .env file fallback
 */
export function getTwitterApiKey(): string {
  if (process.env.TWITTER_API_KEY) {
    return process.env.TWITTER_API_KEY.trim();
  }

  // Fallback: Read from .env file if running in Node environment where dotenv isn't preloaded
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/TWITTER_API_KEY=(.*)/);
      if (match && match[1]) {
        process.env.TWITTER_API_KEY = match[1].trim();
        return process.env.TWITTER_API_KEY;
      }
    }
  } catch {
    // Ignore fs read errors and proceed to throw friendly message below
  }

  throw new Error(
    "TWITTER_API_KEY is not defined in environment variables or .env file. Please ensure TWITTER_API_KEY is set.",
  );
}

/**
 * Perform advanced tweet search using twitterapi.io with timeout protection
 */
export async function searchTweets(options: TwitterApiSearchOptions) {
  const apiKey = getTwitterApiKey();
  const queryParams = new URLSearchParams({
    query: options.query,
    queryType: options.queryType || "Latest",
  });

  if (options.cursor) {
    queryParams.append("cursor", options.cursor);
  }

  const url = `${BASE_URL}/twitter/tweet/advanced_search?${queryParams.toString()}`;
  const timeoutMs = options.timeoutMs || 15000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `TwitterAPI.io search failed with status ${response.status}: ${errorText}`,
      );
    }

    return response.json();
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Get latest tweets for a specific Twitter username with timeout protection
 */
export async function getUserTweets(options: TwitterUserTweetsOptions) {
  const apiKey = getTwitterApiKey();
  const queryParams = new URLSearchParams({
    userName: options.userName,
  });

  if (options.cursor) {
    queryParams.append("cursor", options.cursor);
  }

  const url = `${BASE_URL}/twitter/user/last_tweets?${queryParams.toString()}`;
  const timeoutMs = options.timeoutMs || 15000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `TwitterAPI.io getUserTweets failed with status ${response.status}: ${errorText}`,
      );
    }

    return response.json();
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Save data payload to a JSON file in the project workspace
 */
export function saveDataToJsonFile(data: unknown, fileName: string): string {
  const outputPath = path.resolve(process.cwd(), fileName);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
  return outputPath;
}
