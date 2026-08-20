"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TwitterIcon, RedditIcon } from "@/components/SocialIcons";
import {
  MessageSquareCode,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  Target,
  TrendingUp,
  BrainCircuit,
  Filter,
  ShieldCheck,
  Search,
  Radio,
  FileSpreadsheet
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-sky-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        
        {/* Main Hero Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Intent Signal Engine & Real-Time Twitter Search</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Search Twitter Posts & Find High-Intent <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-orange-400 bg-clip-text text-transparent">Social Leads</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Search keywords and topics in real-time across Twitter / X, inspect post metrics and raw JSON, or match high-intent prospects against your Ideal Customer Profile.
          </p>

          {/* Action Platform Selection Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 flex-wrap">
            <Link
              href="/twitter/search"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 hover:scale-[1.02] transition-all group"
            >
              <Search className="h-4 w-4" />
              <span>Twitter Keyword Search</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/twitter"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-900 border border-sky-500/30 px-6 py-3.5 text-sm font-bold text-sky-300 shadow-lg hover:bg-sky-500/10 hover:scale-[1.02] transition-all group"
            >
              <TwitterIcon className="h-4 w-4 fill-current" />
              <span>Twitter ICP Leads</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/reddit"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-900 border border-orange-500/30 px-6 py-3.5 text-sm font-bold text-orange-300 shadow-lg hover:bg-orange-500/10 hover:scale-[1.02] transition-all group"
            >
              <MessageSquareCode className="h-4 w-4" />
              <span>Reddit Radar</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          
          {/* Feature 1: Keyword & Post Search */}
          <div className="group relative rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-950/30 via-zinc-900/60 to-zinc-950 p-7 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-sky-500/60 hover:shadow-sky-500/15">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                  <Search className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-400 border border-sky-500/30">
                  /twitter/search
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                Twitter Keyword Search
              </h3>
              
              <p className="text-xs text-zinc-400 leading-relaxed">
                Search any keyword, hashtag, topic, or user handle on X. Inspect tweet text, dates, engagement counts, and export to CSV.
              </p>

              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>Real-time post search with Latest / Top filters</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>Likes, reposts, replies, views & bookmarks</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>AI reply generator & raw JSON inspection modal</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/twitter/search"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-sky-400 hover:to-blue-500 transition-all"
              >
                <span>Open Twitter Search</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 2: Twitter ICP Discovery */}
          <div className="group relative rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 via-zinc-900/60 to-zinc-950 p-7 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <TwitterIcon className="h-5 w-5 fill-current" />
                </div>
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                  /twitter
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                Twitter ICP Lead Radar
              </h3>
              
              <p className="text-xs text-zinc-400 leading-relaxed">
                Input your B2B ICP criteria or natural language prompt to surface matched Twitter profiles with buying signals and personalized DMs.
              </p>

              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Match score % and buying intent signals</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Tailored cold DM outreach hooks</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Lead filtering and CSV export</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/twitter"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-indigo-500/30 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/10 transition-all"
              >
                <span>Open Twitter ICP Tool</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 3: Reddit Radar */}
          <div className="group relative rounded-3xl border border-orange-500/20 bg-gradient-to-b from-orange-950/20 via-zinc-900/60 to-zinc-950 p-7 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-orange-500/50 hover:shadow-orange-500/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                  <MessageSquareCode className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 border border-orange-500/20">
                  /reddit
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors">
                Reddit Thread Radar
              </h3>
              
              <p className="text-xs text-zinc-400 leading-relaxed">
                Monitor discussions in SaaS, tech, and startup subreddits to find founders and users actively seeking tool solutions.
              </p>

              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>Identifies bottleneck pain points in threads</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>Crafts authentic, non-spam comment drafts</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>Subreddit filtering and signal scoring</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/reddit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-orange-500/30 py-2.5 text-xs font-bold text-orange-300 hover:bg-orange-500/10 transition-all"
              >
                <span>Open Reddit ICP Tool</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Workflow Explanation Steps */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">How SignalICP Delivers Social Intelligence</h2>
            <p className="text-xs text-zinc-400">Streamlined 3-step workflow from keyword/ICP definition to ready-to-send engagement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold">
                1
              </div>
              <h4 className="font-bold text-zinc-100 text-base">Search Keywords or Input ICP</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Query any keyword/hashtag live on X or provide structured ICP criteria (roles, company size, offering, and pain points).
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                2
              </div>
              <h4 className="font-bold text-zinc-100 text-base">Deep Post & Metric Analysis</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                View post text, post timestamps, author metadata, follower counts, verified status, likes, retweets, replies, and views.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                3
              </div>
              <h4 className="font-bold text-zinc-100 text-base">Export Data & Generate AI Replies</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate tailored contextual AI reply drafts and export complete search results to CSV or JSON with one click.
              </p>
            </div>
          </div>
        </div>

      </main>

      <footer className="border-t border-zinc-800/80 py-8 bg-zinc-950 text-center text-xs text-zinc-500">
        SignalICP • Built with Next.js • Real-time Social Signal Intelligence
      </footer>
    </div>
  );
}
