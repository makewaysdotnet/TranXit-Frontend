import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField, TextAreaField, TextField } from "@/components/ui/input";
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

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card className="p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="Ocean freight" defaultValue="1640000" />
              <TextField label="Origin handling" defaultValue="185000" />
              <TextField label="Customs clearance" defaultValue="95000" />
              <TextField label="Pickup charges" defaultValue="110000" />
              <SelectField label="Delivery type" defaultValue="Standard">
                <option>Economy</option>
                <option>Standard</option>
                <option>Express</option>
              </SelectField>
              <TextField label="Delivery date" type="date" />
              <TextAreaField
                label="Proposal notes"
                defaultValue="Door-to-door quote includes origin handling, export filings, ocean freight, and Hamburg terminal support."
                className="md:col-span-3"
              />
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="secondary">Save draft</Button>
              <Button>Submit bid</Button>
            </div>
          </Card>

          <Card className="h-fit p-5">
            <p className="text-xs font-bold uppercase text-[#8083A3]">
              Proposal total
            </p>
            <p className="mt-2 text-3xl font-bold">PKR 2.03M</p>
            <div className="mt-5 grid gap-3 text-sm text-[#595D62]">
              <div className="flex justify-between"><span>Transit time</span><strong>18 days</strong></div>
              <div className="flex justify-between"><span>Reliability</span><strong>92%</strong></div>
              <div className="flex justify-between"><span>Free time</span><strong>7 days</strong></div>
            </div>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

