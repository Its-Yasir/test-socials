export interface TweetAuthor {
  type: string;
  userName: string;
  url?: string;
  twitterUrl?: string;
  id: string;
  name: string;
  isVerified?: boolean;
  isBlueVerified?: boolean;
  verifiedType?: string | null;
  profilePicture?: string;
  coverPicture?: string;
  description?: string;
  location?: string;
  followers?: number;
  following?: number;
  status?: string;
  canDm?: boolean;
  canMediaTag?: boolean;
  createdAt?: string;
  favouritesCount?: number;
  mediaCount?: number;
  statusesCount?: number;
  profile_bio?: {
    description?: string;
    entities?: Record<string, unknown>;
  };
  entities?: {
    description?: {
      urls?: TweetUrlEntity[];
    };
    url?: {
      urls?: TweetUrlEntity[];
    };
  };
}

export interface TweetUserMention {
  id_str?: string;
  name?: string;
  screen_name?: string;
  indices?: number[];
}

export interface TweetUrlEntity {
  display_url?: string;
  expanded_url?: string;
  url?: string;
  indices?: number[];
}

export interface TweetHashtagEntity {
  text?: string;
  tag?: string;
  indices?: number[];
}

export interface TweetMediaEntity {
  type?: string;
  media_url_https?: string;
  url?: string;
  display_url?: string;
  expanded_url?: string;
}

export interface TweetEntities {
  user_mentions?: TweetUserMention[];
  urls?: TweetUrlEntity[];
  hashtags?: TweetHashtagEntity[];
  media?: TweetMediaEntity[];
}

export interface TweetItem {
  type?: string;
  id: string;
  url?: string;
  twitterUrl?: string;
  text: string;
  source?: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount?: number;
  viewCount?: number;
  bookmarkCount?: number;
  createdAt: string;
  lang?: string;
  isReply?: boolean;
  inReplyToId?: string | null;
  conversationId?: string;
  displayTextRange?: number[];
  inReplyToUserId?: string | null;
  inReplyToUsername?: string | null;
  author: TweetAuthor;
  entities?: TweetEntities;
  extendedEntities?: {
    media?: TweetMediaEntity[];
  };
  card?: {
    name?: string;
    url?: string;
    card_values?: Record<string, unknown>;
    binding_values?: Array<Record<string, unknown>>;
  } | null;
  place?: Record<string, unknown>;
  quoted_tweet?: TweetItem | null;
  retweeted_tweet?: TweetItem | null;
  isLimitedReply?: boolean;
  communityInfo?: Record<string, unknown>;
  article?: Record<string, unknown>;
}

export interface TwitterSearchResponse {
  success: boolean;
  data?: {
    tweets: TweetItem[];
    total: number;
    has_next_page: boolean;
    next_cursor: string;
    source: 'api' | 'fallback';
    query: string;
    queryType: 'Latest' | 'Top';
  };
  error?: string;
}

export interface CompetitorAnalyzedTweet {
  id: string;
  tweet: TweetItem;
  competitorHandle: string;
  isLead: boolean;
  matchScore: number;
  leadType?: string; // e.g. "Pain Point / Dissatisfaction", "Looking for Alternative", "Feature Gap Complaint", "ICP Fit Inquirer"
  painPointAnalysis?: string;
  whyMatchesIcp?: string[];
  suggestedOutreachHook?: string;
  sentiment?: 'negative_to_competitor' | 'looking_for_alternative' | 'positive_to_competitor' | 'neutral' | 'question';
  analyzedAt: string;
}

export interface CompetitorAnalysisStats {
  tweetsRead: number;
  aiCallsCount: number;
  apiRequestsCount: number;
  leadsFound: number;
  competitors: string[];
}

export interface CompetitorAnalysisResponse {
  success: boolean;
  data?: {
    leads: CompetitorAnalyzedTweet[];
    allAnalyzedTweets: CompetitorAnalyzedTweet[];
    stats: CompetitorAnalysisStats;
  };
  error?: string;
}

export interface ProfileAnalysisResult {
  username: string;
  name: string;
  bio?: string;
  location?: string;
  followers?: number;
  roleAndCompany?: string;
  icpFitScore: number;
  isIcpMatch: boolean;
  verdict: string;
  roleFitReason: string;
  companyFitReason: string;
  intentSignals: string[];
  recentTweetsInsights: string[];
  pinnedTweetInsight?: string;
  personalizedOutreachHook: string;
  suggestedDmOpener: string;
}

export interface ProfileAnalysisResponse {
  success: boolean;
  data?: {
    profile: ProfileAnalysisResult;
    userTweetsSample: TweetItem[];
    pinnedTweet?: TweetItem | null;
  };
  error?: string;
}

export interface AdvancedSearchAiResponse {
  searchIntent: string;
  searchStrategy: "Playbook A" | "Playbook B" | "Playbook C" | "Playbook D" | string;
  generatedQuery: string;
  appliedFilters: string[];
  proTip: string;
}

export interface AdvancedSearchApiResponse {
  success: boolean;
  data?: {
    aiStrategy: AdvancedSearchAiResponse;
    tweets: TweetItem[];
    total: number;
    has_next_page: boolean;
    next_cursor: string;
    source: "api" | "fallback";
    aiSource: "openai" | "fallback";
    query: string;
  };
  error?: string;
}


