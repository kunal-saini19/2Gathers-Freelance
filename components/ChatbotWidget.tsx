"use client";

import { useMemo, useState } from "react";
import type { MockJob } from "@/lib/db";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export function ChatbotWidget({ suggestions }: { suggestions: MockJob[] }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi, I'm 2Gathers AI Search Assistant powered by Groq. Ask me anything about jobs, wallet, tokens, dashboard flow, or support.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickReplies = useMemo(
    () => [
      "Find jobs matching my skills",
      "How do tokens and wallet actions work?",
      "I am a client: how do I post and manage a job?",
    ],
    [],
  );

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: data.id,
        role: "assistant",
        content: data.message,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((current) => [...current, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            disabled={isLoading}
            placeholder="Ask the assistant something..."
            className="flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-slate-400 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Suggestions</p>
        <div className="mt-4 space-y-3">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => sendMessage(reply)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Recommended jobs</p>
          <div className="mt-3 space-y-3">
            {suggestions.slice(0, 3).map((job) => (
              <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-sm font-medium text-slate-900">{job.title}</p>
                <p className="mt-1 text-xs text-slate-500">{job.client} · {job.matchScore}% fit</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
