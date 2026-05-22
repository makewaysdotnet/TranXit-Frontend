import { ShipmentStatus } from "@/lib/types";
import { cx } from "@/lib/utils";

const statusClasses: Record<ShipmentStatus, string> = {
  Open: "bg-[#EAF1FF] text-[#3E7EFF]",
  Bidding: "bg-[#FFF4DF] text-[#9B6500]",
  Won: "bg-[#ECFBF6] text-[#0D8F65]",
  InTransit: "bg-[#EAF1FF] text-[#3E7EFF]",
  Delivered: "bg-[#ECFBF6] text-[#0D8F65]",
  Closed: "bg-[#F5F5FA] text-[#8083A3]",
  Draft: "bg-[#F5F5FA] text-[#292C43]",
};

export function StatusTag({
  status,
  className,
}: {
  status: ShipmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-bold",
        statusClasses[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
