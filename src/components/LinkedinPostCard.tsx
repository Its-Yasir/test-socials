"use client";

import { useState } from "react";
import { LinkedinPostItem } from "@/lib/linkedinTypes";
import {
  formatCompactNumber,
  formatRelativeDate,
  formatFullDateTime,
} from "@/lib/linkedinFormatters";
import { LinkedinIcon } from "@/components/SocialIcons";
import {
  ThumbsUp,
  MessageSquare,
  Repeat,
  Eye,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Sparkles,
  Building2,
  Briefcase,
  MapPin,
  Bot,
  UserCheck,
} from "lucide-react";

interface LinkedinPostCardProps {
  post: LinkedinPostItem;
  onInspectJson: (post: LinkedinPostItem) => void;
}

export function LinkedinPostCard({
  post,
  onInspectJson,
}: LinkedinPostCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showAiOutreach, setShowAiOutreach] = useState(false);
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedAiDraft, setCopiedAiDraft] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const linkedinPostUrl =
    post.share_url ||
    (post.social_id
      ? `https://www.linkedin.com/feed/update/${post.social_id}`
      : `https://www.linkedin.com/feed/update/urn:li:activity:${post.id}`);

  const authorProfileUrl = post.author?.public_identifier
    ? `https://www.linkedin.com/${post.author.is_company ? "company" : "in"}/${post.author.public_identifier}`
    : undefined;

  const authorInitials = (post.author?.name || "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(linkedinPostUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(post.text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleGenerateAiOutreach = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAiOutreach(true);
    if (!aiDraft) {
      setIsGeneratingAi(true);
      setTimeout(() => {
        const firstName =
          post.author?.name?.split(" ")[0] ||
          (post.author?.is_company ? "Team" : "there");

        let draft = "";
        const lowerText = post.text.toLowerCase();

        if (lowerText.includes("hiring") || lowerText.includes("job") || post.job_posting) {
          draft = `Hi ${firstName}, I saw your post regarding the ${post.job_posting?.title || "open role"}. With relevant background scaling high-impact software systems, I'd love to connect and see how I can add immediate value to your team.`;
        } else if (lowerText.includes("ai") || lowerText.includes("agent") || lowerText.includes("llm")) {
          draft = `Hi ${firstName}, really enjoyed your insightful post on AI agent workflows! We've been exploring similar signal discovery architectures. Would love to connect and follow your updates in this space.`;
        } else if (lowerText.includes("founder") || lowerText.includes("saas") || lowerText.includes("build")) {
          draft = `Hey ${firstName}, great momentum and transparency on your recent milestones. Always exciting connecting with fellow operators building in tech. Looking forward to keeping in touch!`;
        } else {
          draft = `Hi ${firstName}, came across your post about ${post.author?.headline ? post.author.headline.slice(0, 40) + "..." : "industry trends"} and found your perspective very sharp. Would love to add you to my LinkedIn network!`;
        }

        setAiDraft(draft);
        setIsGeneratingAi(false);
      }, 600);
    }
  };

  const handleCopyAiDraft = () => {
    if (aiDraft) {
      navigator.clipboard.writeText(aiDraft);
      setCopiedAiDraft(true);
      setTimeout(() => setCopiedAiDraft(false), 2000);
    }
  };

  // Render text with clickable links, hashtags, and mentions
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, lineIdx) => {
      const tokens = line.split(/(https?:\/\/[^\s]+|#[\w\d_-]+|@[\w\d_-]+)/g);
      return (
        <span key={lineIdx} className="block min-h-[1.25rem]">
          {tokens.map((token, tokenIdx) => {
            if (token.startsWith("http://") || token.startsWith("https://")) {
              return (
                <a
                  key={tokenIdx}
                  href={token}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sky-400 hover:text-sky-300 underline underline-offset-2 break-all inline-flex items-center gap-0.5"
                >
                  <span>
                    {token.length > 40 ? token.slice(0, 36) + "..." : token}
                  </span>
                  <ExternalLink className="h-2.5 w-2.5 inline" />
                </a>
              );
            } else if (token.startsWith("#")) {
              return (
                <span
                  key={tokenIdx}
                  className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(
                        token
                      )}`,
                      "_blank"
                    );
                  }}
                >
                  {token}
                </span>
              );
            } else if (token.startsWith("@")) {
              return (
                <span
                  key={tokenIdx}
                  className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  {token}
                </span>
              );
            }
            return <span key={tokenIdx}>{token}</span>;
          })}
        </span>
      );
    });
  };

  const isTextLong = post.text && post.text.length > 320;
  const displayedText =
    isTextLong && !isExpanded ? post.text.slice(0, 320) + "..." : post.text;

  return (
    <div className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-sky-500/40 hover:bg-zinc-900/90 hover:shadow-sky-500/10 flex flex-col justify-between">
      {/* Top Author Row */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Author Avatar */}
            <div className="relative shrink-0">
              {post.author?.profile_picture_url && !avatarError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.profile_picture_url}
                  alt={post.author.name || "LinkedIn Author"}
                  onError={() => setAvatarError(true)}
                  className="h-12 w-12 rounded-xl object-cover border border-zinc-700/80 bg-zinc-800 shadow-md"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white font-bold text-sm border border-sky-400/30 shadow-md">
                  {authorInitials}
                </div>
              )}

              {/* LinkedIn Platform Icon Badge */}
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0077B5] text-white border-2 border-zinc-950 shadow-sm">
                <LinkedinIcon className="h-2.5 w-2.5 fill-current" />
              </div>
            </div>

            {/* Author Metadata */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {authorProfileUrl ? (
                  <a
                    href={authorProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-zinc-100 text-sm sm:text-base hover:text-sky-400 transition-colors truncate"
                  >
                    {post.author?.name || "LinkedIn Member"}
                  </a>
                ) : (
                  <span className="font-bold text-zinc-100 text-sm sm:text-base truncate">
                    {post.author?.name || "LinkedIn Member"}
                  </span>
                )}

                {post.author?.is_company ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                    <Building2 className="h-2.5 w-2.5" />
                    Company
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <UserCheck className="h-2.5 w-2.5" />
                    Member
                  </span>
                )}
              </div>

              {post.author?.headline && (
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">
                  {post.author.headline}
                </p>
              )}

              <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                <span title={formatFullDateTime(post.parsed_datetime || post.date)}>
                  {formatRelativeDate(post.parsed_datetime, post.date)}
                </span>
                {post.is_repost && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-400 flex items-center gap-1">
                      <Repeat className="h-3 w-3" /> Reposted
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick External Link */}
          <a
            href={linkedinPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open on LinkedIn"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/60 text-zinc-400 hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-400 transition-all shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Post Text Content */}
        <div className="text-sm text-zinc-200 leading-relaxed break-words font-normal">
          {renderFormattedContent(displayedText)}

          {isTextLong && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-2 text-xs font-semibold text-sky-400 hover:text-sky-300 inline-block focus:outline-none"
            >
              {isExpanded ? "Show less" : "Show more..."}
            </button>
          )}
        </div>

        {/* Job Posting Attachment Card (if present) */}
        {post.job_posting && (
          <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/20 text-sky-400">
                <Briefcase className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                Attached Job Listing
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {post.job_posting.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  {post.job_posting.company?.name && (
                    <span className="font-medium text-zinc-300">
                      {post.job_posting.company.name}
                    </span>
                  )}
                  {post.job_posting.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-zinc-500" />
                      {post.job_posting.location}
                    </span>
                  )}
                </div>
              </div>

              {post.job_posting.company?.picture_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.job_posting.company.picture_url}
                  alt={post.job_posting.company.name || "Company"}
                  className="h-9 w-9 rounded-lg border border-zinc-700 object-cover bg-zinc-800"
                />
              )}
            </div>
          </div>
        )}

        {/* AI Outreach Assistant Drawer */}
        {showAiOutreach && (
          <div className="mt-3 rounded-xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/30 to-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <span className="text-xs font-bold text-indigo-300">
                  AI Contextual Outreach Note
                </span>
              </div>
              <button
                onClick={() => setShowAiOutreach(false)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300"
              >
                Close
              </button>
            </div>

            {isGeneratingAi ? (
              <div className="flex items-center gap-2 text-xs text-indigo-300 py-2">
                <Bot className="h-4 w-4 animate-spin text-indigo-400" />
                <span>Crafting personalized connection message...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-lg border border-indigo-500/20 bg-zinc-900/80 p-3 text-xs text-zinc-200 leading-relaxed select-all">
                  {aiDraft}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleCopyAiDraft}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all"
                  >
                    {copiedAiDraft ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Engagement & Action Toolbar */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Engagement Counters */}
        <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
          <div
            className="flex items-center gap-1.5 hover:text-sky-400 transition-colors"
            title="Reactions"
          >
            <ThumbsUp className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-semibold text-zinc-200">
              {formatCompactNumber(post.reaction_counter)}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
            title="Comments"
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-semibold text-zinc-200">
              {formatCompactNumber(post.comment_counter)}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            title="Reposts"
          >
            <Repeat className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-semibold text-zinc-200">
              {formatCompactNumber(post.repost_counter)}
            </span>
          </div>

          {post.impressions_counter !== undefined && post.impressions_counter > 0 && (
            <div
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              title="Impressions"
            >
              <Eye className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-zinc-200">
                {formatCompactNumber(post.impressions_counter)}
              </span>
            </div>
          )}
        </div>

        {/* Quick Card Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
          {/* AI Outreach Trigger */}
          <button
            onClick={handleGenerateAiOutreach}
            title="Generate AI Outreach Note"
            className="flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span className="hidden sm:inline">AI Outreach</span>
          </button>

          {/* Copy Post Text */}
          <button
            onClick={handleCopyText}
            title="Copy Post Content"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all"
          >
            {copiedText ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Copy Share Link */}
          <button
            onClick={handleCopyLink}
            title="Copy Link to LinkedIn Post"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all"
          >
            {copiedLink ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Inspect JSON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspectJson(post);
            }}
            title="Inspect Raw JSON Payload"
            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-800/60 px-2.5 py-1 text-[11px] font-semibold text-zinc-400 hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-300 transition-all"
          >
            <Code2 className="h-3 w-3" />
            <span>JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
