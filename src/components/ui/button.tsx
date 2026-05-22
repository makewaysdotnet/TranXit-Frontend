import { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  children,
  icon,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#BFF000]/60 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-[#BFF000] text-[#111110] hover:bg-[#d6ff28]",
        variant === "secondary" &&
          "border border-[#E4E6E8] bg-white text-[#171721] hover:border-[#BFF000]",
        variant === "ghost" && "bg-transparent text-[#171721] hover:bg-[#F5F5FA]",
        variant === "danger" && "bg-[#EB5E55] text-white hover:bg-[#d94d45]",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
