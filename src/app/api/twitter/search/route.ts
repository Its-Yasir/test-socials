import { NextResponse } from "next/server";
import { searchTweets, getUserTweets } from "@/lib/twitterApi";
import { TweetItem } from "@/lib/twitterTypes";
import { generateFallbackSearchTweets } from "@/lib/twitterCompetitorFallback";
import { normalizeTweets } from "@/lib/twitterFormatters";

import * as fs from "fs";
import * as path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const username = searchParams.get("username")?.trim() || "";
    const cursor = searchParams.get("cursor")?.trim() || undefined;
    const queryType =
      (searchParams.get("queryType") as "Latest" | "Top") || "Latest";
    const saveToFile = searchParams.get("save") === "true";
    const forceFallback = searchParams.get("fallback") === "true";

    let rawData: Record<string, unknown> | null = null;
    let source: "api" | "fallback" = "api";
    let apiErrorMessage: string | null = null;

    if (!forceFallback) {
      try {
        if (username) {
          rawData = (await getUserTweets({
            userName: username,
            cursor,
          })) as Record<string, unknown>;
        } else if (query) {
          rawData = (await searchTweets({
            query,
            queryType,
            cursor,
          })) as Record<string, unknown>;
        } else {
          rawData = (await searchTweets({
            query: "buildinpublic OR AI OR SaaS",
            queryType: "Latest",
            cursor,
          })) as Record<string, unknown>;
        }
      } catch (apiError: unknown) {
        apiErrorMessage =
          apiError instanceof Error ? apiError.message : String(apiError);
        console.warn(
          "Live Twitter API search failed, attempting offline fallback:",
          apiErrorMessage,
        );
        // If API key is invalid or rate limited, fallback to sample JSON file
        const fallbackFile = username
          ? "twitter_user_posts_output.json"
          : "twitter_posts_output.json";
        const fallbackPath = path.resolve(process.cwd(), fallbackFile);
        if (fs.existsSync(fallbackPath)) {
          const content = fs.readFileSync(fallbackPath, "utf-8");
          rawData = JSON.parse(content);
          source = "fallback";
        }
      }
    } else {
      const fallbackFile = username
        ? "twitter_user_posts_output.json"
        : "twitter_posts_output.json";
      const fallbackPath = path.resolve(process.cwd(), fallbackFile);
      if (fs.existsSync(fallbackPath)) {
        const content = fs.readFileSync(fallbackPath, "utf-8");
        rawData = JSON.parse(content);
        source = "fallback";
      }
    }

    // Normalize tweet list
    let tweets: TweetItem[] = [];
    let hasNextPage = false;
    let nextCursor = "";

    if (rawData) {
      const dataObj = rawData.data as Record<string, unknown> | undefined;
      if (Array.isArray(rawData.tweets)) {
        tweets = rawData.tweets as TweetItem[];
        hasNextPage = Boolean(rawData.has_next_page);
        nextCursor = String(rawData.next_cursor || "");
      } else if (dataObj && Array.isArray(dataObj.tweets)) {
        tweets = dataObj.tweets as TweetItem[];
        hasNextPage = Boolean(dataObj.has_next_page);
        nextCursor = String(dataObj.next_cursor || "");
      } else if (Array.isArray(rawData)) {
        tweets = rawData as TweetItem[];
      }
    }

    // If a specific query was provided and we fell back to sample data, filter the sample data by query
    if (source === "fallback" && (query || username)) {
      const q = (query || username).toLowerCase();
      const matched = tweets.filter(
        (t) =>
          t.text?.toLowerCase().includes(q) ||
          t.author?.name?.toLowerCase().includes(q) ||
          t.author?.userName?.toLowerCase().includes(q),
      );

      if (matched.length > 0) {
        tweets = matched;
      } else {
        // Generate realistic dynamic search tweets for the target keyword
        tweets = generateFallbackSearchTweets(query, username);
      }
    } else if (source === "fallback" && tweets.length === 0) {
      tweets = generateFallbackSearchTweets(query || "AI agents OR SaaS", username);
    }

    if (saveToFile && rawData) {
      const fileName = `twitter_search_${Date.now()}.json`;
      const filePath = path.join(process.cwd(), fileName);
      fs.writeFileSync(filePath, JSON.stringify(rawData, null, 2), "utf-8");
    }

    // Normalize all tweets to resolve t.co media to [Image] and URLs to real expanded links
    const normalizedTweets = normalizeTweets(tweets);

    return NextResponse.json({
      success: true,
      data: {
        tweets: normalizedTweets,
        total: normalizedTweets.length,
        has_next_page: hasNextPage,
        next_cursor: nextCursor,
        source,
        query: username ? `@${username}` : query,
        queryType,
        apiStatus: {
          isLive: source === "api",
          errorMessage: apiErrorMessage,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Twitter API search route error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Twitter data",
      },
      { status: 500 },
    );
  }
}
