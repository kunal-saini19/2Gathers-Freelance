"use client";

import { motion } from "framer-motion";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  delta?: string;
  positive?: boolean;
};

export function StatCard({ label, value, helper, delta, positive = true }: StatCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="card-surface p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {delta ? (
        <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${positive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
          {delta}
        </p>
      ) : null}
      {helper ? <p className="mt-2 text-sm text-slate-600">{helper}</p> : null}
    </motion.article>
  );
}
