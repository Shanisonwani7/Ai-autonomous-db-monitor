"use client";

import AIChat from "@/components/Ai/AIChat";

export default function AIPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      {/* Page Heading */}
      <h1 className="text-3xl font-bold text-white mb-2">
        AI Database Assistant
      </h1>

      {/* Page Description */}
      <p className="text-gray-400 mb-8">
        Ask anything about your database using AI.
      </p>

      {/* AI Chat */}
      <AIChat />
    </div>
  );
}