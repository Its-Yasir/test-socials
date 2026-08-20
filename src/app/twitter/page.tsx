"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { IcpInputSection } from "@/components/IcpInputSection";
import { CompetitorLeadCard } from "@/components/CompetitorLeadCard";
import { AnalyzedTweetsModal } from "@/components/AnalyzedTweetsModal";
import { ProfileAnalysisModal } from "@/components/ProfileAnalysisModal";
import { ScanningLoader } from "@/components/ScanningLoader";
import { IcpInput } from "@/lib/sampleDataGenerator";
import {
  CompetitorAnalyzedTweet,
  CompetitorAnalysisStats,
  ProfileAnalysisResult,
  TweetAuthor,
  TweetItem,
} from "@/lib/twitterTypes";
import { TwitterIcon } from "@/components/SocialIcons";
import {
  Search,
  Filter,
  TrendingUp,
  AtSign,
  Layers,
  Users,
  Bot,
  Radio,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function TwitterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentIcp, setCurrentIcp] = useState<IcpInput>({
    mode: "freeform",
    freeformText:
      "B2B SaaS founders and VPs of Engineering building developer tools with 10-50 employees looking to solve customer churn and scale outbound revenue.",
    companyName: "DevScale AI",
    offering: "Automated developer churn analytics and signal discovery tool",
    targetRole: "Founder, VP Growth, Head of Engineering",
    industry: "B2B SaaS & Developer Infrastructure",
    companySize: "10-50 employees ($1M-$5M ARR)",
    painPoints: "High customer acquisition cost, low cold outreach reply rates",
    location: "North America & Europe",
  });

  const [leads, setLeads] = useState<CompetitorAnalyzedTweet[]>([]);
  const [allAnalyzedTweets, setAllAnalyzedTweets] = useState<CompetitorAnalyzedTweet[]>([]);
  const [stats, setStats] = useState<CompetitorAnalysisStats | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "fallback">("api");
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAnalyzedModalOpen, setIsAnalyzedModalOpen] = useState(false);
  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean;
    isLoading: boolean;
    author: TweetAuthor | null;
    profileData: ProfileAnalysisResult | null;
    recentTweets: TweetItem[];
    pinnedTweet: TweetItem | null;
  }>({
    isOpen: false,
    isLoading: false,
    author: null,
    profileData: null,
    recentTweets: [],
    pinnedTweet: null,
  });

  const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null);

  // Trigger Competitor Mentions Discovery
  const handleCompetitorSearch = async (icp: IcpInput, competitors?: string[]) => {
    setCurrentIcp(icp);
    setIsLoading(true);
    setHasSearched(true);
    setApiNotice(null);

    const compList = competitors && competitors.length > 0 ? competitors : ["linear", "jira"];

    try {
      const response = await fetch("/api/twitter/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitors: compList,
          icp,
          timeframeDays: 7,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setLeads(json.data.leads || []);
        setAllAnalyzedTweets(json.data.allAnalyzedTweets || []);
        setStats(json.data.stats || null);
        setDataSource(json.data.source || "fallback");
        if (json.data.apiStatus?.errorMessage) {
          setApiNotice(json.data.apiStatus.errorMessage);
        }
      } else {
        console.error("Competitor discovery error:", json.error);
        setLeads([]);
        setAllAnalyzedTweets([]);
      }
    } catch (err) {
      console.error("Failed to fetch competitor analysis:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Profile Deep AI Analysis
  const handleAnalyzeProfile = async (author: TweetAuthor, tweet: TweetItem) => {
    setAnalyzingLeadId(tweet.id);
    setProfileModal({
      isOpen: true,
      isLoading: true,
      author,
      profileData: null,
      recentTweets: [],
      pinnedTweet: null,
    });

    try {
      const response = await fetch("/api/twitter/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: author.userName,
          author,
          icp: currentIcp,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setProfileModal({
          isOpen: true,
          isLoading: false,
          author,
          profileData: json.data.profile,
          recentTweets: json.data.userTweetsSample || [],
          pinnedTweet: json.data.pinnedTweet || null,
        });
      } else {
        console.error("Profile analysis error:", json.error);
        setProfileModal((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      console.error("Profile analysis request failed:", err);
      setProfileModal((prev) => ({ ...prev, isLoading: false }));
    } finally {
      setAnalyzingLeadId(null);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesFilter =
      activeFilter === "All"
        ? true
        : activeFilter === "Seeking Alternative"
        ? lead.sentiment === "looking_for_alternative" || lead.leadType?.toLowerCase().includes("alternative")
        : activeFilter === "Pain Points"
        ? lead.sentiment === "negative_to_competitor" || lead.leadType?.toLowerCase().includes("pain")
        : activeFilter === "High Intent (85%+)"
        ? lead.matchScore >= 85
        : true;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      (lead.tweet.author?.name || "").toLowerCase().includes(q) ||
      (lead.tweet.author?.userName || "").toLowerCase().includes(q) ||
      (lead.tweet.author?.description || "").toLowerCase().includes(q) ||
      lead.tweet.text.toLowerCase().includes(q) ||
      (lead.painPointAnalysis || "").toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-sky-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl border border-sky-500/20 bg-gradient-to-b from-sky-950/30 via-zinc-900/60 to-zinc-950 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400">
                  <TwitterIcon className="h-3.5 w-3.5 fill-current" />
                  <span>X (Twitter) Competitor Mentions Engine</span>
                </div>
                {dataSource === "fallback" ? (
                  <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
                    <AlertCircle className="h-3 w-3" />
                    Dynamic Simulation Mode (API Credits Depleted)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live TwitterAPI Stream Active
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Turn Competitor Dissatisfaction Into High-Intent Leads
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Enter your competitor @handles and ICP criteria. We scan competitor mentions from the last 7 days, batch-process them 10 at a time with AI to filter out praise and isolate pain points, and match qualified buyers.
              </p>

              {apiNotice && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Live Twitter API Status: </span>
                    <span>{apiNotice}. Running in dynamic multi-competitor simulation mode. To enable real-time live data, recharge your TwitterAPI.io key in .env.</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <a
                  href="/twitter/search"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition-all"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Looking to search tweets by custom keywords? Open Tweet Search &rarr;</span>
                </a>
              </div>
            </div>

            {/* Quick Live Stats Grid */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5 text-center shadow-inner">
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <Users className="h-3.5 w-3.5 text-sky-400" /> Leads Found
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {leads.length}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5 text-center shadow-inner">
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Avg Match
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {leads.length > 0
                    ? Math.round(
                        leads.reduce((acc, l) => acc + l.matchScore, 0) /
                          leads.length
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ICP & Competitor Input Form */}
        <IcpInputSection
          platform="twitter"
          onSearch={handleCompetitorSearch}
          isLoading={isLoading}
          initialCompetitors="linear, jira"
          buttonLabel="Analyze Competitor Mentions"
        />

        {/* Loading State or Results */}
        {isLoading ? (
          <div className="space-y-6">
            <ScanningLoader platform="twitter" />
            <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-6 text-center space-y-3 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-sky-400 text-sm font-semibold">
                <Bot className="h-4 w-4 animate-spin" />
                <span>Running Batch AI Qualification (10 at a time)</span>
              </div>
              <p className="text-xs text-zinc-400">
                Fetching tweets mentioning competitor handles from the last 7 days, filtering out positive praise, and matching buying signals against your ICP.
              </p>
            </div>
          </div>
        ) : !hasSearched ? (
          /* Initial Clean State (Placeholder removed) */
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/30 p-8 sm:p-12 text-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto shadow-lg">
              <AtSign className="h-8 w-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl font-bold text-white">
                Ready to Analyze Competitor Mentions
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Configure your target competitor handles (e.g. <code className="text-sky-300">@linear, @jira</code>) and ICP profile above, then click <strong className="text-zinc-200">&quot;Analyze Competitor Mentions&quot;</strong> to begin scanning.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-left">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-1.5">
                <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[10px]">1</span>
                  <span>Fetch 7-Day Mentions</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Retrieves all tweets containing competitor @mentions within the last 7 days.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px]">2</span>
                  <span>AI Batch Filtering (10x)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Evaluates 10 tweets per batch to identify pain points and discard generic praise.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-1.5">
                <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px]">3</span>
                  <span>Deep Profile Evaluation</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Inspect lead profiles, pinned tweets, and last 5 posts for hyper-personalized outreach.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="space-y-6">
            {/* Live Stats Summary Bar */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Stat 1: Tweets Read */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-sky-400" />
                    <span>Tweets Read (7 Days)</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {stats.tweetsRead}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Mentions scanned
                  </div>
                </div>

                {/* Stat 2: AI Calls */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-purple-400" />
                    <span>AI / OpenAI Calls</span>
                  </div>
                  <div className="text-2xl font-black text-purple-400">
                    {stats.aiCallsCount}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Batches processed (10/batch)
                  </div>
                </div>

                {/* Stat 3: API Requests */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <TwitterIcon className="h-3.5 w-3.5 fill-sky-400" />
                    <span>Twitter API Requests</span>
                  </div>
                  <div className="text-2xl font-black text-sky-400">
                    {stats.apiRequestsCount}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Competitor queries sent
                  </div>
                </div>

                {/* Stat 4: Qualified Leads */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Qualified Leads</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {leads.length}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Matched your ICP
                  </div>
                </div>
              </div>
            )}

            {/* Results Filter & Modal Action Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 mr-1">
                  <Filter className="h-3.5 w-3.5 text-sky-400" /> Filter Leads:
                </span>

                {["All", "Seeking Alternative", "Pain Points", "High Intent (85%+)"].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                        activeFilter === filter
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                          : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Keyword Search */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search leads, bio, tweet..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-sky-500/50 focus:outline-none"
                  />
                </div>

                {/* View All Analyzed Tweets Button */}
                <button
                  onClick={() => setIsAnalyzedModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-all shrink-0 shadow-sm"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>View All Analyzed Tweets ({allAnalyzedTweets.length})</span>
                </button>
              </div>
            </div>

            {/* Leads Grid or Empty State */}
            {filteredLeads.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredLeads.map((lead) => (
                  <CompetitorLeadCard
                    key={lead.id}
                    lead={lead}
                    onAnalyzeProfile={handleAnalyzeProfile}
                    isAnalyzingProfile={analyzingLeadId === lead.tweet.id}
                  />
                ))}
              </div>
            ) : (
              /* No Leads Found Empty State */
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-4 max-w-lg mx-auto">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500 mx-auto">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-200">
                    No ICPs found from competitor mentions
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    We scanned competitor mentions from the last 7 days, but none met your specific ICP pain point threshold.
                  </p>
                </div>

                {allAnalyzedTweets.length > 0 && (
                  <button
                    onClick={() => setIsAnalyzedModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-all"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Inspect all {allAnalyzedTweets.length} scanned tweets manually</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* All Analyzed Tweets Modal Popup */}
        <AnalyzedTweetsModal
          isOpen={isAnalyzedModalOpen}
          onClose={() => setIsAnalyzedModalOpen(false)}
          allTweets={allAnalyzedTweets}
          stats={stats}
        />

        {/* Deep Profile AI Evaluation Modal Popup */}
        <ProfileAnalysisModal
          isOpen={profileModal.isOpen}
          onClose={() => setProfileModal((prev) => ({ ...prev, isOpen: false }))}
          isLoading={profileModal.isLoading}
          author={profileModal.author}
          profileData={profileModal.profileData}
          recentTweets={profileModal.recentTweets}
          pinnedTweet={profileModal.pinnedTweet}
        />
      </main>
    </div>
  );
}
