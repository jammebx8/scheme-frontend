"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { users, UserDocument } from "@/lib/api";
import Image from "next/image";
import PersonalDetails from "./steps/PersonalDetails";
import DocumentUpload from "./steps/DocumentUpload";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Profile",   desc: "Personal information" },
  { id: 2, label: "Documents", desc: "Upload your papers"   },
];

export default function OnboardingPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState<UserDocument[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user)
      users.getDocuments()
        .then((d) => setUploadedDocs(d as unknown as UserDocument[]))
        .catch(() => {});
  }, [user]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="animate-spin w-7 h-7 border-2 border-secondary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      {/* ── top bar ── */}
      <div className="tricolor-bar h-[3px] w-full" />
      <header className="bg-surface-container-lowest border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/Agent Image - Design a modern_ professional logo for a digital government services portal that unifi.png"
              alt="Scheme Sarthi"
              width={140}
              height={36}
              className="h-9 w-auto object-contain"
            />
          </div>
          <span className="text-[12px] text-on-surface-variant font-medium">
            Profile Setup · Step {step} of {STEPS.length}
          </span>
        </div>
      </header>

      {/* ── step progress ── */}
      <div className="bg-surface-container-lowest border-b border-outline-variant/20">
        <div className="max-w-2xl mx-auto px-5 py-5">
          <div className="flex items-center gap-0">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all shrink-0",
                      step > s.id
                        ? "bg-secondary text-on-secondary"
                        : step === s.id
                        ? "bg-primary text-on-primary ring-4 ring-primary-fixed/50"
                        : "bg-surface-container text-on-surface-variant"
                    )}
                  >
                    {step > s.id ? <Check size={13} /> : s.id}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={cn(
                        "text-[13px] font-semibold leading-tight",
                        step === s.id
                          ? "text-on-surface"
                          : step > s.id
                          ? "text-secondary"
                          : "text-on-surface-variant"
                      )}
                    >
                      {s.label}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {s.desc}
                    </p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-4 rounded-full transition-all",
                      step > s.id
                        ? "bg-secondary"
                        : "bg-outline-variant/40"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── content ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card overflow-hidden">
          {/* card header */}
          <div className="px-7 pt-6 pb-5 border-b border-surface-container-low">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                  "bg-primary text-on-primary"
                )}
              >
                {step}
              </span>
              <h2 className="font-display text-[18px] font-bold text-on-surface">
                {step === 1 ? "Personal Details" : "Upload Documents"}
              </h2>
            </div>
            <p className="text-[13px] text-on-surface-variant ml-8">
              {step === 1
                ? "We use this to find government schemes you're eligible for"
                : "Upload Aadhaar, PAN and other documents — AI extracts all fields automatically"}
            </p>
          </div>

          <div className="p-7">
            {step === 1 && (
              <PersonalDetails
                user={user}
                onComplete={async () => {
                  await refreshUser();
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <DocumentUpload
                uploadedDocs={uploadedDocs}
                onDocsChange={setUploadedDocs}
                onComplete={async () => {
                  await refreshUser();
                  router.push("/dashboard");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
