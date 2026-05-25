import { AppShell } from "@/components/dashboard/app-shell";
import { CourierBidForm } from "@/components/courier/courier-bid-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDeliveryTypesRequest, getJobDetailRequest, resultErrors } from "@/lib/api";
import { formatDate, normalizeStatus } from "@/lib/live-data";
import { getServerAuth } from "@/lib/server-auth";
import { BackendJobDetail, CourierJob, DeliveryTypeOption } from "@/lib/types";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatLocation(city?: string | null, country?: string | null) {
  return [city, country].filter(Boolean).join(", ") || "Location pending";
}

function mapDetailToCourierJob(detail: BackendJobDetail): CourierJob {
  return {
    id: detail.jobId,
    jobNumber: detail.jobNumber || `TX-${detail.jobId}`,
    customer: detail.customerName || `Customer #${detail.userId}`,
    origin: formatLocation(detail.originCity, detail.originCountry),
    destination: formatLocation(detail.destinationCity, detail.destinationCountry),
    status: normalizeStatus(detail.status),
    cargo: detail.cargoMode || "Shipment request",
    deadline: formatDate(detail.pickupDateUtc, "Pickup pending"),
    bidStatus: "Not started",
    targetBudget: "Awaiting bids",
  };
}

async function loadBidPage(jobId: number) {
  const { token } = await getServerAuth();

  if (!token) {
    return {
      job: null as CourierJob | null,
      deliveryTypes: [] as DeliveryTypeOption[],
      error: "Authentication required",
    };
  }

  try {
    const [jobResult, deliveryTypeResult] = await Promise.all([
      getJobDetailRequest(jobId, token),
      getDeliveryTypesRequest(token),
    ]);

    if (!jobResult.isSuccess || !jobResult.value) {
      return {
        job: null as CourierJob | null,
        deliveryTypes: deliveryTypeResult.value || [],
        error: resultErrors(jobResult).join(", ") || "Job not found",
      };
    }

    return {
      job: mapDetailToCourierJob(jobResult.value),
      deliveryTypes: deliveryTypeResult.isSuccess ? deliveryTypeResult.value || [] : [],
      error: deliveryTypeResult.isSuccess ? "" : resultErrors(deliveryTypeResult).join(", "),
    };
  } catch {
    return {
      job: null as CourierJob | null,
      deliveryTypes: [] as DeliveryTypeOption[],
      error: "Unable to load this job from the gateway",
    };
  }
}

export default async function CourierBidPage({ params }: PageProps) {
  const { id } = await params;
  const { job, deliveryTypes, error } = await loadBidPage(Number(id));

  return (
    <AppShell role="courier">
      <section className="grid gap-6">
        {job ? (
          <>
            <div>
              <p className="text-xs font-bold uppercase text-[#8083A3]">
                Make a bid
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#171721]">
                Build proposal for {job.jobNumber}
              </h1>
            </div>

            {error ? (
              <Card className="p-4 text-sm font-medium text-[#EB5E55]">{error}</Card>
            ) : null}

            <CourierBidForm deliveryTypes={deliveryTypes} job={job} />
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

