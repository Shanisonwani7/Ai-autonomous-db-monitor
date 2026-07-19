import React from "react";
import { Bot, User } from "lucide-react";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string | number | Date;
}

export interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Formats a timestamp into a short, locale-aware time string (e.g. "10:42 AM").
 */
function formatTimestamp(timestamp: ChatMessage["timestamp"]): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Minimal, dependency-free markdown-style renderer.
 * Supports: **bold**, `inline code`, fenced code blocks, and line breaks.
 * Intentionally lightweight so it stays framework-agnostic and safe (no HTML injection).
 */
function renderContent(content: string): React.ReactNode[] {
  const blocks = content.split(/```/);

  return blocks.map((block, blockIndex) => {
    const isCodeBlock = blockIndex % 2 === 1;

    if (isCodeBlock) {
      return (
        <pre
          key={`code-${blockIndex}`}
          className="my-2 overflow-x-auto rounded-lg border border-slate-700/60 bg-slate-950/70 p-3 font-mono text-xs text-slate-200"
        >
          <code>{block.trim()}</code>
        </pre>
      );
    }

    const lines = block.split("\n");

    return (
      <React.Fragment key={`text-${blockIndex}`}>
        {lines.map((line, lineIndex) => {
          const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);

          return (
            <React.Fragment key={`line-${blockIndex}-${lineIndex}`}>
              {parts.map((part, partIndex) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={partIndex} className="font-semibold text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                if (part.startsWith("`") && part.endsWith("`")) {
                  return (
                    <code
                      key={partIndex}
                      className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-300"
                    >
                      {part.slice(1, -1)}
                    </code>
                  );
                }
                return <span key={partIndex}>{part}</span>;
              })}
              {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  });
}

export default function MessageBubble({ message }: MessageBubbleProps): React.ReactElement {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${
          isUser
            ? "border-slate-600/60 bg-slate-800/80 text-slate-200"
            : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`flex max-w-[80%] flex-col gap-1 sm:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl border px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm ${
            isUser
              ? "rounded-tr-sm border-cyan-500/20 bg-cyan-500/10 text-slate-100"
              : "rounded-tl-sm border-slate-700/60 bg-slate-800/40 text-slate-200"
          }`}
        >
          {renderContent(message.content)}
        </div>
        <span className="px-1 text-[11px] text-slate-500">{formatTimestamp(message.timestamp)}</span>
      </div>
    </div>
  );
}