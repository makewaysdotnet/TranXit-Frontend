import { ShipmentStatus } from "./types";

export type CourierDashboardJob = {
  id: number;
  jobId: string;
  customer: string;
  fromCity: string;
  fromCountry: string;
  toCity: string;
  toCountry: string;
  minBid: string;
  maxBid: string;
  yourBid: string | null;
  timeLeft: string;
  status: ShipmentStatus;
  dated: string;
  cargo: string;
  trackingId: string;
  progress: number;
  notes: string;
};

export type RecentRoute = {
  id: string;
  from: string;
  to: string;
  active: boolean;
};

export type TeamAgent = {
  id: number;
  name: string;
  bids: number;
  assigned: number;
  avatar: string;
};

export type SalesSummary = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
};

export type LiveTrackingStep = {
  id: string;
  label: string;
  description: string;
  state: "complete" | "current" | "upcoming";
};

export type LiveTrackingItem = {
  id: number;
  trackingId: string;
  from: string;
  to: string;
  status: ShipmentStatus;
  steps: LiveTrackingStep[];
};

export const courierCompany = {
  name: "DHL Courier",
  location: "B block, Johar town, Lahore",
  profileCompletion: 75,
};

export const dashboardDateRanges = [
  "Last 30 days",
  "This month",
  "This quarter",
  "This year",
];

export const recentRoutes: RecentRoute[] = [
  { id: "pakistan-jordan", from: "Pakistan", to: "Jordan", active: true },
  { id: "pakistan-saudi", from: "Pakistan", to: "Saudi Arabia", active: true },
  { id: "lahore-karachi", from: "Lahore", to: "Karachi", active: true },
  { id: "islamabad-rawalpindi", from: "Islamabad", to: "Rawalpindi", active: true },
  { id: "karachi-dubai", from: "Karachi", to: "Dubai", active: false },
  { id: "quetta-muscat", from: "Quetta", to: "Muscat", active: false },
];

export const teamAgents: TeamAgent[] = [
  { id: 1, name: "Arlene McCoy", bids: 10, assigned: 10, avatar: "agent-arlene.png" },
  { id: 2, name: "Savannah Nguyen", bids: 10, assigned: 10, avatar: "agent-savannah.png" },
  { id: 3, name: "Annette Black", bids: 10, assigned: 10, avatar: "agent-annette.png" },
  { id: 4, name: "Bessie Cooper", bids: 10, assigned: 10, avatar: "agent-bessie.png" },
  { id: 5, name: "Jerome Bell", bids: 7, assigned: 8, avatar: "agent-arlene.png" },
  { id: 6, name: "Wade Warren", bids: 5, assigned: 6, avatar: "agent-savannah.png" },
];

export const dashboardJobs: CourierDashboardJob[] = [
  {
    id: 1001,
    jobId: "48234das",
    customer: "Ayesha Khan",
    fromCity: "Lahore",
    fromCountry: "Pakistan",
    toCity: "Zarqa",
    toCountry: "Jordan",
    minBid: "Rs. 420",
    maxBid: "Rs. 5,000",
    yourBid: "Rs. 1,050",
    timeLeft: "08:56",
    status: "Bidding",
    dated: "12 Mar 2024",
    cargo: "24 cartons, 1,180 kg",
    trackingId: "6124-2472-2472",
    progress: 62,
    notes: "Packing list and customs declaration are required before the bid can be finalized.",
  },
  {
    id: 1002,
    jobId: "49214zqk",
    customer: "Hassan Imports",
    fromCity: "Lahore",
    fromCountry: "Pakistan",
    toCity: "Jeddah",
    toCountry: "Saudi Arabia",
    minBid: "Rs. 390",
    maxBid: "Rs. 4,500",
    yourBid: null,
    timeLeft: "11:20",
    status: "Open",
    dated: "12 Mar 2024",
    cargo: "2 document packs, 3 kg",
    trackingId: "6124-2472-4810",
    progress: 35,
    notes: "Customer requested express pickup and a same-day quote.",
  },
  {
    id: 1003,
    jobId: "53290kfa",
    customer: "Memon Textiles",
    fromCity: "Islamabad",
    fromCountry: "Pakistan",
    toCity: "Rawalpindi",
    toCountry: "Pakistan",
    minBid: "Rs. 610",
    maxBid: "Rs. 6,800",
    yourBid: "Rs. 1,250",
    timeLeft: "04:42",
    status: "Won",
    dated: "12 Mar 2024",
    cargo: "1 40ft container",
    trackingId: "6124-2472-7710",
    progress: 78,
    notes: "Accepted quote. Driver assignment and pickup confirmation are next.",
  },
  {
    id: 1004,
    jobId: "58220bka",
    customer: "Northstar Trading",
    fromCity: "Karachi",
    fromCountry: "Pakistan",
    toCity: "Dubai",
    toCountry: "UAE",
    minBid: "Rs. 700",
    maxBid: "Rs. 8,100",
    yourBid: "Rs. 1,400",
    timeLeft: "13:08",
    status: "Bidding",
    dated: "13 Mar 2024",
    cargo: "18 pallets, 2,400 kg",
    trackingId: "6124-2472-9241",
    progress: 48,
    notes: "Bid is under review by the customer procurement team.",
  },
  {
    id: 1005,
    jobId: "61300mnl",
    customer: "Blue Ocean Foods",
    fromCity: "Multan",
    fromCountry: "Pakistan",
    toCity: "Doha",
    toCountry: "Qatar",
    minBid: "Rs. 550",
    maxBid: "Rs. 6,000",
    yourBid: "Rs. 1,120",
    timeLeft: "18:36",
    status: "InTransit",
    dated: "14 Mar 2024",
    cargo: "Reefer cartons, 940 kg",
    trackingId: "6124-2472-1055",
    progress: 81,
    notes: "Shipment is moving through origin handling and should clear tonight.",
  },
  {
    id: 1006,
    jobId: "71244rpq",
    customer: "Metro Pharma",
    fromCity: "Peshawar",
    fromCountry: "Pakistan",
    toCity: "Muscat",
    toCountry: "Oman",
    minBid: "Rs. 480",
    maxBid: "Rs. 5,300",
    yourBid: "Rs. 980",
    timeLeft: "21:15",
    status: "Delivered",
    dated: "15 Mar 2024",
    cargo: "Temperature controlled boxes, 260 kg",
    trackingId: "6124-2472-6601",
    progress: 100,
    notes: "Delivered successfully with signed proof of delivery.",
  },
];

export const salesSummary: SalesSummary[] = [
  { id: "revenue", label: "Revenue", value: "Rs. 4.8M", delta: "+12%", trend: "up" },
  { id: "avg-bid", label: "Average Bid", value: "Rs. 1,140", delta: "+6%", trend: "up" },
  { id: "conversion", label: "Bid Conversion", value: "41%", delta: "-3%", trend: "down" },
];

export const salesTransactions = [
  { id: "INV-4210", customer: "Memon Textiles", amount: "Rs. 2.4M", status: "Paid" },
  { id: "INV-4211", customer: "Northstar Trading", amount: "Rs. 1.4M", status: "Pending" },
  { id: "INV-4212", customer: "Blue Ocean Foods", amount: "Rs. 1.1M", status: "Paid" },
];

export const liveTrackingItems: LiveTrackingItem[] = [
  {
    id: 1001,
    trackingId: "6124-2472-2472",
    from: "Pakistan",
    to: "Jordan",
    status: "InTransit",
    steps: [
      {
        id: "account",
        label: "Create account",
        description: "Customer account was created and verified.",
        state: "complete",
      },
      {
        id: "payment",
        label: "Payment has been made",
        description: "Customer payment is confirmed for this shipment.",
        state: "complete",
      },
      {
        id: "documents",
        label: "Upload Documents",
        description: "Please upload the packing list and update the customer.",
        state: "current",
      },
      {
        id: "handoff",
        label: "Create account",
        description: "Destination handoff opens after the document upload.",
        state: "upcoming",
      },
    ],
  },
  {
    id: 1005,
    trackingId: "6124-2472-1055",
    from: "Pakistan",
    to: "Qatar",
    status: "InTransit",
    steps: [
      {
        id: "quote",
        label: "Quote accepted",
        description: "Customer accepted the submitted courier bid.",
        state: "complete",
      },
      {
        id: "pickup",
        label: "Pickup completed",
        description: "Driver collected the shipment from the origin warehouse.",
        state: "complete",
      },
      {
        id: "clearance",
        label: "Origin clearance",
        description: "Shipment is being cleared with export documents.",
        state: "current",
      },
      {
        id: "flight",
        label: "Flight handoff",
        description: "Airline handoff starts after clearance approval.",
        state: "upcoming",
      },
    ],
  },
  {
    id: 1006,
    trackingId: "6124-2472-6601",
    from: "Pakistan",
    to: "Oman",
    status: "Delivered",
    steps: [
      {
        id: "quote",
        label: "Quote accepted",
        description: "Customer accepted the submitted courier bid.",
        state: "complete",
      },
      {
        id: "shipping",
        label: "Shipment dispatched",
        description: "Shipment left the origin facility on schedule.",
        state: "complete",
      },
      {
        id: "delivered",
        label: "Delivered",
        description: "Proof of delivery was received from the customer.",
        state: "current",
      },
      {
        id: "invoice",
        label: "Invoice archived",
        description: "Final invoice and documents can be archived.",
        state: "upcoming",
      },
    ],
  },
];
