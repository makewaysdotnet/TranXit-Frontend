import { test, expect } from "@playwright/test";
import { formatQuoteAmount, MAX_QUOTE_CENTS, parseQuoteCents, sumQuoteCents } from "../../src/lib/quote-money";
import { mapBidToOffer, mapCourierJobToDashboardJob, mapCourierJobToListJob } from "../../src/lib/live-data";

test("T-UNIT-QUOTE.StrictDecimalParsing", () => {
  // UC-COUR-4
  for (const [text, cents] of [
    ["0", 0], ["0.00", 0], ["0.01", 1], ["1.1", 110], [" 0012.34 ", 1234],
    ["9999999999999.99", MAX_QUOTE_CENTS],
  ] as const) expect(parseQuoteCents(text), text).toBe(cents);
  for (const text of [
    "", " ", "-1", "-0.00", "1.001", "1.230", "abc12", "1,234", "PKR 12", "1e2",
    "1.2.3", "Infinity", "NaN", "+1", ".01", "1.", "10000000000000", "9999999999999.991",
  ]) expect(parseQuoteCents(text), text).toBeNull();
});

test("T-UNIT-QUOTE.AllInIntegerCentSum", () => {
  // UC-COUR-4
  expect(sumQuoteCents(["0.10", "0.20"].map(parseQuoteCents))).toBe(30);
  expect(sumQuoteCents(["1.01", "2.02", "3.03", "4.04", "5.05", "30.30", "40.40"].map(parseQuoteCents))).toBe(8585);
  expect(sumQuoteCents([0, 0, 0])).toBe(0);
  expect(sumQuoteCents([MAX_QUOTE_CENTS, 0])).toBe(MAX_QUOTE_CENTS);
  for (const values of [[MAX_QUOTE_CENTS, 1], [1, null], [-1], [0.1], [NaN], [Infinity]]) {
    expect(sumQuoteCents(values)).toBeNull();
  }
});

test("T-UNIT-QUOTE.JsonAndDisplayRoundTrips", () => {
  // UC-COUR-4, UC-CUST-4, UC-CUST-5
  for (const cents of [0, 1, 10, 29, 101, 8585, 999999999999999]) {
    const amount = JSON.parse(JSON.stringify({ total: cents / 100 })).total as number;
    expect(parseQuoteCents(String(amount))).toBe(cents);
  }
  expect(formatQuoteAmount(0)).toBe("PKR 0.00");
  expect(formatQuoteAmount(85.85)).toBe("PKR 85.85");
  expect(formatQuoteAmount(1_381_001.23)).toBe("PKR 1,381,001.23");
  expect(formatQuoteAmount(MAX_QUOTE_CENTS / 100)).toBe("PKR 9,999,999,999,999.99");
  expect(formatQuoteAmount(1199.875)).toBe("PKR 1,199.875");
  for (const value of [null, undefined, NaN, Infinity, -1]) expect(formatQuoteAmount(value)).toBe("Awaiting bids");
});

test("T-UNIT-QUOTE.ZeroBidIsNotMissing", () => {
  // UC-COUR-2, UC-CUST-4
  const job = { id: 1, customerId: 1, yourBid: 0, minBid: 0, maxBid: 85.85 };
  expect(mapCourierJobToListJob(job).bidStatus).toBe("Submitted");
  expect(mapCourierJobToListJob(job).targetBudget).toBe("PKR 0.00 - PKR 85.85");
  expect(mapCourierJobToDashboardJob(job).yourBid).toBe("PKR 0.00");
  expect(mapCourierJobToDashboardJob(job).minBid).toBe("PKR 0.00");
  expect(mapCourierJobToDashboardJob(job).maxBid).toBe("PKR 85.85");
  const emptyJob = { ...job, yourBid: null, minBid: null, maxBid: null };
  expect(mapCourierJobToListJob(emptyJob).bidStatus).toBe("Not started");
  expect(mapCourierJobToListJob(emptyJob).targetBudget).toBe("Awaiting bids");
  expect(mapCourierJobToDashboardJob(emptyJob).yourBid).toBeNull();
});

test("T-UNIT-QUOTE.ProposalPricesAndHistory", () => {
  // UC-CUST-4, UC-CUST-5
  const bid = {
    bidId: 5, bidMinOffer: 85.85, courierName: "Test Courier", courierId: 2,
    bidProposalId: 10, canAccept: true,
    bidProposals: [
      { bidProposalId: 10, isBaseBid: true, total: 85.85 },
      { bidProposalId: 11, isBaseBid: false, total: 92.92 },
    ],
  };
  const offer = mapBidToOffer(bid);
  expect(offer.total).toBe("PKR 85.85");
  expect(offer.proposals?.map((proposal) => proposal.total)).toEqual(["PKR 85.85", "PKR 92.92"]);
  const accepted = mapBidToOffer({ ...bid, bidMinOffer: 92.92, acceptedBidProposalId: 11, isJobAwarded: true, canAccept: false });
  expect(accepted.total).toBe("PKR 92.92");
  expect(accepted.acceptedProposalId).toBe(11);
  expect(accepted.canAccept).toBe(false);
  expect(accepted.proposals).toEqual(offer.proposals);
  const zero = mapBidToOffer({ ...bid, bidMinOffer: 0, bidProposals: [{ bidProposalId: 10, isBaseBid: true, total: 0 }] });
  expect(zero.total).toBe("PKR 0.00");
  expect(zero.proposals?.[0].total).toBe("PKR 0.00");
});
