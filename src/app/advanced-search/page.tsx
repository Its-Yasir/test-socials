"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { TwitterPostCard } from "@/components/TwitterPostCard";
import { TweetDetailModal } from "@/components/TweetDetailModal";
import { TweetItem, TwitterSearchResponse } from "@/lib/twitterTypes";
import { AdvancedSearchAiResponse, PLAYBOOK_DEFINITIONS } from "@/../data/SYSTEM_PROMPT";
import { TwitterIcon } from "@/components/SocialIcons";
import { formatCompactNumber } from "@/lib/twitterFormatters";
import {
  Sparkles,
  Search,
  BrainCircuit,
  Filter,
  ArrowUpDown,
  Download,
  Flame,
  Clock,
  ShieldCheck,
  Eye,
  Heart,
  RotateCcw,
  AlertCircle,
  Hash,
  AtSign,
  FileJson,
  FileSpreadsheet,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  HelpCircle,
  Lightbulb,
  Zap,
  Target,
  ArrowRight,
  RefreshCw,
  Edit3
} from "lucide-react";

export default function AdvancedSearchPage() {
  const [userPrompt, setUserPrompt] = useState(
    "Find people complaining about Apollo.io or HubSpot and looking for outbound sales alternatives"
  );
  
  // Custom filter options
  const [excludeLinks, setExcludeLinks] = useState(true);
  const [excludeRetweets, setExcludeRetweets] = useState(true);
  const [englishOnly, setEnglishOnly] = useState(true);
  const [excludeHiring, setExcludeHiring] = useState(true);
  const [minFaves, setMinFaves] = useState<number>(0);
  const [competitorHandle, setCompetitorHandle] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // AI & Search state
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingTweets, setIsLoadingTweets] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<AdvancedSearchAiResponse | null>(null);
  const [aiSource, setAiSource] = useState<"openai" | "fallback">("openai");
  const [editableQuery, setEditableQuery] = useState("");
  const [isEditingQuery, setIsEditingQuery] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);

  // Tweets results & pagination
  const [tweets, setTweets] = useState<TweetItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [dataSource, setDataSource] = useState<"api" | "fallback">("api");

  // In-page search & sorting
  const [activeFilter, setActiveFilter] = useState<"all" | "verified" | "no_replies" | "high_engagement" | "questions">("all");
  const [sortBy, setSortBy] = useState<"recent" | "likes" | "retweets" | "views" | "replies">("recent");
  const [inPageSearch, setInPageSearch] = useState("");

  // Inspect tweet modal
  const [inspectedTweet, setInspectedTweet] = useState<TweetItem | null>(null);

  // Execute AI strategy & search
  const handleGenerateAndSearch = useCallback(
    async (promptToUse?: string) => {
      const targetPrompt = (promptToUse || userPrompt).trim();
      if (!targetPrompt) return;

      setIsLoadingAi(true);
      setIsLoadingTweets(true);
      setError(null);
      setNextCursor(null);
      setHasNextPage(false);

      try {
        const response = await fetch("/api/twitter/advanced-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: targetPrompt,
            options: {
              excludeLinks,
              excludeRetweets,
              englishOnly,
              excludeHiring,
              minFaves: minFaves > 0 ? minFaves : undefined,
              targetAccount: competitorHandle.trim() || undefined,
            },
            fetchTweets: true,
          }),
        });

        const json = await response.json();

        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.error || "Failed to generate advanced search query.");
        }

        const data = json.data;
        setAiStrategy(data.aiStrategy);
        setAiSource(data.aiSource || "openai");
        setEditableQuery(data.aiStrategy.generatedQuery);
        setTweets(data.tweets || []);
        setHasNextPage(Boolean(data.has_next_page));
        setNextCursor(data.next_cursor || null);
        setDataSource(data.source || "api");
      } catch (err: unknown) {
        console.error("Advanced search error:", err);
        setError(err instanceof Error ? err.message : "An error occurred while generating query.");
      } finally {
        setIsLoadingAi(false);
        setIsLoadingTweets(false);
      }
    },
    [userPrompt, excludeLinks, excludeRetweets, englishOnly, excludeHiring, minFaves, competitorHandle]
  );

  // Initial load
  useEffect(() => {
    handleGenerateAndSearch(
      "Find people complaining about Apollo.io or HubSpot and looking for outbound sales alternatives"
    );
  }, []); // Run once on mount

  // Re-search when user modifies the generated boolean query
  const handleReSearchCustomQuery = async (customQuery: string) => {
    if (!customQuery.trim()) return;
    setIsLoadingTweets(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query: customQuery.trim(),
        queryType: "Latest",
      });
      const res = await fetch(`/api/twitter/search?${params.toString()}`);
      const json: TwitterSearchResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Failed to search Twitter posts.");
      }

      setTweets(json.data.tweets || []);
      setHasNextPage(Boolean(json.data.has_next_page));
      setNextCursor(json.data.next_cursor || null);
      setDataSource(json.data.source || "api");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to execute custom query.");
    } finally {
      setIsLoadingTweets(false);
    }
  };

  // Pagination
  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const queryToUse = editableQuery || aiStrategy?.generatedQuery || userPrompt;
      const params = new URLSearchParams({
        query: queryToUse.trim(),
        queryType: "Latest",
        cursor: nextCursor,
      });

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

  // Copy query
  const handleCopyQuery = () => {
    const q = editableQuery || aiStrategy?.generatedQuery || "";
    if (!q) return;
    navigator.clipboard.writeText(q);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  // Playbook color helper
  const getPlaybookColorStyles = (strategy: string) => {
    if (strategy.includes("Playbook A")) {
      return {
        badgeBg: "bg-rose-500/15 border-rose-500/30 text-rose-300",
        glow: "from-rose-500/10 via-zinc-900/60 to-zinc-950",
        pill: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        border: "border-rose-500/30",
      };
    }
    if (strategy.includes("Playbook B")) {
      return {
        badgeBg: "bg-amber-500/15 border-amber-500/30 text-amber-300",
        glow: "from-amber-500/10 via-zinc-900/60 to-zinc-950",
        pill: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        border: "border-amber-500/30",
      };
    }
    if (strategy.includes("Playbook C")) {
      return {
        badgeBg: "bg-sky-500/15 border-sky-500/30 text-sky-300",
        glow: "from-sky-500/10 via-zinc-900/60 to-zinc-950",
        pill: "bg-sky-500/20 text-sky-300 border-sky-500/30",
        border: "border-sky-500/30",
      };
    }
    // Playbook D or default
    return {
      badgeBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
      glow: "from-emerald-500/10 via-zinc-900/60 to-zinc-950",
      pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      border: "border-emerald-500/30",
    };
  };

  // Filtered & Sorted Tweets
  const processedTweets = useMemo(() => {
    let result = [...tweets];

    if (activeFilter === "verified") {
      result = result.filter((t) => t.author?.isBlueVerified || t.author?.isVerified);
    } else if (activeFilter === "no_replies") {
      result = result.filter((t) => !t.isReply);
    } else if (activeFilter === "high_engagement") {
      result = result.filter((t) => (t.likeCount || 0) >= 10 || (t.viewCount && t.viewCount >= 500));
    } else if (activeFilter === "questions") {
      result = result.filter(
        (t) =>
          t.text.includes("?") ||
          t.text.toLowerCase().includes("how") ||
          t.text.toLowerCase().includes("why") ||
          t.text.toLowerCase().includes("anyone")
      );
    }

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

    result.sort((a, b) => {
      if (sortBy === "likes") return (b.likeCount || 0) - (a.likeCount || 0);
      if (sortBy === "retweets") return (b.retweetCount || 0) - (a.retweetCount || 0);
      if (sortBy === "replies") return (b.replyCount || 0) - (a.replyCount || 0);
      if (sortBy === "views") return (b.viewCount || 0) - (a.viewCount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [tweets, activeFilter, inPageSearch, sortBy]);

  // Aggregate Stats
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

  // Export CSV
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
      "Tweet URL",
      "Tweet Text",
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
      `"${t.url || t.twitterUrl || `https://x.com/${t.author.userName}/status/${t.id}`}"`,
      `"${t.text.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai_advanced_search_${Date.now()}.csv`;
    a.click();
  };

  // Export JSON
  const handleExportJson = () => {
    const payload = {
      aiStrategy,
      stats,
      tweets: processedTweets,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai_advanced_search_${Date.now()}.json`;
    a.click();
  };

  const currentPlaybookStyle = aiStrategy
    ? getPlaybookColorStyles(aiStrategy.searchStrategy)
    : getPlaybookColorStyles("Playbook A");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-sky-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main Hero Banner */}
        <div className="relative rounded-3xl border border-sky-500/25 bg-gradient-to-b from-sky-950/40 via-zinc-900/60 to-zinc-950 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    <span>AI-Powered B2B Search Intelligence</span>
                  </div>

                  {aiSource === "openai" ? (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      OpenAI gpt-4o-mini
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-400">
                      <Zap className="h-3 w-3" />
                      Playbook NLP Engine
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Advanced Twitter Search
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mt-1">
                  Describe what leads you want in natural language. Our AI converts your intent into high-converting Twitter / X search queries with optimized B2B filters.
                </p>
              </div>
            </div>

            {/* Playbook Preset Quick Selectors */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                <span>Select an Intent Playbook or type custom prompt:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PLAYBOOK_DEFINITIONS.map((playbook) => (
                  <button
                    key={playbook.id}
                    type="button"
                    onClick={() => {
                      setUserPrompt(playbook.defaultExample);
                      handleGenerateAndSearch(playbook.defaultExample);
                    }}
                    className={`text-left rounded-2xl border p-3.5 transition-all duration-200 group relative overflow-hidden flex flex-col justify-between ${
                      aiStrategy?.searchStrategy.includes(playbook.id)
                        ? "border-sky-500/60 bg-sky-500/10 shadow-lg shadow-sky-500/10"
                        : "border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider rounded-md px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 group-hover:text-white">
                          {playbook.badge}
                        </span>
                        <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-xs font-bold text-zinc-200 group-hover:text-white line-clamp-1">
                        {playbook.name}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {playbook.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerateAndSearch();
              }}
              className="space-y-4"
            >
              <div className="relative">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerateAndSearch();
                    }
                  }}
                  rows={2}
                  placeholder="Describe your search intent in plain English (e.g. Find people angry with HubSpot and asking for CRM alternatives)..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all resize-none shadow-inner"
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium border transition-all ${
                      showAdvancedOptions
                        ? "bg-sky-500/20 border-sky-500/40 text-sky-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Sliders className="h-3 w-3" />
                    <span>Filter Constraints</span>
                    {showAdvancedOptions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoadingAi || isLoadingTweets}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isLoadingAi || isLoadingTweets ? (
                      <>
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Generating AI Query...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Filter Options Panel */}
              {showAdvancedOptions && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5 text-sky-400" />
                    <span>Twitter/X Quality & Spam Filter Controls</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <label className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 cursor-pointer hover:border-zinc-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={excludeLinks}
                        onChange={(e) => setExcludeLinks(e.target.checked)}
                        className="rounded border-zinc-700 text-sky-500 focus:ring-sky-500/20 bg-zinc-950"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-zinc-200">-filter:links</div>
                        <div className="text-[10px] text-zinc-500">Strips blog marketing</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 cursor-pointer hover:border-zinc-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={excludeRetweets}
                        onChange={(e) => setExcludeRetweets(e.target.checked)}
                        className="rounded border-zinc-700 text-sky-500 focus:ring-sky-500/20 bg-zinc-950"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-zinc-200">-is:retweet</div>
                        <div className="text-[10px] text-zinc-500">Original posts only</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 cursor-pointer hover:border-zinc-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={englishOnly}
                        onChange={(e) => setEnglishOnly(e.target.checked)}
                        className="rounded border-zinc-700 text-sky-500 focus:ring-sky-500/20 bg-zinc-950"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-zinc-200">lang:en</div>
                        <div className="text-[10px] text-zinc-500">English results only</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 cursor-pointer hover:border-zinc-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={excludeHiring}
                        onChange={(e) => setExcludeHiring(e.target.checked)}
                        className="rounded border-zinc-700 text-sky-500 focus:ring-sky-500/20 bg-zinc-950"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-zinc-200">-job -hiring</div>
                        <div className="text-[10px] text-zinc-500">Filters recruiter noise</div>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Specific Competitor Handle (Optional, e.g. useapolloai, hubspot)
                      </label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          value={competitorHandle}
                          onChange={(e) => setCompetitorHandle(e.target.value.replace(/^@/, ""))}
                          placeholder="Competitor username..."
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Minimum Likes Threshold (min_faves)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={minFaves || ""}
                        onChange={(e) => setMinFaves(Number(e.target.value) || 0)}
                        placeholder="0 (no minimum)"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
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
              <div className="font-semibold text-sm">Search Request Error</div>
              <div className="text-xs text-rose-300/80">{error}</div>
            </div>
          </div>
        )}

        {/* AI Strategy & Query Breakdown Card */}
        {aiStrategy && (
          <div className={`relative rounded-3xl border ${currentPlaybookStyle.border} bg-gradient-to-b ${currentPlaybookStyle.glow} p-6 sm:p-7 shadow-2xl space-y-5`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`rounded-xl px-3 py-1 text-xs font-black tracking-wide border ${currentPlaybookStyle.badgeBg}`}>
                  {aiStrategy.searchStrategy}
                </span>
                <span className="text-sm font-semibold text-white">
                  {aiStrategy.searchIntent}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  Tactical Playbook Active
                </span>
              </div>
            </div>

            {/* Generated Query String Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-sky-400" />
                  Generated Twitter Boolean Query:
                </span>
                <span className="text-[11px] text-zinc-500">
                  Ready for Twitter Search API execution
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={editableQuery}
                    onChange={(e) => {
                      setEditableQuery(e.target.value);
                      setIsEditingQuery(true);
                    }}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 font-mono text-xs text-sky-300 px-4 py-3 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 focus:outline-none shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isEditingQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        handleReSearchCustomQuery(editableQuery);
                        setIsEditingQuery(false);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-3 text-xs font-bold text-white shadow-md hover:bg-sky-400 transition-all cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Re-Run Query</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyQuery}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    {copiedQuery ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Copy Query</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://x.com/search?q=${encodeURIComponent(editableQuery || aiStrategy.generatedQuery)}&f=live`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-xs font-semibold text-zinc-300 hover:text-sky-400 hover:bg-zinc-800 transition-all"
                  >
                    <TwitterIcon className="h-3.5 w-3.5 fill-current" />
                    <span>Open on X</span>
                    <ExternalLink className="h-3 w-3 text-zinc-500" />
                  </a>
                </div>
              </div>
            </div>

            {/* Applied Filters Tags & Pro Tip */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
              {/* Applied Filters list */}
              <div className="lg:col-span-2 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Applied Filters & Syntaxes:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {aiStrategy.appliedFilters.map((filterDesc, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-zinc-800/80 bg-zinc-950/80 px-2.5 py-1 text-xs text-zinc-300 font-mono"
                    >
                      {filterDesc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Outreach Pro Tip Banner */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Tactical Outreach Pro-Tip</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {aiStrategy.proTip}
                </p>
              </div>
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
              <div className="text-[11px] text-zinc-500 mt-0.5">Matching generated query</div>
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

        {/* Toolbar: In-Page Filters, Sorting, In-Page Search, and Exports */}
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
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shrink-0 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              {/* Export JSON */}
              <button
                onClick={handleExportJson}
                title="Export complete result and AI analysis as JSON"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shrink-0 cursor-pointer"
              >
                <FileJson className="h-3.5 w-3.5 text-sky-400" />
                <span>JSON</span>
              </button>
            </div>

          </div>
        )}

        {/* Loading Skeleton */}
        {(isLoadingAi || isLoadingTweets) && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-sky-500/20 bg-zinc-900/40 p-8 text-center space-y-3">
              <div className="h-10 w-10 mx-auto rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
              <div className="text-sm font-bold text-zinc-200">
                {isLoadingAi ? "AI converting intent to boolean query & strategy..." : "Fetching real-time Twitter results..."}
              </div>
              <p className="text-xs text-zinc-500">Applying quality filters (-filter:links, -is:retweet, lang:en)</p>
            </div>

            {[1, 2, 3].map((n) => (
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
              </div>
            ))}
          </div>
        )}

        {/* Results List */}
        {!isLoadingAi && !isLoadingTweets && processedTweets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span>
                Showing <strong className="text-white">{processedTweets.length}</strong> posts
                {inPageSearch && ` matching "${inPageSearch}"`}
              </span>
              <span className="text-zinc-500">Click any card to inspect full JSON or generate AI replies</span>
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
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 disabled:opacity-50 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
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
        {!isLoadingAi && !isLoadingTweets && processedTweets.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto text-zinc-500">
              <TwitterIcon className="h-7 w-7 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-200">No tweets found for this query</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                {inPageSearch
                  ? `No tweets match your in-page filter "${inPageSearch}".`
                  : "Try broadening your prompt, removing restrictive filters, or selecting one of the intent playbook presets."}
              </p>
            </div>
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
