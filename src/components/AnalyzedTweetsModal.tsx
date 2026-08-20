"use client";

import { useState } from "react";
import { CompetitorAnalyzedTweet, CompetitorAnalysisStats } from "@/lib/twitterTypes";
import { TwitterIcon } from "@/components/SocialIcons";
import { formatCompactNumber, formatRelativeDate, formatFullDateTime } from "@/lib/twitterFormatters";
import {
  X,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  Sparkles,
  FileJson,
  FileSpreadsheet
} from "lucide-react";

interface AnalyzedTweetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTweets: CompetitorAnalyzedTweet[];
  stats: CompetitorAnalysisStats | null;
}

export function AnalyzedTweetsModal({
  isOpen,
  onClose,
  allTweets,
  stats,
}: AnalyzedTweetsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "leads" | "non-leads">("all");

  if (!isOpen) return null;

  const filteredTweets = allTweets.filter((item) => {
    const matchesFilter =
      filterType === "all"
        ? true
        : filterType === "leads"
        ? item.isLead
        : !item.isLead;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      query === "" ||
      item.tweet.text.toLowerCase().includes(query) ||
      (item.tweet.author?.name || "").toLowerCase().includes(query) ||
      (item.tweet.author?.userName || "").toLowerCase().includes(query) ||
      (item.competitorHandle || "").toLowerCase().includes(query) ||
      (item.painPointAnalysis || "").toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = [
      "Tweet ID",
      "Author Name",
      "Author Handle",
      "Created At",
      "Competitor Mentioned",
      "Is Lead",
      "Match Score",
      "Lead Type",
      "Pain Point Analysis",
      "Tweet Text",
      "Tweet URL",
    ].join(",");

    const rows = filteredTweets.map((item) => {
      const url =
        item.tweet.url ||
        item.tweet.twitterUrl ||
        `https://x.com/${item.tweet.author?.userName}/status/${item.tweet.id}`;
      return [
        `"${item.id}"`,
        `"${(item.tweet.author?.name || "").replace(/"/g, '""')}"`,
        `"@${item.tweet.author?.userName || ""}"`,
        `"${item.tweet.createdAt}"`,
        `"@${item.competitorHandle.replace('@', '')}"`,
        `"${item.isLead ? "YES" : "NO"}"`,
        `"${item.matchScore}%"`,
        `"${(item.leadType || "").replace(/"/g, '""')}"`,
        `"${(item.painPointAnalysis || "").replace(/"/g, '""')}"`,
        `"${item.tweet.text.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${url}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analyzed_competitor_tweets_${Date.now()}.csv`;
    link.click();
  };

  const handleExportJson = () => {
    const jsonContent = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        stats,
        totalExported: filteredTweets.length,
        tweets: filteredTweets,
      },
      null,
      2
    );
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analyzed_competitor_tweets_${Date.now()}.json`;
    link.click();
  };

  const leadsCount = allTweets.filter((t) => t.isLead).length;
  const nonLeadsCount = allTweets.length - leadsCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <TwitterIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                All Analyzed Competitor Mentions
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300 font-mono">
                  {allTweets.length} Tweets
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Full transparent log of every tweet fetched in the last 7 days and evaluated by AI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
              title="Export filtered tweets to CSV spreadsheet"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
              title="Export filtered tweets to JSON payload"
            >
              <FileJson className="h-3.5 w-3.5 text-sky-400" />
              <span>Export JSON</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 px-6 py-3 bg-zinc-950/80">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                filterType === "all"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Mentions ({allTweets.length})
            </button>
            <button
              onClick={() => setFilterType("leads")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                filterType === "leads"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>AI Qualified Leads ({leadsCount})</span>
            </button>
            <button
              onClick={() => setFilterType("non-leads")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                filterType === "non-leads"
                  ? "bg-zinc-800 text-zinc-300 border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <XCircle className="h-3.5 w-3.5 text-zinc-500" />
              <span>Non-Leads / Praise ({nonLeadsCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in tweets, users, bio..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tweets List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-170px)]">
          {filteredTweets.length > 0 ? (
            filteredTweets.map((item, idx) => {
              const tweetUrl =
                item.tweet.url ||
                item.tweet.twitterUrl ||
                `https://x.com/${item.tweet.author?.userName}/status/${item.tweet.id}`;
              const authorUrl = `https://x.com/${item.tweet.author?.userName}`;

              return (
                <div
                  key={item.id || idx}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3 ${
                    item.isLead
                      ? "border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50"
                      : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  {/* Top Row: Author & Lead Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.tweet.author?.profilePicture ||
                          "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                        }
                        alt={item.tweet.author?.name || "Author"}
                        className="h-10 w-10 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute(
                            "src",
                            "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                          );
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={authorUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-sm text-zinc-100 hover:text-sky-400 transition-colors"
                          >
                            {item.tweet.author?.name}
                          </a>
                          <span className="text-xs text-zinc-400">
                            @{item.tweet.author?.userName}
                          </span>
                          <span className="rounded-md bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-400 font-mono">
                            Mentioned @{item.competitorHandle.replace('@', '')}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>
                            {item.tweet.author?.followers !== undefined
                              ? `${formatCompactNumber(item.tweet.author.followers)} followers`
                              : "Active user"}
                          </span>
                          <span>&bull;</span>
                          <span title={formatFullDateTime(item.tweet.createdAt)}>
                            {formatRelativeDate(item.tweet.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {item.isLead ? (
                        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Lead: {item.matchScore}% Match</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1 text-xs font-medium text-zinc-400">
                          <XCircle className="h-3.5 w-3.5 text-zinc-500" />
                          <span>Not a Lead ({item.sentiment === "positive_to_competitor" ? "Praise" : "Neutral"})</span>
                        </div>
                      )}

                      <a
                        href={tweetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-400 hover:text-sky-300 hover:border-zinc-700 transition-all"
                        title="View tweet on X"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Tweet Text */}
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
                    {item.tweet.text}
                  </p>

                  {/* AI Evaluation Reason */}
                  <div className="flex items-start gap-2 text-xs pt-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-semibold text-zinc-300">
                        AI Assessment:{" "}
                        <span className="font-normal text-zinc-400">
                          {item.painPointAnalysis || "Competitor mention evaluated."}
                        </span>
                      </div>
                      {item.isLead && item.suggestedOutreachHook && (
                        <div className="text-[11px] text-sky-300 font-sans italic bg-sky-950/30 p-2 rounded-lg border border-sky-500/20">
                          Suggested Hook: &quot;{item.suggestedOutreachHook}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-2">
              <Layers className="h-8 w-8 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-300">No tweets match current filter</h3>
              <p className="text-xs text-zinc-500">
                Try switching between &quot;All Mentions&quot;, &quot;AI Qualified Leads&quot;, or clear your search term.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
