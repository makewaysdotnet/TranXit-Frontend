import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BidOffer } from "@/lib/types";

export function BidOfferCard({ bid }: { bid: BidOffer }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-[#171721]">{bid.label}</h3>
            {bid.status ? (
              <span className="rounded-full bg-[#ECFBF6] px-3 py-1 text-xs font-bold text-[#0D8F65]">
                {bid.status}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-[#8083A3]">{bid.courierName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Total
          </p>
          <p className="text-2xl font-bold text-[#171721]">{bid.total}</p>
        </div>
      </div>
      <div className="my-5 h-px bg-[#E4E6E8]" />
      <div className="grid gap-4 text-sm text-[#595D62] md:grid-cols-4">
        <div>
          <p className="font-bold text-[#171721]">{bid.route}</p>
          <p>{bid.transitTime}</p>
        </div>
        <span className="flex items-center gap-2">
          <ShieldCheck size={17} /> Reliability {bid.reliability}
        </span>
        <span className="flex items-center gap-2">
          <Clock3 size={17} /> Cut-off {bid.cutoff}
        </span>
        <span className="flex items-center gap-2">
          <CheckCircle2 size={17} /> {bid.freeTime} free time
        </span>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button variant="secondary">View breakdown</Button>
        <Button>Accept bid</Button>
      </div>
    </Card>
  );
}

