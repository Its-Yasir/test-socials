"use client";

import { useState } from "react";
import { LinkedinPostItem } from "@/lib/linkedinTypes";
import {
  formatFullDateTime,
  formatCompactNumber,
} from "@/lib/linkedinFormatters";
import { LinkedinIcon } from "@/components/SocialIcons";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Code,
  FileText,
  Building2,
  UserCheck,
  Briefcase,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Eye,
  Calendar,
  Sparkles,
} from "lucide-react";

interface LinkedinDetailModalProps {
  post: LinkedinPostItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LinkedinDetailModal({
  post,
  isOpen,
  onClose,
}: LinkedinDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "json">("overview");

  if (!isOpen || !post) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(post, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkedinPostUrl =
    post.share_url ||
    (post.social_id
      ? `https://www.linkedin.com/feed/update/${post.social_id}`
      : `https://www.linkedin.com/feed/update/urn:li:activity:${post.id}`);

  const authorProfileUrl = post.author?.public_identifier
    ? `https://www.linkedin.com/${post.author.is_company ? "company" : "in"}/${post.author.public_identifier}`
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0077B5]/20 border border-[#0077B5]/40 text-[#0077B5]">
              <LinkedinIcon className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                LinkedIn Post Inspector & Raw Data
                <span className="font-mono text-[11px] text-zinc-500 font-normal">
                  ID: {post.id}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Author: {post.author?.name || "Member"} &bull;{" "}
                {formatFullDateTime(post.parsed_datetime || post.date)}
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
              {/* Author Overview Card */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Author Profile
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {post.author?.profile_picture_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.author.profile_picture_url}
                        alt={post.author.name}
                        className="h-12 w-12 rounded-xl object-cover border border-zinc-700 bg-zinc-800"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white font-bold text-sm">
                        {post.author?.name?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">
                          {post.author?.name}
                        </span>
                        {post.author?.is_company ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                            <Building2 className="h-2.5 w-2.5" /> Company
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <UserCheck className="h-2.5 w-2.5" /> Member
                          </span>
                        )}
                      </div>
                      {post.author?.headline && (
                        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          {post.author.headline}
                        </p>
                      )}
                      {post.author?.public_identifier && (
                        <p className="text-[11px] font-mono text-zinc-500 mt-1">
                          Handle: @{post.author.public_identifier}
                        </p>
                      )}
                    </div>
                  </div>

                  {authorProfileUrl && (
                    <a
                      href={authorProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10 transition-all shrink-0"
                    >
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Post Full Content */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Full Post Content
                </div>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed select-all">
                  {post.text}
                </p>
              </div>

              {/* Engagement Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-xs text-sky-400">
                    <ThumbsUp className="h-3.5 w-3.5" /> Reactions
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatCompactNumber(post.reaction_counter)}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-xs text-indigo-400">
                    <MessageSquare className="h-3.5 w-3.5" /> Comments
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatCompactNumber(post.comment_counter)}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-xs text-emerald-400">
                    <Repeat className="h-3.5 w-3.5" /> Reposts
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatCompactNumber(post.repost_counter)}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-xs text-amber-400">
                    <Eye className="h-3.5 w-3.5" /> Impressions
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatCompactNumber(post.impressions_counter)}
                  </div>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Technical Metadata
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500">Social ID: </span>
                    <span className="font-mono text-zinc-300">
                      {post.social_id || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Provider: </span>
                    <span className="font-mono text-zinc-300">
                      {post.provider || "LINKEDIN"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Parsed Timestamp: </span>
                    <span className="text-zinc-300">
                      {post.parsed_datetime || post.date || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Share URL: </span>
                    <a
                      href={linkedinPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline truncate inline-block max-w-[200px]"
                    >
                      {linkedinPostUrl}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Raw JSON Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  <span>Full Unipile LinkedIn Search Item Object</span>
                </div>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-sky-300 overflow-x-auto max-h-[500px]">
                <pre>{JSON.stringify(post, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/80 px-6 py-4 bg-zinc-900/40 flex items-center justify-between">
          <a
            href={linkedinPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
          >
            <span>Open post directly on LinkedIn</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-bold text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
