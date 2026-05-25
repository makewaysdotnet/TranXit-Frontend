import Link from "next/link";
import { AppShell } from "@/components/dashboard/app-shell";
import { BidOfferCard } from "@/components/dashboard/bid-offer-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getJobBidsRequest, getJobDetailRequest, resultErrors } from "@/lib/api";
import { mapBidToOffer, mapJobDetailToShipment } from "@/lib/live-data";
import { bidOffers, customerShipments } from "@/lib/mock-data";
import { getServerAuth } from "@/lib/server-auth";
import { BackendJobDetail, BidOffer, Shipment } from "@/lib/types";

const demoDataEnabled = process.env.TRANXIT_ENABLE_DEMO_DATA === "true";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function loadBidPage(jobId: number) {
  const { token } = await getServerAuth();

  if (!token) {
    return {
      shipment: null as Shipment | null,
      bids: [] as BidOffer[],
      error: "Authentication required",
    };
  }

  try {
    const [detailResult, bidsResult] = await Promise.all([
      getJobDetailRequest(jobId, token),
      getJobBidsRequest(jobId, 1, 20, token),
    ]);

    const detail = detailResult.value as BackendJobDetail | undefined;

    if (!detailResult.isSuccess || !detail) {
      return {
        shipment: demoDataEnabled
          ? customerShipments.find((item) => item.id === jobId) || customerShipments[0]
          : null,
        bids: demoDataEnabled ? bidOffers : [],
        error: resultErrors(detailResult).join(", ") || "Job not found",
      };
    }

    const bids = bidsResult.isSuccess
      ? (bidsResult.value?.items || []).map((bid) => mapBidToOffer(bid, detail))
      : [];

    return {
      shipment: mapJobDetailToShipment(detail),
      bids: bids.length > 0 || !demoDataEnabled ? bids : bidOffers,
      error: bidsResult.isSuccess ? "" : resultErrors(bidsResult).join(", "),
    };
  } catch {
    return {
      shipment: demoDataEnabled
        ? customerShipments.find((item) => item.id === jobId) || customerShipments[0]
        : null,
      bids: demoDataEnabled ? bidOffers : [],
      error: "Unable to load bids from the gateway",
    };
  }
}

export default async function JobBidsPage({ params }: PageProps) {
  const { id } = await params;
  const { shipment, bids, error } = await loadBidPage(Number(id));

  return (
    <AppShell>
      <section className="grid gap-6">
        {shipment ? (
          <>
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

            {error ? (
              <Card className="p-4 text-sm font-medium text-[#EB5E55]">{error}</Card>
            ) : null}

            <div className="grid gap-4">
              {bids.length > 0 ? (
                bids.map((bid) => (
                  <BidOfferCard key={bid.id} bid={bid} />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-sm font-bold text-[#171721]">No bid offers yet</p>
                  <p className="mt-1 text-sm text-[#8083A3]">
                    Courier bids will appear here when companies submit offers.
                  </p>
                </Card>
              )}
            </div>
          </>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-[#171721]">Job unavailable</p>
            <p className="mt-1 text-sm text-[#8083A3]">{error || "Unable to load this job."}</p>
            <Link href="/dashboard" className="mt-5 inline-flex">
              <Button variant="secondary">Back to dashboard</Button>
            </Link>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
