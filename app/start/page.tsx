"use client";

import { motion } from "framer-motion";
import { BriefcaseBusiness, Search, Trophy, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { ActionCard } from "@/components/post-signup/ActionCard";

export default function PostSignupSelectionPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_15%,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_90%_18%,rgba(16,185,129,0.2),transparent_30%),linear-gradient(160deg,#f8fcff_0%,#eef5ff_52%,#fbfff8_100%)] px-4 py-10">
      <Navbar />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(14,165,233,0.1),transparent_33%)]" />

      <main className="relative z-10 mx-auto w-full max-w-7xl pt-20">
        <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-8 rounded-3xl border border-white/50 bg-white/60 p-7 text-center shadow-xl backdrop-blur-md md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">2gathers</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Welcome to 2gathers</h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg">Start your journey</p>
        </motion.header>

        <section className="grid gap-5 md:grid-cols-3">
          <ActionCard
            title="Work as Freelancer"
            description="Find jobs, build profile, and grow predictable monthly earnings with high-conversion proposals."
            buttonLabel="Start Working"
            icon={BriefcaseBusiness}
            accentClass="bg-gradient-to-br from-sky-200/60 via-transparent to-cyan-300/30"
            onClick={() => router.push("/freelancer/dashboard")}
          />

          <ActionCard
            title="Hire Talent"
            description="Post jobs and hire skilled freelancers with strong ratings, fast response times, and proven delivery."
            buttonLabel="Hire Now"
            icon={UserRound}
            accentClass="bg-gradient-to-br from-emerald-200/60 via-transparent to-lime-300/30"
            onClick={() => router.push("/client/dashboard")}
          />

          <ActionCard
            title="Explore Jobs"
            description="View all available jobs instantly and discover opportunities that match your skills and interests."
            buttonLabel="Browse Jobs"
            icon={Search}
            accentClass="bg-gradient-to-br from-indigo-200/60 via-transparent to-violet-300/30"
            onClick={() => router.push("/jobs")}
          />
        </section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }} className="mt-7">
          <Link
            href="/leaderboard"
            className="group block w-full rounded-3xl border border-amber-200/70 bg-gradient-to-r from-amber-50/90 via-white/90 to-yellow-50/90 p-6 text-left shadow-lg backdrop-blur transition hover:shadow-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Leaderboard</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">Top Freelancers Leaderboard</h2>
                <p className="mt-1 text-sm text-slate-600">See the best performers on the platform</p>
              </div>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 transition group-hover:scale-105">
                <Trophy className="h-7 w-7" />
              </div>
            </div>
          </Link>
        </motion.section>
      </main>
    </div>
  );
}
