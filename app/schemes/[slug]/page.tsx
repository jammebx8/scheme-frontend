"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { schemes as schemesApi, Scheme } from "@/lib/api";
import Navbar from "@/components/Navbar";
import ApplyButton from "@/components/ApplyButton";
import { CATEGORY_ICONS, cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, FileText, Users,
  Globe, Tag, AlertCircle,
} from "lucide-react";
import Link from "next/link";

const LEVEL_PILL: Record<string, string> = {
  Central:         "bg-primary-fixed text-on-primary-fixed",
  State:           "bg-secondary-fixed text-on-secondary-fixed",
  "State-Central": "bg-surface-container-highest text-on-surface",
};

function InfoSection({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-5 shadow-card">
      <h3 className="flex items-center gap-2 font-semibold text-on-surface text-[14px] mb-3">
        <Icon size={15} className="text-secondary" />
        {title}
      </h3>
      <p className="text-[13px] text-on-surface-variant leading-relaxed whitespace-pre-line">
        {content}
      </p>
    </div>
  );
}

export default function SchemeDetailPage() {
  const { slug }          = useParams<{ slug: string }>();
  const { user, loading } = useAuth();
  const router            = useRouter();
  const [scheme,   setScheme]   = useState<Scheme | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && slug) {
      schemesApi
        .getBySlug(slug)
        .then(setScheme)
        .catch(() => router.push("/schemes"))
        .finally(() => setFetching(false));
    }
  }, [user, slug, router]);

  if (loading || fetching) return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 shimmer rounded-xl" />
        ))}
      </div>
    </div>
  );

  if (!scheme) return null;

  const icon      = CATEGORY_ICONS[scheme.scheme_category] || "📋";
  const levelPill = LEVEL_PILL[scheme.level] || "bg-surface-container text-on-surface-variant";

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        <Link
          href="/schemes"
          className="inline-flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-on-surface mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Schemes
        </Link>

        {/* ── hero card ── */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden mb-5 shadow-card">
          {/* tricolor top stripe */}
          <div className="tricolor-bar h-[3px] w-full" />

          <div className="p-6 md:p-8">
            {/* badge row */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full font-semibold",
                  levelPill
                )}
              >
                {scheme.level} Government
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-secondary-fixed/30 text-on-secondary-container border border-secondary-fixed/50 font-semibold">
                {scheme.scheme_category}
              </span>
              {scheme.eligible !== undefined && (
                <span
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1",
                    scheme.eligible
                      ? "bg-secondary-fixed/30 text-on-secondary-container border border-secondary-fixed/50"
                      : "bg-surface-container text-on-surface-variant border border-outline-variant/40"
                  )}
                >
                  {scheme.eligible ? (
                    <CheckCircle2 size={11} />
                  ) : (
                    <AlertCircle size={11} />
                  )}
                  {scheme.eligible ? "You may be eligible" : "Eligibility unclear"}
                </span>
              )}
            </div>

            {/* title row */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-outline-variant/40">
                {icon}
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-xl md:text-2xl font-bold text-on-surface leading-tight mb-2">
                  {scheme.scheme_name}
                </h1>
                {scheme.eligibility_reason && (
                  <p
                    className={cn(
                      "text-[12px] px-3 py-1.5 rounded-xl inline-block border",
                      scheme.eligible
                        ? "bg-secondary-fixed/20 text-on-secondary-container border-secondary-fixed/40"
                        : "bg-surface-container text-on-surface-variant border-outline-variant/40"
                    )}
                  >
                    {scheme.eligibility_reason}
                  </p>
                )}
              </div>
            </div>

            {/* tags */}
            {scheme.tags && scheme.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {scheme.tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 text-[11px] bg-primary-fixed text-on-primary-fixed px-2.5 py-0.5 rounded-full font-medium"
                  >
                    <Tag size={9} />
                    {t}
                  </span>
                ))}
              </div>
            )}

            <p className="text-[13px] text-on-surface-variant leading-relaxed mb-6">
              {scheme.details}
            </p>

            {/* apply strip */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-surface-container">
              <div>
                <p className="text-[13px] font-semibold text-on-surface mb-0.5">
                  Ready to apply?
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  {scheme.application
                    ? "Our AI agent will fill and submit the form automatically"
                    : "This scheme requires in-person application"}
                </p>
              </div>
              <ApplyButton
                schemeId={scheme.id}
                schemeName={scheme.scheme_name}
                hasApplicationUrl={!!scheme.application}
                className="px-8 py-3 text-[14px] min-w-[220px]"
              />
            </div>
          </div>
        </div>

        {/* ── detail sections ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <InfoSection
            icon={CheckCircle2}
            title="Benefits"
            content={scheme.benefits}
          />
          <InfoSection
            icon={Users}
            title="Eligibility Criteria"
            content={scheme.eligibility}
          />
        </div>

        {scheme.documents && (
          <div className="mb-4">
            <InfoSection
              icon={FileText}
              title="Required Documents"
              content={scheme.documents}
            />
          </div>
        )}

        {scheme.application && (
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-on-surface flex items-center gap-2 mb-0.5">
                <Globe size={14} className="text-secondary" />
                Official Portal
              </p>
              <p className="text-[12px] text-on-surface-variant truncate max-w-xs">
                {scheme.application}
              </p>
            </div>
            <a
              href={scheme.application}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[13px] text-secondary font-semibold hover:underline flex items-center gap-1"
            >
              Open <Globe size={12} />
            </a>
          </div>
        )}
      </main>

      {/* mobile sticky CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/40 p-4 z-40">
        <ApplyButton
          schemeId={scheme.id}
          schemeName={scheme.scheme_name}
          hasApplicationUrl={!!scheme.application}
          className="w-full py-3.5 text-[14px]"
        />
      </div>
      <div className="sm:hidden h-20" />
    </div>
  );
}
