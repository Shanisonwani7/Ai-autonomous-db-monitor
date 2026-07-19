import React, { useEffect, useRef } from "react";
import MessageBubble, { type ChatMessage } from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";

export interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onEmptyStateAction?: () => void;
}

export default function ChatWindow({
  messages,
  isTyping = false,
  onEmptyStateAction,
}: ChatWindowProps): React.ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyState onActionClick={onEmptyStateAction} />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <TypingIndicator isTyping={isTyping} />
      <div ref={bottomRef} />
    </div>
  );
}