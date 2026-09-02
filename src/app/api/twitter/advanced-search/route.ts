import { NextResponse } from "next/server";
import { generateAdvancedSearchQuery, QueryFilterOptions } from "@/lib/advancedSearchEngine";
import { searchTweets } from "@/lib/twitterApi";
import { TweetItem } from "@/lib/twitterTypes";
import { generateFallbackSearchTweets } from "@/lib/twitterCompetitorFallback";
import { normalizeTweets } from "@/lib/twitterFormatters";
import * as fs from "fs";
import * as path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt?.trim();
    const options = (body.options || {}) as QueryFilterOptions;
    const fetchTweets = body.fetchTweets !== false; // default true

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Natural language prompt is required." },
        { status: 400 }
      );
    }

    // 1. Generate AI Query and Strategy
    const { result: aiStrategy, source: aiSource } = await generateAdvancedSearchQuery(prompt, options);

    let tweets: TweetItem[] = [];
    let hasNextPage = false;
    let nextCursor = "";
    let searchSource: "api" | "fallback" = "api";

    // 2. If requested, immediately fetch tweets for the generated query
    if (fetchTweets && aiStrategy.generatedQuery) {
      try {
        const rawData = (await searchTweets({
          query: aiStrategy.generatedQuery,
          queryType: "Latest",
        })) as Record<string, unknown>;

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
      } catch (apiError: unknown) {
        console.warn("Live search failed during advanced search, using fallback:", apiError);
        searchSource = "fallback";

        const fallbackFile = "twitter_posts_output.json";
        const fallbackPath = path.resolve(process.cwd(), fallbackFile);
        if (fs.existsSync(fallbackPath)) {
          try {
            const content = fs.readFileSync(fallbackPath, "utf-8");
            const parsed = JSON.parse(content);
            const fallbackTweets = Array.isArray(parsed.tweets)
              ? parsed.tweets
              : Array.isArray(parsed.data?.tweets)
              ? parsed.data.tweets
              : [];
            tweets = fallbackTweets;
          } catch {
            tweets = [];
          }
        }

        if (tweets.length === 0) {
          tweets = generateFallbackSearchTweets(aiStrategy.generatedQuery);
        }
      }
    }

    const normalizedTweets = normalizeTweets(tweets);

    return NextResponse.json({
      success: true,
      data: {
        aiStrategy,
        aiSource,
        tweets: normalizedTweets,
        total: normalizedTweets.length,
        has_next_page: hasNextPage,
        next_cursor: nextCursor,
        source: searchSource,
        query: aiStrategy.generatedQuery,
      },
    });
  } catch (error: unknown) {
    console.error("Advanced search route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process advanced search",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get("prompt")?.trim() || "Find people complaining about HubSpot or looking for CRM alternatives";

    const { result: aiStrategy, source: aiSource } = await generateAdvancedSearchQuery(prompt);

    return NextResponse.json({
      success: true,
      data: {
        aiStrategy,
        aiSource,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate query",
      },
      { status: 500 }
    );
  }
}
