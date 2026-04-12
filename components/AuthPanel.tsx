"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check, Circle, Lock, Mail, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "At least 1 uppercase letter")
    .regex(/[a-z]/, "At least 1 lowercase letter")
    .regex(/[0-9]/, "At least 1 number")
    .regex(/[^A-Za-z0-9]/, "At least 1 special character"),
  role: z.enum(["CLIENT", "FREELANCER"]),
});

type RegisterInput = z.infer<typeof registerSchema>;

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

type LoginInput = z.infer<typeof loginSchema>;

type AuthPanelProps = {
  initialMode: "register" | "login";
};

export function AuthPanel({ initialMode }: AuthPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [mode, setMode] = useState<"register" | "login">(initialMode);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: (searchParams.get("role") as "CLIENT" | "FREELANCER" | null) ?? "CLIENT",
    },
  });

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    registerForm.setValue("role", (searchParams.get("role") as "CLIENT" | "FREELANCER" | null) ?? "CLIENT");
  }, [registerForm, searchParams]);

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterInput) => {
      const response = await authApi.register(values);
      return response.data;
    },
    onSuccess: (payload) => {
      setRegisterSuccess(payload?.message || "Registration successful. Please verify your email before signing in.");
      setVerificationLink(payload?.verificationLink ?? null);
      setMode("login");
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginInput) => {
      const response = await authApi.login(values);
      return response.data;
    },
    onSuccess: (payload) => {
      if (!payload?.accessToken || !payload?.user) {
        throw new Error("Unexpected auth response.");
      }
      login({ user: payload.user, token: payload.accessToken });
      router.push("/start");
    },
  });

  const activeMutation = mode === "register" ? registerMutation : loginMutation;
  const error = (activeMutation.error as any)?.response?.data?.detail || activeMutation.error?.message;
  const loading = activeMutation.isPending;
  const passwordValue = registerForm.watch("password") || "";
  const passwordRules = [
    { label: "At least 8 characters", ok: passwordValue.length >= 8 },
    { label: "At least 1 uppercase letter", ok: /[A-Z]/.test(passwordValue) },
    { label: "At least 1 lowercase letter", ok: /[a-z]/.test(passwordValue) },
    { label: "At least 1 number", ok: /[0-9]/.test(passwordValue) },
    { label: "At least 1 special character", ok: /[^A-Za-z0-9]/.test(passwordValue) },
  ];



  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-secondary-950 px-10 py-12 lg:flex lg:flex-col lg:justify-center">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="relative z-10 max-w-xl">
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-black text-white">2G</span>
            </div>
            <span className="text-base font-bold text-white">2Gathers</span>
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
            {mode === "register" ? "Create your account" : "Welcome back"}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white">A cleaner path into the platform.</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
            The auth screens now match the same visual system as the landing page: sharper hierarchy, calmer spacing, and stronger product framing.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Clear role selection for clients and freelancers",
              "Responsive forms with a consistent card surface",
              "Same structure as the marketing and dashboard views",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[9px] text-white">✓</div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-black text-white">2G</span>
            </div>
            <span className="font-bold text-slate-900">2Gathers</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="card p-7">
            <div className="mb-1 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
                <UserRoundPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{mode === "register" ? "Create account" : "Sign in"}</h2>
                <p className="text-sm text-slate-500">{mode === "register" ? "Start with a new profile" : "Access your existing account"}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button type="button" onClick={() => setMode("register")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>
                Create account
              </button>
              <button type="button" onClick={() => setMode("login")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>
                Sign in
              </button>
            </div>

            {registerSuccess ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <p>{registerSuccess}</p>
                {verificationLink ? (
                  <p className="mt-1 text-xs">
                    Dev link: <Link href={verificationLink} className="font-semibold underline">Verify email now</Link>
                  </p>
                ) : null}
              </div>
            ) : null}

            {error ? <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

            {mode === "register" ? (
              <form onSubmit={registerForm.handleSubmit((values) => registerMutation.mutate(values))} className="mt-5 space-y-4">
                <label className="block">
                  <span className="label">Username</span>
                  <input className="input pl-10" placeholder="Username" {...registerForm.register("username")} required />
                </label>

                <label className="block">
                  <span className="label">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input className="input pl-10" type="email" placeholder="you@example.com" {...registerForm.register("email")} required />
                  </div>
                </label>

                <label className="block">
                  <span className="label">Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input className="input pl-10" type="password" placeholder="Create a strong password" {...registerForm.register("password")} minLength={8} required />
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {passwordRules.map((rule) => (
                      <div key={rule.label} className={`flex items-center gap-2 text-xs ${rule.ok ? "text-emerald-700" : "text-slate-500"}`}>
                        {rule.ok ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="label">Role</span>
                  <select className="input" {...registerForm.register("role")}>
                    <option value="CLIENT">Client</option>
                    <option value="FREELANCER">Freelancer</option>
                  </select>
                </label>

                <button className="btn-primary btn-md w-full" disabled={loading}>
                  {loading ? "Creating account…" : <><span>Create account</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))} className="mt-5 space-y-4">
                <label className="block">
                  <span className="label">Username</span>
                  <input className="input pl-10" placeholder="Username" {...loginForm.register("username")} required />
                </label>

                <label className="block">
                  <span className="label">Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input className="input pl-10" type="password" placeholder="Password" {...loginForm.register("password")} minLength={8} required />
                  </div>
                </label>

                <button className="btn-primary btn-md w-full" disabled={loading}>
                  {loading ? "Signing in…" : <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            )}

            <p className="mt-6 text-xs text-slate-500">
              {mode === "register" ? (
                <>
                  Already have an account? <Link href="/login" className="font-semibold text-primary-600">Sign in</Link>
                </>
              ) : (
                <>
                  Need an account? <Link href="/register" className="font-semibold text-primary-600">Create one</Link>
                </>
              )}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}