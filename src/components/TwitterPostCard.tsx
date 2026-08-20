"use client";

import { useState } from "react";
import { TweetItem } from "@/lib/twitterTypes";
import {
  formatCompactNumber,
  formatRelativeDate,
  formatFullDateTime,
  formatSourceClient,
} from "@/lib/twitterFormatters";
import { TwitterIcon } from "@/components/SocialIcons";
import {
  Heart,
  Repeat,
  MessageCircle,
  Eye,
  Bookmark,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Sparkles,
  MapPin,
  ShieldCheck,
  Bot,
  Image as ImageIcon
} from "lucide-react";

interface TwitterPostCardProps {
  tweet: TweetItem;
  onInspectJson: (tweet: TweetItem) => void;
}

export function TwitterPostCard({ tweet, onInspectJson }: TwitterPostCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAiReply, setShowAiReply] = useState(false);
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedAiReply, setCopiedAiReply] = useState(false);

  const tweetUrl =
    tweet.url ||
    tweet.twitterUrl ||
    `https://x.com/${tweet.author.userName}/status/${tweet.id}`;
  const authorUrl =
    tweet.author.url ||
    tweet.author.twitterUrl ||
    `https://x.com/${tweet.author.userName}`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tweetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleGenerateAiReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAiReply(true);
    if (!aiDraft) {
      setIsGeneratingAi(true);
      setTimeout(() => {
        // Generate high-quality contextual outreach reply
        const authorFirstName = tweet.author.name.split(" ")[0] || tweet.author.userName;
        let draft = "";

        if (tweet.text.toLowerCase().includes("ai") || tweet.text.toLowerCase().includes("agent")) {
          draft = `Great perspective on AI agents, ${authorFirstName}! We've been seeing similar patterns with automated signal discovery. Curious what your main evaluation criteria is when testing workflows like this?`;
        } else if (tweet.text.toLowerCase().includes("buildinpublic") || tweet.text.toLowerCase().includes("saas")) {
          draft = `Love the transparency and hustle on this milestone, ${authorFirstName}! Scaling early distribution is always the toughest hurdle. Keep crushing it! 🔥`;
        } else if (tweet.text.includes("?")) {
          draft = `Hey ${authorFirstName}, regarding your question—in our experience testing outbound and social leads, targeting high-intent real-time mentions converted 4x better than cold scrapes. Happy to share what worked!`;
        } else {
          draft = `Solid take here, ${authorFirstName}! Really agree with this point about modern workflows. Would love to stay connected and follow your updates.`;
        }

        setAiDraft(draft);
        setIsGeneratingAi(false);
      }, 700);
    }
  };

  const handleCopyAiReply = () => {
    if (aiDraft) {
      navigator.clipboard.writeText(aiDraft);
      setCopiedAiReply(true);
      setTimeout(() => setCopiedAiReply(false), 2000);
    }
  };

  // Helper to render text with highlighted tags, links, and [Image] indicators
  const renderFormattedText = (text: string) => {
    // Regex splits by [Image], urls, hashtags, and mentions while retaining them
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
        return (
          <span
            key={index}
            className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
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
    <div className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 transition-all duration-200 hover:border-sky-500/40 hover:bg-zinc-900/70 hover:shadow-xl hover:shadow-sky-500/5">
      <div className="space-y-4">
        
        {/* Header: Author Information & Top Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Author Profile Picture */}
            <a
              href={authorUrl}
              target="_blank"
              rel="noreferrer"
              className="relative shrink-0 group/avatar"
            >
              <img
                src={
                  tweet.author.profilePicture ||
                  "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                }
                alt={tweet.author.name}
                className="h-11 w-11 rounded-full border border-zinc-700/80 bg-zinc-800 object-cover shadow-sm transition-transform group-hover/avatar:scale-105"
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

            {/* Author Name & Handle */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <a
                  href={authorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-sm text-zinc-100 hover:text-white truncate transition-colors"
                >
                  {tweet.author.name}
                </a>

                {(tweet.author.isBlueVerified || tweet.author.isVerified) && (
                  <span
                    className="inline-flex items-center text-sky-400"
                    title="Verified on X"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 fill-sky-400/20" />
                  </span>
                )}

                {tweet.author.followers !== undefined && (
                  <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                    {formatCompactNumber(tweet.author.followers)} followers
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
                <a
                  href={authorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-sky-400 transition-colors"
                >
                  @{tweet.author.userName}
                </a>
                <span>&bull;</span>
                <span
                  className="hover:text-zinc-200 cursor-help"
                  title={formatFullDateTime(tweet.createdAt)}
                >
                  {formatRelativeDate(tweet.createdAt)}
                </span>

                {tweet.author.location && (
                  <>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-0.5 text-zinc-500 truncate max-w-[130px]">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{tweet.author.location}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Direct Link to Tweet on X */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyLink}
              title="Copy Tweet URL"
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
            >
              {copiedLink ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>

            <a
              href={tweetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-500/20 transition-all"
            >
              <span className="hidden sm:inline">Open</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Replying-to Banner if applicable */}
        {tweet.isReply && (
          <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/60 px-3 py-1 text-xs text-zinc-400 flex items-center gap-1.5">
            <MessageCircle className="h-3 w-3 text-sky-400" />
            <span>
              Replying to{" "}
              <span className="text-sky-400 font-medium">
                @{tweet.inReplyToUsername || "author"}
              </span>
            </span>
          </div>
        )}

        {/* Tweet Main Text Content */}
        <div className="text-sm text-zinc-100 leading-relaxed font-normal whitespace-pre-wrap selection:bg-sky-500/30">
          {renderFormattedText(tweet.text)}
        </div>

        {/* Engagement Metrics & Interaction Stats Bar */}
        <div className="flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-3 flex-wrap">
          <div className="flex items-center gap-4 sm:gap-6 text-xs text-zinc-400 flex-wrap">
            {/* Likes */}
            <div
              className="flex items-center gap-1.5 hover:text-rose-400 transition-colors cursor-default"
              title={`${tweet.likeCount.toLocaleString()} Likes`}
            >
              <Heart className="h-3.5 w-3.5 text-rose-400/80" />
              <span className="font-semibold text-zinc-200">
                {formatCompactNumber(tweet.likeCount)}
              </span>
            </div>

            {/* Reposts */}
            <div
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-default"
              title={`${tweet.retweetCount.toLocaleString()} Reposts`}
            >
              <Repeat className="h-3.5 w-3.5 text-emerald-400/80" />
              <span className="font-semibold text-zinc-200">
                {formatCompactNumber(tweet.retweetCount)}
              </span>
            </div>

            {/* Replies */}
            <div
              className="flex items-center gap-1.5 hover:text-sky-400 transition-colors cursor-default"
              title={`${tweet.replyCount.toLocaleString()} Replies`}
            >
              <MessageCircle className="h-3.5 w-3.5 text-sky-400/80" />
              <span className="font-semibold text-zinc-200">
                {formatCompactNumber(tweet.replyCount)}
              </span>
            </div>

            {/* Impressions / Views */}
            {tweet.viewCount !== undefined && (
              <div
                className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-default"
                title={`${tweet.viewCount.toLocaleString()} Views`}
              >
                <Eye className="h-3.5 w-3.5 text-indigo-400/80" />
                <span className="font-semibold text-zinc-200">
                  {formatCompactNumber(tweet.viewCount)}
                </span>
              </div>
            )}

            {/* Bookmarks */}
            {tweet.bookmarkCount !== undefined && tweet.bookmarkCount > 0 && (
              <div
                className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-default hidden sm:flex"
                title={`${tweet.bookmarkCount.toLocaleString()} Bookmarks`}
              >
                <Bookmark className="h-3.5 w-3.5 text-amber-400/80" />
                <span className="font-semibold text-zinc-200">
                  {formatCompactNumber(tweet.bookmarkCount)}
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            {/* Client Device Tag */}
            {tweet.source && (
              <span className="hidden md:inline-block rounded-md bg-zinc-950 border border-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-500 font-mono">
                {formatSourceClient(tweet.source)}
              </span>
            )}

            {/* Language Tag */}
            {tweet.lang && (
              <span className="rounded-md bg-zinc-950 border border-zinc-800/80 px-1.5 py-0.5 text-[10px] uppercase font-mono text-zinc-400">
                {tweet.lang}
              </span>
            )}

            {/* AI Reply Quick Trigger */}
            <button
              onClick={handleGenerateAiReply}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all ${
                showAiReply
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-purple-400 hover:border-purple-500/30"
              }`}
              title="Draft smart reply with AI"
            >
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>AI Reply</span>
            </button>

            {/* Inspect Raw Data Button */}
            <button
              onClick={() => onInspectJson(tweet)}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all"
              title="Inspect raw tweet JSON payload"
            >
              <Code2 className="h-3 w-3" />
              <span>Inspect</span>
            </button>
          </div>
        </div>

        {/* AI Outreach / Reply Generator Drawer */}
        {showAiReply && (
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                <Bot className="h-3.5 w-3.5 text-purple-400" />
                <span>AI Suggested Engagement Reply</span>
              </div>
              <button
                onClick={() => setShowAiReply(false)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                Dismiss
              </button>
            </div>

            {isGeneratingAi ? (
              <div className="flex items-center gap-2 text-xs text-purple-300/80 py-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                <span>Crafting personalized response based on tweet context...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-lg bg-zinc-950/80 border border-purple-500/20 p-3 text-xs text-zinc-200 leading-relaxed font-sans">
                  {aiDraft}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={handleCopyAiReply}
                    className="flex items-center gap-1 rounded-lg bg-purple-600/30 border border-purple-500/40 px-2.5 py-1 text-xs font-semibold text-purple-200 hover:bg-purple-600/40 transition-all"
                  >
                    {copiedAiReply ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
