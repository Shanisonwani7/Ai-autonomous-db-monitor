"use client";

import { useEffect, useState } from "react";

import { useDatabase } from "@/context/DatabaseContext";

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
  const [loading, setLoading] = useState(false);

  const { selectedDatabaseId } = useDatabase();

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

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!selectedDatabaseId) {
      alert("Please select a database.");
      return;
    }

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
    ]);

    setInput("");

    try {
      setLoading(true);

      const answer = await askAI(userMessage, selectedDatabaseId);

      const aiTime = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
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

      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        loading={loading}
      />
    </div>
  );
}