"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { jobsApi } from "@/lib/api";

type JobItem = {
  id: string;
  title: string;
  description: string;
  difficultyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  isPremium: boolean;
  premiumApplyCost: number;
};

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");

  const jobsQuery = useQuery({
    queryKey: ["jobs", search, difficulty],
    queryFn: async () => {
      const response = await jobsApi.list({ search, difficulty });
      return response.data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await jobsApi.apply(jobId, "Applying from Next.js app");
    },
    onSuccess: () => setStatus("Application submitted"),
    onError: (err: any) => setStatus(err?.response?.data?.detail || "Unable to apply"),
  });

  const jobs: JobItem[] = jobsQuery.data || [];

  function apply(jobId: string) {
    applyMutation.mutate(jobId);
  }

  return (
    <DashboardLayout title="Jobs" subtitle="Search open opportunities, filter by difficulty, and apply from a cleaner marketplace layout.">
      <section className="card-surface mb-6 p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="input" placeholder="Search jobs" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">All levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <button onClick={() => window.location.assign("http://127.0.0.1:8000/jobs/browse/")} className="btn-secondary btn-md">
            Open full Django Jobs
          </button>
        </div>
      </section>

      {status ? <p className="mb-4 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700">{status}</p> : null}

      <div className="space-y-4">
        {jobs.map((job) => (
          <article key={job.id} className="card-surface p-6">
            <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
            <p className="mt-2 text-slate-600">{job.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-cyan-100 px-3 py-1 font-semibold text-cyan-700">{job.difficultyLevel}</span>
              {job.isPremium ? <span className="rounded-full bg-violet-100 px-3 py-1 font-semibold text-violet-700">Premium {job.premiumApplyCost} tokens</span> : null}
            </div>
            <button onClick={() => apply(job.id)} className="btn-primary btn-md mt-4">
              Apply
            </button>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
}
