"use client";

import { useState, useEffect } from "react";
import { TaskCard } from "@/components/TaskCard";
import { Filter } from "lucide-react";

interface TaskData {
  id: string;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  category: string;
  rewardTokens: number;
  testCasesCount: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    fetchTasks();
  }, [difficulty, category]);

  async function fetchTasks() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (difficulty) params.append("difficulty", difficulty);
      if (category) params.append("category", category);

      const response = await fetch(`/api/tasks?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  const difficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
  const categories = ["Basic Math", "Logic", "String Manipulation", "Array Operations", "Algorithms", "General"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Coding Tasks</h1>
          <p className="mt-2 text-slate-600">
            Complete challenges and earn tokens. Perfect your coding skills!
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Filter className="inline h-4 w-4 mr-1" />
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              {difficulties.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Filter className="inline h-4 w-4 mr-1" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-slate-600">No tasks found. Try adjusting filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
