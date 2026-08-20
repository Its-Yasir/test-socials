"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { IcpInputSection } from "@/components/IcpInputSection";
import { RedditResultCard } from "@/components/RedditResultCard";
import { ScanningLoader } from "@/components/ScanningLoader";
import { IcpInput, RedditLead, generateRedditLeads } from "@/lib/sampleDataGenerator";
import {
  MessageSquareCode,
  Sparkles,
  Filter,
  Search,
  Download,
  Users,
  TrendingUp,
  Zap,
  Flame,
  Award
} from "lucide-react";

export default function RedditPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentIcp, setCurrentIcp] = useState<IcpInput>({
    mode: "freeform",
    freeformText: "B2B SaaS founders and VPs of Engineering building developer tools with 10-50 employees looking to solve customer churn and scale outbound revenue.",
    companyName: "DevScale AI",
    offering: "Automated developer churn analytics and signal discovery tool",
    targetRole: "Founder, VP Growth, Head of Engineering",
    industry: "B2B SaaS & Developer Infrastructure",
    companySize: "10-50 employees ($1M-$5M ARR)",
    painPoints: "High customer acquisition cost, low cold outreach reply rates",
    location: "North America & Europe",
  });

  const [leads, setLeads] = useState<RedditLead[]>(() => generateRedditLeads(currentIcp));
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (icp: IcpInput) => {
    setCurrentIcp(icp);
    setIsLoading(true);
    setTimeout(() => {
      setLeads(generateRedditLeads(icp));
      setIsLoading(false);
    }, 2200);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesFilter =
      activeFilter === "All" ||
      lead.tags.includes(activeFilter) ||
      lead.buyingSignal.type === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      lead.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.subreddit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.postSnippet.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = "Username,Subreddit,MatchScore,Karma,PostTitle,BuyingSignal,OutreachHook\n";
    const rows = filteredLeads
      .map(
        (l) =>
          `"${l.username}","${l.subreddit}","${l.matchScore}%","${l.karma}","${l.postTitle.replace(/"/g, '""')}","${l.buyingSignal.content.replace(/"/g, '""')}","${l.outreachHook.replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reddit_icp_leads_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl border border-orange-500/20 bg-gradient-to-b from-orange-950/30 via-zinc-900/60 to-zinc-950 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
                  <MessageSquareCode className="h-3.5 w-3.5" />
                  <span>Reddit Intent Radar & Community Scanner</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  r/SaaS & r/startups Active
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Discover High-Intent Leads on Reddit
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Scan Reddit subreddits and threads for buyers expressing pain points or asking for vendor recommendations matching your product offering.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5 text-center shadow-inner">
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <Users className="h-3.5 w-3.5 text-orange-400" /> Reddit Matches
                </div>
                <div className="text-2xl font-black text-white mt-1">{leads.length}</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5 text-center shadow-inner">
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-400" /> Avg Match
                </div>
                <div className="text-2xl font-black text-orange-400 mt-1">
                  {Math.round(leads.reduce((acc, l) => acc + l.matchScore, 0) / leads.length)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ICP Input Form Component */}
        <IcpInputSection
          platform="reddit"
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Loading State or Results List */}
        {isLoading ? (
          <ScanningLoader platform="reddit" />
        ) : (
          <div className="space-y-6">
            
            {/* Results Filter & Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 mr-1">
                  <Filter className="h-3.5 w-3.5 text-orange-400" /> Filter Reddit Signals:
                </span>

                {["All", "High Urgency", "Vendor Request", "Problem Post", "Comparison"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                      activeFilter === filter
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm"
                        : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {/* Keyword Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search subreddit, user, post..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-orange-500/50 focus:outline-none"
                  />
                </div>

                {/* Export CSV Button */}
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Results Grid / List */}
            {filteredLeads.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredLeads.map((lead) => (
                  <RedditResultCard key={lead.id} lead={lead} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
                <MessageSquareCode className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-zinc-300">No matching Reddit leads found</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Try broadening your ICP criteria or clearing your search filters to display more Reddit community posts.
                </p>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
