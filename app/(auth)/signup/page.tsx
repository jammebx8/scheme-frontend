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
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

const schema = z
  .object({
    full_name:        z.string().min(2, "Enter your full name"),
    email:            z.string().email("Enter a valid email"),
    phone:            z.string().optional(),
    password:         z.string().min(8, "At least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });
type F = z.infer<typeof schema>;

const STEPS = [
  {
    num: "01",
    title: "Create your account",
    desc: "Sign up with your email in under a minute.",
  },
  {
    num: "02",
    title: "Fill your profile",
    desc: "Add basic details — age, income, state, occupation, category.",
  },
  {
    num: "03",
    title: "Upload your documents",
    desc: "Aadhaar, PAN, income certificate and more — upload once, reuse forever.",
  },
  {
    num: "04",
    title: "Discover & apply",
    desc: "See every scheme you qualify for, with AI-computed eligibility scores.",
  },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const router     = useRouter();
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } =
    useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setLoading(true);
    try {
      await signup({
        email:     data.email,
        password:  data.password,
        full_name: data.full_name,
        phone:     data.phone,
      });
      toast.success("Account created!");
      router.push("/onboarding");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">

      {/* ── LEFT: brand / how it works ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[45%] relative flex-col bg-gradient-to-br from-slate-950 via-[#00111f] to-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -right-24 top-10 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
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

          <div>
            <h1 className="font-display text-3xl xl:text-[2.5rem] font-bold leading-tight mb-3 tracking-tight">
              Start your journey<br />
              <span className="text-emerald-300">in 4 simple steps</span>
            </h1>
            <p className="text-white/50 text-[14px] mb-8 leading-relaxed max-w-sm">
              Thousands of citizens are already accessing benefits they never
              knew existed. Join them — it&apos;s completely free.
            </p>

            <div className="space-y-5">
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <span className="text-emerald-300 text-[11px] font-bold">{num}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] mb-0.5">{title}</p>
                    <p className="text-white/45 text-[12px] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/80 text-[13px] font-semibold mb-1">
              100% Free · No Hidden Fees · Always
            </p>
            <p className="text-white/40 text-[12px] leading-relaxed">
              Scheme Sarthi is a civic technology platform built to help every Indian
              citizen discover and access the government benefits they are entitled to.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: signup form ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-[420px]">

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
            Create your account
          </h2>
          <p className="text-slate-500 text-sm mb-7">
            Already have one?{" "}
            <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <input
                {...register("full_name")}
                placeholder="As on Aadhaar card"
                className="form-input"
              />
              {errors.full_name && (
                <p className="mt-1 text-[11px] text-error">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="form-input"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Mobile{" "}
                <span className="text-slate-400 font-normal normal-case">(optional)</span>
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+91 98765 43210"
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPw ? "text" : "password"}
                    placeholder="Min 8 chars"
                    className="form-input pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-error">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Confirm
                </label>
                <input
                  {...register("confirm_password")}
                  type="password"
                  placeholder="Repeat"
                  className="form-input"
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-[11px] text-error">{errors.confirm_password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all text-sm mt-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              Covers 1000+ Central and State government schemes
            </div>
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              AI-powered eligibility matching — no guesswork
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-3">
              By creating an account you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
