"use client";

import { useState } from "react";
import { RedditLead } from "@/lib/sampleDataGenerator";
import {
  MessageSquareCode,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  Sparkles,
  Zap,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Award,
  Clock
} from "lucide-react";

interface RedditResultCardProps {
  lead: RedditLead;
}

export function RedditResultCard({ lead }: RedditResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopyHook = () => {
    navigator.clipboard.writeText(lead.outreachHook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-orange-500/40 hover:shadow-orange-500/5 hover:-translate-y-0.5">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        
        {/* User & Subreddit Info */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 text-white font-bold text-lg shadow-md shadow-orange-500/10">
            <MessageSquareCode className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 text-xs font-bold text-orange-400">
                {lead.subreddit}
              </span>
              <span className="font-bold text-zinc-100 text-sm group-hover:text-orange-300 transition-colors">
                {lead.username}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3 text-amber-400" />
                <strong className="text-zinc-200">{lead.karma}</strong> karma
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-zinc-400" />
                Member {lead.accountAge}
              </span>
            </div>
          </div>
        </div>

        {/* Match Score Gauge */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 self-start">
          <div className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 shadow-sm">
            <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs font-bold text-orange-300">{lead.matchScore}% Match</span>
          </div>

          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-xl border transition-all ${
              saved
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            }`}
            title={saved ? "Saved Lead" : "Bookmark Lead"}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Reddit Post Title & Thread Snippet */}
      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
        <h4 className="font-bold text-zinc-100 text-sm leading-snug">
          &quot;{lead.postTitle}&quot;
        </h4>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          {lead.postSnippet}
        </p>

        <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-zinc-900 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1 text-orange-400 font-medium">
            <ThumbsUp className="h-3 w-3" /> {lead.buyingSignal.upvotes} upvotes
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> {lead.buyingSignal.commentsCount} comments
          </span>
          <span className="ml-auto text-zinc-500">{lead.buyingSignal.timestamp}</span>
        </div>
      </div>

      {/* Grid: Why Good + Buying Signal */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Why this person is good */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 mb-2.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Why this Reddit user matches your ICP</span>
          </div>
          <ul className="space-y-2">
            {lead.whyGoodReason.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Buying Signal */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Zap className="h-3.5 w-3.5" />
                <span>Buying / Pain Signal ({lead.buyingSignal.type})</span>
              </div>
            </div>

            <p className="text-xs text-zinc-200 italic bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-lg">
              {lead.buyingSignal.content}
            </p>
          </div>

          <div className="mt-3 text-[11px] text-zinc-500">
            Detected intent score: <strong className="text-amber-400">High Urgency</strong>
          </div>
        </div>

      </div>

      {/* AI Reddit Outreach Hook */}
      <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-950/20 p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Suggested Reddit Value Comment / DM Reply</span>
          </div>

          <button
            onClick={handleCopyHook}
            className="flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-300 hover:bg-orange-500/20 transition-all"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied Pitch!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Comment Pitch</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-orange-100/90 leading-relaxed font-sans">
          &quot;{lead.outreachHook}&quot;
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/60 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {lead.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-zinc-950 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 font-medium">
              #{tag}
            </span>
          ))}
        </div>

        <a
          href={lead.postUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-medium transition-colors ml-auto"
        >
          <MessageSquareCode className="h-3.5 w-3.5" />
          <span>View Thread on Reddit</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

    </div>
  );
}
