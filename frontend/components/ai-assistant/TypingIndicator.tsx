import React from "react";
import { Bot } from "lucide-react";

export interface TypingIndicatorProps {
  isTyping: boolean;
}

export default function TypingIndicator({ isTyping }: TypingIndicatorProps): React.ReactElement | null {
  if (!isTyping) return null;

  return (
    <div className="flex w-full items-center gap-3" role="status" aria-live="polite" aria-label="Assistant is typing">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-slate-700/60 bg-slate-800/40 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
      </div>
    </div>
  );
}