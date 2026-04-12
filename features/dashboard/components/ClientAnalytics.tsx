"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { clientFreelancerCategory, clientJobsComparison, clientMetrics, clientSpendingTrend } from "@/features/dashboard/analyticsData";

const categoryColors = ["#0ea5e9", "#10b981", "#f59e0b", "#6366f1", "#f43f5e"];

export function ClientAnalytics() {
  const router = useRouter();

  return (
    <section className="mt-6 space-y-5">
      <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Main CTA</p>
            <h2 className="text-2xl font-semibold text-slate-900">Scale delivery with better hiring velocity</h2>
            <p className="mt-1 text-sm text-slate-600">Best performing freelancer category: Frontend. Rehire rate is at 42%.</p>
          </div>
          <button onClick={() => router.push("/client/post-job")} className="btn-primary btn-lg">
            Post a Job
          </button>
        </div>
      </motion.article>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {clientMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Spending Over Time" subtitle="Monthly spending trend across completed payouts.">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clientSpendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Spending"]} />
                <Line type="monotone" dataKey="spending" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Freelancer Categories" subtitle="Distribution of hired freelancer specialization.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={clientFreelancerCategory} dataKey="value" nameKey="name" outerRadius={90} innerRadius={52}>
                {clientFreelancerCategory.map((entry, index) => (
                  <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${Number(value)}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Jobs Posted vs Completed" subtitle="Hiring efficiency by month.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={clientJobsComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="posted" fill="#94a3b8" radius={[8, 8, 0, 0]} />
            <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-surface p-5">
        <h3 className="text-lg font-semibold text-slate-900">Hiring insights</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>Projects hired within 48 hours have 15% higher on-time completion.</li>
          <li>Frontend category drives best satisfaction and fastest turnaround in your account.</li>
          <li>Proposal volume drops on weekends; publish jobs Tue-Thu for faster quality bids.</li>
        </ul>
      </motion.article>
    </section>
  );
}
