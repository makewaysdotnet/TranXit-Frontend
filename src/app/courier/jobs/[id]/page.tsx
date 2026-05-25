import Link from "next/link";
import { CalendarDays, MapPin, Package } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag } from "@/components/ui/status-tag";
import { getJobDetailRequest, resultErrors } from "@/lib/api";
import { formatDate, normalizeStatus } from "@/lib/live-data";
import { getServerAuth } from "@/lib/server-auth";
import { BackendJobDetail } from "@/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatLocation(city?: string | null, country?: string | null) {
  return [city, country].filter(Boolean).join(", ") || "Location pending";
}

async function loadCourierJob(id: number) {
  const { token } = await getServerAuth();

  if (!token) {
    return { job: null as BackendJobDetail | null, error: "Authentication required" };
  }

  try {
    const result = await getJobDetailRequest(id, token);

    if (!result.isSuccess || !result.value) {
      return {
        job: null as BackendJobDetail | null,
        error: resultErrors(result).join(", ") || "Job not found",
      };
    }

    return { job: result.value, error: "" };
  } catch {
    return {
      job: null as BackendJobDetail | null,
      error: "Unable to load job detail from the gateway",
    };
  }
}

export default async function CourierJobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { job, error } = await loadCourierJob(Number(id));

  return (
    <AppShell role="courier">
      <section className="grid gap-6">
        {job ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-[#8083A3]">
                  View request
                </p>
                <h1 className="mt-2 text-3xl font-bold text-[#171721]">{job.jobNumber}</h1>
              </div>
              <Link href={`/courier/jobs/${job.jobId}/bid`}>
                <Button>Make a bid</Button>
              </Link>
            </div>

            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{job.customerName}</h2>
                  <p className="mt-2 text-[#595D62]">{job.cargoMode}</p>
                </div>
                <StatusTag status={normalizeStatus(job.status)} />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Info icon={<MapPin size={17} />} label="Origin" value={formatLocation(job.originCity, job.originCountry)} />
                <Info icon={<MapPin size={17} />} label="Destination" value={formatLocation(job.destinationCity, job.destinationCountry)} />
                <Info icon={<CalendarDays size={17} />} label="Pickup" value={formatDate(job.pickupDateUtc)} />
                <Info icon={<Package size={17} />} label="Cargo" value={job.cargoMode || "Shipment request"} />
                <Info icon={<Package size={17} />} label="Service" value={job.courierMode || "Pending"} />
                <Info icon={<Package size={17} />} label="Items" value={String(job.jobItems?.length || 0)} />
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-[#171721]">Job unavailable</p>
            <p className="mt-1 text-sm text-[#8083A3]">{error || "Unable to load this job."}</p>
            <Link href="/courier/jobs" className="mt-5 inline-flex">
              <Button variant="secondary">Back to jobs</Button>
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
