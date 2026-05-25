import Link from "next/link";
import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag } from "@/components/ui/status-tag";
import { getCourierJobsRequest, resultErrors } from "@/lib/api";
import { mapCourierJobToListJob } from "@/lib/live-data";
import { courierJobs } from "@/lib/mock-data";
import { getServerAuth } from "@/lib/server-auth";
import { CourierJob } from "@/lib/types";

const demoDataEnabled = process.env.TRANXIT_ENABLE_DEMO_DATA === "true";

async function loadCourierJobs() {
  const { token } = await getServerAuth();

  if (!token) {
    return { jobs: [] as CourierJob[], error: "Authentication required" };
  }

  try {
    const result = await getCourierJobsRequest(1, 50, token);

    if (!result.isSuccess || !result.value) {
      return {
        jobs: demoDataEnabled ? courierJobs : [],
        error: resultErrors(result).join(", ") || "No jobs found",
      };
    }

    return {
      jobs: result.value.items.map(mapCourierJobToListJob),
      error: "",
    };
  } catch {
    return {
      jobs: demoDataEnabled ? courierJobs : [],
      error: "Unable to load courier jobs from the gateway",
    };
  }
}

export default async function CourierJobsPage() {
  const { jobs, error } = await loadCourierJobs();

  return (
    <AppShell role="courier">
      <section className="grid gap-6">
        <div>
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Job Request Bid
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#171721]">
            Browse requests and prepare bids
          </h1>
          {error ? <p className="mt-2 text-sm text-[#8083A3]">{error}</p> : null}
        </div>

        <div className="grid gap-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold">{job.jobNumber}</h2>
                      <StatusTag status={job.status} />
                    </div>
                    <p className="mt-2 text-sm text-[#8083A3]">
                      {job.customer} - {job.cargo}
                    </p>
                    <p className="mt-4 font-bold text-[#292C43]">
                      {job.origin} {"->"} {job.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase text-[#8083A3]">
                      Budget
                    </p>
                    <p className="mt-1 text-xl font-bold">{job.targetBudget}</p>
                    <p className="mt-1 text-sm text-[#8083A3]">{job.deadline}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <Link href={`/courier/jobs/${job.id}`}>
                    <Button variant="secondary">View request</Button>
                  </Link>
                  <Link href={`/courier/jobs/${job.id}/bid`}>
                    <Button>{job.bidStatus === "Not started" ? "Make a bid" : "View bid"}</Button>
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-sm font-bold text-[#171721]">No courier jobs available</p>
              <p className="mt-1 text-sm text-[#8083A3]">
                Customer requests will appear here when they are opened for bidding.
              </p>
            </Card>
          )}
        </div>
      </section>
    </AppShell>
  );
}
