export function TokenStats({
  balance,
  earned,
  spent,
  label = "Wallet overview",
}: {
  balance: number;
  earned: number;
  spent: number;
  label?: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Balance</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{balance}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-emerald-700">Earned</p>
          <p className="mt-1 text-xl font-semibold text-emerald-800">+{earned}</p>
        </div>
        <div className="rounded-xl bg-rose-50 p-3">
          <p className="text-rose-700">Spent</p>
          <p className="mt-1 text-xl font-semibold text-rose-800">-{spent}</p>
        </div>
      </div>
    </section>
  );
}
