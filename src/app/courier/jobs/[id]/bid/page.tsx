import { AppShell } from "@/components/dashboard/app-shell";
import { CourierBidForm } from "@/components/courier/courier-bid-form";
import { courierJobs } from "@/lib/mock-data";

export default function CourierBidPage({ params }: { params: { id: string } }) {
  const job = courierJobs.find((item) => item.id === Number(params.id)) || courierJobs[0];

  return (
    <AppShell role="courier">
      <section className="grid gap-6">
        <div>
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Make a bid
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#171721]">
            Build proposal for {job.jobNumber}
          </h1>
        </div>

        <CourierBidForm job={job} />
      </section>
    </AppShell>
  );
}

