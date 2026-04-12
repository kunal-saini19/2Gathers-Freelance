"use client";

import Link from "next/link";
import { Badge } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  category: string;
  rewardTokens: number;
  testCasesCount: number;
}

const difficultyBadgeColor = {
  BEGINNER: "bg-emerald-100 text-emerald-800",
  INTERMEDIATE: "bg-blue-100 text-blue-800",
  ADVANCED: "bg-amber-100 text-amber-800",
  EXPERT: "bg-red-100 text-red-800",
};

export function TaskCard({
  id,
  title,
  description,
  difficulty,
  category,
  rewardTokens,
  testCasesCount,
}: TaskCardProps) {
  return (
    <Link href={`/tasks/${id}`}>
      <div className="group rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-400 hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="flex-1 text-base font-semibold text-slate-900 group-hover:text-blue-600">
            {title}
          </h3>
          <span className={cn("inline-block rounded px-2 py-1 text-xs font-semibold", difficultyBadgeColor[difficulty])}>
            {difficulty}
          </span>
        </div>

        <p className="mb-3 text-sm text-slate-600 line-clamp-2">{description}</p>

        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {category}
          </span>
          <span className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {testCasesCount} tests
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-amber-500">+{rewardTokens}</span>
            <span className="text-xs font-medium text-slate-600">tokens</span>
          </div>
          <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
            Start →
          </span>
        </div>
      </div>
    </Link>
  );
}
