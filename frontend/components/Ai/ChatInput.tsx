"use client";

import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
}

export default function ChatInput({
  input,
  setInput,
  handleSend,
}: ChatInputProps) {
  return (
    <div className="flex gap-3 pt-4 border-t border-slate-800">

      <input
        type="text"
        value={input}
        placeholder="Ask anything about your database..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-500"
      />

      <button
        onClick={handleSend}
        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 transition px-5 rounded-xl font-semibold text-white"
      >
        <SendHorizontal size={18} />
        Send
      </button>

    </div>
  );
}