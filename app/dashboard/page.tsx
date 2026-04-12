"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  adminApi,
  authApi,
  clientProfileApi,
  freelancerProfileApi,
  jobsApi,
  notificationsApi,
  proposalsApi,
  savedFreelancersApi,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const FreelancerAnalytics = dynamic(() => import("@/features/dashboard/components/FreelancerAnalytics").then((mod) => mod.FreelancerAnalytics), {
  ssr: false,
  loading: () => <div className="mt-6 card-surface p-6 text-sm text-slate-600">Loading freelancer analytics...</div>,
});

const ClientAnalytics = dynamic(() => import("@/features/dashboard/components/ClientAnalytics").then((mod) => mod.ClientAnalytics), {
  ssr: false,
  loading: () => <div className="mt-6 card-surface p-6 text-sm text-slate-600">Loading client analytics...</div>,
});

type JobListItem = {
  id: number;
  title: string;
  clientId: number;
  _count?: {
    proposals: number;
  };
};

type ProposalItem = {
  id: number;
  status: "SUBMITTED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED";
  coverLetter: string;
  createdAt: string;
  job?: {
    id: number;
    title: string;
    status: "OPEN" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED";
  };
  freelancer: {
    id: number;
    username: string | null;
    name: string;
    email: string;
    walletAddress?: string | null;
  };
};

type AdminOverview = {
  counts: {
    users: number;
    jobs: number;
    proposals: number;
  };
  users: Array<{
    id: number;
    username: string | null;
    name: string;
    email: string;
    role: string;
    tokens: number;
  }>;
  jobs: Array<{
    id: number;
    title: string;
    budget: number;
    createdAt: string;
    client: {
      id: number;
      username: string | null;
      name: string;
      email: string;
    };
    _count: {
      proposals: number;
    };
  }>;
  proposals: Array<{
    id: number;
    coverLetter: string;
    createdAt: string;
    job: {
      id: number;
      title: string;
    };
    freelancer: {
      id: number;
      username: string | null;
      name: string;
      email: string;
    };
  }>;
};

type FreelancerProfileSummary = {
  professionalTitle: string;
  skills: string;
  experienceLevel: "ENTRY" | "INTERMEDIATE" | "EXPERT";
  hourlyRateUsd: number;
  country: string;
  city: string;
};

type ClientProfileSummary = {
  accountType: "INDIVIDUAL" | "COMPANY";
  displayName: string;
  companyName?: string | null;
  budgetRange: "UNDER_1K" | "ONE_TO_FIVE_K" | "FIVE_TO_TEN_K" | "TEN_PLUS";
  country: string;
  timezone: string;
  phone?: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalIdFromQuery = Number(searchParams.get("proposalId") || "0");
  const { user, logout } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState(0);
  const [proposalStatusFilter, setProposalStatusFilter] = useState<"ALL" | "SUBMITTED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED">("ALL");
  const [clientViewTab, setClientViewTab] = useState<"proposals" | "saved">("proposals");
  const [proposalActionStatus, setProposalActionStatus] = useState("");
  const [proposalStatusOverrides, setProposalStatusOverrides] = useState<Record<number, "SUBMITTED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED">>({});
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await authApi.dashboard();
      return response.data;
    },
  });

  const dashboard = dashboardQuery.data;
  const currentUserId = Number(user?.id || "0");

  const myJobsQuery = useQuery({
    queryKey: ["client-jobs", currentUserId],
    queryFn: async () => {
      const response = await jobsApi.list();
      const allJobs = (response.data?.jobs as JobListItem[]) || [];
      return allJobs.filter((job) => job.clientId === currentUserId);
    },
    enabled: user?.role === "CLIENT" && currentUserId > 0,
  });

  useEffect(() => {
    if (!selectedJobId && myJobsQuery.data?.length) {
      setSelectedJobId(myJobsQuery.data[0].id);
    }
  }, [myJobsQuery.data, selectedJobId]);

  const selectedJob = myJobsQuery.data?.find((job) => job.id === selectedJobId) || null;

  const proposalsQuery = useQuery({
    queryKey: ["client-proposals", currentUserId],
    queryFn: async () => {
      const response = await proposalsApi.inbox();
      return (response.data?.proposals as ProposalItem[]) || [];
    },
    enabled: user?.role === "CLIENT" && currentUserId > 0,
    refetchInterval: 5000,
  });

  const savedFreelancersQuery = useQuery({
    queryKey: ["saved-freelancers", currentUserId],
    queryFn: async () => {
      const response = await savedFreelancersApi.list();
      return (response.data?.saved || []) as Array<{
        id: number;
        freelancer: {
          id: number;
          username: string | null;
          name: string;
          email: string;
          role: string;
        };
      }>;
    },
    enabled: user?.role === "CLIENT" && currentUserId > 0,
    refetchInterval: 8000,
  });

  const proposalCountsByJob = (proposalsQuery.data || []).reduce<Record<number, number>>((counts, proposal) => {
    if (!proposal.job?.id) return counts;
    counts[proposal.job.id] = (counts[proposal.job.id] || 0) + 1;
    return counts;
  }, {});

  const visibleClientProposals = (proposalsQuery.data || []).filter((proposal) => {
    const matchesJob = selectedJobId > 0 ? proposal.job?.id === selectedJobId : true;
    const displayedStatus = proposalStatusOverrides[proposal.id] || proposal.status;
    const matchesStatus = proposalStatusFilter === "ALL" ? true : displayedStatus === proposalStatusFilter;
    return matchesJob && matchesStatus;
  });

  const getDisplayedProposalStatus = (proposal: ProposalItem) => proposalStatusOverrides[proposal.id] || proposal.status;

  useEffect(() => {
    if (user?.role !== "CLIENT") return;
    if (!myJobsQuery.data?.length || !proposalsQuery.data?.length) return;

    if (!selectedJobId) {
      const firstJobWithProposals = myJobsQuery.data.find((job) =>
        proposalsQuery.data?.some((proposal) => proposal.job?.id === job.id),
      );

      if (firstJobWithProposals) {
        setSelectedJobId(firstJobWithProposals.id);
        return;
      }
    }

    const selectedHasProposals = proposalsQuery.data.some((proposal) => proposal.job?.id === selectedJobId);
    if (selectedHasProposals) return;

    const firstJobWithProposals = myJobsQuery.data.find((job) =>
      proposalsQuery.data?.some((proposal) => proposal.job?.id === job.id),
    );

    if (firstJobWithProposals && firstJobWithProposals.id !== selectedJobId) {
      setSelectedJobId(firstJobWithProposals.id);
    }
  }, [myJobsQuery.data, proposalsQuery.data, selectedJobId, user?.role]);

  useEffect(() => {
    if (user?.role !== "CLIENT" || !proposalIdFromQuery || !proposalsQuery.data?.length) return;

    const proposal = proposalsQuery.data.find((item) => item.id === proposalIdFromQuery);
    if (!proposal?.job?.id) return;

    setClientViewTab("proposals");
    setProposalStatusFilter("ALL");
    setSelectedJobId(proposal.job.id);
  }, [proposalIdFromQuery, proposalsQuery.data, user?.role]);

  const notificationsQuery = useQuery({
    queryKey: ["dashboard-notifications"],
    queryFn: async () => {
      const response = await notificationsApi.list(10);
      return {
        notifications: response.data?.notifications || [],
        unreadCount: response.data?.unreadCount || 0,
      };
    },
    enabled: Boolean(user),
    refetchInterval: 5000,
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

  const updateProposalStatusMutation = useMutation({
    mutationFn: async ({ proposalId, status }: { proposalId: number; status: "SHORTLISTED" | "ACCEPTED" | "REJECTED" }) =>
      proposalsApi.updateStatus(proposalId, status),
    onSuccess: async (_, variables) => {
      setProposalStatusOverrides((current) => ({
        ...current,
        [variables.proposalId]: variables.status,
      }));
      setProposalActionStatus(`Proposal updated to ${variables.status}`);
      await proposalsQuery.refetch();
      await myJobsQuery.refetch();
      await savedFreelancersQuery.refetch();
      await notificationsQuery.refetch();
    },
    onError: (err: any) => {
      setProposalActionStatus(err?.response?.data?.detail || "Unable to update proposal status");
    },
  });

  const toggleSavedFreelancerMutation = useMutation({
    mutationFn: async (freelancerId: number) => savedFreelancersApi.toggle(freelancerId),
    onSuccess: async (response: any) => {
      setProposalActionStatus(response?.data?.saved ? "Freelancer saved" : "Freelancer removed from saved list");
      await savedFreelancersQuery.refetch();
    },
    onError: (err: any) => {
      setProposalActionStatus(err?.response?.data?.detail || "Unable to save freelancer");
    },
  });

  const adminOverviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const response = await adminApi.overview();
      return response.data as AdminOverview;
    },
    enabled: user?.role === "ADMIN",
  });

  const freelancerProfileQuery = useQuery({
    queryKey: ["dashboard-freelancer-profile"],
    queryFn: async () => {
      const response = await freelancerProfileApi.me();
      return (response.data?.profile as FreelancerProfileSummary | null) || null;
    },
    enabled: user?.role === "FREELANCER",
  });

  const clientProfileQuery = useQuery({
    queryKey: ["dashboard-client-profile"],
    queryFn: async () => {
      const response = await clientProfileApi.me();
      return (response.data?.profile as ClientProfileSummary | null) || null;
    },
    enabled: user?.role === "CLIENT",
  });

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome ${user?.username ?? "back"}. Review your wallet, role, and quick actions from one focused place.`}
      sidebar={
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
          <nav className="space-y-2">
            <button onClick={() => router.push("/dashboard")} className="btn-secondary btn-md w-full justify-start">
              Overview
            </button>
            {user?.role === "FREELANCER" ? (
              <button onClick={() => router.push("/freelancer/jobs")} className="btn-secondary btn-md w-full justify-start">
                Get Jobs
              </button>
            ) : null}
            {user?.role === "CLIENT" ? (
              <button onClick={() => router.push("/client/post-job")} className="btn-secondary btn-md w-full justify-start">
                Post a Job
              </button>
            ) : null}
            <button onClick={() => router.push("/jobs")} className="btn-secondary btn-md w-full justify-start">
              Job Board
            </button>
            <button onClick={() => router.push("/support")} className="btn-secondary btn-md w-full justify-start">
              Messages & Support
            </button>
            <button onClick={() => router.push("/wallet")} className="btn-secondary btn-md w-full justify-start">
              Wallet
            </button>
            {user?.role === "FREELANCER" ? (
              <button onClick={() => router.push("/tasks")} className="btn-secondary btn-md w-full justify-start">
                Coding Tasks
              </button>
            ) : null}
          </nav>
        </div>
      }
    >
      <section className="grid gap-5 md:grid-cols-3">
        <article className="card-surface p-6">
          <p className="text-sm text-slate-600">Wallet balance</p>
          <div className="mt-2 flex items-center gap-2 text-3xl font-bold text-emerald-700">
            <Coins className="h-7 w-7" />
            {dashboard?.walletBalance ?? 0}
          </div>
        </article>

        <article className="card-surface p-6 md:col-span-2">
          <p className="text-sm text-slate-600">Quick actions</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => router.push("/jobs")} className="btn-primary btn-md">
              Browse jobs
            </button>
            {user?.role === "FREELANCER" ? (
              <button onClick={() => router.push("/freelancer/jobs")} className="btn-primary btn-md">
                Get Jobs
              </button>
            ) : null}
            {user?.role === "FREELANCER" ? (
              <button onClick={() => router.push("/tasks")} className="btn-primary btn-md">
                Solve Coding Tasks
              </button>
            ) : null}
            {user?.role === "CLIENT" ? (
              <button onClick={() => router.push("/client/post-job")} className="btn-primary btn-md">
                Post a Job
              </button>
            ) : null}
            <button onClick={() => router.push("/wallet")} className="btn-secondary btn-md">
              Open wallet
            </button>
          </div>
        </article>
      </section>

      {user?.role === "CLIENT" ? (
        <>
          <section className="mt-6 card-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
              <button onClick={() => markAllReadMutation.mutate()} className="btn-secondary btn-md" disabled={markAllReadMutation.isPending}>
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
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                    <p className="mt-2 text-xs font-medium text-cyan-700">Tap to review request</p>
                  </Link>
                ) : (
                  <article key={item.id} className={`rounded-xl border p-4 ${item.isRead ? "border-slate-200 bg-white" : "border-cyan-200 bg-cyan-50/50"}`}>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                  </article>
                )
              ))}
              {!notificationsQuery.data?.notifications?.length ? <p className="text-sm text-slate-600">No notifications yet.</p> : null}
            </div>
          </section>

          <section className="mt-6 card-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Client profile</h2>
              <button onClick={() => router.push("/onboarding/client?edit=1")} className="btn-secondary btn-md">
                {clientProfileQuery.data ? "Edit profile" : "Complete profile"}
              </button>
            </div>

            {clientProfileQuery.data ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Identity</p>
                  <p className="mt-1 font-medium text-slate-900">{clientProfileQuery.data.displayName}</p>
                  <p className="mt-1 text-sm text-slate-600">{clientProfileQuery.data.accountType === "COMPANY" ? clientProfileQuery.data.companyName || "Company" : "Individual client"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Budget range</p>
                  <p className="mt-1 font-medium text-slate-900">{clientProfileQuery.data.budgetRange}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Country</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {clientProfileQuery.data.country}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Timezone</p>
                  <p className="mt-1 font-medium text-slate-900">{clientProfileQuery.data.timezone}</p>
                  {clientProfileQuery.data.phone ? <p className="mt-1 text-sm text-slate-600">{clientProfileQuery.data.phone}</p> : null}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Complete your client profile to build trust with freelancers before posting projects.</p>
            )}
          </section>

          <ClientAnalytics />

          <section className="mt-6 card-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Client workspace</h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setClientViewTab("proposals")}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    clientViewTab === "proposals" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Proposals ({proposalsQuery.data?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setClientViewTab("saved")}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    clientViewTab === "saved" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Saved freelancers ({savedFreelancersQuery.data?.length || 0})
                </button>
              </div>
            </div>

            {clientViewTab === "proposals" ? (
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Applications on your jobs</h3>
                {!myJobsQuery.data?.length ? (
                  <p className="text-sm text-slate-600">You have not posted any jobs yet. Create one in Jobs to start receiving applications.</p>
                ) : (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Select your job</span>
                      <select className="input" value={selectedJobId} onChange={(event) => setSelectedJobId(Number(event.target.value))}>
                        {myJobsQuery.data.map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.title} ({proposalCountsByJob[job.id] || 0})
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="font-medium text-slate-900">{selectedJob?.title}</p>
                      <p className="mt-1 text-xs text-slate-500">Proposals for selected job: {visibleClientProposals.length}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {(["ALL", "SUBMITTED", "SHORTLISTED", "ACCEPTED", "REJECTED"] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setProposalStatusFilter(status)}
                            className={`rounded-full px-3 py-1 font-semibold transition ${
                              proposalStatusFilter === status
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {status === "ALL" ? "All" : status.toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {visibleClientProposals.map((proposal) => (
                        <article key={proposal.id} className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-slate-900">{proposal.freelancer.username || proposal.freelancer.name}</p>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  getDisplayedProposalStatus(proposal) === "ACCEPTED"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : getDisplayedProposalStatus(proposal) === "SHORTLISTED"
                                      ? "bg-amber-100 text-amber-700"
                                      : getDisplayedProposalStatus(proposal) === "REJECTED"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {getDisplayedProposalStatus(proposal)}
                              </span>
                              <p className="text-xs text-slate-500">{new Date(proposal.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{proposal.freelancer.email}</p>
                          <p className="mt-1 text-xs text-slate-500">Job: {proposal.job?.title || selectedJob?.title || "Unknown job"}</p>
                          <p className="mt-3 text-sm text-slate-700">{proposal.coverLetter}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn-secondary btn-md"
                              disabled={updateProposalStatusMutation.isPending}
                              onClick={() => updateProposalStatusMutation.mutate({ proposalId: proposal.id, status: "SHORTLISTED" })}
                            >
                              Shortlist
                            </button>
                            <button
                              type="button"
                              className="btn-primary btn-md"
                              disabled={updateProposalStatusMutation.isPending}
                              onClick={() => updateProposalStatusMutation.mutate({ proposalId: proposal.id, status: "ACCEPTED" })}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              className="btn-ghost btn-md text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              disabled={updateProposalStatusMutation.isPending}
                              onClick={() => updateProposalStatusMutation.mutate({ proposalId: proposal.id, status: "REJECTED" })}
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              className="btn-secondary btn-md"
                              disabled={toggleSavedFreelancerMutation.isPending}
                              onClick={() => toggleSavedFreelancerMutation.mutate(proposal.freelancer.id)}
                            >
                              Save freelancer
                            </button>
                          </div>
                        </article>
                      ))}
                      {!visibleClientProposals.length ? <p className="text-sm text-slate-600">No applications yet for this job.</p> : null}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">Freelancers you saved for quick access and future outreach.</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {savedFreelancersQuery.data?.length || 0} saved
                  </span>
                </div>
                {(savedFreelancersQuery.data || []).map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{item.freelancer.username || item.freelancer.name}</p>
                        <p className="text-xs text-slate-500">{item.freelancer.email}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                        {item.freelancer.role}
                      </span>
                      <button
                        type="button"
                        className="btn-ghost btn-md text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => toggleSavedFreelancerMutation.mutate(item.freelancer.id)}
                        disabled={toggleSavedFreelancerMutation.isPending}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
                {!savedFreelancersQuery.data?.length ? <p className="text-sm text-slate-600">No saved freelancers yet.</p> : null}
              </div>
            )}

            {proposalActionStatus ? <p className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700">{proposalActionStatus}</p> : null}
          </section>
        </>
      ) : null}

      {user?.role === "FREELANCER" ? (
        <section className="mt-6 card-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Freelancer profile</h2>
            <button onClick={() => router.push("/onboarding/freelancer?edit=1")} className="btn-secondary btn-md">
              {freelancerProfileQuery.data ? "Edit profile" : "Complete profile"}
            </button>
          </div>

          {freelancerProfileQuery.data ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Title</p>
                <p className="mt-1 font-medium text-slate-900">{freelancerProfileQuery.data.professionalTitle}</p>
                <p className="mt-1 text-sm text-slate-600">{freelancerProfileQuery.data.experienceLevel}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Skills</p>
                <p className="mt-1 font-medium text-slate-900">{freelancerProfileQuery.data.skills}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Rate</p>
                <p className="mt-1 font-medium text-slate-900">${freelancerProfileQuery.data.hourlyRateUsd}/hr</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Location</p>
                <p className="mt-1 font-medium text-slate-900">
                  {freelancerProfileQuery.data.city}, {freelancerProfileQuery.data.country}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">Complete your freelancer profile to receive better job matches and client trust.</p>
          )}

          <FreelancerAnalytics />
        </section>
      ) : null}

      {user?.role === "ADMIN" ? (
        <section className="mt-6 space-y-6">
          <div className="grid gap-5 md:grid-cols-3">
            <article className="card-surface p-6">
              <p className="text-sm text-slate-600">Total users</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{adminOverviewQuery.data?.counts.users ?? 0}</p>
            </article>
            <article className="card-surface p-6">
              <p className="text-sm text-slate-600">Total jobs</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{adminOverviewQuery.data?.counts.jobs ?? 0}</p>
            </article>
            <article className="card-surface p-6">
              <p className="text-sm text-slate-600">Total proposals</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{adminOverviewQuery.data?.counts.proposals ?? 0}</p>
            </article>
          </div>

          <article className="card-surface p-6">
            <h2 className="text-xl font-semibold text-slate-900">Recent users</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 font-medium">Name</th>
                    <th className="py-2 font-medium">Email</th>
                    <th className="py-2 font-medium">Role</th>
                    <th className="py-2 font-medium">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {(adminOverviewQuery.data?.users || []).map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-2 text-slate-800">{item.username || item.name}</td>
                      <td className="py-2 text-slate-600">{item.email}</td>
                      <td className="py-2 text-slate-600">{item.role}</td>
                      <td className="py-2 text-slate-600">{item.tokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card-surface p-6">
            <h2 className="text-xl font-semibold text-slate-900">Recent jobs</h2>
            <div className="mt-4 space-y-3">
              {(adminOverviewQuery.data?.jobs || []).map((job) => (
                <div key={job.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">{new Date(job.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Client: {job.client.username || job.client.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Budget: {job.budget} | Proposals: {job._count.proposals}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card-surface p-6">
            <h2 className="text-xl font-semibold text-slate-900">Recent proposals</h2>
            <div className="mt-4 space-y-3">
              {(adminOverviewQuery.data?.proposals || []).map((proposal) => (
                <div key={proposal.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{proposal.job.title}</p>
                    <p className="text-xs text-slate-500">{new Date(proposal.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Freelancer: {proposal.freelancer.username || proposal.freelancer.name}</p>
                  <p className="mt-2 text-sm text-slate-700">{proposal.coverLetter}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </DashboardLayout>
  );
}
