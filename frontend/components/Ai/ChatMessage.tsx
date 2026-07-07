"use client";

interface ChatMessageProps {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function ChatMessage({
  sender,
  text,
  time,
}: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex items-end gap-3 max-w-[75%]">

        {/* AI Avatar */}
        {sender === "ai" && (
          <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white">
            AI
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            sender === "user"
              ? "bg-cyan-600 text-white"
              : "bg-slate-800 text-gray-200"
          }`}
        >
          <p>{text}</p>

          <p className="text-[10px] opacity-60 mt-2">
            {time}
          </p>
        </div>

        {/* User Avatar */}
        {sender === "user" && (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
            U
          </div>
        )}

      </div>
    </div>
  );
}