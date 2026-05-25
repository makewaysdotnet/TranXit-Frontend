"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, PackagePlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField, TextAreaField, TextField } from "@/components/ui/input";

function numberFromText(value: FormDataEntryValue | null) {
  return Number(String(value || "").replace(/[^0-9.]/g, "")) || 0;
}

export function JobRequestForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "draft" | "submitting" | "submitted">(
    "idle",
  );
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("submitting");

    const form = new FormData(event.currentTarget);
    const payload = {
      courierModeId: 1,
      cargoModeId: 1,
      itemTypeId: 1,
      originCountryId: 1,
      destinationCountryId: 2,
      originCityId: 1,
      destinationCityId: 2,
      originAddress: String(form.get("originAddress")),
      destinationAddress: String(form.get("destinationAddress")),
      recipientName: String(form.get("recipientName")),
      recipientEmail: String(form.get("recipientEmail")),
      recipientContact: String(form.get("recipientContact")),
      pickupDateUtc: form.get("pickupDate")
        ? new Date(String(form.get("pickupDate"))).toISOString()
        : null,
      jobItems: [
        {
          itemName: String(form.get("itemName")),
          quantity: numberFromText(form.get("quantity")),
          weight: numberFromText(form.get("weight")),
          declaredValue: numberFromText(form.get("declaredValue")),
          itemTypeId: 1,
          description: String(form.get("description")),
        },
      ],
    };

    let response: Response;
    let result;

    try {
      response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      result = await response.json();
    } catch {
      setStatus("idle");
      setError("Unable to create the shipment request right now.");
      return;
    }

    if (!response.ok || !result.isSuccess) {
      setStatus("idle");
      setError((result.error || result.errors || ["Unable to create job"]).join(", "));
      return;
    }

    setStatus("submitted");
    const jobId = result.value?.jobId || result.value?.JobId || 1001;
    router.push(`/jobs/${jobId}/bids`);
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
            <TextField label="Recipient name" name="recipientName" defaultValue="Jamal Meyer" />
            <TextField label="Recipient email" name="recipientEmail" type="email" defaultValue="jamal@example.com" />
            <TextField label="Recipient contact" name="recipientContact" defaultValue="+49 40 000000" />
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
          {error ? (
            <p className="mt-4 rounded-lg bg-[#FFF0EF] p-3 text-sm font-medium text-[#EB5E55]">
              {error}
            </p>
          ) : null}
          {status === "draft" ? (
            <p className="mt-4 rounded-lg bg-[#F5F5FA] p-3 text-sm font-medium text-[#595D62]">
              Draft saved locally.
            </p>
          ) : null}
          <div className="mt-5 grid gap-3">
            <Button
              type="button"
              variant="secondary"
              icon={<Save size={16} />}
              onClick={() => setStatus("draft")}
            >
              Save draft
            </Button>
            <Button
              type="submit"
              disabled={status === "submitting"}
              icon={<ArrowRight size={16} />}
            >
              {status === "submitting" ? "Sending..." : "Confirm & request bids"}
            </Button>
          </div>
        </Card>
      </aside>
    </form>
  );
}

