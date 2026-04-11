import { DashboardLayout } from "@/components/DashboardLayout";
import { mockFaqs } from "@/lib/db";

export default function SupportPage() {
  return (
    <DashboardLayout
      title="Support"
      subtitle="A concise helpdesk experience with FAQs and contact paths for clients and freelancers."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">FAQ</p>
          <div className="mt-4 space-y-4">
            {mockFaqs.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">{faq.question}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Helpdesk</p>
          <div className="mt-4 space-y-4">
            {[
              { title: "Account and login", body: "Reset access, change roles, and manage profile details." },
              { title: "Wallet and tokens", body: "Check balance, buy or spend tokens, and review audit history." },
              { title: "Project matching", body: "Understand how AI suggestions are ranked and filtered." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
