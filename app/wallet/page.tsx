"use client";

import { useEffect, useState } from "react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { TokenStats } from "@/components/TokenStats";
import { useBlockchain } from "@/hooks/useBlockchain";
import { useAuth } from "@/context/AuthContext";

export default function WalletPage() {
  const { user } = useAuth();
  const blockchain = useBlockchain(user?.id);
  const [walletInput, setWalletInput] = useState(blockchain.walletAddress ?? "");
  const [buyAmount, setBuyAmount] = useState("100");

  useEffect(() => {
    setWalletInput(blockchain.walletAddress ?? "");
  }, [blockchain.walletAddress]);

  const incoming = blockchain.transactions.filter((tx) => tx.type === "mint" || tx.type === "receive").reduce((sum, tx) => sum + Math.max(tx.amount, 0), 0);
  const outgoing = blockchain.transactions.filter((tx) => tx.type === "send").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  async function handleSaveWalletAddress() {
    if (!walletInput.trim()) {
      return;
    }

    await blockchain.linkWalletAddress(walletInput.trim());
  }

  async function handleBuyTokens() {
    const amount = Number(buyAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    await blockchain.buyTokens(amount);
  }

  return (
    <DashboardLayout
      title="Wallet"
      subtitle="Link a real wallet address, read the ERC-20 balance from chain, and route fiat purchases through Razorpay."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="card-surface space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Account</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{user?.username || "Not signed in"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {user ? `Signed in as ${user.email || user.username}.` : "Sign in to link a wallet and buy tokens."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">Role: {user?.role || "guest"}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">User ID: {user?.id || "n/a"}</span>
          </div>
        </section>

        <div className="space-y-6">
          <TokenStats balance={blockchain.balance} earned={incoming} spent={outgoing} />

          <section className="card-surface space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Wallet address</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Link the address that receives minted tokens</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                The database stores one wallet address per user so onramp mints can land in the right account.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={walletInput}
                onChange={(event) => setWalletInput(event.target.value)}
                placeholder="0x..."
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-500"
              />
              <button type="button" onClick={handleSaveWalletAddress} className="btn-primary px-5 py-3 text-sm">
                Save address
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                Linked: {blockchain.walletAddress || "not linked yet"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                Contract: {blockchain.contractAddress || "not deployed"}
              </span>
            </div>
          </section>

          <section className="card-surface space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Buy tokens</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Route fiat payment through Razorpay</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={buyAmount}
                onChange={(event) => setBuyAmount(event.target.value)}
                inputMode="numeric"
                placeholder="100"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-500"
              />
              <button type="button" onClick={handleBuyTokens} className="btn-primary px-5 py-3 text-sm">
                Continue to Razorpay
              </button>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Payment success is confirmed by the callback route, which mints the ERC-20 directly to the linked wallet.
            </p>
          </section>

          <section className="card-surface space-y-3 p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Chain state</p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1">Balance: {blockchain.balance} 2GT</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Transactions: {blockchain.transactions.length}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Status: {blockchain.loading ? "Loading" : "Ready"}</span>
            </div>
            {blockchain.error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-700">{blockchain.error}</p> : null}
          </section>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Transaction history</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Recent token activity</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{blockchain.walletAddress}</span>
        </div>
        <div className="mt-4 divide-y divide-slate-200">
          {blockchain.transactions.map((tx) => (
            <div key={tx.id} className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-slate-900">{tx.label}</p>
                <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right text-sm">
                <p className={tx.amount >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>
                  {tx.amount >= 0 ? "+" : ""}{tx.amount} 2GT
                </p>
                <p className="text-xs text-slate-500">Balance after: {tx.balanceAfter}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
