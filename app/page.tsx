"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, CheckCircle2, ChevronRight, Globe, Lock, Shield, Sparkles, Star, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { mockJobs } from "@/lib/db";

const features = [
  {
    icon: Sparkles,
    title: "AI Job Matching",
    description: "Relevant opportunities are surfaced with a strong, focused layout that makes browsing feel quick and intentional.",
  },
  {
    icon: Shield,
    title: "Trusted Workflow",
    description: "Profile, application, and payment flows are presented with calm structure so the product feels credible from the first click.",
  },
  {
    icon: Zap,
    title: "Token Economy",
    description: "The wallet, rewards, and premium actions are framed as part of one system instead of isolated screens.",
  },
];

const steps = [
  { n: "01", title: "Create Your Profile", body: "Set up your role, skills, and preferences in a few focused steps." },
  { n: "02", title: "Discover Work", body: "Browse projects, compare fit, and move through the funnel with less friction." },
  { n: "03", title: "Track Value", body: "Review token movement, wallet balance, and platform activity in one place." },
];

const testimonials = [
  { name: "Alex Chen", role: "Full-stack freelancer", quote: "The interface feels sharper than a typical marketplace. Everything is organized around action." },
  { name: "Sarah Rodriguez", role: "Hiring manager", quote: "The structure makes it easy to scan for value fast. It looks polished without feeling heavy." },
  { name: "Marcus Williams", role: "Startup founder", quote: "A strong balance of trust, clarity, and modern UI. It reads like a product a team can actually ship." },
];

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold tabular-nums text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(statsRef, { once: true });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative min-h-screen overflow-hidden bg-secondary-950 pt-24">
        <div className="absolute inset-0 dot-grid opacity-35" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%)" }} />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-16 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              Built for freelance hiring with a cleaner product structure
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
              Hire and get hired
              <br />
              <span className="text-primary-400">with clarity, speed, and trust</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
              A focused freelancing experience with cleaner structure, stronger hierarchy, and a more intentional visual system.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="btn-primary btn-xl shadow-none hover:shadow-none">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/jobs" className="btn-secondary btn-xl border-slate-700 bg-transparent text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white">
                Browse Jobs
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              {[
                { icon: Shield, label: "Secure workflows" },
                { icon: Lock, label: "Simple auth flow" },
                { icon: Globe, label: "Responsive structure" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-slate-600" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.55 }}
            className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-sm md:grid-cols-4"
          >
            <StatItem value={inView ? `${mockJobs.length}+` : "—"} label="Live jobs" />
            <StatItem value={inView ? "95%" : "—"} label="Match rate" />
            <StatItem value={inView ? "24/7" : "—"} label="Platform access" />
            <StatItem value={inView ? "1 flow" : "—"} label="Unified structure" />
          </motion.div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="mb-16 text-center">
            <p className="section-label">Platform capabilities</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Everything feels closer together.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-500">The UI now reads like one product system instead of a set of disconnected pages.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.08 }} className="card-hover p-8">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-6 text-slate-500">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="mb-16 text-center">
            <p className="section-label">How it works</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Simple structure. Clear progression.</h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.article key={step.n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.08 }} className="relative">
                <div className="mb-4 text-5xl font-black select-none text-slate-100">{step.n}</div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm leading-6 text-slate-500">{step.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Trending jobs</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured opportunities</h2>
            </div>
            <Link href="/jobs" className="hidden items-center gap-1.5 text-sm font-medium text-primary-600 transition hover:text-primary-700 md:flex">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {mockJobs.slice(0, 3).map((job, index) => (
              <motion.article key={job.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }} className="card-hover group p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span className="badge-slate">{job.status}</span>
                  <span className="text-xs text-slate-400">{job.tokenCost} tokens</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-primary-600">{job.title}</h3>
                <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">{job.description}</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-xl font-bold text-slate-900">{job.budget}</span>
                  <Link href="/register" className="flex items-center gap-1 text-sm font-medium text-primary-600 transition hover:text-primary-700">
                    Apply <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-secondary-950 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="mb-14 text-center">
            <p className="section-label">Testimonials</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">Designed to feel calm and professional.</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <motion.article key={item.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-5 text-sm leading-6 text-slate-300 italic">&ldquo;{item.quote}&rdquo;</p>
                <div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.role}</div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Ready to get started?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">Move into the cleaner auth flow and start using the rest of the product structure from there.</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="btn-primary btn-xl">
                Create account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-secondary btn-xl">Sign in</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Fast setup</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Polished layout</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Responsive shell</span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
