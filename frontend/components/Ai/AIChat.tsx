"use client";

import { useEffect, useState } from "react";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { askAI } from "@/services/aiService";

interface Message {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // Load initial AI message
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
  const handleSend = async () => {
    if (!input.trim()) return;

    const currentTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());

    const userMessage = input;

    // Show user message immediately
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
        time: currentTime,
      },
    ]);

    // Clear input
    setInput("");

    try {
      // Temporary Database ID
      const databaseId = 2;

      // Get AI Response
      const answer = await askAI(userMessage, databaseId);

      const aiTime = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());

      // Show AI response
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: answer,
          time: aiTime,
        },
      ]);
    } catch (error) {
      console.error(error);

      const aiTime = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Failed to connect with AI service.",
          time: aiTime,
        },
      ]);
    }
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