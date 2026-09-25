"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SplashPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) router.replace(user.profile_complete ? "/dashboard" : "/onboarding");
      else       router.replace("/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden">
      {/* tricolor stripe */}
      <div className="tricolor-bar fixed top-0 left-0 right-0 h-1 z-50" />

      {/* decorative blobs */}
      <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-80 h-80 rounded-full bg-secondary-fixed/10 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative text-center text-on-primary select-none px-4">
        {/* logo mark */}
        <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-4xl mx-auto mb-6 shadow-lg">
          G
        </div>

        <h1 className="font-display text-3xl font-bold mb-1 tracking-tight">
          GovAssist
        </h1>
        <p className="text-white/50 text-sm mb-8 font-medium">
          AI-Powered Government Scheme Portal
        </p>

        {/* animated dots */}
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-secondary-fixed rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>

        {/* tagline */}
        <p className="text-white/25 text-xs mt-10 tracking-wider uppercase">
          Powered by AI · Built for Bharat
        </p>
      </div>
    </div>
  );
}
