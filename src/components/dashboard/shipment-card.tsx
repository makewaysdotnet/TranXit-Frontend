import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Package } from "lucide-react";
import { StatusTag } from "@/components/ui/status-tag";
import { Shipment } from "@/lib/types";

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <Link
      href={`/jobs/${shipment.id}`}
      className="grid gap-4 rounded-lg border border-[#E4E6E8] bg-white p-4 transition hover:border-[#BFF000]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            {shipment.jobNumber}
          </p>
          <h3 className="mt-1 text-lg font-bold text-[#171721]">{shipment.title}</h3>
        </div>
        <StatusTag status={shipment.status} />
      </div>
      <div className="grid gap-3 text-sm text-[#595D62] md:grid-cols-3">
        <span className="flex items-center gap-2">
          <MapPin size={16} /> {shipment.origin}
        </span>
        <span className="flex items-center gap-2">
          <ArrowRight size={16} /> {shipment.destination}
        </span>
        <span className="flex items-center gap-2">
          <CalendarDays size={16} /> {shipment.eta}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-[#292C43]">
          <Package size={16} /> {shipment.items[0]?.quantity ?? 0} items -{" "}
          {shipment.amountRange}
        </span>
        <span className="text-sm font-bold text-[#171721]">{shipment.bids} bid offers</span>
      </div>
    </Link>
  );
}

