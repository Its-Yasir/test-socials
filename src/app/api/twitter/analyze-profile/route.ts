import { NextResponse } from 'next/server';
import { getUserTweets } from '@/lib/twitterApi';
import { TweetItem, TweetAuthor } from '@/lib/twitterTypes';
import { analyzeProfileWithAi } from '@/lib/aiCompetitorAnalyzer';
import { IcpInput } from '@/lib/sampleDataGenerator';
import { normalizeTweet, normalizeTweets, resolveUserBio } from '@/lib/twitterFormatters';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || '').replace(/^@+/, '').trim();
    const icp: IcpInput = body.icp || {
      mode: 'freeform',
      freeformText: 'B2B SaaS founders & tech leaders',
    };
    const providedAuthor: TweetAuthor | undefined = body.author;

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    let userTweets: TweetItem[] = [];
    let pinnedTweet: TweetItem | null = null;
    let authorObj: TweetAuthor = providedAuthor || {
      id: username,
      userName: username,
      name: username,
      type: 'user',
    };

    // Fetch live user tweets from Twitter API with 15s timeout
    try {
      const res = (await getUserTweets({ userName: username, timeoutMs: 15000 })) as Record<string, unknown>;
      if (res) {
        const dataObj = res.data as Record<string, unknown> | undefined;
        if (dataObj?.pin_tweet) {
          pinnedTweet = dataObj.pin_tweet as TweetItem;
        } else if (res.pin_tweet) {
          pinnedTweet = res.pin_tweet as TweetItem;
        }

        if (Array.isArray(res.tweets)) {
          userTweets = res.tweets as TweetItem[];
        } else if (dataObj && Array.isArray(dataObj.tweets)) {
          userTweets = dataObj.tweets as TweetItem[];
        } else if (Array.isArray(res.data)) {
          userTweets = res.data as TweetItem[];
        }

        if (userTweets.length > 0 && userTweets[0]?.author) {
          authorObj = { ...authorObj, ...userTweets[0].author };
        }
      }
    } catch (err: unknown) {
      console.warn(`Live user tweets fetch bypassed for @${username}: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Fallback to real user posts dataset if live API returned 0
    if (userTweets.length === 0) {
      try {
        const fallbackPath = path.resolve(process.cwd(), 'twitter_user_posts_output.json');
        if (fs.existsSync(fallbackPath)) {
          const content = fs.readFileSync(fallbackPath, 'utf-8');
          const raw = JSON.parse(content);
          if (raw.data?.tweets && Array.isArray(raw.data.tweets)) {
            userTweets = raw.data.tweets.slice(0, 5);
            pinnedTweet = raw.data.pin_tweet || null;
          }
        }
      } catch (fErr) {
        console.warn('Fallback user posts read bypassed:', fErr);
      }
    }

    // Normalize author bio and tweets to resolve t.co media to [Image] and URLs to real expanded links
    if (authorObj) {
      authorObj = {
        ...authorObj,
        description: resolveUserBio(authorObj.description, authorObj),
      };
    }

    const normalizedPinnedTweet = pinnedTweet ? normalizeTweet(pinnedTweet) : null;
    const normalizedUserTweets = normalizeTweets(userTweets);
    const last5Tweets = normalizedUserTweets.slice(0, 5);

    // Call AI profile evaluation
    const { profileAnalysis } = await analyzeProfileWithAi(authorObj, last5Tweets, normalizedPinnedTweet, icp);

    return NextResponse.json({
      success: true,
      data: {
        profile: profileAnalysis,
        userTweetsSample: last5Tweets,
        pinnedTweet: normalizedPinnedTweet,
      },
    });
  } catch (error: unknown) {
    console.error('Profile analysis API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to analyze profile' },
      { status: 500 }
    );
  }
}
