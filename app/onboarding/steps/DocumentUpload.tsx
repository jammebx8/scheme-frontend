"use client";

import { useRef, useState } from "react";
import { documents as docsApi, UserDocument } from "@/lib/api";
import { DOC_TYPE_LABELS } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Upload, CheckCircle2, Trash2, FileText,
  Loader2, ArrowRight, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const REQUIRED = ["aadhaar", "pan"];
const OPTIONAL = [
  "income_certificate", "caste_certificate", "marksheet",
  "bank_passbook", "photo", "disability_certificate", "farmer_id",
];

interface Props {
  uploadedDocs: UserDocument[];
  onDocsChange: (d: UserDocument[]) => void;
  onComplete:   () => void;
}

export default function DocumentUpload({ uploadedDocs, onDocsChange, onComplete }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [pending,   setPending]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploaded = new Set(uploadedDocs.map((d) => d.doc_type));

  const trigger = (docType: string) => {
    setPending(docType);
    setTimeout(() => inputRef.current?.click(), 50);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!pending || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const type = pending;
    setUploading(type);
    try {
      const res = await docsApi.upload(type, file);
      onDocsChange([...uploadedDocs.filter((d) => d.doc_type !== type), res]);
      toast.success(`${DOC_TYPE_LABELS[type]} processed!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      setPending(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (doc: UserDocument) => {
    try {
      await docsApi.delete(doc.id);
      onDocsChange(uploadedDocs.filter((d) => d.id !== doc.id));
      toast.success("Removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const canContinue = REQUIRED.every((t) => uploaded.has(t));

  function DocRow({ type, required }: { type: string; required?: boolean }) {
    const doc   = uploadedDocs.find((d) => d.doc_type === type);
    const busy  = uploading === type;
    const label = DOC_TYPE_LABELS[type] || type;

    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3.5 rounded-xl border transition-all",
          doc
            ? "border-secondary/40 bg-secondary-container/20"
            : "border-outline-variant bg-surface-container-lowest hover:border-outline/60"
        )}
      >
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            doc ? "bg-secondary-container" : "bg-surface-container"
          )}
        >
          {doc ? (
            <CheckCircle2 size={17} className="text-secondary" />
          ) : (
            <FileText size={16} className="text-on-surface-variant" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-on-surface">
            {label}
            {required && <span className="ml-1 text-error text-[11px]">*</span>}
          </p>
          <p className="text-[11px] text-on-surface-variant truncate">
            {doc
              ? ((doc.extracted_data?.name as string) || "Uploaded & extracted")
              : "JPG, PNG or PDF · max 10 MB"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {doc && (
            <button
              onClick={() => remove(doc)}
              className="p-1.5 text-error/70 hover:text-error hover:bg-error-container/40 rounded-lg transition"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={() => trigger(type)}
            disabled={busy}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
              doc
                ? "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                : "bg-secondary text-on-secondary hover:opacity-90"
            )}
          >
            {busy ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Upload size={12} />
            )}
            {doc ? "Replace" : "Upload"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={onFile}
        className="hidden"
      />

      {/* required */}
      <div>
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
          Required Documents
        </p>
        <div className="space-y-2">
          {REQUIRED.map((t) => (
            <DocRow key={t} type={t} required />
          ))}
        </div>
      </div>

      {/* optional */}
      <div>
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
          Optional — Unlocks More Schemes
        </p>
        <div className="space-y-2">
          {OPTIONAL.map((t) => (
            <DocRow key={t} type={t} />
          ))}
        </div>
      </div>

      {/* warning */}
      {!canContinue && (
        <div className="flex items-center gap-2.5 p-4 bg-tertiary-fixed/30 border border-on-tertiary-container/30 rounded-xl text-[13px] text-on-surface">
          <AlertCircle size={16} className="shrink-0 text-on-tertiary-container" />
          Upload Aadhaar and PAN to continue
        </div>
      )}

      <button
        onClick={onComplete}
        disabled={!canContinue}
        className="w-full flex items-center justify-center gap-2 bg-secondary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-on-secondary font-semibold py-3 rounded-xl transition-all text-[14px] shadow-sm"
      >
        <span>Continue to Dashboard</span>
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
