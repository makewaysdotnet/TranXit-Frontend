import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Package, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag } from "@/components/ui/status-tag";
import { customerShipments } from "@/lib/mock-data";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const shipment =
    customerShipments.find((item) => item.id === Number(params.id)) || customerShipments[0];

  return (
    <AppShell>
      <section className="grid gap-6">
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

