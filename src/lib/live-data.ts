import {
  BackendCourierJob,
  BackendCustomerJob,
  BackendJobBid,
  BackendJobDetail,
  BackendJobStats,
  BidOffer,
  CourierJob,
  Shipment,
  ShipmentStatus,
} from "./types";
import {
  CourierDashboardJob,
  LiveTrackingItem,
  RecentRoute,
} from "./courier-dashboard-data";

const moneyFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 0,
});

const validStatuses: ShipmentStatus[] = [
  "Open",
  "Bidding",
  "Won",
  "InTransit",
  "Delivered",
  "Closed",
  "Draft",
];

export function normalizeStatus(status?: string | null): ShipmentStatus {
  const compact = (status || "Open").replace(/\s+/g, "");

  if (validStatuses.includes(compact as ShipmentStatus)) {
    return compact as ShipmentStatus;
  }

  return "Open";
}

export function formatDate(value?: string | null, fallback = "Pending") {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatMoney(value?: number | null, fallback = "Awaiting bids") {
  if (value === null || value === undefined || value <= 0) {
    return fallback;
  }

  return `PKR ${moneyFormatter.format(value)}`;
}

function formatMoneyRange(min?: number | null, max?: number | null) {
  if ((min === null || min === undefined || min <= 0) &&
      (max === null || max === undefined || max <= 0)) {
    return "Awaiting bids";
  }

  if (min && max && min !== max) {
    return `${formatMoney(min)} - ${formatMoney(max, "")}`;
  }

  return formatMoney(min || max);
}

function formatLocation(city?: string | null, country?: string | null) {
  return [city, country].filter(Boolean).join(", ") || "Location pending";
}

function statusProgress(status: ShipmentStatus) {
  switch (status) {
    case "Delivered":
      return 100;
    case "InTransit":
      return 78;
    case "Won":
      return 62;
    case "Bidding":
      return 42;
    case "Closed":
      return 100;
    default:
      return 18;
  }
}

function formatRemaining(seconds?: number | null) {
  if (!seconds || seconds <= 0) {
    return "Closed";
  }

  const hours = Math.ceil(seconds / 3600);
  if (hours < 24) {
    return `${hours}h left`;
  }

  return `${Math.ceil(hours / 24)}d left`;
}

export function mapCustomerJobToShipment(job: BackendCustomerJob): Shipment {
  const status = normalizeStatus(job.status);
  const origin = formatLocation(job.originCity, job.originCountry);
  const destination = formatLocation(job.destinationCity, job.destinationCountry);

  return {
    id: job.id,
    jobNumber: job.jobNumber || `TX-${job.id}`,
    title: `${job.originCity || "Origin"} to ${job.destinationCity || "Destination"}`,
    origin,
    destination,
    status,
    cargoMode: "Shipment request",
    courierMode: "Awaiting courier",
    pickupDate: formatDate(job.createdOnUtc),
    eta: formatDate(job.deliveryDateUtc, "Awaiting bid ETA"),
    amountRange: "Awaiting bids",
    bids: 0,
    progress: statusProgress(status),
    items: [
      {
        name: "Shipment request",
        quantity: 1,
        weight: "Pending",
        declaredValue: "Pending",
      },
    ],
  };
}

export function mapJobDetailToShipment(detail: BackendJobDetail): Shipment {
  const status = normalizeStatus(detail.status);

  return {
    id: detail.jobId,
    jobNumber: detail.jobNumber || `TX-${detail.jobId}`,
    title: `${detail.originCity || "Origin"} to ${detail.destinationCity || "Destination"}`,
    origin: formatLocation(detail.originCity, detail.originCountry),
    destination: formatLocation(detail.destinationCity, detail.destinationCountry),
    status,
    cargoMode: detail.cargoMode || "Shipment request",
    courierMode: detail.courierMode || "Awaiting courier",
    pickupDate: formatDate(detail.pickupDateUtc),
    eta: "Awaiting bid ETA",
    amountRange: "Awaiting bids",
    bids: 0,
    progress: statusProgress(status),
    items: (detail.jobItems || []).map((item) => ({
      name: item.itemName || `Item ${item.jobItemId}`,
      quantity: item.quantity || 0,
      weight: item.weight ? `${moneyFormatter.format(item.weight)} kg` : "Pending",
      declaredValue: formatMoney(item.declaredValue, "Pending"),
    })),
  };
}

export function mapBidToOffer(bid: BackendJobBid, detail?: BackendJobDetail): BidOffer {
  const route = detail
    ? `${formatLocation(detail.originCity, detail.originCountry)} -> ${formatLocation(
        detail.destinationCity,
        detail.destinationCountry,
      )}`
    : "Route pending";

  return {
    id: bid.bidId,
    proposalId: bid.bidId,
    courierName: bid.courierName || `Courier #${bid.courierId}`,
    label: `Bid offer #${bid.bidId}`,
    total: formatMoney(bid.bidMinOffer),
    route,
    transitTime: "Delivery proposal",
    reliability: "Pending",
    cutoff: "Pending",
    freeTime: "Standard",
  };
}

export function mapCourierJobToListJob(job: BackendCourierJob): CourierJob {
  return {
    id: job.id,
    jobNumber: job.jobNumber || `TX-${job.id}`,
    customer: `Customer #${job.customerId}`,
    origin: formatLocation(job.originCity, job.originCountry),
    destination: formatLocation(job.destinationCity, job.destinationCountry),
    status: normalizeStatus(job.status),
    cargo: "Shipment request",
    deadline: formatRemaining(job.remainingTime),
    bidStatus: job.yourBid && job.yourBid > 0 ? "Submitted" : "Not started",
    targetBudget: formatMoneyRange(job.minBid, job.maxBid),
  };
}

export function mapCourierJobToDashboardJob(job: BackendCourierJob): CourierDashboardJob {
  const status = normalizeStatus(job.status);

  return {
    id: job.id,
    jobId: job.jobNumber || `TX-${job.id}`,
    customer: `Customer #${job.customerId}`,
    fromCity: job.originCity || "Origin",
    fromCountry: job.originCountry || "Country",
    toCity: job.destinationCity || "Destination",
    toCountry: job.destinationCountry || "Country",
    minBid: formatMoney(job.minBid),
    maxBid: formatMoney(job.maxBid),
    yourBid: job.yourBid && job.yourBid > 0 ? formatMoney(job.yourBid) : null,
    timeLeft: formatRemaining(job.remainingTime),
    status,
    dated: formatDate(job.createdOnUtc),
    cargo: "Shipment request",
    trackingId: job.jobNumber || `TX-${job.id}`,
    progress: statusProgress(status),
    notes: "Live job loaded from the TranXIT gateway.",
  };
}

export function mapCourierStats(stats?: BackendJobStats | null, jobs: CourierDashboardJob[] = []) {
  const won = stats?.won ?? jobs.filter((job) => job.status === "Won").length;
  const inTransit =
    stats?.inTransit ?? jobs.filter((job) => job.status === "InTransit").length;
  const delivered =
    stats?.delivered ?? jobs.filter((job) => job.status === "Delivered").length;
  const totalShipments = stats?.totalShipments ?? jobs.length;

  return [
    {
      label: "Total Shipments",
      value: String(totalShipments),
      helper: "Items",
      delta: "+10%",
      trend: "up" as const,
      icon: "counter-box.svg",
    },
    {
      label: "Won",
      value: String(won),
      helper: "Job requests this month",
      delta: "+10%",
      trend: "up" as const,
      icon: "counter-judge.svg",
    },
    {
      label: "In Transit",
      value: String(inTransit),
      helper: "Jobs won this month",
      delta: "-10%",
      trend: "down" as const,
      icon: "counter-ship.svg",
    },
    {
      label: "Delivered",
      value: String(delivered),
      helper: "Jobs this month",
      delta: "+10%",
      trend: "up" as const,
      icon: "counter-box-tick.svg",
    },
  ];
}

export function mapRecentRoutes(jobs: CourierDashboardJob[]): RecentRoute[] {
  const routes = jobs.map((job) => ({
    id: `${job.id}-${job.fromCity}-${job.toCity}`,
    from: job.fromCountry,
    to: job.toCountry,
    active: job.status !== "Closed" && job.status !== "Delivered",
  }));

  return routes.length > 0 ? routes : [];
}

export function mapTrackingItems(jobs: CourierDashboardJob[]): LiveTrackingItem[] {
  return jobs
    .filter((job) => ["Won", "InTransit", "Delivered"].includes(job.status))
    .map((job) => ({
      id: job.id,
      trackingId: job.trackingId,
      from: job.fromCountry,
      to: job.toCountry,
      status: job.status,
      steps: [
        {
          id: "quote",
          label: "Quote accepted",
          description: "Customer accepted the submitted courier bid.",
          state: "complete",
        },
        {
          id: "pickup",
          label: job.status === "Won" ? "Awaiting pickup" : "Pickup completed",
          description: "Shipment handoff is tracked from the accepted bid.",
          state: job.status === "Won" ? "current" : "complete",
        },
        {
          id: "transit",
          label: "In transit",
          description: "Shipment movement appears here once the courier updates status.",
          state: job.status === "InTransit" ? "current" : job.status === "Delivered" ? "complete" : "upcoming",
        },
        {
          id: "delivered",
          label: "Delivered",
          description: "Proof of delivery closes the shipment.",
          state: job.status === "Delivered" ? "current" : "upcoming",
        },
      ],
    }));
}
