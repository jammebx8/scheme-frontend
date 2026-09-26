"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Eye, EyeOff, ArrowRight, CheckCircle2,
  Search, Sparkles, MousePointerClick,
} from "lucide-react";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type F = z.infer<typeof schema>;

const FEATURES = [
  {
    icon: Search,
    title: "Smart Scheme Discovery",
    desc: "Our AI matches thousands of Central and State schemes to your profile using semantic search — no manual browsing needed.",
  },
  {
    icon: Sparkles,
    title: "Eligibility in Seconds",
    desc: "Large Language Models analyse your age, income, caste, occupation and more to calculate an eligibility percentage for every scheme.",
  },
  {
    icon: MousePointerClick,
    title: "One-Click Applications",
    desc: "Upload your documents once. Our AI agent fills and submits government application forms on your behalf automatically.",
  },
];

const STATS = [
  { value: "1000+", label: "Schemes Indexed" },
  { value: "28",    label: "States Covered"  },
  { value: "Free",  label: "Always"          },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router    = useRouter();
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } =
    useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">

      {/* ── LEFT: brand / marketing panel ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[45%] relative flex-col bg-gradient-to-br from-slate-950 via-[#00111f] to-slate-900 overflow-hidden">
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* glow blobs */}
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        {/* tricolor top stripe */}
        <div className="tricolor-bar absolute top-0 left-0 right-0 h-[3px]" />

        <div className="relative flex flex-col justify-between h-full p-10 xl:p-14 text-white">

          {/* Logo */}
          <div>
            <Image
              src="/Agent Image - Design a modern_ professional logo for a digital government services portal that unifi.png"
              alt="Scheme Sarthi"
              width={220}
              height={60}
              className="h-14 w-auto object-contain brightness-0 invert"
              priority
            />
          </div>

          {/* headline + description */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              India&apos;s AI-First Scheme Portal
            </div>

            <h1 className="font-display text-3xl xl:text-[2.6rem] font-bold leading-tight mb-4 tracking-tight">
              Every Government<br />
              Scheme You Deserve,<br />
              <span className="text-emerald-300">Found Automatically</span>
            </h1>

            <p className="text-white/55 text-[14px] leading-relaxed max-w-sm mb-8">
              India issues hundreds of schemes every year — most citizens never
              know they qualify. Scheme Sarthi changes that. Fill your profile
              once; we do the rest.
            </p>

            {/* feature list */}
            <div className="space-y-5">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-emerald-300" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] mb-0.5">{title}</p>
                    <p className="text-white/45 text-[12px] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* stats row */}
          <div className="flex items-center gap-6 pt-6 border-t border-white/8">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-2xl font-bold text-white leading-none">{value}</p>
                <p className="text-white/40 text-[11px] mt-0.5 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: login form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-[400px]">

          {/* mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="tricolor-bar w-full h-[3px] mb-6 rounded" />
            <Image
              src="/Agent Image - Design a modern_ professional logo for a digital government services portal that unifi.png"
              alt="Scheme Sarthi"
              width={180}
              height={48}
              className="h-12 w-auto object-contain mx-auto"
              priority
            />
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900 mb-1 tracking-tight">
            Welcome back
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            New to Scheme Sarthi?{" "}
            <Link href="/signup" className="text-emerald-600 font-semibold hover:underline">
              Create a free account
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Email address
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="form-input"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="form-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-error">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* trust signals */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              Free to use · No hidden charges
            </div>
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              Your data is encrypted and protected
            </div>
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              Covers Central + all State government schemes
            </div>
            <p className="text-center text-[11px] text-slate-400 pt-1">
              By signing in you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
