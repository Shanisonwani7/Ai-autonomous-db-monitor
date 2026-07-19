"use client";

import React, { useState, useCallback } from "react";
import {
  ChatHeader,
  ChatWindow,
  ChatInput,
  SuggestedPrompts,
  type ChatMessage,
} from "@/components/ai-assistant";

export default function AIAssistantPage(): React.ReactElement {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  /**
   * Sends the current input as a user message.
   *
   * TODO (backend integration):
   *  1. POST the conversation (or just the latest message) to the assistant API,
   *     e.g. `POST /api/ai-assistant/messages`.
   *  2. Set `isTyping(true)` while awaiting the response.
   *  3. On success, append the returned assistant message to `messages`.
   *  4. On failure, surface an error state (e.g. a system message or toast).
   *  5. Set `isTyping(false)` once the response is handled.
   */
  const handleSend = useCallback(async (): Promise<void> => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // TODO: call the backend assistant API here, e.g.
      // const response = await fetch("/api/ai-assistant/messages", { ... });
      // const assistantMessage = await response.json();
      // setMessages((previous) => [...previous, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [input]);

  /**
   * Handles selection of a suggested prompt card.
   *
   * TODO (backend integration):
   *  Decide whether selecting a prompt should immediately send the message
   *  or only populate the input for the user to review/edit before sending.
   *  Currently it populates the input, matching common chat-assistant UX.
   */
  const handlePromptSelect = useCallback(async (prompt: string): Promise<void> => {
    setSelectedPrompt(prompt);
    setInput(prompt);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-950">
      <ChatHeader />

      <main className="flex min-h-0 flex-1 flex-col">
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          onEmptyStateAction={() => void handlePromptSelect("Check database health")}
        />

        {messages.length === 0 && !isTyping && (
          <div className="border-t border-slate-800/60 px-4 py-5 sm:px-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
              Suggested prompts
            </p>
            <SuggestedPrompts onSelect={(prompt) => void handlePromptSelect(prompt)} />
          </div>
        )}

        {selectedPrompt && input === selectedPrompt && (
          <p className="px-4 pt-2 text-[11px] text-slate-500 sm:px-6" aria-live="polite">
            From suggested prompt &mdash; edit before sending if needed.
          </p>
        )}

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => void handleSend()}
          loading={isTyping}
          disabled={false}
        />
      </main>
    </div>
  );
}