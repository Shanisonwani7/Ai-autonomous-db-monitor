import React, { useRef } from "react";
import { Send, Loader2 } from "lucide-react";

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  loading = false,
  disabled = false,
  maxLength = 2000,
  placeholder = "Ask about query performance, indexes, CPU, or storage...",
}: ChatInputProps): React.ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInteractionDisabled = disabled || loading;
  const canSend = value.trim().length > 0 && !isInteractionDisabled;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    if (nextValue.length <= maxLength) {
      onChange(nextValue);
    }
  };

  const handleSendClick = () => {
    if (canSend) {
      onSend();
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="border-t border-slate-800/60 bg-slate-900/40 p-3 backdrop-blur-md sm:p-4">
      <div
        className={`flex items-end gap-2 rounded-2xl border bg-slate-800/40 p-2 transition-colors ${
          isInteractionDisabled ? "border-slate-800/60 opacity-60" : "border-slate-700/60 focus-within:border-cyan-500/40"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isInteractionDisabled}
          placeholder={placeholder}
          rows={1}
          maxLength={maxLength}
          className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none disabled:cursor-not-allowed"
        />

        <button
          type="button"
          onClick={handleSendClick}
          disabled={!canSend}
          aria-label="Send message"
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
            canSend
              ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              : "cursor-not-allowed bg-slate-700/50 text-slate-500"
          }`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-1">
        <span className="text-[11px] text-slate-500">Enter to send &middot; Shift+Enter for a new line</span>
        <span className="text-[11px] text-slate-500">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}