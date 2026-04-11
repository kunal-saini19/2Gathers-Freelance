import type { MockUser } from "@/lib/db";

export function ProfileCard({ user }: { user: MockUser }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Profile</p>
      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{user.name}</h3>
          <p className="text-sm text-slate-500">{user.headline}</p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{user.role}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{user.bio}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {user.skills.map((skill) => (
          <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {skill}
          </span>
        ))}
      </div>
    </aside>
  );
}
