"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { LinkedinPostCard } from "@/components/LinkedinPostCard";
import { LinkedinDetailModal } from "@/components/LinkedinDetailModal";
import { LinkedinPostItem, LinkedinSearchResponse } from "@/lib/linkedinTypes";
import { LinkedinIcon } from "@/components/SocialIcons";
import {
  Search,
  Sparkles,
  ArrowUpDown,
  FileJson,
  FileSpreadsheet,
  SlidersHorizontal,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronDown,
  Building2,
  MessageSquare,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

const POPULAR_PRESETS = [
  { label: "AI Agents", query: "AI agents OR LLM" },
  { label: "B2B SaaS Growth", query: "B2B SaaS growth OR ARR" },
  { label: "Hiring Tech Leaders", query: "Hiring engineering leader OR CTO" },
  { label: "Startup Founders", query: "building in public OR startup founder" },
  { label: "YC Tech News", query: "Y Combinator OR TechCrunch AI" },
  { label: "Remote Engineers", query: "hiring remote software engineer" },
];

export default function LinkedinSearchPage() {
  const [keywords, setKeywords] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "date">("relevance");
  const [datePosted, setDatePosted] = useState<
    "all" | "past_day" | "past_week" | "past_month"
  >("all");
  const [contentType, setContentType] = useState<
    | "all"
    | "images"
    | "videos"
    | "documents"
    | "jobs"
    | "collaborative_articles"
  >("all");
  const [limit, setLimit] = useState<number>(10);

  const [posts, setPosts] = useState<LinkedinPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [dataSource, setDataSource] = useState<"api" | "fallback">("api");
  const [apiAccountId, setApiAccountId] = useState<string>("");

  // In-results filtering & sorting
  const [inPageFilter, setInPageFilter] = useState("");
  const [inPageSort, setInPageSort] = useState<
    "default" | "reactions" | "comments" | "reposts" | "date"
  >("default");

  // Search history
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("linkedin_search_history");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  // Detailed Post Modal
  const [inspectedPost, setInspectedPost] = useState<LinkedinPostItem | null>(
    null
  );

  const saveToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setRecentSearches((prev) => {
      const updated = [
        searchTerm,
        ...prev.filter((s) => s.toLowerCase() !== searchTerm.toLowerCase()),
      ].slice(0, 6);
      try {
        localStorage.setItem("linkedin_search_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const performSearch = useCallback(
    async (
      searchTerm: string,
      sortOpt: "relevance" | "date" = sortBy,
      dateOpt: "all" | "past_day" | "past_week" | "past_month" = datePosted,
      typeOpt:
        | "all"
        | "images"
        | "videos"
        | "documents"
        | "jobs"
        | "collaborative_articles" = contentType,
      limitOpt: number = limit
    ) => {
      if (!searchTerm.trim()) return;
      setIsLoading(true);
      setHasSearched(true);
      setError(null);
      setNextCursor(null);
      setHasNextPage(false);

      try {
        const params = new URLSearchParams();
        params.append("keywords", searchTerm.trim());
        if (sortOpt) params.append("sortBy", sortOpt);
        if (dateOpt !== "all") params.append("datePosted", dateOpt);
        if (typeOpt !== "all") params.append("contentType", typeOpt);
        params.append("limit", limitOpt.toString());

        const res = await fetch(`/api/linkedin/search?${params.toString()}`);
        const json: LinkedinSearchResponse = await res.json();

        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error || "Failed to search LinkedIn posts");
        }

        setPosts(json.data.items || []);
        setHasNextPage(Boolean(json.data.has_next_page));
        setNextCursor(json.data.next_cursor || null);
        setDataSource(json.data.source || "api");
        if (json.data.apiStatus?.accountId) {
          setApiAccountId(json.data.apiStatus.accountId);
        }
        saveToHistory(searchTerm);
      } catch (err: unknown) {
        console.error("LinkedIn search error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while searching LinkedIn."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sortBy, datePosted, contentType, limit, saveToHistory]
  );

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams();
      params.append("keywords", keywords.trim());
      if (sortBy) params.append("sortBy", sortBy);
      if (datePosted !== "all") params.append("datePosted", datePosted);
      if (contentType !== "all") params.append("contentType", contentType);
      params.append("limit", limit.toString());
      params.append("cursor", nextCursor);

      const res = await fetch(`/api/linkedin/search?${params.toString()}`);
      const json: LinkedinSearchResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Failed to load more posts");
      }

      const newItems = json.data.items || [];
      // Deduplicate posts
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = newItems.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });

      setHasNextPage(Boolean(json.data.has_next_page));
      setNextCursor(json.data.next_cursor || null);
    } catch (err: unknown) {
      console.error("Error loading more LinkedIn posts:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(keywords, sortBy, datePosted, contentType, limit);
  };

  const handlePresetClick = (query: string) => {
    setKeywords(query);
    performSearch(query, sortBy, datePosted, contentType, limit);
  };

  // Filter & Sort in-memory posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (inPageFilter.trim()) {
      const term = inPageFilter.toLowerCase();
      result = result.filter(
        (p) =>
          p.text.toLowerCase().includes(term) ||
          p.author?.name?.toLowerCase().includes(term) ||
          p.author?.headline?.toLowerCase().includes(term) ||
          p.job_posting?.title?.toLowerCase().includes(term) ||
          p.job_posting?.company?.name?.toLowerCase().includes(term)
      );
    }

    if (inPageSort === "reactions") {
      result.sort((a, b) => (b.reaction_counter || 0) - (a.reaction_counter || 0));
    } else if (inPageSort === "comments") {
      result.sort((a, b) => (b.comment_counter || 0) - (a.comment_counter || 0));
    } else if (inPageSort === "reposts") {
      result.sort((a, b) => (b.repost_counter || 0) - (a.repost_counter || 0));
    } else if (inPageSort === "date") {
      result.sort((a, b) => {
        const dateA = a.parsed_datetime ? new Date(a.parsed_datetime).getTime() : 0;
        const dateB = b.parsed_datetime ? new Date(b.parsed_datetime).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [posts, inPageFilter, inPageSort]);

  // Export to JSON
  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredPosts, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `linkedin_posts_${keywords.replace(/\s+/g, "_")}_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Author Name",
      "Author Headline",
      "Is Company",
      "Date",
      "Reactions",
      "Comments",
      "Reposts",
      "Impressions",
      "Share URL",
      "Text",
      "Job Title",
      "Job Company",
    ];

    const rows = filteredPosts.map((p) => [
      `"${p.id}"`,
      `"${(p.author?.name || "").replace(/"/g, '""')}"`,
      `"${(p.author?.headline || "").replace(/"/g, '""')}"`,
      p.author?.is_company ? "true" : "false",
      `"${p.parsed_datetime || p.date || ""}"`,
      p.reaction_counter || 0,
      p.comment_counter || 0,
      p.repost_counter || 0,
      p.impressions_counter || 0,
      `"${p.share_url || ""}"`,
      `"${(p.text || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${(p.job_posting?.title || "").replace(/"/g, '""')}"`,
      `"${(p.job_posting?.company?.name || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `linkedin_posts_${keywords.replace(/\s+/g, "_")}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-sky-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Sub-navigation Switcher: Posts vs Companies */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
          <Link
            href="/linkedin"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0077B5] to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20"
          >
            <MessageSquare className="h-4 w-4" />
            <span>LinkedIn Posts</span>
          </Link>

          <Link
            href="/linkedin/companies"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-all"
          >
            <Building2 className="h-4 w-4 text-sky-400" />
            <span>Company Search</span>
          </Link>
        </div>

        {/* Header Title & Status Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0077B5]/20 border border-[#0077B5]/40 text-[#0077B5] shadow-lg shadow-[#0077B5]/10">
                <LinkedinIcon className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  LinkedIn Post & Intent Search
                  <span className="rounded-full bg-[#0077B5]/20 border border-[#0077B5]/40 px-2.5 py-0.5 text-xs font-semibold text-sky-400">
                    Unipile API
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Search live LinkedIn posts, filter by date & media, and discover high-intent conversations.
                </p>
              </div>
            </div>
          </div>

          {/* API Connection Indicator */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {dataSource === "api" ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-medium text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Live Unipile API Connected</span>
                {apiAccountId && (
                  <span className="font-mono text-[10px] text-emerald-400/80 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    Account: {apiAccountId.slice(0, 8)}...
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 text-xs font-medium text-amber-300">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span>Offline / Sample Resilience Mode</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar & Presets Card */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Main Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="relative flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <Search className="h-5 w-5 text-sky-400" />
                </div>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Enter keywords (e.g., 'AI agents', 'hiring engineers', 'SaaS pricing')..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 text-sm transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setKeywords("");
                    setPosts([]);
                    setHasSearched(false);
                  }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !keywords.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0077B5] to-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:from-[#006097] hover:to-blue-500 transition-all disabled:opacity-50 shrink-0"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Search Posts</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Sort By */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> Sort By
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "relevance" | "date")
                    }
                    className="w-full appearance-none rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Latest Date</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Date Posted */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date Posted
                </label>
                <div className="relative">
                  <select
                    value={datePosted}
                    onChange={(e) =>
                      setDatePosted(
                        e.target.value as
                          | "all"
                          | "past_day"
                          | "past_week"
                          | "past_month"
                      )
                    }
                    className="w-full appearance-none rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="all">Any Time</option>
                    <option value="past_day">Past 24 Hours</option>
                    <option value="past_week">Past Week</option>
                    <option value="past_month">Past Month</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Content Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Content Type
                </label>
                <div className="relative">
                  <select
                    value={contentType}
                    onChange={(e) =>
                      setContentType(
                        e.target.value as
                          | "all"
                          | "images"
                          | "videos"
                          | "documents"
                          | "jobs"
                          | "collaborative_articles"
                      )
                    }
                    className="w-full appearance-none rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="all">All Content Types</option>
                    <option value="images">Images</option>
                    <option value="videos">Videos</option>
                    <option value="documents">Documents</option>
                    <option value="jobs">Job Listings</option>
                    <option value="collaborative_articles">Articles</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Results Per Page */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3" /> Batch Size
                </label>
                <div className="relative">
                  <select
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                    className="w-full appearance-none rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value={5}>5 posts</option>
                    <option value={10}>10 posts (Default)</option>
                    <option value={20}>20 posts</option>
                    <option value={40}>40 posts</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </form>

          {/* Quick Presets Carousel */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/60">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Suggested B2B Lead & Search Topics:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.query)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-300 transition-all shadow-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Banner (if any) */}
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 flex items-start gap-3 text-rose-300">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold">Search request encountered an issue</p>
              <p className="text-rose-400/90 leading-relaxed">{error}</p>
              <p className="text-zinc-400 mt-1">
                Displaying fallback sample results for continuity. Make sure your <code className="text-sky-300 bg-zinc-900 px-1 py-0.5 rounded">.env</code> has valid <code className="text-sky-300 bg-zinc-900 px-1 py-0.5 rounded">UNIPILE_API_KEY</code> and <code className="text-sky-300 bg-zinc-900 px-1 py-0.5 rounded">UNIPILE_ACCOUNT_ID</code>.
              </p>
            </div>
          </div>
        )}

        {/* Results Toolbar & Stats */}
        {hasSearched && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Results</span>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-bold text-sky-400">
                  {filteredPosts.length} posts
                </span>
              </div>

              {keywords && (
                <span className="text-xs text-zinc-400 hidden sm:inline">
                  for <span className="font-medium text-zinc-200">"{keywords}"</span>
                </span>
              )}
            </div>

            {/* Quick Filters & Export Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter in results */}
              <div className="relative">
                <input
                  type="text"
                  value={inPageFilter}
                  onChange={(e) => setInPageFilter(e.target.value)}
                  placeholder="Filter in results..."
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500 w-36 sm:w-44"
                />
              </div>

              {/* In-page Sort Dropdown */}
              <div className="relative">
                <select
                  value={inPageSort}
                  onChange={(e) =>
                    setInPageSort(
                      e.target.value as
                        | "default"
                        | "reactions"
                        | "comments"
                        | "reposts"
                        | "date"
                    )
                  }
                  className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900 pl-3 pr-7 py-1.5 text-xs font-medium text-zinc-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="default">Default Order</option>
                  <option value="reactions">Top Reactions</option>
                  <option value="comments">Most Comments</option>
                  <option value="reposts">Most Reposts</option>
                  <option value="date">Newest Date</option>
                </select>
                <ChevronDown className="absolute right-2 top-2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
              </div>

              {/* Export JSON */}
              <button
                onClick={handleExportJson}
                disabled={filteredPosts.length === 0}
                className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 transition-all"
                title="Export filtered results to JSON"
              >
                <FileJson className="h-3.5 w-3.5 text-sky-400" />
                <span className="hidden md:inline">JSON</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={handleExportCsv}
                disabled={filteredPosts.length === 0}
                className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 transition-all"
                title="Export filtered results to CSV spreadsheet"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden md:inline">CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* Post Results List / Grid */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-zinc-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 rounded bg-zinc-800" />
                    <div className="h-3 w-64 rounded bg-zinc-800" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-zinc-800" />
                  <div className="h-4 w-5/6 rounded bg-zinc-800" />
                  <div className="h-4 w-2/3 rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched && filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <LinkedinPostCard
                key={post.id}
                post={post}
                onInspectJson={(item) => setInspectedPost(item)}
              />
            ))}

            {/* Pagination / Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-6 pb-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 rounded-2xl border border-sky-500/40 bg-sky-500/10 px-8 py-3.5 text-sm font-bold text-sky-300 hover:bg-sky-500/20 hover:scale-[1.02] shadow-lg shadow-sky-500/10 transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-sky-400/20 border-t-sky-400 animate-spin" />
                      <span>Fetching Next Page...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      <span>Load More LinkedIn Posts</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : hasSearched ? (
          /* Empty State after search */
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 mx-auto text-zinc-400">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                No LinkedIn posts found
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No posts matched your current search and filter criteria. Try searching broader keywords or clearing filters.
              </p>
            </div>
          </div>
        ) : (
          /* Initial State before searching */
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/20 p-12 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0077B5]/10 border border-[#0077B5]/20 mx-auto text-[#0077B5]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Ready to Search LinkedIn Posts
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Enter keywords or pick one of the suggested topics above to discover live LinkedIn posts and conversations.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* JSON Inspector Modal */}
      <LinkedinDetailModal
        post={inspectedPost}
        isOpen={Boolean(inspectedPost)}
        onClose={() => setInspectedPost(null)}
      />
    </div>
  );
}
