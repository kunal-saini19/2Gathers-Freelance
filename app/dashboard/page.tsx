"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Coins, LogOut } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await authApi.dashboard();
      return response.data;
    },
  });

  const dashboard = dashboardQuery.data;

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome ${user?.username ?? "back"}. Review your wallet, role, and quick actions from one focused place.`}>
      <section className="grid gap-5 md:grid-cols-3">
        <article className="card-surface p-6">
          <p className="text-sm text-slate-600">Wallet balance</p>
          <div className="mt-2 flex items-center gap-2 text-3xl font-bold text-emerald-700">
            <Coins className="h-7 w-7" />
            {dashboard?.walletBalance ?? 0}
          </div>
        </article>

        <article className="card-surface p-6 md:col-span-2">
          <p className="text-sm text-slate-600">Quick actions</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => router.push("/jobs")} className="btn-primary btn-md">
              Browse jobs
            </button>
            <button onClick={() => window.location.assign("http://127.0.0.1:8000/freelancers/dashboard/")} className="btn-secondary btn-md">
              Open Django dashboard
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="btn-ghost btn-md text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
