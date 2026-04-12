"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { jobsApi } from "@/lib/api";

type AvailableJob = {
  id: number;
  title: string;
  description: string;
  budget: number;
  status: "OPEN" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED";
  client: {
    username: string | null;
    name: string;
  };
  _count?: {
    proposals: number;
  };
};

export default function FreelancerJobsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const jobsQuery = useQuery({
    queryKey: ["freelancer-browse-jobs"],
    queryFn: async () => {
      const response = await jobsApi.list();
      return (response.data?.jobs || []) as AvailableJob[];
    },
    enabled: user?.role === "FREELANCER",
  });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "FREELANCER") {
      router.replace("/dashboard");
    }
  }, [router, user]);

  return (
    <DashboardLayout title="Get Jobs" subtitle="Browse live client-posted jobs visible to every freelancer account.">
      <section className="space-y-4">
        {(jobsQuery.data || []).map((job) => (
          <article key={job.id} className="card-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{job.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{job.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">Budget: {job.budget}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Client: {job.client?.username || job.client?.name || "Unknown"}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Proposals: {job._count?.proposals || 0}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Status: {job.status}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Link href={`/jobs/${job.id}`} className="btn-primary btn-md inline-flex">
                  View and Apply
                </Link>
              </div>
            </div>
          </article>
        ))}

        {jobsQuery.isLoading ? <p className="card-surface p-5 text-sm text-slate-600">Loading jobs...</p> : null}
        {!jobsQuery.isLoading && (jobsQuery.data || []).length === 0 ? (
          <p className="card-surface p-5 text-sm text-slate-600">No client jobs posted yet.</p>
        ) : null}
      </section>
    </DashboardLayout>
  );
}
