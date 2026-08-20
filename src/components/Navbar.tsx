"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, MessageSquareCode, Compass, ArrowRight, Search } from "lucide-react";
import { TwitterIcon } from "@/components/SocialIcons";

export function Navbar() {
  const pathname = usePathname();

  const isTwitterSearch = pathname === "/twitter/search";
  const isTwitterLeads = pathname === "/twitter";
  const isReddit = pathname.startsWith("/reddit");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-500 p-0.5 shadow-lg shadow-sky-500/10 transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <Sparkles className="h-4 w-4 text-sky-400 group-hover:text-amber-400 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-zinc-100 tracking-tight">SignalICP</span>
              <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-400 uppercase tracking-widest">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">AI Social Lead Discovery & Signal Intelligence</p>
          </div>
        </Link>

        {/* Route Selector Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/90 p-1 shadow-inner">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              pathname === "/"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </Link>

          {/* Twitter Search */}
          <Link
            href="/twitter/search"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              isTwitterSearch
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                : "text-zinc-400 hover:text-sky-400 hover:bg-sky-500/10"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Tweet Search</span>
            {isTwitterSearch && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
          </Link>

          {/* Twitter ICP Leads */}
          <Link
            href="/twitter"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              isTwitterLeads
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                : "text-zinc-400 hover:text-sky-400 hover:bg-sky-500/10"
            }`}
          >
            <TwitterIcon className="h-3.5 w-3.5 fill-current" />
            <span className="hidden md:inline">Twitter Leads</span>
            <span className="md:hidden">Leads</span>
            {isTwitterLeads && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
          </Link>

          {/* Reddit */}
          <Link
            href="/reddit"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              isReddit
                ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/20"
                : "text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10"
            }`}
          >
            <MessageSquareCode className="h-3.5 w-3.5" />
            <span>Reddit</span>
            {isReddit && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
          </Link>
        </nav>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href={isTwitterSearch ? "/twitter" : "/twitter/search"}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800 transition-all"
          >
            <span>{isTwitterSearch ? "Go to ICP Leads" : "Search Tweets"}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

      </div>
    </header>
  );
}
