import { TweetItem } from './twitterTypes';
import { IcpInput } from './sampleDataGenerator';

interface FallbackTemplate {
  text: (handle: string, icp: IcpInput) => string;
  isReply: boolean;
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  userName: string;
  name: string;
  bio: string;
  followers: number;
  verified: boolean;
  hoursAgo: number;
}

const TEMPLATES: FallbackTemplate[] = [
  {
    text: (h, icp) =>
      `Honestly getting frustrated with @${h}. The pricing tier jumps and bloated features are killing our momentum. Anyone switched to a better alternative for ${icp.offering || 'B2B workflows'}?`,
    isReply: false,
    likes: 42,
    retweets: 9,
    replies: 24,
    views: 3200,
    userName: 'sarah_devops',
    name: 'Sarah Jenkins',
    bio: 'VP of Engineering @ CloudFlow | ex-Meta | Scaling distributed dev teams',
    followers: 12400,
    verified: true,
    hoursAgo: 14,
  },
  {
    text: (h) =>
      `Is anyone else experiencing horrible lag and sync issues on @${h} today? Our sprint planning meeting just got derailed by 45 mins. Might finally be time to migrate.`,
    isReply: false,
    likes: 31,
    retweets: 6,
    replies: 18,
    views: 2100,
    userName: 'alex_m_tech',
    name: 'Alex Martinez',
    bio: 'Founder & CTO @ StackPilot. Building developer automation tools.',
    followers: 8900,
    verified: false,
    hoursAgo: 28,
  },
  {
    text: (h, icp) =>
      `What are founders using instead of @${h} right now? We need something lightweight that actually solves ${icp.painPoints || 'team friction'} without enterprise bloat.`,
    isReply: false,
    likes: 67,
    retweets: 14,
    replies: 39,
    views: 5400,
    userName: 'dabora_builds',
    name: 'David Bora',
    bio: 'Co-founder @ LaunchScale ($40k MRR). #buildinpublic #saas',
    followers: 18200,
    verified: true,
    hoursAgo: 42,
  },
  {
    text: (h) =>
      `Love the UI of @${h} but their recent permissions overhaul broke our entire guest workflow. Support has been silent for 48 hours.`,
    isReply: false,
    likes: 19,
    retweets: 3,
    replies: 8,
    views: 1400,
    userName: 'elena_growth',
    name: 'Elena Rostova',
    bio: 'Head of Growth @ SaaSMetrics. Obsessed with high-converting customer funnels.',
    followers: 6700,
    verified: false,
    hoursAgo: 56,
  },
  {
    text: (h) =>
      `We just cancelled our @${h} enterprise plan. $18k/year for features 80% of our engineers don't even touch. Looking for recommendations on modern replacements!`,
    isReply: false,
    likes: 114,
    retweets: 28,
    replies: 62,
    views: 12800,
    userName: 'marcus_v_eng',
    name: 'Marcus Vance',
    bio: 'Head of Engineering @ PulseCorp | Angel Investor | Systems Architect',
    followers: 24300,
    verified: true,
    hoursAgo: 70,
  },
  {
    text: (h) =>
      `Huge props to the @${h} team, the latest update is slick and keyboard shortcuts are 🔥`,
    isReply: false,
    likes: 88,
    retweets: 5,
    replies: 7,
    views: 4200,
    userName: 'kevin_ui',
    name: 'Kevin Zhao',
    bio: 'Product Designer & Frontend Dev. Crafting delightful web experiences.',
    followers: 4500,
    verified: false,
    hoursAgo: 85,
  },
  {
    text: (h, icp) =>
      `Evaluating @${h} vs custom tooling for our Q3 roadmap. Has anyone integrated ${icp.offering || 'modern solutions'} to automate developer churn?`,
    isReply: false,
    likes: 24,
    retweets: 4,
    replies: 15,
    views: 1900,
    userName: 'priya_sharma_tech',
    name: 'Priya Sharma',
    bio: 'VP Product @ NextScale | Tech Speaker | Building B2B SaaS',
    followers: 15600,
    verified: true,
    hoursAgo: 96,
  },
  {
    text: (h) =>
      `Our team spent 3 hours trying to configure custom reporting in @${h}. It shouldn't require a computer science PhD to export basic analytics.`,
    isReply: true,
    likes: 53,
    retweets: 11,
    replies: 22,
    views: 3900,
    userName: 'tom_solopreneur',
    name: 'Tom Bradley',
    bio: 'Bootstrapped SaaS Founder. Building tools for remote tech teams.',
    followers: 9100,
    verified: false,
    hoursAgo: 110,
  },
  {
    text: (h) =>
      `Can anyone recommend a migration script or service from @${h}? Exporting our workspace history has been a nightmare.`,
    isReply: false,
    likes: 16,
    retweets: 2,
    replies: 11,
    views: 1200,
    userName: 'rachel_k_dev',
    name: 'Rachel Kim',
    bio: 'Tech Lead @ DataForge | Rust & TypeScript enthusiast',
    followers: 5200,
    verified: false,
    hoursAgo: 124,
  },
  {
    text: (h) =>
      `Super happy with @${h} for our small team so far. Simple, clean, and does what it says on the tin.`,
    isReply: false,
    likes: 34,
    retweets: 1,
    replies: 4,
    views: 1600,
    userName: 'lucas_builds',
    name: 'Lucas Meyer',
    bio: 'Indie Hacker building micro-SaaS apps. $12k MRR.',
    followers: 7800,
    verified: false,
    hoursAgo: 138,
  },
  {
    text: (h, icp) =>
      `Why is @${h} still missing native support for ${icp.painPoints ? icp.painPoints.slice(0, 40) : 'deep intent analytics'}? It feels like they stopped listening to power users.`,
    isReply: false,
    likes: 72,
    retweets: 16,
    replies: 33,
    views: 6100,
    userName: 'nathan_lead',
    name: 'Nathan Cross',
    bio: 'Director of Product Growth @ ApexGlobal | Scaling B2B tech',
    followers: 16800,
    verified: true,
    hoursAgo: 150,
  },
  {
    text: (h) =>
      `Has anyone successfully negotiated pricing with @${h} for mid-size teams? Renewal quote came in 40% higher with zero added value.`,
    isReply: false,
    likes: 95,
    retweets: 21,
    replies: 47,
    views: 8900,
    userName: 'anna_ops',
    name: 'Anna Lindqvist',
    bio: 'Head of Operations @ NordicSaaS | Optimizing startup tooling & spend',
    followers: 11200,
    verified: true,
    hoursAgo: 160,
  },
];

/**
 * Generate rich, realistic fallback tweets tailored to each competitor handle
 */
export function generateFallbackCompetitorTweets(
  competitorHandles: string[],
  icp: IcpInput,
  tweetsPerCompetitor: number = 12
): TweetItem[] {
  const results: TweetItem[] = [];
  const now = Date.now();

  competitorHandles.forEach((rawHandle, compIdx) => {
    const handle = rawHandle.replace(/^@+/, '').trim();
    const count = Math.min(TEMPLATES.length, tweetsPerCompetitor);

    for (let i = 0; i < count; i++) {
      const template = TEMPLATES[i];
      const hoursAgo = template.hoursAgo + (compIdx * 3);
      const createdAtDate = new Date(now - hoursAgo * 3600 * 1000);
      const tweetId = `gen_${handle}_${i}_${Date.now()}`;
      const userUniqueName = `${template.userName}_${handle.slice(0, 4)}`;

      const tweetText = template.text(handle, icp);

      results.push({
        type: 'tweet',
        id: tweetId,
        url: `https://x.com/${userUniqueName}/status/${tweetId}`,
        twitterUrl: `https://twitter.com/${userUniqueName}/status/${tweetId}`,
        text: tweetText,
        source: 'Twitter for Web',
        retweetCount: template.retweets + (i % 3),
        replyCount: template.replies + (i % 2),
        likeCount: template.likes + (i * 2),
        quoteCount: Math.floor(template.retweets / 3),
        viewCount: template.views + (i * 150),
        createdAt: createdAtDate.toUTCString(),
        lang: 'en',
        bookmarkCount: Math.floor(template.likes / 5),
        isReply: template.isReply,
        author: {
          type: 'user',
          id: `usr_${userUniqueName}`,
          userName: userUniqueName,
          url: `https://x.com/${userUniqueName}`,
          twitterUrl: `https://twitter.com/${userUniqueName}`,
          name: template.name,
          isVerified: template.verified,
          isBlueVerified: template.verified,
          description: template.bio,
          location: i % 2 === 0 ? 'San Francisco, CA' : 'Remote / New York',
          followers: template.followers,
          following: Math.floor(template.followers * 0.2),
          profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userUniqueName}`,
        },
      });
    }
  });

  return results;
}

/**
 * Generate rich fallback tweets for Twitter search keyword or username query
 */
export function generateFallbackSearchTweets(query: string, username?: string): TweetItem[] {
  const target = (username ? `@${username.replace(/^@+/, '')}` : query).trim() || 'Tech';
  const cleanTarget = target.replace(/["']/g, '');
  const now = Date.now();

  const searchSnippets = [
    `Just published our breakdown on scaling with ${cleanTarget}. The biggest bottleneck wasn't infra, it was outbound alignment.`,
    `Has anyone tried connecting ${cleanTarget} with automated social monitoring pipelines? Reply rates went up 3x this week.`,
    `Hot take: Most teams investing in ${cleanTarget} are focusing on the wrong metrics. Focus on retention first.`,
    `What are the best open-source or indie alternatives to ${cleanTarget} right now? Need something developer-first.`,
    `Building in public update: Added native integrations for ${cleanTarget}. Loving how smooth the developer experience is.`,
    `Quick question for founders working with ${cleanTarget}: how do you handle customer churn during onboarding?`,
    `The recent progress around ${cleanTarget} is genuinely mindblowing. Solves so many manual headaches.`,
    `Top lessons from our first 100 enterprise customers using ${cleanTarget}: 1. Simplicity wins. 2. Real-time signals beat cold scraping.`,
    `Is anyone else encountering sync latency when querying ${cleanTarget} at scale? Looking for workarounds.`,
    `Excited to announce our new deep dive into ${cleanTarget} workflows. Link in thread!`,
    `Why is nobody talking about the hidden operational costs of managing ${cleanTarget} without automated tooling?`,
    `Migrating our primary workflow to ${cleanTarget} cut our team's context switching in half. Highly recommend.`,
  ];

  return searchSnippets.map((text, idx) => {
    const hoursAgo = (idx + 1) * 4;
    const createdAtDate = new Date(now - hoursAgo * 3600 * 1000);
    const tweetId = `search_${idx}_${Date.now()}`;
    const authorHandle = username ? username.replace(/^@+/, '') : `creator_${idx + 1}`;
    const authorName = username ? `@${authorHandle}` : `Alex ${['Rivera', 'Chen', 'Vance', 'Sharma', 'Jenkins', 'Meyer'][idx % 6]}`;

    return {
      type: 'tweet',
      id: tweetId,
      url: `https://x.com/${authorHandle}/status/${tweetId}`,
      twitterUrl: `https://twitter.com/${authorHandle}/status/${tweetId}`,
      text,
      source: 'Twitter for Web',
      retweetCount: (idx * 3) + 2,
      replyCount: (idx * 2) + 5,
      likeCount: (idx * 8) + 14,
      quoteCount: Math.floor(idx / 2),
      viewCount: ((idx + 1) * 850) + 1200,
      createdAt: createdAtDate.toUTCString(),
      lang: 'en',
      bookmarkCount: idx * 2 + 1,
      isReply: idx % 3 === 0,
      author: {
        type: 'user',
        id: `usr_${authorHandle}_${idx}`,
        userName: authorHandle,
        url: `https://x.com/${authorHandle}`,
        twitterUrl: `https://twitter.com/${authorHandle}`,
        name: authorName,
        isVerified: idx % 2 === 0,
        isBlueVerified: idx % 2 === 0,
        description: `Builder & practitioner exploring ${cleanTarget} | SaaS & Developer Ecosystems`,
        location: 'San Francisco, CA',
        followers: ((idx + 1) * 2100) + 3400,
        following: 540,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorHandle}_${idx}`,
      },
    };
  });
}

