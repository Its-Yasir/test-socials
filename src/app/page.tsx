"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TwitterIcon, LinkedinIcon } from "@/components/SocialIcons";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Search,
  Building2,
  Briefcase,
  Users,
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
            <span>AI Intent Signal Engine & Real-Time Social Search</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Search Social Posts & Find High-Intent{" "}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-[#0077B5] bg-clip-text text-transparent">
              B2B Leads
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Search keywords, hiring signals, and conversations across LinkedIn and Twitter in real-time, inspect post metrics and raw JSON, or match high-intent prospects against your Ideal Customer Profile.
          </p>

          {/* Action Platform Selection Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 flex-wrap">
            <Link
              href="/linkedin"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#0077B5] via-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 hover:from-[#006097] hover:to-blue-500 hover:scale-[1.02] transition-all group"
            >
              <LinkedinIcon className="h-4 w-4 fill-current" />
              <span>LinkedIn Search</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/advanced-search"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 hover:scale-[1.02] transition-all group"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>AI Advanced Search</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/twitter/search"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-3.5 text-sm font-bold text-zinc-200 shadow-lg hover:bg-zinc-800 hover:border-zinc-700 hover:scale-[1.02] transition-all group"
            >
              <Search className="h-4 w-4 text-sky-400" />
              <span>Tweet Explorer</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/twitter"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-900 border border-indigo-500/30 px-6 py-3.5 text-sm font-bold text-indigo-300 shadow-lg hover:bg-indigo-500/10 hover:scale-[1.02] transition-all group"
            >
              <TwitterIcon className="h-4 w-4 fill-current" />
              <span>ICP Lead Radar</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {/* Feature 1: LinkedIn Post Search */}
          <div className="group relative rounded-3xl border border-blue-500/40 bg-gradient-to-b from-blue-950/40 via-zinc-900/60 to-zinc-950 p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-blue-500/70 hover:shadow-blue-500/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0077B5]/20 border border-[#0077B5]/40 text-[#0077B5]">
                  <LinkedinIcon className="h-5 w-5 fill-current" />
                </div>
                <span className="rounded-full bg-[#0077B5]/20 px-3 py-1 text-xs font-bold text-sky-300 border border-[#0077B5]/40">
                  /linkedin
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                LinkedIn Search
              </h3>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Live post search via Unipile API. Filter by media type, date ranges, and attached job listings with instant AI outreach drafts.
              </p>

              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>Real-time Unipile API endpoint</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>Date, relevance & media type filters</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>AI outreach & raw JSON viewer</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/linkedin"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0077B5] to-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-[#006097] hover:to-blue-500 transition-all"
              >
                <span>Launch LinkedIn Search</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 2: AI Advanced Search */}
          <div className="group relative rounded-3xl border border-sky-500/40 bg-gradient-to-b from-sky-950/40 via-zinc-900/60 to-zinc-950 p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-sky-500/70 hover:shadow-sky-500/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-300 border border-sky-500/40">
                  /advanced-search
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                AI Advanced Search
              </h3>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Describe your search goal in plain English. AI synthesizes optimal boolean filters using B2B intent playbooks.
              </p>

              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>Playbooks A, B, C, D intent mapping</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>Auto-applied quality & spam filters</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>Instant live Twitter post retrieval</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/advanced-search"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-sky-400 hover:to-indigo-500 transition-all"
              >
                <span>Launch AI Search</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 3: Keyword & Post Search */}
          <div className="group relative rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 via-zinc-900/40 to-zinc-950 p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-zinc-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-800/80 border border-zinc-700 text-zinc-300">
                  <Search className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-400 border border-zinc-700">
                  /twitter/search
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-zinc-200 transition-colors">
                Tweet Explorer
              </h3>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Search any keyword, hashtag, topic, or user handle on X. Inspect tweet metrics, dates, and engagement counts.
              </p>

              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>Real-time post search (Latest/Top)</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>Likes, reposts, replies, views</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>AI reply generator & raw JSON modal</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/twitter/search"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-700 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all"
              >
                <span>Open Tweet Explorer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 4: Twitter ICP Discovery */}
          <div className="group relative rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 via-zinc-900/60 to-zinc-950 p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/10">
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
                Twitter ICP Radar
              </h3>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Input your B2B ICP criteria or natural language prompt to surface matched Twitter profiles with buying signals and personalized DMs.
              </p>

              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Match score % and buying signals</span>
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
        </div>

        {/* Workflow Explanation Steps */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">
              How SignalICP Delivers Social Intelligence
            </h2>
            <p className="text-xs text-zinc-400">
              Streamlined 3-step workflow from keyword/ICP definition to ready-to-send outreach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold">
                1
              </div>
              <h4 className="font-bold text-zinc-100 text-base">
                Search LinkedIn & Twitter
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Query keywords, hiring topics, and company mentions in real-time across LinkedIn via Unipile and Twitter via TwitterAPI.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                2
              </div>
              <h4 className="font-bold text-zinc-100 text-base">
                Deep Post & Metric Analysis
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                View author headlines, company vs member badges, engagement metrics (reactions, reposts, comments, impressions), and job listings.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                3
              </div>
              <h4 className="font-bold text-zinc-100 text-base">
                AI Outreach & One-Click Export
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate tailored contextual connection notes or comments, and export complete search results to CSV or JSON with one click.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800/80 py-8 bg-zinc-950 text-center text-xs text-zinc-500">
        SignalICP • Built with Next.js & Unipile API • Real-time Social Signal Intelligence
      </footer>
    </div>
  );
}
