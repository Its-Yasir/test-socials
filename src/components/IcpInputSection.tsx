"use client";

import { useState } from "react";
import { IcpInput, ICP_PRESETS } from "@/lib/sampleDataGenerator";
import {
  Sparkles,
  FileText,
  FormInput,
  Building2,
  Target,
  Briefcase,
  Layers,
  AlertCircle,
  Wand2,
  RotateCcw,
  Zap,
  AtSign
} from "lucide-react";

interface IcpInputSectionProps {
  platform: "twitter" | "reddit";
  onSearch: (icp: IcpInput, competitors?: string[]) => void;
  isLoading: boolean;
  initialCompetitors?: string;
  buttonLabel?: string;
}

const DEFAULT_COMPETITOR_SUGGESTIONS = [
  "linear",
  "jira",
  "asana",
  "apolloio",
  "hubspot",
  "notionhq"
];

export function IcpInputSection({
  platform,
  onSearch,
  isLoading,
  initialCompetitors = "linear, jira",
  buttonLabel,
}: IcpInputSectionProps) {
  const [mode, setMode] = useState<"freeform" | "structured">("freeform");

  // Competitor state
  const [competitorsText, setCompetitorsText] = useState(initialCompetitors);

  // Form states
  const [freeformText, setFreeformText] = useState(
    "B2B SaaS founders and VPs of Engineering building developer tools with 10-50 employees looking to solve customer churn and scale outbound revenue."
  );
  const [companyName, setCompanyName] = useState("DevScale AI");
  const [offering, setOffering] = useState("Automated developer churn analytics and signal discovery tool");
  const [targetRole, setTargetRole] = useState("Founder, VP Growth, Head of Engineering");
  const [industry, setIndustry] = useState("B2B SaaS & Developer Infrastructure");
  const [companySize, setCompanySize] = useState("10-50 employees ($1M-$5M ARR)");
  const [painPoints, setPainPoints] = useState("High customer acquisition cost, low cold outreach reply rates");
  const [location, setLocation] = useState("North America & Europe");

  const isTwitter = platform === "twitter";
  const brandGradient = isTwitter
    ? "from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 shadow-sky-500/20"
    : "from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-500/20";

  const handleApplyPreset = (preset: typeof ICP_PRESETS[0]) => {
    if (mode === "freeform") {
      setFreeformText(preset.freeform);
    } else {
      setCompanyName(preset.structured.companyName);
      setOffering(preset.structured.offering);
      setTargetRole(preset.structured.targetRole);
      setIndustry(preset.structured.industry);
      setCompanySize(preset.structured.companySize);
      setPainPoints(preset.structured.painPoints);
      setLocation(preset.structured.location);
    }
  };

  const handleAddCompetitorChip = (handle: string) => {
    const clean = handle.replace(/^@+/, "");
    const current = competitorsText
      .split(/[,\s]+/)
      .map((c) => c.trim().replace(/^@+/, ""))
      .filter(Boolean);

    if (!current.includes(clean)) {
      const updated = current.length > 0 ? `${current.join(", ")}, @${clean}` : `@${clean}`;
      setCompetitorsText(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const competitorsList = isTwitter
      ? competitorsText
          .split(/[,\s]+/)
          .map((c) => c.trim().replace(/^@+/, ""))
          .filter(Boolean)
      : [];

    onSearch(
      {
        mode,
        freeformText,
        companyName,
        offering,
        targetRole,
        industry,
        companySize,
        painPoints,
        location,
      },
      competitorsList
    );
  };

  const handleReset = () => {
    setFreeformText("");
    setCompanyName("");
    setOffering("");
    setTargetRole("");
    setIndustry("");
    setCompanySize("");
    setPainPoints("");
    setLocation("");
    if (isTwitter) setCompetitorsText("");
  };

  return (
    <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow background accent */}
      <div
        className={`absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-15 pointer-events-none ${
          isTwitter ? "bg-sky-500" : "bg-orange-500"
        }`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg border text-xs font-semibold ${
                isTwitter
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                  : "bg-orange-500/10 text-orange-400 border-orange-500/20"
              }`}
            >
              {isTwitter ? "X / Twitter Competitor Mention Radar" : "Reddit Community Radar"}
            </span>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
              Define Ideal Customer Profile (ICP) & Competitors
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {isTwitter
              ? "Monitor competitor mentions in the last 7 days and use AI to pinpoint dissatisfied prospects matching your ICP."
              : "Choose between single prompt or granular parameters to scan for matching leads."}
          </p>
        </div>

        {/* Input Mode Toggle Tabs */}
        <div className="flex items-center rounded-xl bg-zinc-950 p-1 border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode("freeform")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              mode === "freeform"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Single Prompt Input</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("structured")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              mode === "structured"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FormInput className="h-3.5 w-3.5" />
            <span>Detailed Form Input</span>
          </button>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Wand2 className="h-3.5 w-3.5 text-amber-400" />
          <span>Quick ICP Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {ICP_PRESETS.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all"
              >
                + {preset.title}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors ml-auto sm:ml-0"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Form</span>
        </button>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {/* Competitor Handles Input (for Twitter) */}
        {isTwitter && (
          <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 sm:p-5 space-y-3 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-sky-200 flex items-center gap-2">
                <AtSign className="h-4 w-4 text-sky-400" />
                <span>Target Competitor Handles (Twitter / X)</span>
                <span className="rounded-md bg-sky-500/20 text-sky-300 px-2 py-0.5 text-[10px] font-semibold border border-sky-500/30">
                  Last 7 Days Mentions
                </span>
              </label>
              <span className="text-[11px] text-zinc-400">
                Separate multiple handles with comma or space (e.g. <code className="text-sky-300">@linear, @jira</code>)
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={competitorsText}
                onChange={(e) => setCompetitorsText(e.target.value)}
                placeholder="e.g. @linear, @jira, @asana, @apolloio"
                className="w-full rounded-xl border border-sky-500/30 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                required
              />
            </div>

            {/* Quick Competitor Suggestions */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="text-[11px] text-zinc-400 font-medium">Quick Competitor Suggestions:</span>
              {DEFAULT_COMPETITOR_SUGGESTIONS.map((comp) => (
                <button
                  key={comp}
                  type="button"
                  onClick={() => handleAddCompetitorChip(comp)}
                  className="rounded-lg border border-sky-500/20 bg-sky-950/40 px-2.5 py-0.5 text-[11px] font-medium text-sky-300 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all"
                >
                  + @{comp}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "freeform" ? (
          /* FREEFORM PROMPT MODE */
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Describe your ICP in free-form natural language
              </label>
              <span className="text-[11px] text-zinc-500">
                Company stage, buyer roles, value proposition, and pain points solved
              </span>
            </div>
            <div className="relative">
              <textarea
                value={freeformText}
                onChange={(e) => setFreeformText(e.target.value)}
                rows={4}
                placeholder="e.g. B2B SaaS founders building developer tools with 10-50 employees looking for automated lead gen tools to scale outbound sales without high SDR headcount..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all resize-y shadow-inner font-sans"
                required
              />
              <div className="absolute bottom-3 right-3 text-[11px] text-zinc-500">
                {freeformText.length} characters
              </div>
            </div>
          </div>
        ) : (
          /* STRUCTURED FORM MODE */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Offering / Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-sky-400" />
                Your Company Name & Product Offering
              </label>
              <input
                type="text"
                value={offering}
                onChange={(e) => setOffering(e.target.value)}
                placeholder="e.g. AI Social Intent Lead Finder"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                required
              />
            </div>

            {/* Target Job Title / Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                Target Job Titles / Roles
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Founder, CEO, VP of Growth, Marketing Director"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                required
              />
            </div>

            {/* Target Industry & Niche */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-purple-400" />
                Target Industry / Niche
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. B2B SaaS, FinTech, E-Commerce, DevTools"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>

            {/* Target Company Size / Revenue */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-amber-400" />
                Company Size / Revenue Stage
              </label>
              <input
                type="text"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                placeholder="e.g. 10-50 employees, $1M-$5M ARR"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>

            {/* Core Buyer Pain Points / Keywords */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                Core Buyer Pain Points & Intent Keywords
              </label>
              <input
                type="text"
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                placeholder="e.g. High customer churn, slow lead conversion, looking for Apollo alternative"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isTwitter
                ? "Scans @competitor mentions from last 7 days & batches 10 at a time to AI"
                : "Searching real-time Reddit posts, comments & subreddits"}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r ${brandGradient} px-8 py-3.5 text-sm font-bold text-white shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>Analyzing Competitor Mentions with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{buttonLabel || (isTwitter ? "Analyze Competitor Mentions" : "Run Reddit ICP Discovery")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
