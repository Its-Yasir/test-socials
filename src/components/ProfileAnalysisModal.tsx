"use client";

import { useState } from "react";
import { ProfileAnalysisResult, TweetItem, TweetAuthor } from "@/lib/twitterTypes";
import { TwitterIcon } from "@/components/SocialIcons";
import { formatCompactNumber, formatRelativeDate } from "@/lib/twitterFormatters";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Bot,
  Pin,
  TrendingUp,
  MapPin,
  Users,
  ShieldCheck,
  Briefcase,
  Building2,
  Radio
} from "lucide-react";

interface ProfileAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  author: TweetAuthor | null;
  profileData: ProfileAnalysisResult | null;
  recentTweets: TweetItem[];
  pinnedTweet: TweetItem | null;
}

export function ProfileAnalysisModal({
  isOpen,
  onClose,
  isLoading,
  author,
  profileData,
  recentTweets,
  pinnedTweet,
}: ProfileAnalysisModalProps) {
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedOpener, setCopiedOpener] = useState(false);

  if (!isOpen) return null;

  const handleCopyPitch = () => {
    if (profileData?.personalizedOutreachHook) {
      navigator.clipboard.writeText(profileData.personalizedOutreachHook);
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    }
  };

  const handleCopyOpener = () => {
    if (profileData?.suggestedDmOpener) {
      navigator.clipboard.writeText(profileData.suggestedDmOpener);
      setCopiedOpener(true);
      setTimeout(() => setCopiedOpener(false), 2000);
    }
  };

  const profileUrl = `https://x.com/${author?.userName || profileData?.username || ""}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-sky-500/30 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-gradient-to-r from-sky-950/40 via-zinc-900/60 to-zinc-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  AI Deep Profile & ICP Evaluation
                </h2>
                <span className="rounded-full bg-sky-500/20 text-sky-300 px-2.5 py-0.5 text-[10px] font-semibold border border-sky-500/30">
                  Bio + Pinned + 5 Tweets
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Evaluating @{author?.userName || profileData?.username} against your target ICP specifications.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-140px)]">
          {isLoading ? (
            /* Loading State */
            <div className="py-16 text-center space-y-4">
              <div className="relative inline-block">
                <div className="h-16 w-16 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin mx-auto" />
                <Sparkles className="h-6 w-6 text-sky-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-zinc-100">
                  Analyzing Profile with AI...
                </h3>
                <p className="text-xs text-zinc-400">
                  Reading bio, follower metrics, pinned post, and last 5 tweets to evaluate ICP role & company fit.
                </p>
              </div>
            </div>
          ) : profileData ? (
            /* Analysis Content */
            <>
              {/* Top Profile Card Header */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src={
                      author?.profilePicture ||
                      "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                    }
                    alt={profileData.name}
                    className="h-12 w-12 rounded-full border border-zinc-700 bg-zinc-800 object-cover shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-zinc-100 text-base">
                        {profileData.name}
                      </h3>
                      {author?.isVerified && (
                        <ShieldCheck className="h-4 w-4 text-sky-400 fill-sky-400/20" />
                      )}
                      <span className="text-xs text-zinc-400">
                        @{profileData.username}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed max-w-xl">
                      {profileData.bio || "No profile bio provided."}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400 flex-wrap">
                      {profileData.followers !== undefined && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-sky-400" />
                          <strong className="text-zinc-200">
                            {formatCompactNumber(profileData.followers)}
                          </strong>{" "}
                          followers
                        </span>
                      )}
                      {profileData.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-zinc-400" />
                          {profileData.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition-all shrink-0 self-start sm:self-center"
                >
                  <TwitterIcon className="h-3.5 w-3.5 fill-current" />
                  <span>View on X</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Match Score & Verdict Banner */}
              <div
                className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  profileData.isIcpMatch
                    ? "border-emerald-500/40 bg-emerald-950/20"
                    : "border-amber-500/40 bg-amber-950/20"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {profileData.isIcpMatch ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    )}
                    <span className="text-sm font-bold text-white">
                      {profileData.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {profileData.roleFitReason}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                      ICP Match Fit
                    </div>
                    <div
                      className={`text-3xl font-black ${
                        profileData.isIcpMatch
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {profileData.icpFitScore}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid: Role & Company Fit + Intent Signals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role & Company Fit */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                    <Briefcase className="h-4 w-4" />
                    <span>Role & Persona Match</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {profileData.roleFitReason}
                  </p>

                  <div className="pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 mb-1.5">
                      <Building2 className="h-4 w-4" />
                      <span>Company Stage & Fit</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {profileData.companyFitReason}
                    </p>
                  </div>
                </div>

                {/* Intent Signals */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>Key Intent Signals Detected</span>
                  </div>

                  <ul className="space-y-2">
                    {profileData.intentSignals.map((signal, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-zinc-300"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pinned Tweet (if any) */}
              {pinnedTweet && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                    <Pin className="h-3.5 w-3.5" />
                    <span>Pinned Post on Profile</span>
                  </div>
                  <p className="text-xs text-zinc-200 italic bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-xl">
                    &quot;{pinnedTweet.text}&quot;
                  </p>
                  {profileData.pinnedTweetInsight && (
                    <p className="text-[11px] text-zinc-400">
                      💡 {profileData.pinnedTweetInsight}
                    </p>
                  )}
                </div>
              )}

              {/* Last 5 Tweets Sample & Insights */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                    <Radio className="h-3.5 w-3.5 text-sky-400" />
                    <span>Last 5 Tweets Activity Analyzed</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {recentTweets.length} posts inspected
                  </span>
                </div>

                <div className="space-y-2.5">
                  {recentTweets.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className="rounded-xl border border-zinc-800/70 bg-zinc-950/70 p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="font-semibold text-zinc-400">
                          Post #{idx + 1}
                        </span>
                        <span>{formatRelativeDate(t.createdAt)}</span>
                      </div>
                      <p className="text-zinc-200">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized AI Outreach Angles */}
              <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-950/30 via-zinc-900/60 to-zinc-950 p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-300">
                  <Sparkles className="h-4 w-4 text-sky-400" />
                  <span>AI Generated Outreach Angles</span>
                </div>

                {/* Pitch */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">
                      Tailored DM Pitch:
                    </span>
                    <button
                      onClick={handleCopyPitch}
                      className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300 hover:bg-sky-500/20 transition-all"
                    >
                      {copiedPitch ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Pitch</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-sky-100 font-sans leading-relaxed">
                    &quot;{profileData.personalizedOutreachHook}&quot;
                  </p>
                </div>

                {/* Opener */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">
                      Short Conversational DM Opener:
                    </span>
                    <button
                      onClick={handleCopyOpener}
                      className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-all"
                    >
                      {copiedOpener ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Opener</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300 font-sans leading-relaxed">
                    &quot;{profileData.suggestedDmOpener}&quot;
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No profile data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
