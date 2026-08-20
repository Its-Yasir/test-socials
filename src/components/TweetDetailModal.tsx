"use client";

import { useState } from "react";
import { TweetItem } from "@/lib/twitterTypes";
import { formatFullDateTime, formatCompactNumber } from "@/lib/twitterFormatters";
import { TwitterIcon } from "@/components/SocialIcons";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Code,
  User,
  Heart,
  Repeat,
  MessageCircle,
  Eye,
  Bookmark,
  Calendar,
  Sparkles,
  ShieldCheck,
  Radio,
  FileText
} from "lucide-react";

interface TweetDetailModalProps {
  tweet: TweetItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TweetDetailModal({ tweet, isOpen, onClose }: TweetDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "json">("overview");

  if (!isOpen || !tweet) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(tweet, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweetUrl = tweet.url || tweet.twitterUrl || `https://x.com/${tweet.author.userName}/status/${tweet.id}`;
  const authorUrl = tweet.author.url || tweet.author.twitterUrl || `https://x.com/${tweet.author.userName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <TwitterIcon className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Tweet Inspector & Raw Data
                <span className="font-mono text-[11px] text-zinc-500 font-normal">ID: {tweet.id}</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Posted by @{tweet.author.userName} &bull; {formatFullDateTime(tweet.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 p-1 text-xs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
                  activeTab === "json"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span>Raw JSON</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" ? (
            <div className="space-y-6">
              {/* Author & Tweet Hero Box */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={tweet.author.profilePicture || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"}
                      alt={tweet.author.name}
                      className="h-12 w-12 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute(
                          "src",
                          "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                        );
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-base">{tweet.author.name}</span>
                        {(tweet.author.isBlueVerified || tweet.author.isVerified) && (
                          <span className="inline-flex items-center text-sky-400" title="Verified Creator">
                            <ShieldCheck className="h-4 w-4 fill-sky-400/20" />
                          </span>
                        )}
                      </div>
                      <a
                        href={authorUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-zinc-400 hover:text-sky-400 transition-colors"
                      >
                        @{tweet.author.userName}
                      </a>
                    </div>
                  </div>

                  <a
                    href={tweetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition-all"
                  >
                    <span>View on X</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Tweet Text Content */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-100 leading-relaxed font-normal whitespace-pre-wrap selection:bg-sky-500/30">
                  {tweet.text}
                </div>

                {/* Meta details list */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1 border-t border-zinc-800/60">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{formatFullDateTime(tweet.createdAt)}</span>
                  </span>
                  {tweet.source && (
                    <span className="flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{tweet.source.replace(/<[^>]*>?/gm, "")}</span>
                    </span>
                  )}
                  {tweet.lang && (
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono uppercase text-zinc-300">
                      Lang: {tweet.lang}
                    </span>
                  )}
                  {tweet.isReply && (
                    <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300 font-medium">
                      Reply to @{tweet.inReplyToUsername || "thread"}
                    </span>
                  )}
                </div>
              </div>

              {/* Engagement Numbers Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
                  <Heart className="h-4 w-4 text-rose-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{formatCompactNumber(tweet.likeCount)}</div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Likes</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
                  <Repeat className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{formatCompactNumber(tweet.retweetCount)}</div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Reposts</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
                  <MessageCircle className="h-4 w-4 text-sky-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{formatCompactNumber(tweet.replyCount)}</div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Replies</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
                  <Eye className="h-4 w-4 text-indigo-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{formatCompactNumber(tweet.viewCount || 0)}</div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Views</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
                  <Bookmark className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{formatCompactNumber(tweet.bookmarkCount || 0)}</div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Bookmarks</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
                  <Sparkles className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{formatCompactNumber(tweet.quoteCount || 0)}</div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Quotes</div>
                </div>
              </div>

              {/* Author Breakdown Details */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-sky-400" /> Author Deep-Dive Data
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-3">
                    <span className="text-zinc-500 block text-[11px]">Followers</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">
                      {formatCompactNumber(tweet.author.followers)}
                    </span>
                  </div>
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-3">
                    <span className="text-zinc-500 block text-[11px]">Following</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">
                      {formatCompactNumber(tweet.author.following)}
                    </span>
                  </div>
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-3">
                    <span className="text-zinc-500 block text-[11px]">Total Posts</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">
                      {formatCompactNumber(tweet.author.statusesCount || 0)}
                    </span>
                  </div>
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-3">
                    <span className="text-zinc-500 block text-[11px]">Location</span>
                    <span className="font-bold text-zinc-200 text-xs mt-0.5 block truncate">
                      {tweet.author.location || "Not specified"}
                    </span>
                  </div>
                </div>

                {tweet.author.profile_bio?.description && (
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-3 text-xs text-zinc-300">
                    <span className="text-zinc-500 font-semibold block text-[10px] uppercase mb-1">Author Bio</span>
                    {tweet.author.profile_bio.description}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white shadow-lg transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Full JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-[500px] leading-relaxed select-all">
                {JSON.stringify(tweet, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-zinc-800/80 bg-zinc-900/40 px-6 py-3 flex items-center justify-between">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{copied ? "JSON Copied to clipboard" : "Copy raw payload"}</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
