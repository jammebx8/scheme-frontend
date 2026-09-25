"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

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

const STEPS_INFO = [
  "Create your account",
  "Fill in your personal profile",
  "Upload Aadhaar, PAN & other documents",
  "See recommended schemes & apply with one click",
];

export default function SignupPage() {
  const { signup } = useAuth();
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
      await signup({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
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
      {/* ── left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col bg-primary overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -right-20 top-10 w-72 h-72 rounded-full bg-secondary/12 blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-64 h-64 rounded-full bg-secondary-fixed/8 blur-3xl pointer-events-none" />
        <div className="tricolor-bar absolute top-0 left-0 right-0 h-1" />

        <div className="relative flex flex-col justify-between h-full p-10 xl:p-14 text-on-primary">
          {/* brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-lg">
              G
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-tight">GovAssist</div>
              <div className="text-white/50 text-[11px]">AI-Powered Scheme Portal</div>
            </div>
          </div>

          <div>
            <h1 className="font-display text-3xl xl:text-4xl font-bold leading-tight mb-3 tracking-tight">
              Start your journey<br />
              <span className="text-secondary-fixed">in 4 simple steps</span>
            </h1>
            <p className="text-white/50 text-[14px] mb-8 leading-relaxed">
              Join thousands of citizens accessing their entitled benefits.
            </p>

            <div className="space-y-4">
              {STEPS_INFO.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-sm font-bold shrink-0 shadow-sm">
                    {i + 1}
                  </div>
                  <p className="text-white/70 text-[14px] leading-snug pt-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/6 border border-white/10 rounded-2xl p-5">
            <p className="text-white/80 text-sm font-semibold mb-1">
              100% Free · No Hidden Fees
            </p>
            <p className="text-white/40 text-[12px] leading-relaxed">
              GovAssist is a free civic technology tool built to help every
              Indian citizen access their entitled benefits.
            </p>
          </div>
        </div>
      </div>

      {/* ── right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-surface-container-lowest px-6 py-10 overflow-y-auto">
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
            Create account
          </h2>
          <p className="text-on-surface-variant text-sm mb-7">
            Already have one?{" "}
            <Link href="/login" className="text-secondary font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <input
                {...register("full_name")}
                placeholder="As on Aadhaar card"
                className="form-input"
              />
              {errors.full_name && (
                <p className="mt-1 text-[11px] text-error">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="form-input"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                Mobile{" "}
                <span className="text-outline font-normal normal-case">(optional)</span>
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
                <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-error">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Confirm
                </label>
                <input
                  {...register("confirm_password")}
                  type="password"
                  placeholder="Repeat"
                  className="form-input"
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-[11px] text-error">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-secondary hover:opacity-90 text-on-secondary font-semibold py-3 rounded-xl transition-all text-sm mt-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="text-center text-[11px] text-outline mt-6">
            By creating an account you agree to our terms of service and
            privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
