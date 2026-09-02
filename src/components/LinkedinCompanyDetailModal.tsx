"use client";

import { useState } from "react";
import { LinkedinCompanyItem } from "@/lib/linkedinTypes";
import { formatCompactNumber } from "@/lib/linkedinFormatters";
import { LinkedinIcon } from "@/components/SocialIcons";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Code,
  FileText,
  Building2,
  MapPin,
  Users,
  Layers,
  Sparkles,
} from "lucide-react";

interface LinkedinCompanyDetailModalProps {
  company: LinkedinCompanyItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LinkedinCompanyDetailModal({
  company,
  isOpen,
  onClose,
}: LinkedinCompanyDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "json">("overview");

  if (!isOpen || !company) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(company, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const companyUrl =
    company.profile_url ||
    `https://www.linkedin.com/company/${encodeURIComponent(
      company.name.toLowerCase().replace(/\s+/g, "-")
    )}`;

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
                Company Inspector & Raw Data
                <span className="font-mono text-[11px] text-zinc-500 font-normal">
                  ID: {company.id}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                {company.name} &bull; {company.industry || "Company Profile"}
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
              {/* Company Header Card */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Company Identity
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {company.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="h-14 w-14 rounded-2xl object-cover border border-zinc-700 bg-zinc-800 shadow-md"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-black text-base">
                        {company.name?.[0] || "C"}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-lg">
                          {company.name}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-blue-400">
                          <Building2 className="h-2.5 w-2.5" /> Company
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        {company.industry && (
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3 text-sky-400" />
                            {company.industry}
                          </span>
                        )}
                        {company.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-rose-400" />
                            {company.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href={companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10 transition-all shrink-0"
                  >
                    <span>View on LinkedIn</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Summary */}
              {company.summary && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Company Summary & About
                  </div>
                  <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed select-all">
                    {company.summary}
                  </p>
                </div>
              )}

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-xs text-indigo-400">
                    <Users className="h-3.5 w-3.5" /> LinkedIn Followers
                  </div>
                  <div className="text-xl font-bold text-white">
                    {formatCompactNumber(company.followers_count)}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-xs text-rose-400">
                    <MapPin className="h-3.5 w-3.5" /> Primary Location
                  </div>
                  <div className="text-xs font-bold text-white truncate px-2">
                    {company.location || "Worldwide"}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-xs text-sky-400">
                    <Layers className="h-3.5 w-3.5" /> Industry Sector
                  </div>
                  <div className="text-xs font-bold text-white truncate px-2">
                    {company.industry || "General"}
                  </div>
                </div>
              </div>

              {/* Technical Metadata */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Technical Metadata
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500">Unipile ID: </span>
                    <span className="font-mono text-zinc-300">{company.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Entity Type: </span>
                    <span className="font-mono text-zinc-300">
                      {company.type || "COMPANY"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-zinc-500">LinkedIn URL: </span>
                    <a
                      href={companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline truncate inline-block max-w-full"
                    >
                      {companyUrl}
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
                  <span>Full Unipile LinkedIn Company Item Object</span>
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
                <pre>{JSON.stringify(company, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/80 px-6 py-4 bg-zinc-900/40 flex items-center justify-between">
          <a
            href={companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
          >
            <span>Open company page on LinkedIn</span>
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
