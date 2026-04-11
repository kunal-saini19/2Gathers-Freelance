"use client";

import { useMemo, useState } from "react";
import { generateChatReply } from "@/lib/ai";
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
      content: "Hi, I’m 2Gathers AI. Ask me about jobs, tokens, wallet flow, or support.",
    },
  ]);
  const [input, setInput] = useState("");

  const quickReplies = useMemo(
    () => [
      "Show jobs that fit my profile",
      "How do tokens work?",
      "How do I contact support?",
    ],
    [],
  );

  function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    const assistantMessage: Message = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: generateChatReply(text),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
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
            placeholder="Ask the assistant something..."
            className="flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Send
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
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
