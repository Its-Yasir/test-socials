"use client";

import { useState } from "react";
import { CompetitorAnalyzedTweet, TweetAuthor, TweetItem } from "@/lib/twitterTypes";
import { TwitterIcon } from "@/components/SocialIcons";
import { formatCompactNumber, formatRelativeDate, formatFullDateTime } from "@/lib/twitterFormatters";
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Bot,
  Users,
  MapPin,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Repeat,
  Heart,
  Eye,
  AtSign,
  Image as ImageIcon
} from "lucide-react";

interface CompetitorLeadCardProps {
  lead: CompetitorAnalyzedTweet;
  onAnalyzeProfile: (author: TweetAuthor, tweet: TweetItem) => void;
  isAnalyzingProfile: boolean;
}

export function CompetitorLeadCard({
  lead,
  onAnalyzeProfile,
  isAnalyzingProfile,
}: CompetitorLeadCardProps) {
  const [copiedHook, setCopiedHook] = useState(false);

  const tweet = lead.tweet;
  const author = tweet.author || {
    name: "User",
    userName: "user",
    type: "user",
    id: "0",
  };

  const tweetUrl =
    tweet.url ||
    tweet.twitterUrl ||
    `https://x.com/${author.userName}/status/${tweet.id}`;
  const authorUrl =
    author.url ||
    author.twitterUrl ||
    `https://x.com/${author.userName}`;

  const handleCopyHook = () => {
    if (lead.suggestedOutreachHook) {
      navigator.clipboard.writeText(lead.suggestedOutreachHook);
      setCopiedHook(true);
      setTimeout(() => setCopiedHook(false), 2000);
    }
  };

  // Helper to render text with highlighted tags, links, and [Image] indicators
  const renderFormattedText = (text: string) => {
    const tokens = text.split(/(\[Image\]|https?:\/\/[^\s]+|#\w+|@\w+)/g);
    return tokens.map((token, index) => {
      if (token === "[Image]") {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 font-medium text-xs align-middle select-none"
          >
            <ImageIcon className="h-3 w-3" />
            <span>[Image]</span>
          </span>
        );
      } else if (token.startsWith("http://") || token.startsWith("https://")) {
        return (
          <a
            key={index}
            href={token}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 break-all inline-flex items-center gap-0.5"
          >
            <span>{token.length > 35 ? token.slice(0, 32) + "..." : token}</span>
            <ExternalLink className="h-2.5 w-2.5 inline" />
          </a>
        );
      } else if (token.startsWith("#")) {
        return (
          <span
            key={index}
            className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://x.com/hashtag/${token.slice(1)}`, "_blank");
            }}
          >
            {token}
          </span>
        );
      } else if (token.startsWith("@")) {
        const isCompetitor =
          token.toLowerCase().replace("@", "") ===
          lead.competitorHandle.toLowerCase().replace("@", "");
        return (
          <span
            key={index}
            className={`font-semibold cursor-pointer ${
              isCompetitor
                ? "text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded border border-rose-500/30"
                : "text-indigo-400 hover:text-indigo-300"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://x.com/${token.slice(1)}`, "_blank");
            }}
          >
            {token}
          </span>
        );
      }
      return <span key={index}>{token}</span>;
    });
  };

  return (
    <div className="group relative rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-sky-500/40 hover:shadow-sky-500/5 hover:-translate-y-0.5 space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* User Identity */}
        <div className="flex items-start gap-3.5">
          <a
            href={authorUrl}
            target="_blank"
            rel="noreferrer"
            className="relative shrink-0 group/avatar"
          >
            <img
              src={
                author.profilePicture ||
                "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
              }
              alt={author.name}
              className="h-12 w-12 rounded-full border border-zinc-700 bg-zinc-800 object-cover shadow-sm transition-transform group-hover/avatar:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).setAttribute(
                  "src",
                  "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                );
              }}
            />
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800">
              <TwitterIcon className="h-2.5 w-2.5 fill-sky-400" />
            </div>
          </a>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={authorUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-zinc-100 text-base hover:text-sky-300 transition-colors"
              >
                {author.name}
              </a>
              {author.isVerified && (
                <ShieldCheck className="h-4 w-4 text-sky-400 fill-sky-400/20" />
              )}
              <span className="text-xs text-zinc-400">@{author.userName}</span>

              {/* Mentioned Competitor Tag */}
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
                <AtSign className="h-3 w-3" />
                <span>Mentioned @{lead.competitorHandle.replace("@", "")}</span>
              </span>
            </div>

            {author.description && (
              <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                {author.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400 flex-wrap">
              {author.followers !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-zinc-400" />
                  <strong className="text-zinc-200">
                    {formatCompactNumber(author.followers)}
                  </strong>{" "}
                  followers
                </span>
              )}
              {author.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-zinc-400" />
                  {author.location}
                </span>
              )}
              <span>&bull;</span>
              <span title={formatFullDateTime(tweet.createdAt)}>
                {formatRelativeDate(tweet.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 self-start">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 shadow-sm">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">
              {lead.matchScore}% Match
            </span>
          </div>

          <a
            href={tweetUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-sky-300 hover:border-zinc-700 transition-all"
            title="Open tweet on X"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Competitor Mention Tweet Content */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{lead.leadType || "Competitor Pain Point Detected"}</span>
          </div>
          <span className="text-[11px] text-zinc-500">
            {formatRelativeDate(tweet.createdAt)}
          </span>
        </div>

        <div className="text-sm text-zinc-100 leading-relaxed font-sans whitespace-pre-wrap selection:bg-sky-500/30">
          {renderFormattedText(tweet.text)}
        </div>

        {/* Engagement metrics */}
        <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1 border-t border-zinc-900">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-rose-400/70" /> {formatCompactNumber(tweet.likeCount || 0)}
          </span>
          <span className="flex items-center gap-1">
            <Repeat className="h-3 w-3 text-emerald-400/70" /> {formatCompactNumber(tweet.retweetCount || 0)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-sky-400/70" /> {formatCompactNumber(tweet.replyCount || 0)}
          </span>
          {tweet.viewCount !== undefined && tweet.viewCount > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-indigo-400/70" /> {formatCompactNumber(tweet.viewCount)} views
            </span>
          )}
        </div>
      </div>

      {/* Grid: Why Matches ICP + AI Analysis */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Why this person matches your ICP</span>
        </div>

        {lead.painPointAnalysis && (
          <p className="text-xs text-zinc-300 font-medium pb-1 border-b border-zinc-900">
            {lead.painPointAnalysis}
          </p>
        )}

        <ul className="space-y-1.5 pt-1">
          {(lead.whyMatchesIcp || []).map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Outreach Hook */}
      {lead.suggestedOutreachHook && (
        <div className="rounded-2xl border border-sky-500/25 bg-sky-950/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              <span>Suggested Twitter DM / Outreach Pitch</span>
            </div>

            <button
              onClick={handleCopyHook}
              className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300 hover:bg-sky-500/20 transition-all"
            >
              {copiedHook ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied Pitch</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Pitch</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-sky-100 font-sans leading-relaxed">
            &quot;{lead.suggestedOutreachHook}&quot;
          </p>
        </div>
      )}

      {/* Card Action Buttons (Required 2 Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
        <div className="text-xs text-zinc-400 flex items-center gap-1.5">
          <Bot className="h-3.5 w-3.5 text-sky-400" />
          <span>Prospect Intelligence Ready</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Button 1: View Profile */}
          <a
            href={authorUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
          >
            <TwitterIcon className="h-3.5 w-3.5 fill-current" />
            <span>View Profile on X</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {/* Button 2: Analyze Profile with AI */}
          <button
            onClick={() => onAnalyzeProfile(author, tweet)}
            disabled={isAnalyzingProfile}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzingProfile ? (
              <>
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Evaluating Profile...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Analyze Profile with AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
