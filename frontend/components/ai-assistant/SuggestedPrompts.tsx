import React from "react";
import { Gauge, Wrench, HeartPulse, Search, Cpu, HardDrive, type LucideIcon } from "lucide-react";

export interface SuggestedPrompt {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface SuggestedPromptsProps {
  prompts?: SuggestedPrompt[];
  onSelect: (prompt: string) => void;
}

const DEFAULT_PROMPTS: SuggestedPrompt[] = [
  { id: "slow-db", label: "Why is my database slow?", icon: Gauge },
  { id: "optimize-query", label: "Optimize this SQL query", icon: Wrench },
  { id: "check-health", label: "Check database health", icon: HeartPulse },
  { id: "find-slow-queries", label: "Find slow queries", icon: Search },
  { id: "cpu-spikes", label: "Analyze CPU spikes", icon: Cpu },
  { id: "storage-usage", label: "Show storage usage", icon: HardDrive },
];

export default function SuggestedPrompts({
  prompts = DEFAULT_PROMPTS,
  onSelect,
}: SuggestedPromptsProps): React.ReactElement {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => {
        const Icon = prompt.icon ?? Gauge;
        return (
          <button
            key={prompt.id}
            type="button"
            onClick={() => onSelect(prompt.label)}
            className="group flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-800/30 p-4 text-left backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-cyan-500/5"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-900/60 text-slate-400 transition-colors group-hover:border-cyan-500/40 group-hover:text-cyan-400">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-slate-300 transition-colors group-hover:text-slate-100">
              {prompt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}