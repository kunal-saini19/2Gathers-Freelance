"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { freelancerEarningsTrend, freelancerMetrics, freelancerProjectsByMonth, freelancerSkillsDistribution } from "@/features/dashboard/analyticsData";

const skillColors = ["#0ea5e9", "#14b8a6", "#f59e0b", "#6366f1", "#ef4444"];

export function FreelancerAnalytics() {
  const router = useRouter();

  return (
    <section className="mt-6 space-y-5">
      <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Main CTA</p>
            <h2 className="text-2xl font-semibold text-slate-900">Find high-quality projects faster</h2>
            <p className="mt-1 text-sm text-slate-600">Your earnings increased by 20% this month. Top skill in demand: React.js.</p>
          </div>
          <button onClick={() => router.push("/freelancer/jobs")} className="btn-primary btn-lg">
            Get Jobs
          </button>
        </div>
      </motion.article>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {freelancerMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Earnings Over Time" subtitle="Monthly net earnings, adjusted for payouts and refunds.">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={freelancerEarningsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Earnings"]} />
                <Line type="monotone" dataKey="earnings" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Skills Distribution" subtitle="Work mix by billed project category.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={freelancerSkillsDistribution} dataKey="value" nameKey="name" outerRadius={90} innerRadius={52}>
                {freelancerSkillsDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={skillColors[index % skillColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${Number(value)}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Projects Completed Per Month" subtitle="Tracks delivery consistency and throughput.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={freelancerProjectsByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-surface p-5">
        <h3 className="text-lg font-semibold text-slate-900">Actionable insights</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>Increase proposal personalization to push success rate from 31.7% to 36% target.</li>
          <li>Most accepted gigs are in React.js + TypeScript; prioritize this keyword in profile headline.</li>
          <li>Average response time is strong at 2.1 hours. Keeping it below 2.5 hours improves invite rate.</li>
        </ul>
      </motion.article>
    </section>
  );
}
