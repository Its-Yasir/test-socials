"use client";

import { useState } from "react";
import { LinkedinCompanyItem } from "@/lib/linkedinTypes";
import { formatCompactNumber } from "@/lib/linkedinFormatters";
import { LinkedinIcon } from "@/components/SocialIcons";
import {
  Building2,
  MapPin,
  Users,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Sparkles,
  Bot,
  Layers,
} from "lucide-react";

interface LinkedinCompanyCardProps {
  company: LinkedinCompanyItem;
  onInspectJson: (company: LinkedinCompanyItem) => void;
}

export function LinkedinCompanyCard({
  company,
  onInspectJson,
}: LinkedinCompanyCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInfo, setCopiedInfo] = useState(false);
  const [showAiPitch, setShowAiPitch] = useState(false);
  const [aiPitchDraft, setAiPitchDraft] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedAiPitch, setCopiedAiPitch] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const companyUrl =
    company.profile_url ||
    `https://www.linkedin.com/company/${encodeURIComponent(
      company.name.toLowerCase().replace(/\s+/g, "-")
    )}`;

  const companyInitials = (company.name || "Company")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(companyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const infoText = `${company.name} | ${company.industry || "N/A"} | ${
      company.location || "N/A"
    } | Followers: ${company.followers_count || 0}\n${company.summary || ""}\n${companyUrl}`;
    navigator.clipboard.writeText(infoText);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 2000);
  };

  const handleGenerateAiPitch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAiPitch(true);
    if (!aiPitchDraft) {
      setIsGeneratingAi(true);
      setTimeout(() => {
        const ind = company.industry || "Technology";
        const loc = company.location || "your region";
        const pitch = `Hi ${company.name} Team,

I've been following your work in the ${ind} space out of ${loc} and was really impressed by your recent momentum.

We help organizations in ${ind} automate high-intent social lead discovery and streamline B2B growth workflows. Would love to explore if there might be synergies with your team's current initiatives.

Are you open to a brief 10-minute intro next week?

Best regards,`;
        setAiPitchDraft(pitch);
        setIsGeneratingAi(false);
      }, 600);
    }
  };

  const handleCopyAiPitch = () => {
    if (aiPitchDraft) {
      navigator.clipboard.writeText(aiPitchDraft);
      setCopiedAiPitch(true);
      setTimeout(() => setCopiedAiPitch(false), 2000);
    }
  };

  const isSummaryLong = company.summary && company.summary.length > 240;
  const displayedSummary =
    isSummaryLong && !isExpanded
      ? company.summary!.slice(0, 240) + "..."
      : company.summary;

  return (
    <div className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:bg-zinc-900/90 hover:shadow-blue-500/10 flex flex-col justify-between">
      {/* Top Header Row */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Company Logo */}
            <div className="relative shrink-0">
              {company.logo && !logoError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo}
                  alt={company.name}
                  onError={() => setLogoError(true)}
                  className="h-14 w-14 rounded-2xl object-cover border border-zinc-700/80 bg-zinc-800 shadow-md"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-black text-base border border-blue-400/30 shadow-md">
                  {companyInitials}
                </div>
              )}

              {/* LinkedIn Platform Icon Badge */}
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0077B5] text-white border-2 border-zinc-950 shadow-sm">
                <LinkedinIcon className="h-2.5 w-2.5 fill-current" />
              </div>
            </div>

            {/* Company Title & Details */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold text-zinc-100 text-base sm:text-lg hover:text-sky-400 transition-colors truncate"
                >
                  {company.name}
                </a>

                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-blue-400">
                  <Building2 className="h-2.5 w-2.5" />
                  Company
                </span>
              </div>

              {/* Badges: Industry, Location, Followers */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {company.industry && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-xs text-zinc-300 font-medium">
                    <Layers className="h-3 w-3 text-sky-400" />
                    <span className="truncate max-w-[200px]">{company.industry}</span>
                  </span>
                )}

                {company.location && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-xs text-zinc-300 font-medium">
                    <MapPin className="h-3 w-3 text-rose-400" />
                    <span className="truncate max-w-[200px]">{company.location}</span>
                  </span>
                )}

                {company.followers_count !== undefined && company.followers_count > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-xs text-zinc-300 font-medium">
                    <Users className="h-3 w-3 text-indigo-400" />
                    <span>{formatCompactNumber(company.followers_count)} followers</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick External Link */}
          <a
            href={companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open on LinkedIn"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/60 text-zinc-400 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-sky-400 transition-all shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Company Summary Description */}
        {company.summary && (
          <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed break-words font-normal pt-1">
            <p>{displayedSummary}</p>

            {isSummaryLong && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="mt-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 inline-block focus:outline-none"
              >
                {isExpanded ? "Show less" : "Show more..."}
              </button>
            )}
          </div>
        )}

        {/* AI Account Outreach Pitch Drawer */}
        {showAiPitch && (
          <div className="mt-3 rounded-xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/30 to-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <span className="text-xs font-bold text-indigo-300">
                  AI B2B Account Outreach Proposal
                </span>
              </div>
              <button
                onClick={() => setShowAiPitch(false)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300"
              >
                Close
              </button>
            </div>

            {isGeneratingAi ? (
              <div className="flex items-center gap-2 text-xs text-indigo-300 py-2">
                <Bot className="h-4 w-4 animate-spin text-indigo-400" />
                <span>Crafting custom value proposition for {company.name}...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-lg border border-indigo-500/20 bg-zinc-900/80 p-3 text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap select-all font-mono">
                  {aiPitchDraft}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleCopyAiPitch}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all"
                  >
                    {copiedAiPitch ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Copied Proposal!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Proposal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
        <span className="text-[11px] font-mono text-zinc-500">
          ID: {company.id}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* AI Outreach Trigger */}
          <button
            onClick={handleGenerateAiPitch}
            title="Generate AI Account Outreach Proposal"
            className="flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span className="hidden sm:inline">AI Outreach</span>
          </button>

          {/* Copy Info */}
          <button
            onClick={handleCopyInfo}
            title="Copy Company Summary & Info"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all"
          >
            {copiedInfo ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Copy Share Link */}
          <button
            onClick={handleCopyLink}
            title="Copy LinkedIn Company URL"
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
              onInspectJson(company);
            }}
            title="Inspect Raw JSON Payload"
            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-800/60 px-2.5 py-1 text-[11px] font-semibold text-zinc-400 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-sky-300 transition-all"
          >
            <Code2 className="h-3 w-3" />
            <span>JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
