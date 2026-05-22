import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

type FieldProps = {
  label: string;
  hint?: string;
};

export function TextField({
  label,
  hint,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#292C43]">
      <span>{label}</span>
      <input
        className={cx(
          "h-12 rounded-lg border border-[#E4E6E8] bg-white px-4 text-sm text-[#171721] outline-none transition placeholder:text-[#8083A3] focus:border-[#BFF000] focus:ring-2 focus:ring-[#BFF000]/30",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs font-normal text-[#8083A3]">{hint}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  hint,
  className,
  children,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#292C43]">
      <span>{label}</span>
      <select
        className={cx(
          "h-12 rounded-lg border border-[#E4E6E8] bg-white px-4 text-sm text-[#171721] outline-none transition focus:border-[#BFF000] focus:ring-2 focus:ring-[#BFF000]/30",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {hint ? <span className="text-xs font-normal text-[#8083A3]">{hint}</span> : null}
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#292C43]">
      <span>{label}</span>
      <textarea
        className={cx(
          "min-h-[112px] rounded-lg border border-[#E4E6E8] bg-white px-4 py-3 text-sm text-[#171721] outline-none transition placeholder:text-[#8083A3] focus:border-[#BFF000] focus:ring-2 focus:ring-[#BFF000]/30",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs font-normal text-[#8083A3]">{hint}</span> : null}
    </label>
  );
}
