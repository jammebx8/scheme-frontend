"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { users, UserProfile } from "@/lib/api";
import { STATES } from "@/lib/utils";
import toast from "react-hot-toast";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const schema = z.object({
  full_name:         z.string().min(2, "Required"),
  date_of_birth:     z.string().min(1, "Required"),
  gender:            z.string().min(1, "Required"),
  state:             z.string().min(1, "Required"),
  district:          z.string().min(1, "Required"),
  annual_income:     z.coerce.number().min(0, "Required"),
  caste_category:    z.string().min(1, "Required"),
  occupation:        z.string().optional(),
  is_student:        z.boolean().optional(),
  is_farmer:         z.boolean().optional(),
  disability_status: z.boolean().optional(),
});
type F = z.infer<typeof schema>;

interface Props {
  user: UserProfile;
  onComplete: (u: UserProfile) => void;
}

export default function PersonalDetails({ user, onComplete }: Props) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name:         user.full_name        || "",
      date_of_birth:     user.date_of_birth    || "",
      gender:            user.gender           || "",
      state:             user.state            || "",
      district:          user.district         || "",
      annual_income:     user.annual_income    || 0,
      caste_category:    user.caste_category   || "",
      occupation:        user.occupation       || "",
      is_student:        user.is_student       || false,
      is_farmer:         user.is_farmer        || false,
      disability_status: user.disability_status || false,
    },
  });

  const onSubmit = async (data: F) => {
    setSaving(true);
    try {
      onComplete(await users.updateProfile(data));
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const lbl = "block text-[12px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide";
  const inp = "form-input";
  const err = "mt-1 text-[11px] text-error";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* full name */}
        <div className="sm:col-span-2">
          <label className={lbl}>
            Full Name <span className="text-error normal-case">*</span>
          </label>
          <input
            {...register("full_name")}
            placeholder="As on Aadhaar card"
            className={inp}
          />
          {errors.full_name && <p className={err}>{errors.full_name.message}</p>}
        </div>

        {/* dob */}
        <div>
          <label className={lbl}>
            Date of Birth <span className="text-error normal-case">*</span>
          </label>
          <input {...register("date_of_birth")} type="date" className={inp} />
          {errors.date_of_birth && (
            <p className={err}>{errors.date_of_birth.message}</p>
          )}
        </div>

        {/* gender */}
        <div>
          <label className={lbl}>
            Gender <span className="text-error normal-case">*</span>
          </label>
          <select {...register("gender")} className={inp}>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other / Transgender</option>
          </select>
          {errors.gender && <p className={err}>{errors.gender.message}</p>}
        </div>

        {/* caste */}
        <div>
          <label className={lbl}>
            Category <span className="text-error normal-case">*</span>
          </label>
          <select {...register("caste_category")} className={inp}>
            <option value="">Select</option>
            <option value="GEN">General (GEN)</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
          {errors.caste_category && (
            <p className={err}>{errors.caste_category.message}</p>
          )}
        </div>

        {/* income */}
        <div>
          <label className={lbl}>
            Annual Family Income (₹){" "}
            <span className="text-error normal-case">*</span>
          </label>
          <input
            {...register("annual_income")}
            type="number"
            min="0"
            placeholder="e.g. 120000"
            className={inp}
          />
          {errors.annual_income && (
            <p className={err}>{errors.annual_income.message}</p>
          )}
        </div>

        {/* state */}
        <div>
          <label className={lbl}>
            State <span className="text-error normal-case">*</span>
          </label>
          <select {...register("state")} className={inp}>
            <option value="">Select state</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className={err}>{errors.state.message}</p>}
        </div>

        {/* district */}
        <div>
          <label className={lbl}>
            District <span className="text-error normal-case">*</span>
          </label>
          <input
            {...register("district")}
            placeholder="Your district"
            className={inp}
          />
          {errors.district && <p className={err}>{errors.district.message}</p>}
        </div>

        {/* occupation */}
        <div>
          <label className={lbl}>Occupation</label>
          <input
            {...register("occupation")}
            placeholder="e.g. Farmer, Student"
            className={inp}
          />
        </div>
      </div>

      {/* boolean flag tiles */}
      <div>
        <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
          Additional Status
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { field: "is_student",        label: "I am a student",           emoji: "🎓" },
            { field: "is_farmer",         label: "I am a farmer",            emoji: "🌾" },
            { field: "disability_status", label: "I have a disability (PwD)",emoji: "♿" },
          ].map(({ field, label, emoji }) => (
            <label
              key={field}
              className="flex items-center gap-3 p-3.5 border border-outline-variant rounded-xl cursor-pointer transition-all hover:border-secondary/60 hover:bg-secondary-container/20 has-[:checked]:border-secondary has-[:checked]:bg-secondary-container/30"
            >
              <input
                {...register(field as keyof F)}
                type="checkbox"
                className="w-4 h-4 rounded accent-secondary shrink-0"
              />
              <span className="text-[13px] text-on-surface leading-snug">
                {emoji} {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-semibold py-3 rounded-xl transition-all text-[14px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
        ) : (
          <>
            <span>Save &amp; Continue</span>
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  );
}
