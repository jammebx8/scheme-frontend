"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type F = z.infer<typeof schema>;

const FEATURES = [
  { icon: "🤖", title: "AI Form Filling",   desc: "Agent fills & submits government forms automatically" },
  { icon: "🔍", title: "Smart Discovery",   desc: "AI matches schemes to your profile using vector search" },
  { icon: "⚡",  title: "One-Click Apply",   desc: "Upload documents once — apply to any scheme instantly" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<F>({ resolver: zodResolver(schema) });

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
      {/* ── left marketing panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col bg-primary overflow-hidden">
        {/* pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* blobs */}
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-20 w-60 h-60 rounded-full bg-secondary-fixed/10 blur-3xl pointer-events-none" />
        {/* tricolor */}
        <div className="tricolor-bar absolute top-0 left-0 right-0 h-1" />

        <div className="relative flex flex-col justify-between h-full p-10 xl:p-14 text-on-primary">
          {/* brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-lg shadow-sm">
              G
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-tight">GovAssist</div>
              <div className="text-white/50 text-[11px]">AI-Powered Scheme Portal</div>
            </div>
          </div>

          {/* headline */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary-fixed text-xs font-semibold mb-5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
              India&apos;s AI-first scheme portal
            </div>
            <h1 className="font-display text-3xl xl:text-4xl font-bold leading-tight mb-4 tracking-tight">
              Government Schemes,<br />
              <span className="text-secondary-fixed">Applied Automatically</span>
            </h1>
            <p className="text-white/55 text-[15px] leading-relaxed max-w-sm">
              Discover every scheme you qualify for. Our AI agent fills and
              submits applications on your behalf.
            </p>
          </div>

          {/* features */}
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center text-lg shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-[14px]">{f.title}</p>
                  <p className="text-white/50 text-[13px] mt-0.5 leading-snug">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-white/25 text-[11px] tracking-wide">
            Powered by Groq AI · BAAI Embeddings · Built for Bharat
          </p>
        </div>
      </div>

      {/* ── right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-surface-container-lowest px-6 py-10">
        <div className="w-full max-w-[420px]">
          {/* mobile brand */}
          <div className="lg:hidden mb-8 text-center">
            <div className="tricolor-bar w-full h-1 mb-6 rounded" />
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary font-black text-xl mx-auto mb-3 shadow-sm">
              G
            </div>
            <p className="font-display font-bold text-primary text-xl">GovAssist</p>
          </div>

          <h2 className="font-display text-2xl font-bold text-on-surface mb-1 tracking-tight">
            Sign in
          </h2>
          <p className="text-on-surface-variant text-sm mb-8">
            New here?{" "}
            <Link href="/signup" className="text-secondary font-semibold hover:underline">
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
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
              <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-semibold py-3 rounded-xl transition-all text-sm mt-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* trust signals */}
          <div className="mt-8 pt-6 border-t border-outline-variant/40 space-y-2">
            <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
              <CheckCircle2 size={13} className="text-secondary shrink-0" />
              Free to use · No hidden charges
            </div>
            <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
              <CheckCircle2 size={13} className="text-secondary shrink-0" />
              Your data is encrypted and protected
            </div>
            <p className="text-center text-[11px] text-outline mt-3">
              By signing in you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
