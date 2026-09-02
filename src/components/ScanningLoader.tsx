"use client";

import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, Radar } from "lucide-react";

interface ScanningLoaderProps {
  platform?: "twitter";
}

export function ScanningLoader({ platform = "twitter" }: ScanningLoaderProps) {
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Parsing ICP Criteria", desc: "Extracting key buyer roles, intent signals, and problem keywords..." },
    { title: "Scanning X (Twitter) Bios & Tweets", desc: "Filtering platform activity across active tweets and author bios..." },
    { title: "Evaluating Match Confidence", desc: "Scoring profile relevance, decision-making power, and buying urgency..." },
    { title: "Generating Personalized Hooks", desc: "Drafting tailored, high-converting outreach hooks for each match..." },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 500);
    const timer2 = setTimeout(() => setStep(2), 1100);
    const timer3 = setTimeout(() => setStep(3), 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center my-8">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute h-20 w-20 rounded-full animate-ping opacity-25 bg-sky-500" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border shadow-xl border-sky-500/30 bg-sky-500/10 text-sky-400">
          <Radar className="h-8 w-8 animate-spin" style={{ animationDuration: "3s" }} />
        </div>
      </div>

      <h3 className="text-xl font-bold text-zinc-100 tracking-tight">
        Scanning Twitter / X Intent Signals
      </h3>
      <p className="text-xs text-zinc-400 mt-1 max-w-md">
        Matching live profiles against your target customer parameters...
      </p>

      <div className="mt-8 w-full max-w-md space-y-3">
        {steps.map((s, idx) => {
          const isDone = step > idx;
          const isCurrent = step === idx;

          return (
            <div
              key={s.title}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                isCurrent
                  ? "border-sky-500/40 bg-sky-500/5 shadow-md"
                  : isDone
                  ? "border-zinc-800 bg-zinc-900/40 opacity-80"
                  : "border-zinc-900 bg-zinc-950 opacity-40"
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Sparkles className="h-4 w-4 animate-spin text-sky-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-zinc-700" />
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-200">{s.title}</div>
                <div className="text-[11px] text-zinc-500">{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
