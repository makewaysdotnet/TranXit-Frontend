"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField, TextAreaField, TextField } from "@/components/ui/input";
import { CourierJob, DeliveryTypeOption } from "@/lib/types";

function numberFromText(value: FormDataEntryValue | null) {
  return Number(String(value || "").replace(/[^0-9.]/g, "")) || 0;
}

export function CourierBidForm({
  deliveryTypes,
  job,
}: {
  deliveryTypes: DeliveryTypeOption[];
  job: CourierJob;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "draft" | "submitting" | "submitted">(
    "idle",
  );
  const [error, setError] = useState("");
  const deliveryOptions =
    deliveryTypes.length > 0
      ? deliveryTypes
      : [{ id: 2, name: "Standard", noOfDays: 18 }];

  const proposalTotal = useMemo(
    () => ({
      display: "PKR 2.03M",
      amount: 2030000,
    }),
    [],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("submitting");

    const form = new FormData(event.currentTarget);
    const deliveryDate = form.get("deliveryDate")
      ? new Date(String(form.get("deliveryDate"))).toISOString()
      : new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString();
    const oceanFreight = numberFromText(form.get("oceanFreight"));
    const pickupCharges = numberFromText(form.get("pickupCharges"));
    const handlingCharges = numberFromText(form.get("handlingCharges"));
    const customClearanceCharges = numberFromText(form.get("customClearanceCharges"));
    const deliveryTypeId = Number(form.get("deliveryTypeId")) || deliveryOptions[0].id;

    let response: Response;
    let result;

    try {
      response = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          pickupCharges,
          handlingCharges,
          customClearanceCharges,
          isInsurancePolicy: true,
          bidCustomCharges: [
            {
              name: "Ocean freight",
              description: String(form.get("notes")),
              amount: oceanFreight,
            },
          ],
          bidProposals: [
            {
              deliveryTypeId,
              isBaseBid: true,
              deliveryDate,
              total: proposalTotal.amount,
              bidProposalItems: [],
            },
          ],
        }),
      });
      result = await response.json();
    } catch {
      setStatus("idle");
      setError("Unable to submit this bid right now.");
      return;
    }

    if (!response.ok || !result.isSuccess) {
      setStatus("idle");
      setError((result.error || result.errors || ["Unable to submit bid"]).join(", "));
      return;
    }

    setStatus("submitted");
    router.push(`/courier/jobs/${job.id}`);
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <TextField label="Ocean freight" name="oceanFreight" defaultValue="1640000" />
          <TextField label="Origin handling" name="handlingCharges" defaultValue="185000" />
          <TextField label="Customs clearance" name="customClearanceCharges" defaultValue="95000" />
          <TextField label="Pickup charges" name="pickupCharges" defaultValue="110000" />
          <SelectField
            label="Delivery type"
            name="deliveryTypeId"
            defaultValue={String(deliveryOptions[0].id)}
          >
            {deliveryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </SelectField>
          <TextField label="Delivery date" name="deliveryDate" type="date" />
          <TextAreaField
            label="Proposal notes"
            name="notes"
            defaultValue="Door-to-door quote includes origin handling, export filings, freight, and terminal support."
            className="md:col-span-3"
          />
        </div>
        {error ? (
          <p className="mt-5 rounded-lg bg-[#FFF0EF] p-3 text-sm font-medium text-[#EB5E55]">
            {error}
          </p>
        ) : null}
        {status === "draft" ? (
          <p className="mt-5 rounded-lg bg-[#F5F5FA] p-3 text-sm font-medium text-[#595D62]">
            Draft saved locally.
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setStatus("draft")}>
            Save draft
          </Button>
          <Button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Submit bid"}
          </Button>
        </div>
      </Card>

      <Card className="h-fit p-5">
        <p className="text-xs font-bold uppercase text-[#8083A3]">Proposal total</p>
        <p className="mt-2 text-3xl font-bold">{proposalTotal.display}</p>
        <div className="mt-5 grid gap-3 text-sm text-[#595D62]">
          <div className="flex justify-between">
            <span>Transit time</span>
            <strong>18 days</strong>
          </div>
          <div className="flex justify-between">
            <span>Reliability</span>
            <strong>92%</strong>
          </div>
          <div className="flex justify-between">
            <span>Free time</span>
            <strong>7 days</strong>
          </div>
        </div>
      </Card>
    </form>
  );
}
