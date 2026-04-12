"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type ActionCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  icon: LucideIcon;
  onClick: () => void;
  accentClass: string;
};

export function ActionCard({ title, description, buttonLabel, icon: Icon, onClick, accentClass }: ActionCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/55 p-6 shadow-xl backdrop-blur-md"
    >
      <div className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${accentClass}`} />

      <div className="relative z-10">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-white/70 text-slate-700 shadow-sm">
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>

        <button
          onClick={onClick}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {buttonLabel}
        </button>
      </div>
    </motion.article>
  );
}
