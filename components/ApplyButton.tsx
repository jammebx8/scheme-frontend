"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applications as appsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Zap, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  schemeId: string;
  schemeName: string;
  hasApplicationUrl: boolean;
  className?: string;
}

export default function ApplyButton({
  schemeId,
  schemeName,
  hasApplicationUrl,
  className,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!hasApplicationUrl) {
      toast("This scheme has no online application portal.", { icon: "ℹ️" });
      return;
    }
    setLoading(true);
    try {
      const result = await appsApi.apply(schemeId);
      toast.success(`AI Agent started for "${schemeName}"!`);
      router.push(`/applications/${result.job_id}`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start application"
      );
      setLoading(false);
    }
  };

  if (!hasApplicationUrl) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-[13px] text-on-surface-variant",
          "bg-surface-container border border-outline-variant rounded-xl px-5 py-3",
          className
        )}
      >
        <MapPin size={15} className="text-outline shrink-0" />
        No online portal — apply at local office
      </div>
    );
  }

  return (
    <button
      onClick={handleApply}
      disabled={loading}
      className={cn(
        "flex items-center justify-center gap-2 font-semibold rounded-xl transition-all",
        "bg-secondary text-on-secondary hover:opacity-90",
        "active:scale-[0.98]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "shadow-sm",
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 size={17} className="animate-spin" />
          Starting Agent…
        </>
      ) : (
        <>
          <Zap size={17} />
          Apply Now — One Click
        </>
      )}
    </button>
  );
}
