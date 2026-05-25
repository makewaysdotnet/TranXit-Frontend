"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BidOffer } from "@/lib/types";

export function BidOfferCard({ bid }: { bid: BidOffer }) {
  const [status, setStatus] = useState<"idle" | "accepting" | "accepted">("idle");
  const [error, setError] = useState("");

  async function acceptBid() {
    setError("");

    if (!bid.proposalId) {
      setError("Bid proposal was not returned for this offer.");
      return;
    }

    setStatus("accepting");

    let response: Response;
    let result;

    try {
      response = await fetch("/api/bids/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidId: bid.id,
          bidProposalId: bid.proposalId,
          status: 3,
        }),
      });
      result = await response.json();
    } catch {
      setStatus("idle");
      setError("Unable to accept this bid right now.");
      return;
    }

    if (!response.ok || !result.isSuccess) {
      setStatus("idle");
      setError((result.error || result.errors || ["Unable to accept bid"]).join(", "));
      return;
    }

    setStatus("accepted");
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-[#171721]">{bid.label}</h3>
            {bid.status ? (
              <span className="rounded-full bg-[#ECFBF6] px-3 py-1 text-xs font-bold text-[#0D8F65]">
                {bid.status}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-[#8083A3]">{bid.courierName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Total
          </p>
          <p className="text-2xl font-bold text-[#171721]">{bid.total}</p>
        </div>
      </div>
      <div className="my-5 h-px bg-[#E4E6E8]" />
      <div className="grid gap-4 text-sm text-[#595D62] md:grid-cols-4">
        <div>
          <p className="font-bold text-[#171721]">{bid.route}</p>
          <p>{bid.transitTime}</p>
        </div>
        <span className="flex items-center gap-2">
          <ShieldCheck size={17} /> Reliability {bid.reliability}
        </span>
        <span className="flex items-center gap-2">
          <Clock3 size={17} /> Cut-off {bid.cutoff}
        </span>
        <span className="flex items-center gap-2">
          <CheckCircle2 size={17} /> {bid.freeTime} free time
        </span>
      </div>
      {error ? (
        <p className="mt-5 rounded-lg bg-[#FFF0EF] p-3 text-sm font-medium text-[#EB5E55]">
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button variant="secondary">View breakdown</Button>
        <Button onClick={acceptBid} disabled={status !== "idle"}>
          {status === "accepted" ? "Bid accepted" : status === "accepting" ? "Accepting..." : "Accept bid"}
        </Button>
      </div>
    </Card>
  );
}

