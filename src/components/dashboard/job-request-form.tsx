"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, PackagePlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField, TextAreaField, TextField } from "@/components/ui/input";

export function JobRequestForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setTimeout(() => router.push("/jobs/1001/bids"), 450);
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_368px]">
      <div className="grid gap-6">
        <Card className="p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-[#8083A3]">
                Route
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#171721]">
                Where should this cargo move?
              </h2>
            </div>
            <div className="rounded-lg bg-[#BFF000] p-3">
              <PackagePlus size={20} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Origin city" name="originCity" defaultValue="Karachi" />
            <TextField label="Destination city" name="destinationCity" defaultValue="Hamburg" />
            <TextField label="Origin address" name="originAddress" defaultValue="Warehouse 12, Port Qasim" />
            <TextField label="Destination address" name="destinationAddress" defaultValue="Hamburg port terminal" />
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Shipping terms
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SelectField label="Cargo mode" name="cargoMode" defaultValue="Sea freight">
              <option>Sea freight</option>
              <option>Air freight</option>
              <option>Road freight</option>
            </SelectField>
            <SelectField label="Service" name="courierMode" defaultValue="Door to door">
              <option>Door to door</option>
              <option>Port to port</option>
              <option>Warehouse pickup</option>
            </SelectField>
            <SelectField label="Speed" name="speed" defaultValue="Standard">
              <option>Economy</option>
              <option>Standard</option>
              <option>Express</option>
            </SelectField>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Items
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <TextField label="Item name" name="itemName" defaultValue="Textile cartons" className="md:col-span-2" />
            <TextField label="Quantity" name="quantity" defaultValue="24" />
            <TextField label="Weight" name="weight" defaultValue="1180 kg" />
            <TextField label="Declared value" name="declaredValue" defaultValue="PKR 1,750,000" className="md:col-span-2" />
            <TextField label="Pickup date" name="pickupDate" type="date" className="md:col-span-2" />
            <TextAreaField
              label="Notes for courier companies"
              name="description"
              defaultValue="Export cartons. Please quote ocean freight, origin handling, customs clearance, and last-mile delivery."
              className="md:col-span-4"
            />
          </div>
        </Card>
      </div>

      <aside className="grid h-fit gap-4">
        <Card className="p-5">
          <p className="text-sm font-bold text-[#171721]">Your progress</p>
          <div className="mt-4 h-2 rounded-full bg-[#E4E6E8]">
            <div className="h-2 w-[64%] rounded-full bg-[#BFF000]" />
          </div>
          <p className="mt-3 text-sm text-[#8083A3]">5 of 7 steps complete</p>
          <ul className="mt-5 grid gap-3 text-sm text-[#595D62]">
            {["Route", "Shipping terms", "Dates", "Items", "Container & mode", "Service speed", "Pick a vessel"].map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className={index < 5 ? "h-4 w-4 rounded-full bg-[#BFF000]" : "h-4 w-4 rounded-full bg-[#E4E6E8]"} />
                {step}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Estimated
          </p>
          <p className="mt-2 text-2xl font-bold text-[#171721]">PKR 1.2M - 1.6M</p>
          <p className="mt-2 text-sm text-[#8083A3]">
            Final quote calculates after courier companies submit bid offers.
          </p>
          <div className="mt-5 grid gap-3">
            <Button type="button" variant="secondary" icon={<Save size={16} />}>
              Save draft
            </Button>
            <Button type="submit" icon={<ArrowRight size={16} />}>
              {submitted ? "Request sent" : "Confirm & request bids"}
            </Button>
          </div>
        </Card>
      </aside>
    </form>
  );
}

