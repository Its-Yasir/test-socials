"use client";

import { useState } from "react";
import { TwitterLead } from "@/lib/sampleDataGenerator";
import { TwitterIcon } from "@/components/SocialIcons";
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  Sparkles,
  Zap,
  TrendingUp,
  MapPin,
  Users,
  MessageSquare,
  ThumbsUp,
  Repeat,
  ShieldCheck
} from "lucide-react";

interface TwitterResultCardProps {
  lead: TwitterLead;
}

export function TwitterResultCard({ lead }: TwitterResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopyHook = () => {
    navigator.clipboard.writeText(lead.outreachHook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-sky-500/40 hover:shadow-sky-500/5 hover:-translate-y-0.5">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        
        {/* User Identity */}
        <div className="flex items-start gap-3.5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${lead.avatarBg} text-white font-bold text-lg shadow-md`}>
            {lead.name.split(" ").map(n => n[0]).join("")}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-zinc-100 text-base group-hover:text-sky-300 transition-colors">
                {lead.name}
              </h3>
              {lead.verified && (
                <span title="Verified Account">
                  <ShieldCheck className="h-4 w-4 text-sky-400 fill-sky-400/20" />
                </span>
              )}
              <span className="text-xs text-zinc-400">@{lead.handle}</span>
            </div>

            <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
              {lead.bio}
            </p>

            <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 text-zinc-400" />
                <strong className="text-zinc-200">{lead.followers}</strong> followers
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-zinc-400" />
                {lead.location}
              </span>
            </div>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 self-start">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 shadow-sm">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">{lead.matchScore}% Match</span>
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

      {/* Grid: Why Good + Detected Signal */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Why this person is good */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-2.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Why this person matches your ICP</span>
          </div>
          <ul className="space-y-2">
            {lead.whyGoodReason.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Buying Signal / Recent Tweet */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Zap className="h-3.5 w-3.5" />
                <span>Buying Signal Detected ({lead.buyingSignal.type})</span>
              </div>
              <span className="text-[10px] text-zinc-500">{lead.buyingSignal.timestamp}</span>
            </div>

            <p className="text-xs text-zinc-200 italic bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-lg">
              {lead.buyingSignal.content}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-3 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" /> {lead.buyingSignal.engagement.likes}
            </span>
            <span className="flex items-center gap-1">
              <Repeat className="h-3 w-3" /> {lead.buyingSignal.engagement.retweets}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {lead.buyingSignal.engagement.replies}
            </span>
          </div>
        </div>

      </div>

      {/* AI Personalized Outreach Hook */}
      <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-950/20 p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Suggested Personalized Twitter DM / Pitch</span>
          </div>

          <button
            onClick={handleCopyHook}
            className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300 hover:bg-sky-500/20 transition-all"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied Pitch!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy DM Pitch</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-sky-100/90 leading-relaxed font-sans">
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
          href={`https://x.com/${lead.handle}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors ml-auto"
        >
          <TwitterIcon className="h-3.5 w-3.5 fill-current" />
          <span>Open @{lead.handle} on X</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

    </div>
  );
}
