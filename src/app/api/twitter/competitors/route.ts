import { NextResponse } from 'next/server';
import { searchTweets } from '@/lib/twitterApi';
import { TweetItem, CompetitorAnalyzedTweet } from '@/lib/twitterTypes';
import { analyzeTweetBatchWithAi } from '@/lib/aiCompetitorAnalyzer';
import { IcpInput } from '@/lib/sampleDataGenerator';
import { generateFallbackCompetitorTweets } from '@/lib/twitterCompetitorFallback';
import { normalizeTweets } from '@/lib/twitterFormatters';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load real Twitter posts from local dataset as fallback if live network/API is offline
 */
function getRealFallbackTweets(competitorHandles: string[]): TweetItem[] {
  try {
    const fallbackPath = path.resolve(process.cwd(), 'twitter_posts_output.json');
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, 'utf-8');
      const raw = JSON.parse(content);
      const tweets: TweetItem[] = Array.isArray(raw.tweets)
        ? raw.tweets
        : Array.isArray(raw.data?.tweets)
        ? raw.data.tweets
        : Array.isArray(raw)
        ? raw
        : [];

      if (tweets.length > 0) {
        // Only return tweets that actually mention any of the competitor handles
        const matched = tweets.filter((t) => {
          const text = (t.text || '').toLowerCase();
          return competitorHandles.some((c) => {
            const clean = c.toLowerCase().replace(/^@+/, '');
            return text.includes(`@${clean}`) || text.includes(clean);
          });
        });
        return matched;
      }
    }
  } catch (err) {
    console.warn('Failed to load fallback dataset:', err);
  }
  return [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const competitorsInput = body.competitors || [];
    const icp: IcpInput = body.icp || {
      mode: 'freeform',
      freeformText: 'B2B SaaS founders & engineering leaders',
    };
    const timeframeDays = typeof body.timeframeDays === 'number' ? body.timeframeDays : 7;
    const forceFallback = body.fallback === true;

    // Parse competitor handles from input (supporting string or array, comma/space separated)
    let competitorHandles: string[] = [];
    if (Array.isArray(competitorsInput)) {
      competitorHandles = competitorsInput
        .map((c) => String(c).trim().replace(/^@+/, ''))
        .filter(Boolean);
    } else if (typeof competitorsInput === 'string') {
      competitorHandles = competitorsInput
        .split(/[,\s]+/)
        .map((c) => c.trim().replace(/^@+/, ''))
        .filter(Boolean);
    }

    if (competitorHandles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide at least one competitor Twitter/X handle.' },
        { status: 400 }
      );
    }

    const sevenDaysAgoMs = Date.now() - timeframeDays * 24 * 60 * 60 * 1000;
    const rawFetchedTweets: TweetItem[] = [];
    let apiRequestsCount = 0;
    let isLiveApi = false;
    let apiErrorMessage: string | null = null;

    if (!forceFallback) {
      const seenTweetIds = new Set<string>();
      const errors: string[] = [];

      for (let i = 0; i < competitorHandles.length; i++) {
        const handle = competitorHandles[i];
        const query = `@${handle}`;

        // Safe pause between sequential competitor calls to strictly respect TwitterAPI.io rate limits (1 req / 5s)
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 5200));
        }

        apiRequestsCount++;
        try {
          const res = (await searchTweets({
            query,
            queryType: 'Latest',
            timeoutMs: 15000,
          })) as Record<string, unknown>;

          let tweetsArray: TweetItem[] = [];

          if (res) {
            const dataObj = res.data as Record<string, unknown> | undefined;
            if (Array.isArray(res.tweets)) {
              tweetsArray = res.tweets as TweetItem[];
            } else if (dataObj && Array.isArray(dataObj.tweets)) {
              tweetsArray = dataObj.tweets as TweetItem[];
            } else if (Array.isArray(res.data)) {
              tweetsArray = res.data as TweetItem[];
            }
          }

          for (const tweet of tweetsArray) {
            if (tweet && tweet.id && !seenTweetIds.has(tweet.id)) {
              seenTweetIds.add(tweet.id);
              rawFetchedTweets.push(tweet);
            }
          }

          if (rawFetchedTweets.length > 0) {
            isLiveApi = true;
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`Live Twitter search for @${handle} failed: ${msg}`);
          errors.push(`@${handle}: ${msg}`);
        }
      }

      if (errors.length > 0 && !isLiveApi) {
        apiErrorMessage = errors.join('; ');
      }
    }

    let filteredTweets: TweetItem[] = [];

    if (isLiveApi && rawFetchedTweets.length > 0) {
      // Filter live tweets to those within timeframe
      filteredTweets = rawFetchedTweets.filter((t) => {
        if (!t.createdAt) return true; // keep if date unparseable
        const tTime = new Date(t.createdAt).getTime();
        return isNaN(tTime) || tTime >= sevenDaysAgoMs;
      });

      // If strict filter removed all, keep all raw fetched tweets without capping
      if (filteredTweets.length === 0) {
        filteredTweets = rawFetchedTweets;
      }
    }

    // Fallback: If live API yielded 0 tweets (e.g. rate limit, 402 out of credits, or offline)
    if (filteredTweets.length === 0) {
      console.log('Generating dynamic multi-competitor fallback tweets for:', competitorHandles);
      // First try local dataset if matching mentions exist
      const localMatched = getRealFallbackTweets(competitorHandles);
      if (localMatched.length > 0) {
        filteredTweets.push(...localMatched);
      }

      // Generate realistic dynamic tweets for each competitor handle
      const generated = generateFallbackCompetitorTweets(competitorHandles, icp, 12);
      filteredTweets.push(...generated);
    }

    // Normalize all tweets to resolve t.co media to [Image] and URLs to real expanded links
    const normalizedTweets = normalizeTweets(filteredTweets);
    const tweetsReadCount = normalizedTweets.length;

    // Split tweets into batches of 10 for AI analysis
    const BATCH_SIZE = 10;
    const allAnalyzedTweets: CompetitorAnalyzedTweet[] = [];
    let aiCallsCount = 0;

    for (let i = 0; i < normalizedTweets.length; i += BATCH_SIZE) {
      const batch = normalizedTweets.slice(i, i + BATCH_SIZE);
      aiCallsCount++;
      const { analyzedTweets } = await analyzeTweetBatchWithAi(batch, competitorHandles, icp);
      allAnalyzedTweets.push(...analyzedTweets);
    }

    // Filter out qualified leads (isLead = true), sorted by highest match score first
    const leads = allAnalyzedTweets
      .filter((t) => t.isLead)
      .sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      data: {
        leads,
        allAnalyzedTweets,
        stats: {
          tweetsRead: tweetsReadCount,
          aiCallsCount,
          apiRequestsCount,
          leadsFound: leads.length,
          competitors: competitorHandles.map((c) => `@${c}`),
        },
        source: isLiveApi ? 'api' : 'fallback',
        apiStatus: {
          isLive: isLiveApi,
          errorMessage: apiErrorMessage,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Competitor analysis API route error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to analyze competitor mentions' },
      { status: 500 }
    );
  }
}
