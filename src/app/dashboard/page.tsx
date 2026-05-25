import Link from "next/link";
import { BarChart3, PackageCheck, PackagePlus, TimerReset } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ShipmentCard } from "@/components/dashboard/shipment-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCustomerJobsRequest, resultErrors } from "@/lib/api";
import { mapCustomerJobToShipment } from "@/lib/live-data";
import { customerShipments } from "@/lib/mock-data";
import { getServerAuth } from "@/lib/server-auth";
import { Shipment } from "@/lib/types";

const demoDataEnabled = process.env.TRANXIT_ENABLE_DEMO_DATA === "true";

async function loadShipments() {
  const { token, userId } = await getServerAuth();

  if (!token || !userId) {
    return { shipments: [] as Shipment[], error: "Authentication required" };
  }

  try {
    const result = await getCustomerJobsRequest(userId, token);

    if (!result.isSuccess || !result.value) {
      return {
        shipments: demoDataEnabled ? customerShipments : [],
        error: resultErrors(result).join(", ") || "No shipments found",
      };
    }

    return {
      shipments: result.value.map(mapCustomerJobToShipment),
      error: "",
    };
  } catch {
    return {
      shipments: demoDataEnabled ? customerShipments : [],
      error: "Unable to load shipments from the gateway",
    };
  }
}

export default async function CustomerDashboardPage() {
  const { shipments, error } = await loadShipments();
  const activeJobs = shipments.filter(
    (shipment) => !["Delivered", "Closed"].includes(shipment.status),
  ).length;
  const bidOffers = shipments.reduce((total, shipment) => total + shipment.bids, 0);
  const inTransit = shipments.filter((shipment) => shipment.status === "InTransit").length;
  const firstShipment = shipments[0];

  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#8083A3]">
              Customer dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#171721]">
              Manage shipments and bid offers
            </h1>
          </div>
          <Link href="/jobs/new">
            <Button icon={<PackagePlus size={17} />}>Create job request</Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active jobs" value={String(activeJobs)} meta="Live from gateway" icon={<PackageCheck size={19} />} />
          <MetricCard label="Bid offers" value={String(bidOffers)} meta="Across loaded jobs" icon={<BarChart3 size={19} />} />
          <MetricCard label="In transit" value={String(inTransit)} meta="Courier-updated jobs" icon={<TimerReset size={19} />} />
          <MetricCard label="Data source" value="Live" meta="Ocelot gateway" icon={<BarChart3 size={19} />} />
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E6E8] p-5">
            <div>
              <h2 className="text-xl font-bold">Shipment board</h2>
              <p className="mt-1 text-sm text-[#8083A3]">
                {error || "Showing authenticated jobs from the TranXIT gateway."}
              </p>
            </div>
            {firstShipment ? (
              <Link href={`/jobs/${firstShipment.id}/bids`} className="text-sm font-bold text-[#171721] underline decoration-[#BFF000] underline-offset-4">
                Review bids
              </Link>
            ) : null}
          </div>
          <div className="grid gap-4 p-4">
            {shipments.length > 0 ? (
              shipments.map((shipment) => (
                <ShipmentCard key={shipment.id} shipment={shipment} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[#D6D7DA] bg-white p-8 text-center">
                <p className="text-sm font-bold text-[#171721]">No shipment requests yet</p>
                <p className="mt-1 text-sm text-[#8083A3]">
                  Create a job request to start receiving courier bids.
                </p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
