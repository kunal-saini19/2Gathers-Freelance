"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { DashboardLayout } from "@/components/DashboardLayout";

const topFreelancers = [
  { rank: 1, name: "Aarav Sharma", category: "Frontend", score: 98, earnings: "₹9,20,000" },
  { rank: 2, name: "Nisha Verma", category: "Full Stack", score: 95, earnings: "₹8,40,000" },
  { rank: 3, name: "Rohan Mehta", category: "UI/UX", score: 93, earnings: "₹7,75,000" },
  { rank: 4, name: "Sana Khan", category: "AI/Data", score: 91, earnings: "₹7,10,000" },
  { rank: 5, name: "Vikram Patel", category: "Blockchain", score: 89, earnings: "₹6,85,000" },
];

export default function LeaderboardPage() {
  const router = useRouter();

  return (
    <DashboardLayout title="Top Freelancers Leaderboard" subtitle="See the best performers on 2gathers based on delivery consistency, client ratings, and earnings.">
      <section className="card-surface p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Platform ranking</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Live leaderboard view</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/start" className="btn-secondary btn-md">
              Back to Start
            </Link>
            <button onClick={() => router.push("/jobs")} className="btn-primary btn-md">
              Browse Jobs
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {topFreelancers.map((freelancer) => (
            <article key={freelancer.rank} className="rounded-xl border border-slate-200 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Rank #{freelancer.rank}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{freelancer.name}</h3>
                  <p className="text-sm text-slate-600">{freelancer.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Performance score</p>
                  <p className="text-xl font-bold text-emerald-700">{freelancer.score}/100</p>
                  <p className="text-sm text-slate-600">{freelancer.earnings}</p>
                  <button type="button" onClick={() => router.push("/freelancer/dashboard")} className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
                    View profile
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
