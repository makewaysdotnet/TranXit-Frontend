import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Package, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag } from "@/components/ui/status-tag";
import { getJobDetailRequest, resultErrors } from "@/lib/api";
import { mapJobDetailToShipment } from "@/lib/live-data";
import { customerShipments } from "@/lib/mock-data";
import { getServerAuth } from "@/lib/server-auth";
import { Shipment } from "@/lib/types";

const demoDataEnabled = process.env.TRANXIT_ENABLE_DEMO_DATA === "true";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function loadShipment(id: number) {
  const { token } = await getServerAuth();

  if (!token) {
    return { shipment: null as Shipment | null, error: "Authentication required" };
  }

  try {
    const result = await getJobDetailRequest(id, token);

    if (!result.isSuccess || !result.value) {
      return {
        shipment: demoDataEnabled
          ? customerShipments.find((item) => item.id === id) || customerShipments[0]
          : null,
        error: resultErrors(result).join(", ") || "Job not found",
      };
    }

    return { shipment: mapJobDetailToShipment(result.value), error: "" };
  } catch {
    return {
      shipment: demoDataEnabled
        ? customerShipments.find((item) => item.id === id) || customerShipments[0]
        : null,
      error: "Unable to load job detail from the gateway",
    };
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { shipment, error } = await loadShipment(Number(id));

  return (
    <AppShell>
      <section className="grid gap-6">
        {shipment ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-[#8083A3]">
                  {shipment.jobNumber}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-[#171721]">{shipment.title}</h1>
              </div>
              <div className="flex gap-3">
                <StatusTag status={shipment.status} />
                <Link href={`/jobs/${shipment.id}/bids`}>
                  <Button>View bid offers</Button>
                </Link>
              </div>
            </div>

            <Card className="p-5">
              <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr]">
                <div className="rounded-lg bg-[#F5F5FA] p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#8083A3]">
                    <MapPin size={16} /> Origin
                  </p>
                  <p className="mt-2 text-xl font-bold">{shipment.origin}</p>
                </div>
                <div className="hidden items-center text-[#8083A3] md:flex">
                  <ArrowRight />
                </div>
                <div className="rounded-lg bg-[#F5F5FA] p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#8083A3]">
                    <MapPin size={16} /> Destination
                  </p>
                  <p className="mt-2 text-xl font-bold">{shipment.destination}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <Info icon={<CalendarDays size={17} />} label="Pickup" value={shipment.pickupDate} />
                <Info icon={<CalendarDays size={17} />} label="ETA" value={shipment.eta} />
                <Info icon={<Package size={17} />} label="Mode" value={shipment.cargoMode} />
                <Info icon={<ReceiptText size={17} />} label="Quote range" value={shipment.amountRange} />
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-xl font-bold">Cargo items</h2>
              <div className="mt-4 overflow-hidden rounded-lg border border-[#E4E6E8]">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-[#F5F5FA] text-xs uppercase text-[#8083A3]">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Weight</th>
                      <th className="px-4 py-3">Declared value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipment.items.map((item) => (
                      <tr key={item.name} className="border-t border-[#E4E6E8]">
                        <td className="px-4 py-3 font-bold">{item.name}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">{item.weight}</td>
                        <td className="px-4 py-3">{item.declaredValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
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

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#E4E6E8] p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase text-[#8083A3]">
        {icon} {label}
      </p>
      <p className="mt-2 font-bold text-[#171721]">{value}</p>
    </div>
  );
}
