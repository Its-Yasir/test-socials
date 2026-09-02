export interface LinkedinPostAuthor {
  id?: string | null;
  public_identifier?: string;
  name: string;
  is_company: boolean;
  headline?: string;
  profile_picture_url?: string;
}

export interface LinkedinPostAttachment {
  type?: string;
  url?: string;
  thumbnail_url?: string;
  title?: string;
}

export interface LinkedinPostMention {
  url?: string;
  start?: number;
  length?: number;
}

export interface LinkedinJobPosting {
  id: string;
  title?: string;
  location?: string;
  company?: {
    id?: string | null;
    name?: string;
    picture_url?: string;
  };
}

export interface LinkedinPostItem {
  type: string;
  provider: string;
  id: string;
  social_id: string;
  text: string;
  date?: string;
  parsed_datetime?: string;
  reaction_counter?: number;
  comment_counter?: number;
  repost_counter?: number;
  impressions_counter?: number;
  author: LinkedinPostAuthor;
  permissions?: {
    can_react?: boolean;
    can_post_comments?: boolean;
    can_share?: boolean;
  };
  share_url?: string;
  is_repost?: boolean;
  attachments?: LinkedinPostAttachment[];
  mentions?: LinkedinPostMention[];
  job_posting?: LinkedinJobPosting;
  [key: string]: unknown;
}

export interface LinkedinCompanyItem {
  type: string;
  id: string;
  name: string;
  profile_url: string;
  summary?: string;
  industry?: string;
  location?: string;
  logo?: string;
  followers_count?: number;
  has_job_offers?: boolean;
  headcount?: string | number;
  [key: string]: unknown;
}

export interface LinkedinSearchPaging {
  start?: number | null;
  page_count?: number;
  total_count?: number | null;
}

export interface LinkedinSearchOptions {
  api?: "classic" | "sales_navigator";
  category?: "posts" | "people" | "companies" | "jobs";
  keywords?: string;
  sort_by?: "relevance" | "date";
  date_posted?: "past_day" | "past_week" | "past_month";
  content_type?:
    | "videos"
    | "images"
    | "live_videos"
    | "collaborative_articles"
    | "documents"
    | "jobs";
  posted_by?: {
    me?: boolean;
    first_connections?: boolean;
    people_you_follow?: boolean;
    company?: string[];
    member?: string[];
  };
  mentioning?: {
    company?: string[];
    member?: string[];
  };
  author?: {
    industry?: string[];
    company?: string[];
    keywords?: string;
  };
  limit?: number;
  cursor?: string;
  timeoutMs?: number;
}

export interface LinkedinCompanySearchOptions {
  api?: "classic" | "sales_navigator";
  keywords?: string;
  location?: string;
  industry?: string;
  has_job_offers?: boolean;
  limit?: number;
  cursor?: string;
  timeoutMs?: number;
}

export interface LinkedinSearchResponse {
  success: boolean;
  data?: {
    items: LinkedinPostItem[];
    total: number;
    has_next_page: boolean;
    next_cursor?: string | null;
    source: "api" | "fallback";
    query?: string;
    category?: string;
    sortBy?: string;
    datePosted?: string;
    contentType?: string;
    paging?: LinkedinSearchPaging;
    apiStatus: {
      isLive: boolean;
      errorMessage?: string | null;
      accountId?: string;
    };
  };
  error?: string;
}

export interface LinkedinCompanySearchResponse {
  success: boolean;
  data?: {
    companies: LinkedinCompanyItem[];
    total: number;
    has_next_page: boolean;
    next_cursor?: string | null;
    source: "api" | "fallback";
    keywords?: string;
    location?: string;
    industry?: string;
    paging?: LinkedinSearchPaging;
    apiStatus: {
      isLive: boolean;
      errorMessage?: string | null;
      accountId?: string;
    };
  };
  error?: string;
}
