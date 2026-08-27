"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField, TextAreaField, TextField } from "@/components/ui/input";
import { CourierJob, DeliveryTypeOption } from "@/lib/types";
import { formatQuoteAmount, parseQuoteCents, QUOTE_AMOUNT_ERROR, sumQuoteCents } from "@/lib/quote-money";

const chargeFields = [
  { name: "oceanFreight", label: "Ocean freight" },
  { name: "handlingCharges", label: "Origin handling" },
  { name: "customClearanceCharges", label: "Customs clearance" },
  { name: "pickupCharges", label: "Pickup charges" },
] as const;

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
  const [charges, setCharges] = useState({
    oceanFreight: "1640000",
    handlingCharges: "185000",
    customClearanceCharges: "95000",
    pickupCharges: "110000",
  });
  const deliveryOptions =
    deliveryTypes.length > 0
      ? deliveryTypes
      : [{ id: 2, name: "Standard", noOfDays: 18 }];

  const cents = chargeFields.map(({ name }) => parseQuoteCents(charges[name]));
  const totalCents = sumQuoteCents(cents);
  const amountError = totalCents === null
    ? cents.includes(null) ? QUOTE_AMOUNT_ERROR : "The proposal total exceeds 9999999999999.99."
    : "";
  const totalDisplay = formatQuoteAmount(totalCents === null ? null : totalCents / 100, "Invalid amount");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (totalCents === null) return;
    setStatus("submitting");

    const form = new FormData(event.currentTarget);
    const deliveryDate = form.get("deliveryDate")
      ? new Date(String(form.get("deliveryDate"))).toISOString()
      : new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString();
    const [oceanFreight, handlingCharges, customClearanceCharges, pickupCharges] = cents.map((value) => value! / 100);
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
              total: totalCents / 100,
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
    <form onSubmit={submit} className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="min-w-0 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {chargeFields.map(({ name, label }, index) => (
            <TextField
              key={name}
              label={label}
              name={name}
              value={charges[name]}
              inputMode="decimal"
              required
              aria-invalid={cents[index] === null}
              aria-describedby={amountError ? "quote-amount-error" : undefined}
              className="min-w-0 w-full"
              onChange={(event) => {
                setCharges((current) => ({ ...current, [name]: event.target.value }));
                setError("");
              }}
            />
          ))}
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
        {amountError || error ? (
          <p id="quote-amount-error" role="alert" className="mt-5 rounded-lg bg-[#FFF0EF] p-3 text-sm font-medium text-[#EB5E55]">
            {amountError || error}
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
          <Button type="submit" disabled={status === "submitting" || totalCents === null}>
            {status === "submitting" ? "Submitting..." : "Submit bid"}
          </Button>
        </div>
      </Card>

      <Card className="min-w-0 h-fit p-5">
        <p className="text-xs font-bold uppercase text-[#8083A3]">Proposal total</p>
        <output aria-label="Proposal total" aria-live="polite" className={`mt-2 block break-words font-bold ${totalDisplay.length > 21 ? "text-xl" : "text-3xl"}`}>
          {totalDisplay}
        </output>
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
