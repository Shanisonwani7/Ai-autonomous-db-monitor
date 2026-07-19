import React from "react";
import { Database, ArrowRight } from "lucide-react";

export interface EmptyStateProps {
  heading?: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export default function EmptyState({
  heading = "Start a conversation",
  description = "Ask about database performance, slow queries, resource usage, or general health checks.",
  actionLabel = "Check database health",
  onActionClick,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
        <Database className="h-8 w-8 text-cyan-400" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h2 className="text-lg font-semibold text-slate-100">{heading}</h2>
        <p className="text-sm leading-relaxed text-slate-400">{description}</p>
      </div>

      {onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className="group flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}