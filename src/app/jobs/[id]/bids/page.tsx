import Link from "next/link";
import { AppShell } from "@/components/dashboard/app-shell";
import { BidOfferCard } from "@/components/dashboard/bid-offer-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { bidOffers, customerShipments } from "@/lib/mock-data";

export default function JobBidsPage({ params }: { params: { id: string } }) {
  const shipment =
    customerShipments.find((item) => item.id === Number(params.id)) || customerShipments[0];

  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#8083A3]">
              Bid offers
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#171721]">{shipment.title}</h1>
          </div>
          <Link href={`/jobs/${shipment.id}`}>
            <Button variant="secondary">Back to job</Button>
          </Link>
        </div>

        <Card className="grid gap-4 p-5 lg:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase text-[#8083A3]">
              Request
            </p>
            <p className="mt-2 text-xl font-bold">{shipment.jobNumber}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[#8083A3]">
              Route
            </p>
            <p className="mt-2 font-bold">
              {shipment.origin} {"->"} {shipment.destination}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[#8083A3]">
              Target range
            </p>
            <p className="mt-2 text-xl font-bold">{shipment.amountRange}</p>
          </div>
        </Card>

        <div className="grid gap-4">
          {bidOffers.map((bid) => (
            <BidOfferCard key={bid.id} bid={bid} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}

