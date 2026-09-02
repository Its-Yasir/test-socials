"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { LinkedinCompanyCard } from "@/components/LinkedinCompanyCard";
import { LinkedinCompanyDetailModal } from "@/components/LinkedinCompanyDetailModal";
import {
  LinkedinCompanyItem,
  LinkedinCompanySearchResponse,
} from "@/lib/linkedinTypes";
import {
  Search,
  Building2,
  MapPin,
  Layers,
  Sparkles,
  RotateCcw,
  AlertCircle,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

const POPULAR_INDUSTRY_PRESETS = [
  { label: "All Tech", query: "Technology, Information and Internet" },
  { label: "IT Services", query: "IT Services and IT Consulting" },
  { label: "Software Dev", query: "Software Development" },
  { label: "Financial Services", query: "Financial Services" },
  { label: "Healthcare & Biotech", query: "Hospitals and Health Care" },
  { label: "Staffing & Recruiting", query: "Staffing and Recruiting" },
];

const POPULAR_LOCATION_PRESETS = [
  "San Francisco, CA",
  "New York, NY",
  "Austin, TX",
  "London, UK",
  "Berlin, Germany",
  "Boston, MA",
];

export default function LinkedinCompanySearchPage() {
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [limit, setLimit] = useState<number>(10);

  const [companies, setCompanies] = useState<LinkedinCompanyItem[]>([]);
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
    "default" | "followers" | "name" | "location"
  >("default");

  // Detailed Modal
  const [inspectedCompany, setInspectedCompany] =
    useState<LinkedinCompanyItem | null>(null);

  const performSearch = useCallback(
    async (
      kw: string = keywords,
      loc: string = location,
      ind: string = industry,
      limitOpt: number = limit
    ) => {
      if (!kw.trim() && !loc.trim() && !ind.trim()) {
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      setError(null);
      setNextCursor(null);
      setHasNextPage(false);

      try {
        const params = new URLSearchParams();
        if (kw.trim()) params.append("keywords", kw.trim());
        if (loc.trim()) params.append("location", loc.trim());
        if (ind.trim()) params.append("industry", ind.trim());
        params.append("limit", limitOpt.toString());

        const res = await fetch(`/api/linkedin/companies?${params.toString()}`);
        const json: LinkedinCompanySearchResponse = await res.json();

        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error || "Failed to search LinkedIn companies");
        }

        setCompanies(json.data.companies || []);
        setHasNextPage(Boolean(json.data.has_next_page));
        setNextCursor(json.data.next_cursor || null);
        setDataSource(json.data.source || "api");
        if (json.data.apiStatus?.accountId) {
          setApiAccountId(json.data.apiStatus.accountId);
        }
      } catch (err: unknown) {
        console.error("LinkedIn company search error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while searching companies."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [keywords, location, industry, limit]
  );

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (keywords.trim()) params.append("keywords", keywords.trim());
      if (location.trim()) params.append("location", location.trim());
      if (industry.trim()) params.append("industry", industry.trim());
      params.append("limit", limit.toString());
      params.append("cursor", nextCursor);

      const res = await fetch(`/api/linkedin/companies?${params.toString()}`);
      const json: LinkedinCompanySearchResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Failed to load more companies");
      }

      const newItems = json.data.companies || [];
      // Deduplicate
      setCompanies((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const filteredNew = newItems.filter((c) => !existingIds.has(c.id));
        return [...prev, ...filteredNew];
      });

      setHasNextPage(Boolean(json.data.has_next_page));
      setNextCursor(json.data.next_cursor || null);
    } catch (err: unknown) {
      console.error("Error loading more LinkedIn companies:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(keywords, location, industry, limit);
  };

  // Filter & Sort in-memory companies
  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    if (inPageFilter.trim()) {
      const term = inPageFilter.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.industry?.toLowerCase().includes(term) ||
          c.location?.toLowerCase().includes(term) ||
          c.summary?.toLowerCase().includes(term)
      );
    }

    if (inPageSort === "followers") {
      result.sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0));
    } else if (inPageSort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (inPageSort === "location") {
      result.sort((a, b) =>
        (a.location || "").localeCompare(b.location || "")
      );
    }

    return result;
  }, [companies, inPageFilter, inPageSort]);

  // Export to JSON
  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredCompanies, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `linkedin_companies_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Company Name",
      "Industry",
      "Location",
      "Followers",
      "LinkedIn Profile URL",
      "Summary",
    ];

    const rows = filteredCompanies.map((c) => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.industry || "").replace(/"/g, '""')}"`,
      `"${(c.location || "").replace(/"/g, '""')}"`,
      c.followers_count || 0,
      `"${c.profile_url || ""}"`,
      `"${(c.summary || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `linkedin_companies_${Date.now()}.csv`
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
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-all"
          >
            <MessageSquare className="h-4 w-4 text-sky-400" />
            <span>LinkedIn Posts</span>
          </Link>

          <Link
            href="/linkedin/companies"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0077B5] to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20"
          >
            <Building2 className="h-4 w-4" />
            <span>Company Search</span>
          </Link>
        </div>

        {/* Header Title & Status Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0077B5]/20 border border-[#0077B5]/40 text-[#0077B5] shadow-lg shadow-[#0077B5]/10">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  LinkedIn Company Search
                  <span className="rounded-full bg-[#0077B5]/20 border border-[#0077B5]/40 px-2.5 py-0.5 text-xs font-semibold text-sky-400">
                    Location & Industry
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Discover companies, filter by geographical location & industry verticals, and generate B2B account outreach proposals.
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

        {/* Search Bar & Multi-Field Filter Card */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-xl space-y-6">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Keywords Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-sky-400" />
                  <span>Keywords / Company Type</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. AI agents, Cybersecurity, SaaS..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 text-xs sm:text-sm transition-all shadow-inner"
                />
              </div>

              {/* Location Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span>Location (Optional)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or London, UK..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 text-xs sm:text-sm transition-all shadow-inner"
                />
              </div>

              {/* Industry Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Industry (Optional)</span>
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Software, Financial Services, Health..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-xs sm:text-sm transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Action Buttons & Batch Size */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-zinc-400">Batch Limit:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  className="appearance-none rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value={5}>5 companies</option>
                  <option value={10}>10 companies (Default)</option>
                  <option value={20}>20 companies</option>
                  <option value={40}>40 companies</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setKeywords("");
                    setLocation("");
                    setIndustry("");
                    setCompanies([]);
                    setHasSearched(false);
                  }}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
                >
                  Clear Fields
                </button>

                <button
                  type="submit"
                  disabled={isLoading || (!keywords.trim() && !location.trim() && !industry.trim())}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0077B5] to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xl shadow-blue-500/20 hover:from-[#006097] hover:to-blue-500 transition-all disabled:opacity-50 shrink-0"
                >
                  {isLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Searching Companies...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-3.5 w-3.5" />
                      <span>Search Companies</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Presets Row: Industries and Locations */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/60">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Industry Presets:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_INDUSTRY_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setIndustry(p.query);
                      performSearch(keywords, location, p.query, limit);
                    }}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all shadow-sm"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                <span>Location Presets:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_LOCATION_PRESETS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      performSearch(keywords, loc, industry, limit);
                    }}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 transition-all shadow-sm"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
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
                <span className="text-sm font-bold text-white">Companies</span>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-bold text-sky-400">
                  {filteredCompanies.length} results
                </span>
              </div>

              {(keywords || location || industry) && (
                <span className="text-xs text-zinc-400 hidden sm:inline">
                  for{" "}
                  <span className="font-medium text-zinc-200">
                    {[keywords, location, industry].filter(Boolean).join(" • ")}
                  </span>
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
                        | "followers"
                        | "name"
                        | "location"
                    )
                  }
                  className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900 pl-3 pr-7 py-1.5 text-xs font-medium text-zinc-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="default">Default Order</option>
                  <option value="followers">Most Followers</option>
                  <option value="name">Company Name (A-Z)</option>
                  <option value="location">Location</option>
                </select>
                <ChevronDown className="absolute right-2 top-2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
              </div>

              {/* Export JSON */}
              <button
                onClick={handleExportJson}
                disabled={filteredCompanies.length === 0}
                className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 transition-all"
                title="Export filtered results to JSON"
              >
                <FileJson className="h-3.5 w-3.5 text-sky-400" />
                <span className="hidden md:inline">JSON</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={handleExportCsv}
                disabled={filteredCompanies.length === 0}
                className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 transition-all"
                title="Export filtered results to CSV spreadsheet"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden md:inline">CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* Company Results List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 animate-pulse"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 rounded bg-zinc-800" />
                    <div className="h-3 w-72 rounded bg-zinc-800" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-zinc-800" />
                  <div className="h-3 w-5/6 rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched && filteredCompanies.length > 0 ? (
          <div className="space-y-4">
            {filteredCompanies.map((company) => (
              <LinkedinCompanyCard
                key={company.id}
                company={company}
                onInspectJson={(item) => setInspectedCompany(item)}
              />
            ))}

            {/* Pagination / Load More */}
            {hasNextPage && (
              <div className="flex justify-center pt-6 pb-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 rounded-2xl border border-blue-500/40 bg-blue-500/10 px-8 py-3.5 text-sm font-bold text-sky-300 hover:bg-blue-500/20 hover:scale-[1.02] shadow-lg shadow-blue-500/10 transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-sky-400/20 border-t-sky-400 animate-spin" />
                      <span>Loading More Companies...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      <span>Load More LinkedIn Companies</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : hasSearched ? (
          /* Empty State when searched */
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 mx-auto text-zinc-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                No LinkedIn companies found
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No organizations matched your search criteria. Try broader keywords or different location/industry filters.
              </p>
            </div>
          </div>
        ) : (
          /* Initial State before search */
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/20 p-12 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 mx-auto text-sky-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Ready to Search LinkedIn Companies
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Enter a keyword, target location, or industry vertical above to search live LinkedIn organizations.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* JSON Inspector Modal */}
      <LinkedinCompanyDetailModal
        company={inspectedCompany}
        isOpen={Boolean(inspectedCompany)}
        onClose={() => setInspectedCompany(null)}
      />
    </div>
  );
}
