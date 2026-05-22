import { HTMLAttributes } from "react";
import { cx } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-lg border border-[#E4E6E8] bg-white shadow-[0_12px_32px_-24px_rgba(0,0,0,0.35)]",
        className,
      )}
      {...props}
    />
  );
}
