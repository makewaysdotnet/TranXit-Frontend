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
  developmentVerificationCode?: string | null;
};

export type DropdownOption = {
  id: number;
  name: string;
  description?: string | null;
};

export type RoleOption = {
  id: number;
  name: UserRole;
};

export type DeliveryTypeOption = DropdownOption & {
  noOfDays?: number | null;
};

export type LookupBundle = {
  countries: DropdownOption[];
  cargoModes: DropdownOption[];
  courierModes: DropdownOption[];
  itemTypes: DropdownOption[];
  deliveryTypes: DeliveryTypeOption[];
};

export type Pagination<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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

export type BackendCustomerJob = {
  id: number;
  customerId: number;
  originCountry?: string | null;
  destinationCountry?: string | null;
  originCity?: string | null;
  destinationCity?: string | null;
  originAddress?: string | null;
  destinationAddress?: string | null;
  jobNumber?: string | null;
  createdOnUtc?: string | null;
  status?: string | null;
  statusId?: number | null;
  deliveryDateUtc?: string | null;
  comments?: string | null;
};

export type BackendJobItem = {
  jobItemId: number;
  itemName: string;
  weight?: number | null;
  declaredValue?: number | null;
  quantity?: number | null;
  size?: string | null;
  description?: string | null;
};

export type BackendJobDetail = {
  jobId: number;
  userId: number;
  destinationAddress: string;
  customerName: string;
  courierMode: string;
  cargoMode: string;
  originCity?: string | null;
  destinationCity?: string | null;
  originCountry?: string | null;
  destinationCountry?: string | null;
  jobNumber?: string | null;
  pickupDateUtc?: string | null;
  status?: string | null;
  jobItems?: BackendJobItem[];
};

export type BackendJobBid = {
  bidId: number;
  bidProposalId?: number | null;
  bidProposalIds?: number[];
  bidMinOffer: number;
  courierName: string;
  courierId: number;
  courierAddress?: string | null;
};

export type BackendCourierJob = {
  id: number;
  customerId: number;
  originCountry?: string | null;
  destinationCountry?: string | null;
  originCity?: string | null;
  destinationCity?: string | null;
  jobNumber?: string | null;
  minBid?: number | null;
  maxBid?: number | null;
  yourBid?: number | null;
  createdOnUtc?: string | null;
  remainingTime?: number | null;
  status?: string | null;
  statusId?: number | null;
};

export type BackendJobStats = {
  won: number;
  totalShipments: number;
  delivered: number;
  inTransit: number;
};
