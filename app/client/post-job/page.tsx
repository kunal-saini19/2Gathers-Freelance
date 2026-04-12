"use client";

import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { jobsApi } from "@/lib/api";

type JobFormState = {
  title: string;
  description: string;
  budget: string;
  skills: string;
  deadline: string;
};

const initialState: JobFormState = {
  title: "",
  description: "",
  budget: "",
  skills: "",
  deadline: "",
};

export default function ClientPostJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<JobFormState>(initialState);
  const [status, setStatus] = useState("");

  const createJobMutation = useMutation({
    mutationFn: async () => {
      const budgetValue = Number(form.budget);
      const fullDescription = `${form.description.trim()}\n\nSkills Required: ${form.skills.trim()}\nDeadline: ${form.deadline}`;

      await jobsApi.create({
        title: form.title.trim(),
        description: fullDescription,
        budget: budgetValue,
      });
    },
    onSuccess: () => {
      setStatus("Job posted successfully.");
      setForm(initialState);
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err: any) => {
      setStatus(err?.response?.data?.detail || "Unable to post job right now.");
    },
  });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "CLIENT") {
      router.replace("/dashboard");
    }
  }, [router, user]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.budget.trim() || !form.skills.trim() || !form.deadline.trim()) {
      setStatus("Please complete all required fields before posting a job.");
      return;
    }

    const budgetValue = Number(form.budget);
    if (!Number.isInteger(budgetValue) || budgetValue <= 0) {
      setStatus("Budget must be a positive whole number.");
      return;
    }

    createJobMutation.mutate();
  }

  return (
    <DashboardLayout title="Post a Job" subtitle="Publish a project brief with strong scope clarity to attract high-quality proposals faster.">
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="card-surface space-y-4 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="label">Title *</span>
            <input
              className="input"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Build a multi-tenant analytics dashboard"
            />
          </label>

          <label>
            <span className="label">Budget (₹) *</span>
            <input
              className="input"
              inputMode="numeric"
              value={form.budget}
              onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
              placeholder="120000"
            />
          </label>

          <label className="md:col-span-2">
            <span className="label">Description *</span>
            <textarea
              className="input min-h-32"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Describe scope, deliverables, milestones, and success criteria..."
            />
          </label>

          <label>
            <span className="label">Skills Required *</span>
            <input
              className="input"
              value={form.skills}
              onChange={(event) => setForm((prev) => ({ ...prev, skills: event.target.value }))}
              placeholder="React, Node.js, TypeScript"
            />
          </label>

          <label>
            <span className="label">Deadline *</span>
            <input
              className="input"
              type="date"
              value={form.deadline}
              onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary btn-md" disabled={createJobMutation.isPending}>
            {createJobMutation.isPending ? "Posting..." : "Submit Job"}
          </button>
          <button type="button" onClick={() => setForm(initialState)} className="btn-secondary btn-md" disabled={createJobMutation.isPending}>
            Reset
          </button>
        </div>

        {status ? <p className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700">{status}</p> : null}
      </motion.form>
    </DashboardLayout>
  );
}
