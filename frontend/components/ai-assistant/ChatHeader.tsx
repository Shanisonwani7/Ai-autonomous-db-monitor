import React from "react";
import { Sparkles, Database } from "lucide-react";

export interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  isOnline?: boolean;
  poweredByLabel?: string;
}

export default function ChatHeader({
  title = "AI Database Assistant",
  subtitle = "Ask questions about performance, health, and query optimization",
  isOnline = true,
  poweredByLabel = "Powered by AI",
}: ChatHeaderProps): React.ReactElement {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-800/60 bg-slate-900/40 px-5 py-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
          <Database className="h-5 w-5 text-cyan-400" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${
              isOnline ? "bg-emerald-400" : "bg-slate-500"
            }`}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-base font-semibold text-slate-100 sm:text-lg">{title}</h1>
            <span
              className={`hidden items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium sm:inline-flex ${
                isOnline
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-slate-600/40 bg-slate-700/20 text-slate-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-slate-500"}`}
                aria-hidden="true"
              />
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <p className="truncate text-xs text-slate-400 sm:text-sm">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-300">
        <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
        <span className="hidden sm:inline">{poweredByLabel}</span>
      </div>
    </header>
  );
}