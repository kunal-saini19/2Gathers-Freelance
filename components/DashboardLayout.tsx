import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function DashboardLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-24 md:pb-10 md:pt-28">
        <section className="mb-8 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">2Gathers</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">{subtitle}</p> : null}
        </section>
        {children}
      </main>
      <Footer />
    </div>
  );
}
