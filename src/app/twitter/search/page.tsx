"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { TwitterPostCard } from "@/components/TwitterPostCard";
import { TweetDetailModal } from "@/components/TweetDetailModal";
import { TweetItem, TwitterSearchResponse } from "@/lib/twitterTypes";
import { TwitterIcon } from "@/components/SocialIcons";
import { formatCompactNumber } from "@/lib/twitterFormatters";
import {
  Search,
  Sparkles,
  Filter,
  ArrowUpDown,
  Download,
  Flame,
  Clock,
  User,
  ShieldCheck,
  Eye,
  Heart,
  RotateCcw,
  AlertCircle,
  Hash,
  AtSign,
  FileJson,
  FileSpreadsheet
} from "lucide-react";

const POPULAR_PRESETS = [
  { label: "AI Agents", query: "AI agents OR LLM" },
  { label: "#buildinpublic", query: "#buildinpublic SaaS" },
  { label: "Next.js 15", query: "Next.js 15 OR App Router" },
  { label: "SaaS Churn", query: "SaaS churn OR CAC" },
  { label: "DeepSeek", query: "DeepSeek AI" },
  { label: "Solopreneur", query: "Solopreneur MRR" },
  { label: "TypeScript", query: "TypeScript React" },
];

export default function TwitterSearchPage() {
  const [searchMode, setSearchMode] = useState<"keyword" | "user">("keyword");
  const [query, setQuery] = useState("AI agents OR SaaS");
  const [username, setUsername] = useState("elonmusk");
  const [queryType, setQueryType] = useState<"Latest" | "Top">("Latest");
  
  const [tweets, setTweets] = useState<TweetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [dataSource, setDataSource] = useState<"api" | "fallback">("api");

  // Filters & Sorting in results
  const [activeFilter, setActiveFilter] = useState<"all" | "verified" | "no_replies" | "high_engagement" | "questions">("all");
  const [sortBy, setSortBy] = useState<"recent" | "likes" | "retweets" | "views" | "replies">("recent");
  const [inPageSearch, setInPageSearch] = useState("");
  
  // Search history
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("twitter_search_history");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  // Detailed Tweet Modal
  const [inspectedTweet, setInspectedTweet] = useState<TweetItem | null>(null);

  const saveToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setRecentSearches((prev) => {
      const updated = [searchTerm, ...prev.filter((s) => s.toLowerCase() !== searchTerm.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem("twitter_search_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const performSearch = useCallback(async (
    searchTerm: string,
    mode: "keyword" | "user" = searchMode,
    qType: "Latest" | "Top" = queryType
  ) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError(null);
    setNextCursor(null);
    setHasNextPage(false);

    try {
      const params = new URLSearchParams();
      if (mode === "user") {
        const cleanUser = searchTerm.replace(/^@/, "").trim();
        params.append("username", cleanUser);
      } else {
        params.append("query", searchTerm.trim());
        params.append("queryType", qType);
      }

      const res = await fetch(`/api/twitter/search?${params.toString()}`);
      const json: TwitterSearchResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Failed to search Twitter posts");
      }

      setTweets(json.data.tweets || []);
      setHasNextPage(Boolean(json.data.has_next_page));
      setNextCursor(json.data.next_cursor || null);
      setDataSource(json.data.source || "api");
      saveToHistory(searchTerm);
    } catch (err: unknown) {
      console.error("Twitter search error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while searching Twitter.");
    } finally {
      setIsLoading(false);
    }
  }, [searchMode, queryType, saveToHistory]);

  // Initial fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch("AI agents OR SaaS", "keyword", "Latest");
    }, 0);
    return () => clearTimeout(timer);
  }, [performSearch]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (searchMode === "user") {
        params.append("username", username.replace(/^@/, "").trim());
      } else {
        params.append("query", query.trim());
        params.append("queryType", queryType);
      }
      params.append("cursor", nextCursor);

      const res = await fetch(`/api/twitter/search?${params.toString()}`);
      const json: TwitterSearchResponse = await res.json();

      if (json.success && json.data?.tweets) {
        setTweets((prev) => [...prev, ...json.data!.tweets]);
        setHasNextPage(Boolean(json.data.has_next_page));
        setNextCursor(json.data.next_cursor || null);
      }
    } catch (err: unknown) {
      console.error("Failed to load more tweets:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = searchMode === "user" ? username : query;
    performSearch(target, searchMode, queryType);
  };

  const handlePresetClick = (presetQuery: string) => {
    setSearchMode("keyword");
    setQuery(presetQuery);
    performSearch(presetQuery, "keyword", queryType);
  };

  // Filtered and Sorted Tweets
  const processedTweets = useMemo(() => {
    let result = [...tweets];

    // 1. Filter
    if (activeFilter === "verified") {
      result = result.filter((t) => t.author?.isBlueVerified || t.author?.isVerified);
    } else if (activeFilter === "no_replies") {
      result = result.filter((t) => !t.isReply);
    } else if (activeFilter === "high_engagement") {
      result = result.filter((t) => t.likeCount >= 10 || (t.viewCount && t.viewCount >= 500));
    } else if (activeFilter === "questions") {
      result = result.filter((t) => t.text.includes("?") || t.text.toLowerCase().includes("how") || t.text.toLowerCase().includes("why"));
    }

    // 2. In-Page Search
    if (inPageSearch.trim()) {
      const s = inPageSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.text.toLowerCase().includes(s) ||
          t.author.name.toLowerCase().includes(s) ||
          t.author.userName.toLowerCase().includes(s) ||
          (t.author.location && t.author.location.toLowerCase().includes(s))
      );
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === "likes") return b.likeCount - a.likeCount;
      if (sortBy === "retweets") return b.retweetCount - a.retweetCount;
      if (sortBy === "replies") return b.replyCount - a.replyCount;
      if (sortBy === "views") return (b.viewCount || 0) - (a.viewCount || 0);
      // Default: recent (by createdAt)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [tweets, activeFilter, inPageSearch, sortBy]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalLikes = tweets.reduce((acc, t) => acc + (t.likeCount || 0), 0);
    const totalViews = tweets.reduce((acc, t) => acc + (t.viewCount || 0), 0);
    const totalReposts = tweets.reduce((acc, t) => acc + (t.retweetCount || 0), 0);
    const verifiedCount = tweets.filter((t) => t.author?.isBlueVerified || t.author?.isVerified).length;

    return {
      total: tweets.length,
      totalLikes,
      totalViews,
      totalReposts,
      verifiedCount,
    };
  }, [tweets]);

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      "Tweet ID",
      "Created At",
      "Author Name",
      "Username",
      "Verified",
      "Followers",
      "Likes",
      "Reposts",
      "Replies",
      "Views",
      "Bookmarks",
      "Device Source",
      "Tweet URL",
      "Tweet Text"
    ];

    const rows = processedTweets.map((t) => [
      `"${t.id}"`,
      `"${t.createdAt}"`,
      `"${(t.author.name || "").replace(/"/g, '""')}"`,
      `"@${t.author.userName}"`,
      t.author.isBlueVerified || t.author.isVerified ? "Yes" : "No",
      t.author.followers || 0,
      t.likeCount || 0,
      t.retweetCount || 0,
      t.replyCount || 0,
      t.viewCount || 0,
      t.bookmarkCount || 0,
      `"${(t.source || "").replace(/<[^>]*>?/gm, "").replace(/"/g, '""')}"`,
      `"${t.url || t.twitterUrl || `https://x.com/${t.author.userName}/status/${t.id}`}"`,
      `"${t.text.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `twitter_search_export_${Date.now()}.csv`;
    a.click();
  };

  // JSON Export
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(processedTweets, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `twitter_posts_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-sky-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Hero Header Section */}
        <div className="relative rounded-3xl border border-sky-500/20 bg-gradient-to-b from-sky-950/30 via-zinc-900/60 to-zinc-950 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400">
                    <TwitterIcon className="h-3.5 w-3.5 fill-current" />
                    <span>Real-Time Twitter / X Explorer</span>
                  </div>
                  
                  {dataSource === "fallback" ? (
                    <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
                      <AlertCircle className="h-3 w-3" />
                      Sample Offline Cache
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live TwitterAPI Stream
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Twitter Keyword & Post Search
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mt-1">
                  Search any keyword, hashtag, topic, or user handle on X (Twitter). View full post text, timestamps, engagement metrics, author deep-dive info, and export raw data.
                </p>
              </div>

              {/* Quick Preset Mode Toggle */}
              <div className="flex items-center rounded-2xl border border-zinc-800 bg-zinc-950/80 p-1 self-start md:self-auto shrink-0 shadow-inner">
                <button
                  type="button"
                  onClick={() => setSearchMode("keyword")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    searchMode === "keyword"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Hash className="h-3.5 w-3.5" />
                  <span>Keyword / Topic</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("user")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    searchMode === "user"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <AtSign className="h-3.5 w-3.5" />
                  <span>User Profile</span>
                </button>
              </div>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    {searchMode === "keyword" ? (
                      <Search className="h-5 w-5 text-sky-400" />
                    ) : (
                      <AtSign className="h-5 w-5 text-sky-400" />
                    )}
                  </div>
                  
                  {searchMode === "keyword" ? (
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter keyword, #hashtag, or boolean query (e.g. AI agents OR SaaS)..."
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/90 pl-12 pr-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all shadow-inner"
                    />
                  ) : (
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter Twitter/X username without @ (e.g. elonmusk, sama, vercel)..."
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/90 pl-12 pr-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all shadow-inner"
                    />
                  )}
                </div>

                {/* Query Type Toggle (Latest vs Top) for Keyword search */}
                {searchMode === "keyword" && (
                  <div className="flex items-center rounded-2xl border border-zinc-800 bg-zinc-950/90 p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQueryType("Latest")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        queryType === "Latest"
                          ? "bg-zinc-800 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 text-sky-400" />
                      <span>Latest</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQueryType("Top")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        queryType === "Top"
                          ? "bg-zinc-800 text-amber-300 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                      <span>Top</span>
                    </button>
                  </div>
                )}

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-indigo-500 hover:shadow-sky-500/40 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Search Tweets</span>
                    </>
                  )}
                </button>
              </div>

              {/* Popular Preset Keyword Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                <span className="text-zinc-500 flex items-center gap-1 font-medium">
                  <Sparkles className="h-3 w-3 text-sky-400" /> Trending Topics:
                </span>
                {POPULAR_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetClick(preset.query)}
                    className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-3 py-1 text-zinc-400 hover:border-sky-500/40 hover:text-sky-300 hover:bg-sky-500/10 transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-zinc-600" /> Recent:
                  </span>
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (term.startsWith("@")) {
                          setSearchMode("user");
                          setUsername(term.replace(/^@/, ""));
                          performSearch(term.replace(/^@/, ""), "user", queryType);
                        } else {
                          setSearchMode("keyword");
                          setQuery(term);
                          performSearch(term, "keyword", queryType);
                        }
                      }}
                      className="rounded-lg bg-zinc-900/60 px-2 py-0.5 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem("twitter_search_history");
                    }}
                    className="text-[11px] text-zinc-600 hover:text-zinc-400 underline underline-offset-2 ml-1"
                  >
                    Clear history
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 text-rose-300 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-sm">Failed to retrieve Twitter results</div>
              <div className="text-xs text-rose-300/80">{error}</div>
            </div>
          </div>
        )}

        {/* Aggregate Stats Bar */}
        {tweets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Posts Loaded</span>
                <TwitterIcon className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{stats.total}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Matching current query</div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Total Impressions</span>
                <Eye className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-300 mt-1.5">
                {formatCompactNumber(stats.totalViews)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Estimated total views</div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Total Engagement</span>
                <Heart className="h-3.5 w-3.5 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-300 mt-1.5">
                {formatCompactNumber(stats.totalLikes + stats.totalReposts)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                {formatCompactNumber(stats.totalLikes)} likes &bull; {formatCompactNumber(stats.totalReposts)} reposts
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Verified Authors</span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-1.5">
                {stats.verifiedCount}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                {Math.round((stats.verifiedCount / (stats.total || 1)) * 100)}% verified creators
              </div>
            </div>
          </div>
        )}

        {/* Toolbar: Filters, Sorting, In-Page Search, and Exports */}
        {tweets.length > 0 && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 mr-1">
                <Filter className="h-3.5 w-3.5 text-sky-400" /> Filter:
              </span>

              {[
                { id: "all" as const, label: "All Posts" },
                { id: "verified" as const, label: "Verified Only" },
                { id: "no_replies" as const, label: "Originals Only" },
                { id: "high_engagement" as const, label: "High Engagement" },
                { id: "questions" as const, label: "Questions" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                    activeFilter === tab.id
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Controls: In-Page Search, Sort & Export */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* In-page live search */}
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={inPageSearch}
                  onChange={(e) => setInPageSearch(e.target.value)}
                  placeholder="Filter text in results..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-sky-500/50 focus:outline-none"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300">
                <ArrowUpDown className="h-3 w-3 text-sky-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "likes" | "retweets" | "views" | "replies")}
                  className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="recent" className="bg-zinc-900">Most Recent</option>
                  <option value="likes" className="bg-zinc-900">Most Liked ❤️</option>
                  <option value="views" className="bg-zinc-900">Most Viewed 👁️</option>
                  <option value="retweets" className="bg-zinc-900">Most Reposted 🔄</option>
                  <option value="replies" className="bg-zinc-900">Most Replies 💬</option>
                </select>
              </div>

              {/* Export CSV */}
              <button
                onClick={handleExportCsv}
                title="Export current results as CSV spreadsheet"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shrink-0"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              {/* Export JSON */}
              <button
                onClick={handleExportJson}
                title="Export current results as JSON payload"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shrink-0"
              >
                <FileJson className="h-3.5 w-3.5 text-sky-400" />
                <span>JSON</span>
              </button>
            </div>

          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 space-y-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-zinc-800" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-32 rounded bg-zinc-800" />
                    <div className="h-2.5 w-24 rounded bg-zinc-800/60" />
                  </div>
                </div>
                <div className="space-y-2 py-1">
                  <div className="h-3 w-full rounded bg-zinc-800/80" />
                  <div className="h-3 w-4/5 rounded bg-zinc-800/60" />
                </div>
                <div className="flex items-center gap-6 pt-2 border-t border-zinc-800/40">
                  <div className="h-3 w-12 rounded bg-zinc-800/50" />
                  <div className="h-3 w-12 rounded bg-zinc-800/50" />
                  <div className="h-3 w-12 rounded bg-zinc-800/50" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results List */}
        {!isLoading && processedTweets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span>
                Showing <strong className="text-white">{processedTweets.length}</strong> posts
                {inPageSearch && ` matching "${inPageSearch}"`}
              </span>
              <span className="text-zinc-500">Click any card to inspect full JSON</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {processedTweets.map((tweet) => (
                <TwitterPostCard
                  key={tweet.id}
                  tweet={tweet}
                  onInspectJson={(t) => setInspectedTweet(t)}
                />
              ))}
            </div>

            {/* Load More Pagination */}
            {hasNextPage && (
              <div className="pt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 disabled:opacity-50 transition-all shadow-md inline-flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                      <span>Loading More Tweets...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-3.5 w-3.5 text-sky-400" />
                      <span>Load Next Page of Tweets</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && processedTweets.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto text-zinc-500">
              <TwitterIcon className="h-7 w-7 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-200">No tweets found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                {inPageSearch
                  ? `No tweets match your active filter "${inPageSearch}". Try clearing the in-page filter.`
                  : `No tweets matched "${searchMode === "user" ? username : query}". Try searching another keyword or checking one of the trending presets.`}
              </p>
            </div>
            {inPageSearch && (
              <button
                onClick={() => setInPageSearch("")}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs text-zinc-300 hover:text-white"
              >
                Clear In-Page Filter
              </button>
            )}
          </div>
        )}

      </main>

      {/* Tweet Inspector Detail Modal */}
      <TweetDetailModal
        tweet={inspectedTweet}
        isOpen={Boolean(inspectedTweet)}
        onClose={() => setInspectedTweet(null)}
      />
    </div>
  );
}
