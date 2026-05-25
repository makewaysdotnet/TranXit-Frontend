export type UserRole = "Customer" | "Courier" | "Agent" | "Admin";

export type ApiResult<T> = {
  isSuccess: boolean;
  value?: T;
  error?: string[];
  errors?: string[];
};

export type LoginResponse = {
  id: number;
  name: string;
  email: string;
  role?: UserRole | null;
  roleId?: number | null;
  token?: string;
  isEmailVerified?: boolean;
  expires?: string;
};

export type ShipmentStatus =
  | "Open"
  | "Bidding"
  | "Won"
  | "InTransit"
  | "Delivered"
  | "Closed"
  | "Draft";

export type ShipmentItem = {
  name: string;
  quantity: number;
  weight: string;
  declaredValue: string;
};

export type BidOffer = {
  id: number;
  proposalId?: number;
  courierName: string;
  label: string;
  total: string;
  route: string;
  transitTime: string;
  reliability: string;
  cutoff: string;
  freeTime: string;
  status?: "Recommended" | "Cheapest" | "Fastest";
};

export type Shipment = {
  id: number;
  jobNumber: string;
  title: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  cargoMode: string;
  courierMode: string;
  pickupDate: string;
  eta: string;
  amountRange: string;
  bids: number;
  progress: number;
  items: ShipmentItem[];
};

export type CourierJob = {
  id: number;
  jobNumber: string;
  customer: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  cargo: string;
  deadline: string;
  bidStatus: "Not started" | "Draft" | "Submitted" | "Accepted";
  targetBudget: string;
};
