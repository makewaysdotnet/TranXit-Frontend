"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, Clock3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BidOffer } from "@/lib/types";

export function BidOfferCard({ bid }: { bid: BidOffer }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "accepting" | "accepted">("idle");
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const isAccepted = status === "accepted" || bid.acceptedProposalId !== undefined ||
    [3, 6, 7].includes(bid.bidStatusId ?? 0);
  const acceptedProposalId = bid.acceptedProposalId ?? (status === "accepted" ? bid.proposalId : undefined);
  const canAccept = !isAccepted && bid.canAccept !== false && !bid.isJobAwarded;

  async function acceptBid() {
    if (!canAccept || status !== "idle") {
      return;
    }
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
      router.refresh();
      return;
    }

    setStatus("accepted");
    router.refresh();
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
      {isAccepted && !acceptedProposalId ? (
        <p className="mt-5 text-sm text-[#595D62]">Accepted proposal not recorded in legacy history.</p>
      ) : null}
      {historyOpen ? (
        <ul id={`bid-${bid.id}-proposals`} className="mt-5 divide-y divide-[#E4E6E8] border-y border-[#E4E6E8]">
          {bid.proposals?.map((proposal) => (
            <li key={proposal.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-bold text-[#171721]">
                  Proposal #{proposal.id}
                  {proposal.id === acceptedProposalId ? (
                    <span className="inline-flex items-center gap-1 text-[#0D8F65]">
                      <CheckCircle2 size={15} /> Accepted
                    </span>
                  ) : proposal.isBaseBid ? <span className="font-normal text-[#595D62]">Base</span> : null}
                </p>
                <p className="text-[#595D62]">{proposal.deliveryType} / {proposal.deliveryDate}</p>
              </div>
              <p className="font-bold text-[#171721]">{proposal.total}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={() => setHistoryOpen(!historyOpen)}
          disabled={!bid.proposals?.length} aria-expanded={historyOpen} aria-controls={`bid-${bid.id}-proposals`}>
          Proposals ({bid.proposals?.length ?? 0})
          <ChevronDown size={16} className={historyOpen ? "rotate-180" : ""} />
        </Button>
        <Button onClick={acceptBid} disabled={status !== "idle" || !canAccept}>
          {isAccepted ? "Bid accepted" : status === "accepting" ? "Accepting..." :
            !canAccept ? bid.isJobAwarded ? "Not selected" : "Bid unavailable" : "Accept bid"}
        </Button>
      </div>
    </Card>
  );
}

