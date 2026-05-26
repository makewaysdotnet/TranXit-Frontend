import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const gatewayUrl =
  process.env.TRANXIT_API_URL ||
  process.env.NEXT_PUBLIC_TRANXIT_API_URL ||
  "http://127.0.0.1:18188";

type ApiResult<T> = {
  isSuccess: boolean;
  value?: T;
  error?: string[];
  errors?: string[];
};

type LoginValue = {
  token: string;
  id: number;
  role: string;
};

type BidValue = {
  bidId: number;
};

type BidListValue = {
  items: Array<{
    bidId: number;
    bidProposalId?: number | null;
    bidProposalIds?: number[];
  }>;
};

type CustomerJob = {
  id?: number;
  jobId?: number;
  jobNumber?: string | null;
  status?: string | null;
};

type CreatedJob = {
  jobId: number;
};

export async function readDevOtpCookie(page: Page) {
  await expect
    .poll(async () => {
      const cookies = await page.context().cookies();
      return cookies.find((cookie) => cookie.name === "tranxit_dev_verification_code")?.value || "";
    })
    .toMatch(/^\d{6}$/);

  const cookies = await page.context().cookies();
  return cookies.find((cookie) => cookie.name === "tranxit_dev_verification_code")!.value;
}

export async function gatewayLogin(
  request: APIRequestContext,
  email: string,
  password = "Password1!",
) {
  const response = await request.post(`${gatewayUrl}/api/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  const result = (await response.json()) as ApiResult<LoginValue>;
  expect(result.isSuccess).toBeTruthy();
  expect(result.value?.token).toBeTruthy();
  return result.value!;
}

export async function seedCourierBid(request: APIRequestContext, jobId: number) {
  const courier = await gatewayLogin(request, "courier@tranxit.local");
  const response = await request.post(`${gatewayUrl}/api/bids`, {
    headers: {
      Authorization: `Bearer ${courier.token}`,
    },
    data: {
      jobId,
      pickupCharges: 110000,
      handlingCharges: 185000,
      customClearanceCharges: 95000,
      isInsurancePolicy: true,
      bidCustomCharges: [
        {
          name: "Ocean freight",
          description: "E2E seeded freight charge",
          amount: 1640000,
        },
      ],
      bidProposals: [
        {
          deliveryTypeId: 1,
          isBaseBid: true,
          deliveryDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
          total: 2030000,
          bidProposalItems: [],
        },
      ],
    },
  });

  expect(response.status()).toBe(201);
  const result = (await response.json()) as ApiResult<BidValue>;
  expect(result.isSuccess).toBeTruthy();
  expect(result.value?.bidId).toBeGreaterThan(0);
  return result.value!.bidId;
}

export async function createCustomerJobForCourierBid(request: APIRequestContext) {
  const customer = await gatewayLogin(request, "customer@tranxit.local");
  const recipientStamp = Date.now();
  const response = await request.post(`${gatewayUrl}/api/jobs`, {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
    data: {
      courierModeId: 1,
      cargoModeId: 1,
      itemTypeId: 1,
      originCountryId: 1,
      destinationCountryId: 2,
      originCityId: 1,
      destinationCityId: 3,
      originAddress: "E2E origin warehouse",
      destinationAddress: "E2E destination depot",
      recipientName: "E2E Recipient",
      recipientEmail: `e2e.recipient.${recipientStamp}@example.com`,
      recipientContact: "+49 40 123456",
      pickupDateUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDateUtc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      jobItems: [
        {
          itemName: "E2E cartons",
          quantity: 8,
          itemTypeId: 1,
          weight: 320,
          declaredValue: 420000,
          dimensions: "120x80x110cm",
          description: "Created by Playwright courier bid flow",
        },
      ],
    },
  });

  expect(response.status()).toBe(201);
  const result = (await response.json()) as ApiResult<CreatedJob>;
  expect(result.isSuccess).toBeTruthy();
  expect(result.value?.jobId).toBeGreaterThan(0);

  const jobsResponse = await request.get(`${gatewayUrl}/api/jobs/${customer.id}`, {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
  });
  expect(jobsResponse.ok()).toBeTruthy();
  const jobsResult = (await jobsResponse.json()) as ApiResult<CustomerJob[]>;
  const job = jobsResult.value?.find((item) => (item.jobId ?? item.id) === result.value!.jobId);

  return {
    jobId: result.value!.jobId,
    jobNumber: job?.jobNumber || `Job #${result.value!.jobId}`,
  };
}

export async function expectGatewayBid(request: APIRequestContext, jobId: number) {
  const customer = await gatewayLogin(request, "customer@tranxit.local");
  const response = await request.get(`${gatewayUrl}/api/bids/${jobId}?page=1&pageSize=20`, {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
  });

  expect(response.ok()).toBeTruthy();
  const result = (await response.json()) as ApiResult<BidListValue>;
  expect(result.isSuccess).toBeTruthy();
  expect(result.value?.items.length).toBeGreaterThan(0);
  return result.value!.items[0];
}

export async function expectGatewayJobStatus(
  request: APIRequestContext,
  customerEmail: string,
  jobId: number,
  expectedStatus: string,
) {
  const customer = await gatewayLogin(request, customerEmail);
  const response = await request.get(`${gatewayUrl}/api/jobs/${customer.id}`, {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
  });

  expect(response.ok()).toBeTruthy();
  const result = (await response.json()) as ApiResult<CustomerJob[]>;
  expect(result.isSuccess).toBeTruthy();
  const job = result.value?.find((item) => (item.jobId ?? item.id) === jobId);
  expect(job).toBeTruthy();
  expect(job!.status).toBe(expectedStatus);
}
