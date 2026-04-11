import { DashboardLayout } from "@/components/DashboardLayout";
import { mockTeam } from "@/lib/db";

export default function AboutPage() {
  return (
    <DashboardLayout
      title="About 2Gathers"
      subtitle="A focused freelancing platform prototype designed for stronger job matching, safer token flows, and a cleaner path to future blockchain support."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Vision</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">A sharper way to match talent and work</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            2Gathers is built to feel serious, simple, and trustworthy. We aim to reduce friction between clients and freelancers by pairing
            AI recommendations with a token economy that rewards progress and makes premium access more intentional.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: "Mission", value: "Make freelance work easier to discover, apply to, and manage." },
              { label: "Team", value: "Design, product, and engineering focused on clarity and scale." },
              { label: "Future", value: "A foundation that can evolve into real blockchain payments later." },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Team</p>
          <div className="mt-4 space-y-4">
            {mockTeam.map((member) => (
              <div key={member.name} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{member.role}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
