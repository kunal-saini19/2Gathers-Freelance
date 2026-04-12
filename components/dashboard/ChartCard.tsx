"use client";

import { motion } from "framer-motion";

type ChartCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-surface p-5"
    >
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      <div className="h-[260px] w-full">{children}</div>
    </motion.section>
  );
}
