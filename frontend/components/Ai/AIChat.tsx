"use client";

import { useEffect, useState } from "react";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface Message {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // Load initial AI message after component mounts
  useEffect(() => {
    const currentTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());

    setMessages([
      {
        sender: "ai",
        text: "👋 Hello! I am your AI Database Assistant. Ask me anything about your database.",
        time: currentTime,
      },
    ]);
  }, []);

  // Send Message
  const handleSend = () => {
    if (!input.trim()) return;

    const currentTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
        time: currentTime,
      },
      {
        sender: "ai",
        text: "🤖 This is a demo response. Real AI will be connected in the next session.",
        time: currentTime,
      },
    ]);

    setInput("");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      {/* Chat Messages */}
      <div className="h-[500px] overflow-y-auto space-y-5 mb-6">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            sender={message.sender}
            text={message.text}
            time={message.time}
          />
        ))}
      </div>

      {/* Chat Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
      />
    </div>
  );
}