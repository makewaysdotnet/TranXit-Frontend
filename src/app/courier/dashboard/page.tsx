import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CheckCircle2, WalletCards } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag } from "@/components/ui/status-tag";
import { courierJobs } from "@/lib/mock-data";

export default function CourierDashboardPage() {
  return (
    <AppShell role="courier">
      <section className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#8083A3]">
              Courier company dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#171721]">
              Jobs, bids, and sales performance
            </h1>
          </div>
          <Link href="/courier/jobs">
            <Button>Browse job requests</Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Open requests" value="26" meta="8 match your lanes" icon={<BriefcaseBusiness size={19} />} />
          <MetricCard label="Submitted bids" value="14" meta="5 awaiting decision" icon={<BarChart3 size={19} />} />
          <MetricCard label="Won jobs" value="7" meta="3 this week" icon={<CheckCircle2 size={19} />} />
          <MetricCard label="Pipeline value" value="PKR 9.8M" meta="Quote value" icon={<WalletCards size={19} />} />
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-[#E4E6E8] p-5">
            <h2 className="text-xl font-bold">Recommended jobs</h2>
            <p className="mt-1 text-sm text-[#8083A3]">
              Based on Courier Company - Dashboard - Jobs View.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#F5F5FA] text-xs uppercase text-[#8083A3]">
                <tr>
                  <th className="px-5 py-3">Job</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Bid</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {courierJobs.map((job) => (
                  <tr key={job.id} className="border-t border-[#E4E6E8]">
                    <td className="px-5 py-4 font-bold">{job.jobNumber}</td>
                    <td className="px-5 py-4">{job.customer}</td>
                    <td className="px-5 py-4">
                      {job.origin} {"->"} {job.destination}
                    </td>
                    <td className="px-5 py-4"><StatusTag status={job.status} /></td>
                    <td className="px-5 py-4">{job.bidStatus}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/courier/jobs/${job.id}`}>
                        <Button variant="secondary">View</Button>
                      </Link>
                    </td>
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

