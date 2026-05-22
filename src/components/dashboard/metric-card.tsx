import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  meta,
  icon,
}: {
  label: string;
  value: string;
  meta: string;
  icon: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            {label}
          </p>
          <p className="mt-3 text-2xl font-bold text-[#171721]">{value}</p>
          <p className="mt-1 text-sm text-[#8083A3]">{meta}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#BFF000] text-[#111110]">
          {icon}
        </div>
      </div>
    </Card>
  );
}

