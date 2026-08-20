/**
 * Format numbers into compact human-readable strings (e.g., 1.5K, 2.3M)
 */
export function formatCompactNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';
  if (num < 1000) return num.toLocaleString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}

/**
 * Format raw Twitter date string to relative time (e.g., "5m ago", "2h ago", "Aug 13")
 */
export function formatRelativeDate(dateString: string | undefined | null): string {
  if (!dateString) return 'Recent';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

/**
 * Format date to full readable string with time
 */
export function formatFullDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return dateString;
  }
}

/**
 * Clean device / source string (e.g., "Twitter for iPhone" -> "iPhone")
 */
export function formatSourceClient(source: string | undefined | null): string {
  if (!source) return 'Twitter Web';
  // Strip HTML tag if present (older Twitter API formats returned <a href="...">Twitter for iPhone</a>)
  const clean = source.replace(/<[^>]*>?/gm, '').trim();
  return clean;
}

import { TweetEntities, TweetMediaEntity, TweetItem, TweetAuthor } from './twitterTypes';

/**
 * Resolve t.co links in tweet text:
 * - Replace media t.co URLs or pic.twitter.com / pic.x.com URLs with '[Image]'
 * - Replace web link t.co URLs with their expanded_url (or display_url)
 */
export function resolveTweetText(
  text: string | undefined | null,
  entities?: TweetEntities,
  extendedEntities?: { media?: TweetMediaEntity[] }
): string {
  if (!text) return '';
  let result = text;

  // 1. Collect all media URLs from extendedEntities and entities
  const mediaList: TweetMediaEntity[] = [
    ...(extendedEntities?.media || []),
    ...(entities?.media || []),
  ];

  const mediaUrls = new Set<string>();
  for (const m of mediaList) {
    if (m.url) mediaUrls.add(m.url);
    if (m.display_url && (m.display_url.startsWith('pic.twitter.com') || m.display_url.startsWith('pic.x.com'))) {
      mediaUrls.add(m.display_url);
      mediaUrls.add(`https://${m.display_url}`);
      mediaUrls.add(`http://${m.display_url}`);
    }
  }

  // 2. Replace media URLs with [Image]
  for (const mediaUrl of mediaUrls) {
    if (mediaUrl) {
      result = result.split(mediaUrl).join('[Image]');
    }
  }

  // Also replace any remaining standalone pic.twitter.com or pic.x.com links with [Image]
  result = result.replace(/https?:\/\/pic\.(twitter|x)\.com\/\S+/gi, '[Image]');
  result = result.replace(/\bpic\.(twitter|x)\.com\/\S+/gi, '[Image]');

  // 3. Collect and replace regular URLs from entities.urls
  const urlList = entities?.urls || [];
  for (const u of urlList) {
    if (!u.url) continue;
    const targetUrl = u.expanded_url || u.display_url || u.url;
    // Check if this URL is actually an image / photo / video attachment
    if (
      targetUrl.includes('/photo/') ||
      targetUrl.includes('/video/') ||
      (u.display_url && (u.display_url.startsWith('pic.twitter.com') || u.display_url.startsWith('pic.x.com')))
    ) {
      result = result.split(u.url).join('[Image]');
    } else {
      result = result.split(u.url).join(targetUrl);
    }
  }

  // 4. Normalize spacing around [Image] tokens
  result = result.replace(/\s+\[Image\]/g, ' [Image]').trim();
  return result;
}

/**
 * Resolve user bio links (e.g., t.co in author bio)
 */
export function resolveUserBio(bio: string | undefined | null, author?: TweetAuthor): string {
  if (!bio) return '';
  let result = bio;

  interface UrlObj {
    url?: string;
    expanded_url?: string;
    display_url?: string;
  }

  const profileBioEntities = author?.profile_bio?.entities as { description?: { urls?: UrlObj[] } } | undefined;
  const authorEntities = author?.entities as { description?: { urls?: UrlObj[] } } | undefined;

  const urls: UrlObj[] = [
    ...(profileBioEntities?.description?.urls || []),
    ...(authorEntities?.description?.urls || []),
  ];

  for (const u of urls) {
    if (u?.url) {
      const target = u.expanded_url || u.display_url || u.url;
      result = result.split(u.url).join(target);
    }
  }

  return result;
}

/**
 * Recursively normalize TweetItem and its nested quoted_tweet and author text
 */
export function normalizeTweet<T extends Partial<TweetItem>>(tweet: T): T {
  if (!tweet) return tweet;

  const normalized: T = { ...tweet };

  if (normalized.text) {
    normalized.text = resolveTweetText(
      normalized.text,
      normalized.entities,
      normalized.extendedEntities
    );
  }

  if (normalized.author) {
    normalized.author = {
      ...normalized.author,
      description: resolveUserBio(normalized.author.description, normalized.author),
    };
  }

  if (normalized.quoted_tweet) {
    normalized.quoted_tweet = normalizeTweet(normalized.quoted_tweet);
  }

  return normalized;
}

/**
 * Normalize an array of tweets
 */
export function normalizeTweets<T extends Partial<TweetItem>>(tweets: T[]): T[] {
  if (!Array.isArray(tweets)) return [];
  return tweets.map((t) => normalizeTweet(t));
}
