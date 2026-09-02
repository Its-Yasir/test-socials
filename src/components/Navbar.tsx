"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, ArrowRight, Search } from "lucide-react";
import { TwitterIcon, LinkedinIcon } from "@/components/SocialIcons";

export function Navbar() {
  const pathname = usePathname();

  const isTwitterSearch = pathname === "/twitter/search";
  const isAdvancedSearch =
    pathname === "/advanced-search" || pathname === "/twitter/advanced-search";
  const isTwitterLeads = pathname === "/twitter";
  const isLinkedinSearch =
    pathname === "/linkedin" || pathname === "/linkedin/search";

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
              <span className="font-bold text-lg text-zinc-100 tracking-tight">
                SignalICP
              </span>
              <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-400 uppercase tracking-widest">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              AI Social Lead Discovery & Signal Intelligence
            </p>
          </div>
        </Link>

        {/* Route Selector Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/90 p-1 shadow-inner flex-wrap justify-center">
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

          {/* LinkedIn Search */}
          <Link
            href="/linkedin"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              isLinkedinSearch
                ? "bg-gradient-to-r from-[#0077B5] to-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-zinc-400 hover:text-sky-400 hover:bg-sky-500/10"
            }`}
          >
            <LinkedinIcon className="h-3.5 w-3.5 fill-current" />
            <span className="hidden md:inline">LinkedIn Search</span>
            <span className="md:hidden">LinkedIn</span>
            {isLinkedinSearch && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
          </Link>

          {/* AI Advanced Search */}
          <Link
            href="/advanced-search"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              isAdvancedSearch
                ? "bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                : "text-zinc-400 hover:text-sky-400 hover:bg-sky-500/10"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>AI Advanced Search</span>
            {isAdvancedSearch && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
            )}
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
            <span className="hidden md:inline">Tweet Search</span>
            <span className="md:hidden">Search</span>
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
        </nav>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/linkedin"
            className="flex items-center gap-1.5 rounded-lg border border-[#0077B5]/40 bg-[#0077B5]/10 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-[#0077B5]/20 transition-all"
          >
            <LinkedinIcon className="h-3 w-3 fill-current" />
            <span>LinkedIn</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}
