import { AppShell } from "@/components/dashboard/app-shell";
import { JobRequestForm } from "@/components/dashboard/job-request-form";

export default function NewJobPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase text-[#8083A3]">
          Create job request
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#171721]">
          Request bids for a shipment
        </h1>
      </div>
      <JobRequestForm />
    </AppShell>
  );
}

