"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { DashboardLayout } from "@/components/DashboardLayout";
import { messagesApi, notificationsApi, proposalsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type InboxProposal = {
  id: number;
  status: string;
  job: {
    id: number;
    title: string;
    clientId: number;
    client: {
      id: number;
      username: string | null;
      name: string;
    };
  };
  freelancer: {
    id: number;
    username: string | null;
    name: string;
  };
};

type ThreadMessage = {
  id: number;
  body: string;
  createdAt: string;
  senderId: number;
  sender: {
    id: number;
    username: string | null;
    name: string;
    role: string;
  };
};

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedProposalId, setSelectedProposalId] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [messageStatus, setMessageStatus] = useState("");

  const notificationsQuery = useQuery({
    queryKey: ["support-notifications"],
    queryFn: async () => {
      const response = await notificationsApi.list(40);
      return {
        notifications: response.data?.notifications || [],
        unreadCount: response.data?.unreadCount || 0,
      };
    },
    enabled: Boolean(user),
    refetchInterval: 5000,
  });

  const proposalsQuery = useQuery({
    queryKey: ["support-proposal-inbox"],
    queryFn: async () => {
      const response = await proposalsApi.inbox();
      return (response.data?.proposals || []) as InboxProposal[];
    },
    enabled: Boolean(user),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!selectedProposalId && proposalsQuery.data?.length) {
      setSelectedProposalId(proposalsQuery.data[0].id);
    }
  }, [proposalsQuery.data, selectedProposalId]);

  const selectedProposal = useMemo(
    () => proposalsQuery.data?.find((item) => item.id === selectedProposalId) || null,
    [proposalsQuery.data, selectedProposalId],
  );

  const threadQuery = useQuery({
    queryKey: ["support-thread", selectedProposalId],
    queryFn: async () => {
      const response = await messagesApi.listByProposal(selectedProposalId);
      return (response.data?.messages || []) as ThreadMessage[];
    },
    enabled: selectedProposalId > 0,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      return messagesApi.create({
        proposalId: selectedProposalId,
        body: messageInput,
      });
    },
    onSuccess: async () => {
      setMessageInput("");
      setMessageStatus("Message sent");
      await threadQuery.refetch();
      await notificationsQuery.refetch();
    },
    onError: (err: any) => {
      setMessageStatus(err?.response?.data?.detail || "Unable to send message");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => notificationsApi.markAllRead(),
    onSuccess: async () => {
      await notificationsQuery.refetch();
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: async (notificationId: number) => notificationsApi.markRead(notificationId),
    onSuccess: async () => {
      await notificationsQuery.refetch();
    },
  });

  function sendMessage() {
    if (!selectedProposalId) {
      setMessageStatus("Select a proposal thread first");
      return;
    }

    if (!messageInput.trim()) {
      setMessageStatus("Type a message before sending");
      return;
    }

    sendMessageMutation.mutate();
  }

  return (
    <DashboardLayout title="Support & Inbox" subtitle="Real-time style messaging with polling and an in-app notifications center.">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Notifications</p>
            <button className="btn-secondary btn-md" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending}>
              Mark all read ({notificationsQuery.data?.unreadCount || 0})
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {(notificationsQuery.data?.notifications || []).map((item: any) => (
              item.link ? (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={async (event) => {
                    event.preventDefault();
                    if (!item.isRead) {
                      await markNotificationReadMutation.mutateAsync(item.id);
                    }
                    router.push(item.link);
                  }}
                  className={`block rounded-xl border p-4 transition hover:border-cyan-400 hover:bg-cyan-50/60 ${item.isRead ? "border-slate-200 bg-white" : "border-cyan-200 bg-cyan-50/50"}`}
                >
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                  <p className="mt-2 text-xs font-medium text-cyan-700">Tap to review request</p>
                </Link>
              ) : (
                <article key={item.id} className={`rounded-xl border p-4 ${item.isRead ? "border-slate-200 bg-white" : "border-cyan-200 bg-cyan-50/50"}`}>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                  <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                </article>
              )
            ))}
            {!notificationsQuery.data?.notifications?.length ? <p className="text-sm text-slate-500">No notifications yet.</p> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Messages</p>

          {!proposalsQuery.data?.length ? (
            <p className="mt-4 text-sm text-slate-500">No project threads available yet. Messaging unlocks when a proposal exists.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Select thread</span>
                <select value={selectedProposalId} onChange={(event) => setSelectedProposalId(Number(event.target.value))} className="input">
                  {(proposalsQuery.data || []).map((proposal) => (
                    <option key={proposal.id} value={proposal.id}>
                      {proposal.job.title} | {proposal.status}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Project:</span> {selectedProposal?.job.title}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">Proposal status:</span> {selectedProposal?.status}
                </p>
              </div>

              <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
                {(threadQuery.data || []).map((message) => {
                  const mine = Number(user?.id || 0) === message.senderId;
                  return (
                    <article key={message.id} className={`max-w-[86%] rounded-xl px-3 py-2 text-sm ${mine ? "ml-auto bg-primary-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                      <p className="text-xs opacity-80">{message.sender.username || message.sender.name}</p>
                      <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
                      <p className="mt-1 text-[11px] opacity-80">{new Date(message.createdAt).toLocaleTimeString()}</p>
                    </article>
                  );
                })}
                {!threadQuery.data?.length ? <p className="text-sm text-slate-500">No messages yet in this thread.</p> : null}
              </div>

              <div className="flex gap-2">
                <input
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  className="input"
                  placeholder="Type your message"
                />
                <button type="button" className="btn-primary btn-md" onClick={sendMessage} disabled={sendMessageMutation.isPending}>
                  Send
                </button>
              </div>

              {messageStatus ? <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{messageStatus}</p> : null}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
