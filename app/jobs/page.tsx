"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { jobsApi, savedJobsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type JobItem = {
  id: number;
  title: string;
  description: string;
  budget: number;
  clientId: number;
  createdAt: string;
  client: {
    id: number;
    username: string | null;
    name: string;
  };
  _count?: {
    proposals: number;
  };
};

export default function JobsPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("500");
  const [status, setStatus] = useState("");

  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await jobsApi.list();
      return (response.data?.jobs || []) as JobItem[];
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async () => {
      await jobsApi.create({
        title,
        description,
        budget: Number(budget),
      });
    },
    onSuccess: async () => {
      setStatus("Job posted successfully");
      setTitle("");
      setDescription("");
      setBudget("500");
      await jobsQuery.refetch();
    },
    onError: (err: any) => setStatus(err?.response?.data?.detail || "Unable to post job"),
  });

  const jobs = jobsQuery.data || [];

  const savedJobsQuery = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: async () => {
      const response = await savedJobsApi.list();
      const saved = (response.data?.saved || []) as Array<{ jobId: number }>;
      return new Set(saved.map((item) => item.jobId));
    },
    enabled: Boolean(user),
  });

  const toggleSaveJobMutation = useMutation({
    mutationFn: async (jobId: number) => savedJobsApi.toggle(jobId),
    onSuccess: async (response: any) => {
      const isSaved = Boolean(response?.data?.saved);
      setStatus(isSaved ? "Job saved" : "Job removed from saved list");
      await savedJobsQuery.refetch();
    },
    onError: (err: any) => setStatus(err?.response?.data?.detail || "Unable to save this job"),
  });

  function createJob() {
    if (title.trim().length < 3) {
      setStatus("Title must be at least 3 characters");
      return;
    }

    if (description.trim().length < 10) {
      setStatus("Description must be at least 10 characters");
      return;
    }

    const budgetValue = Number(budget);
    if (!Number.isInteger(budgetValue) || budgetValue <= 0) {
      setStatus("Budget must be a positive whole number");
      return;
    }

    createJobMutation.mutate();
  }

  return (
    <DashboardLayout title="Jobs" subtitle="Clients can post jobs, freelancers can browse them, and both can track proposal activity.">
      {user?.role === "CLIENT" ? (
        <section className="card-surface mb-6 space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Post a new job</h2>
          <input className="input" placeholder="Job title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <textarea
            className="input min-h-28 resize-y"
            placeholder="Describe scope, timeline, and expectations"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <input
            className="input"
            placeholder="Budget"
            inputMode="numeric"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
          <button onClick={createJob} className="btn-primary btn-md" disabled={createJobMutation.isPending}>
            {createJobMutation.isPending ? "Posting..." : "Post job"}
          </button>
        </section>
      ) : (
        <section className="card-surface mb-6 p-6">
          <p className="text-sm text-slate-600">You are signed in as {user?.role || "GUEST"}. Only CLIENT accounts can post jobs.</p>
        </section>
      )}

      {status ? <p className="mb-4 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700">{status}</p> : null}

      <div className="space-y-4">
        {jobs.map((job) => (
          <article key={job.id} className="card-surface p-6">
            <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
            <p className="mt-2 text-slate-600">{job.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-cyan-100 px-3 py-1 font-semibold text-cyan-700">Budget: {job.budget}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Client: {job.client?.username || job.client?.name || "Unknown"}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Proposals: {job._count?.proposals || 0}</span>
              {savedJobsQuery.data?.has(job.id) ? <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">Saved</span> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/jobs/${job.id}`} className="btn-primary btn-md inline-flex">
                View details
              </Link>
              {user ? (
                <button
                  type="button"
                  className="btn-secondary btn-md"
                  onClick={() => toggleSaveJobMutation.mutate(job.id)}
                  disabled={toggleSaveJobMutation.isPending}
                >
                  {savedJobsQuery.data?.has(job.id) ? "Unsave" : "Save job"}
                </button>
              ) : null}
            </div>
          </article>
        ))}

        {jobs.length === 0 ? <p className="rounded-2xl bg-white/70 p-6 text-sm text-slate-500">No jobs posted yet.</p> : null}
      </div>
    </DashboardLayout>
  );
}
