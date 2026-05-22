import Link from "next/link";
import { BarChart3, PackageCheck, PackagePlus, TimerReset } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ShipmentCard } from "@/components/dashboard/shipment-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { customerShipments } from "@/lib/mock-data";

export default function CustomerDashboardPage() {
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
          <MetricCard label="Active jobs" value="12" meta="4 need attention" icon={<PackageCheck size={19} />} />
          <MetricCard label="Bid offers" value="38" meta="11 received today" icon={<BarChart3 size={19} />} />
          <MetricCard label="In transit" value="7" meta="3 arriving this week" icon={<TimerReset size={19} />} />
          <MetricCard label="Avg. savings" value="18%" meta="against first quotes" icon={<BarChart3 size={19} />} />
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E6E8] p-5">
            <div>
              <h2 className="text-xl font-bold">Shipment board</h2>
              <p className="mt-1 text-sm text-[#8083A3]">
                Based on the Figma Customer - Dashboard views.
              </p>
            </div>
            <Link href="/jobs/1001/bids" className="text-sm font-bold text-[#171721] underline decoration-[#BFF000] underline-offset-4">
              Review bids
            </Link>
          </div>
          <div className="grid gap-4 p-4">
            {customerShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

