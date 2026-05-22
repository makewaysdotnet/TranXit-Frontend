import Link from "next/link";
import { CalendarDays, MapPin, Package } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag } from "@/components/ui/status-tag";
import { courierJobs } from "@/lib/mock-data";

export default function CourierJobDetailPage({ params }: { params: { id: string } }) {
  const job = courierJobs.find((item) => item.id === Number(params.id)) || courierJobs[0];

  return (
    <AppShell role="courier">
      <section className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#8083A3]">
              View request
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#171721]">{job.jobNumber}</h1>
          </div>
          <Link href={`/courier/jobs/${job.id}/bid`}>
            <Button>Make a bid</Button>
          </Link>
        </div>

        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{job.customer}</h2>
              <p className="mt-2 text-[#595D62]">{job.cargo}</p>
            </div>
            <StatusTag status={job.status} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Info icon={<MapPin size={17} />} label="Origin" value={job.origin} />
            <Info icon={<MapPin size={17} />} label="Destination" value={job.destination} />
            <Info icon={<CalendarDays size={17} />} label="Deadline" value={job.deadline} />
            <Info icon={<Package size={17} />} label="Cargo" value={job.cargo} />
            <Info icon={<Package size={17} />} label="Target budget" value={job.targetBudget} />
            <Info icon={<Package size={17} />} label="Bid status" value={job.bidStatus} />
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

