import { type JobRecommendation } from "@/lib/ai";

export function JobCard({ job }: { job: JobRecommendation }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{job.client}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{job.title}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {job.score}% match
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{job.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
        <span className="font-medium text-slate-900">Budget {job.budget}</span>
        <span className="text-slate-500">{job.tokenCost} tokens</span>
      </div>
    </article>
  );
}
